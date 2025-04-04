# Deployment Guide: ragable-v2 to Google Cloud Run via GitHub Actions & Cloud Deploy

This document outlines the steps to configure a CI/CD pipeline for deploying the `ragable-v2` Next.js application (from the `ragable-dev/ragable` repository) to Google Cloud Run using GitHub Actions and Google Cloud Deploy.

## Prerequisites

*   **Google Cloud Project:** `ragable`
*   **Google Cloud Region:** `us-central1`
*   **APIs Enabled:** Cloud Run, Artifact Registry, Cloud Build, Cloud Deploy, IAM Credentials, Secret Manager, AI Platform (Vertex AI).
*   **Artifact Registry Repository:** `ragable-prod` (Full path: `us-central1-docker.pkg.dev/ragable/ragable-prod`)
*   **Cloud Deploy Delivery Pipeline Name:** `ragable-v2`
*   **Cloud Run Service Name:** `ragable-uscentral1-prod` (This is the name of the target service Cloud Deploy will manage).
*   **GitHub Repository:** `ragable-dev/ragable`
*   **Workload Identity Federation:** Configured between GitHub and GCP (See Step 4c).
*   **Google Cloud Secrets:** Created in Secret Manager for sensitive runtime variables (See Step 4b).
*   **GitHub Secrets:** Configured for WIF (`WIF_PROVIDER`, `WIF_SERVICE_ACCOUNT`) and public build-time variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## Environment Variable Handling Summary

This setup distinguishes between different types of environment variables:

1.  **Build-Time Variables:** Required during the `pnpm build` step inside the Docker container. These are passed using `--build-arg` in the GitHub Actions workflow and declared with `ARG`/`ENV` in the `Dockerfile`'s `builder` stage.
    *   `GOOGLE_VERTEX_PROJECT` (from workflow `env`)
    *   `GOOGLE_VERTEX_LOCATION` (from workflow `env`)
    *   `NEXT_PUBLIC_SUPABASE_URL` (from GitHub secret)
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from GitHub secret)
2.  **Runtime Variables (Non-Sensitive):** Required when the application is running on Cloud Run. These are configured directly in the `clouddeploy.yaml` target definition under `environmentVariables`.
    *   `NEXT_PUBLIC_SITE_URL`
    *   `GOOGLE_VERTEX_PROJECT`
    *   `GOOGLE_VERTEX_LOCATION`
3.  **Runtime Secrets (Sensitive):** Required when the application is running, but stored securely. These are stored in Google Cloud Secret Manager and mounted as environment variables via the `clouddeploy.yaml` target definition under `secretEnvironmentVariables`.
    *   `SUPABASE_SERVICE_ROLE_KEY`
    *   `NEXT_SUPABASE_DB_PASSWORD`
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`

*Note: `GOOGLE_APPLICATION_CREDENTIALS` is handled automatically by Cloud Run using the configured service account.*

---

## Step 1: Configure Next.js (`next.config.ts`)

Ensure your `next.config.ts` includes the `output: 'standalone'` option. This is necessary for the Docker build process to create the optimized `.next/standalone` directory used in the final image stage.

```typescript
// next.config.ts
import type { NextConfig } from "next";
import CopyPlugin from "copy-webpack-plugin";
import path from "path";
// Removed bundle analyzer import and configuration for dev mode compatibility

const nextConfig: NextConfig = {
  output: 'standalone', // <--- Ensure this line is present
  // Add the compiler option here
  compiler: {
    // Remove all console logs except console.error in production
    removeConsole: true, // You could also configure specific removals, e.g., { exclude: ['error'] }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
      }
    ]
  },
  /* other config options */
  webpack: (config, { isServer }) => {
    // Add CopyPlugin to copy wasm file
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.join(
              path.dirname(require.resolve("@rdkit/rdkit/package.json")),
              "dist/RDKit_minimal.wasm"
            ),
            // Correct the destination path to match locateFile in MoleculeDisplay
            to: path.join(__dirname, "public/chunks"), // Change back to public/chunks
          },
          // Add pattern to copy the JS file as well
          {
            from: path.join(
              path.dirname(require.resolve("@rdkit/rdkit/package.json")),
              "dist/RDKit_minimal.js"
            ),
            to: path.join(__dirname, "public/chunks"), // Change back to public/chunks
          },
        ],
      })
    );

    // Polyfill 'fs' module for browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // Tells webpack to provide an empty module for 'fs'
      };
    }

    // Ensure WebAssembly is enabled
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    return config;
  },
};

// Temporarily removed analyzer wrapping for dev mode
// To analyze bundle, manually wrap in next.config.ts before running ANALYZE=true pnpm build
// export default analyzer(nextConfig);
export default nextConfig;
```

---

## Step 2: Create Dockerfile (`Dockerfile`)

A multi-stage `Dockerfile` builds an optimized production image using Node.js 22 LTS. It includes build arguments (`ARG`) and environment variables (`ENV`) for the build stage.

```dockerfile
# Dockerfile

# 1. Install dependencies only when needed
FROM node:22-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod=false

# 2. Rebuild the source code only when needed
FROM node:22-alpine AS builder
WORKDIR /app

# Declare build arguments needed during the build process
ARG GOOGLE_VERTEX_PROJECT
ARG GOOGLE_VERTEX_LOCATION
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

# Set ENV variables within the builder stage so build process can access them
ENV GOOGLE_VERTEX_PROJECT=${GOOGLE_VERTEX_PROJECT}
ENV GOOGLE_VERTEX_LOCATION=${GOOGLE_VERTEX_LOCATION}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# Use pnpm build
RUN npm install -g pnpm
RUN pnpm build

# 3. Production image, copy all the files and run next
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# Set the HOSTNAME environment variable for Next.js to listen on all interfaces
# Required for Cloud Run
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build output tracing
# https://nextjs.org/docs/advanced-features/output-file-tracing
CMD ["node", "server.js"]
```

---

## Step 3: Create Skaffold Configuration (`skaffold.yaml`)

This file tells Cloud Deploy/Skaffold how to build the Docker image.

```yaml
# skaffold.yaml
apiVersion: skaffold/v4beta1
kind: Config
metadata:
  name: ragable-v2
build:
  artifacts:
    - image: ragable-v2-image # Placeholder name, Cloud Deploy replaces this
      context: .
      docker:
        dockerfile: Dockerfile
  tagPolicy:
    gitCommit: {} # Tag images with the git commit SHA
# The 'manifests' section is removed as it's not needed for direct Cloud Run deploy
# Skaffold generates the necessary manifest based on the 'deploy' section below.
deploy:
  cloudrun: {} # Deploy using Cloud Run. Project/Region are defined in Cloud Deploy targets.
```

---

## Step 4: Create Cloud Deploy Configuration (`clouddeploy.yaml`)

This file defines the Cloud Deploy delivery pipeline (`ragable-v2`) and the production target (`prod`). The target definition includes the runtime configuration for the Cloud Run service (service account, environment variables, secrets).

```yaml
# clouddeploy.yaml
apiVersion: deploy.cloud.google.com/v1
kind: DeliveryPipeline
metadata:
  name: ragable-v2 # Your pipeline name
description: Deploys ragable-v2 to Cloud Run
serialPipeline:
  stages:
  - targetId: prod
    # profiles field removed as it's not needed and caused Skaffold rendering issues
---
apiVersion: deploy.cloud.google.com/v1
kind: Target
metadata:
  name: prod # Target ID used in the pipeline stage
description: Production Cloud Run service
run:
  location: projects/ragable/locations/us-central1 # GCP Project and Region
  # Define runtime configurations for the Cloud Run service
  configurations:
    # Specify the runtime service account
    serviceAccount: github-actions-deployer@ragable.iam.gserviceaccount.com
    # Define environment variables
    environmentVariables:
      NEXT_PUBLIC_SITE_URL: "https://ragable.ca"
      GOOGLE_VERTEX_PROJECT: "ragable"
      GOOGLE_VERTEX_LOCATION: "us-central1"
    # Define secrets to mount as environment variables
    secretEnvironmentVariables:
      - keyName: SUPABASE_SERVICE_ROLE_KEY
        secretName: projects/ragable/secrets/supabase-service-role-key # Full secret resource name
        versionName: latest # Use the latest version
      - keyName: NEXT_SUPABASE_DB_PASSWORD
        secretName: projects/ragable/secrets/supabase-db-password
        versionName: latest
      - keyName: NEXT_PUBLIC_SUPABASE_URL
        secretName: projects/ragable/secrets/next-public-supabase-url
        versionName: latest
      - keyName: NEXT_PUBLIC_SUPABASE_ANON_KEY
        secretName: projects/ragable/secrets/next-public-supabase-anon-key
        versionName: latest
```

**Important:** Apply this configuration (or any updates) to your Google Cloud project before the first deployment attempt:

```bash
gcloud deploy apply --file clouddeploy.yaml --region=us-central1 --project=ragable
```

---

## Step 5: Configure Service Account, Secrets, and WIF

This involves setting up the service account, creating secrets, and configuring Workload Identity Federation (WIF).

### 5a. Grant Permissions to Runtime Service Account

Grant the service account (`github-actions-deployer@ragable.iam.gserviceaccount.com`) permissions to access secrets and Vertex AI.

```bash
export PROJECT_ID="ragable"
export SERVICE_ACCOUNT_EMAIL="github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

# Allow accessing secrets from Secret Manager
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"

# Allow using Vertex AI
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/aiplatform.user"
```

### 5b. Create Secrets in Secret Manager

Create the following secrets in Google Cloud Secret Manager (Console -> Security -> Secret Manager) within the `ragable` project:

*   `supabase-service-role-key` -> Value: (Your actual service role key)
*   `supabase-db-password` -> Value: (Your actual DB password)
*   `next-public-supabase-url` -> Value: (Your actual Supabase URL)
*   `next-public-supabase-anon-key` -> Value: (Your actual Supabase anon key)

### 5c. Configure Workload Identity Federation (WIF)

Run the following `gcloud` commands in your authenticated terminal or Cloud Shell to set up WIF, allowing GitHub Actions to impersonate the service account.

**Variables:**

```bash
export PROJECT_ID="ragable"
export REGION="us-central1"
export GITHUB_OWNER="ragable-dev"
export GITHUB_REPO="ragable"
export POOL_ID="github-pool"
export PROVIDER_ID="github-provider"
export SERVICE_ACCOUNT_ID="github-actions-deployer"
export SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_ID}@${PROJECT_ID}.iam.gserviceaccount.com"
```

**Commands:**

1.  **Enable IAM Credentials API:**
    ```bash
    gcloud services enable iamcredentials.googleapis.com --project=${PROJECT_ID}
    ```
2.  **Create Workload Identity Pool:**
    ```bash
    gcloud iam workload-identity-pools create ${POOL_ID} \
      --project=${PROJECT_ID} \
      --location="global" \
      --display-name="GitHub Actions Pool"
    ```
3.  **Get Pool ID:**
    ```bash
    export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe ${POOL_ID} \
      --project=${PROJECT_ID} \
      --location="global" \
      --format='value(name)')
    ```
4.  **Create Workload Identity Provider (with condition):**
    ```bash
    gcloud iam workload-identity-pools providers create-oidc ${PROVIDER_ID} \
      --project=${PROJECT_ID} \
      --location="global" \
      --workload-identity-pool=${POOL_ID} \
      --display-name="GitHub Actions Provider" \
      --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
      --attribute-condition="attribute.repository == '${GITHUB_OWNER}/${GITHUB_REPO}'" \
      --issuer-uri="https://token.actions.githubusercontent.com"
    ```
5.  **Create Service Account:**
    ```bash
    gcloud iam service-accounts create ${SERVICE_ACCOUNT_ID} \
      --project=${PROJECT_ID} \
      --display-name="GitHub Actions Deployer SA"
    ```
6.  **Grant Service Account Necessary Roles:**
    ```bash
    # Cloud Build Editor
    gcloud projects add-iam-policy-binding ${PROJECT_ID} --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" --role="roles/cloudbuild.builds.editor"
    # Artifact Registry Writer
    gcloud projects add-iam-policy-binding ${PROJECT_ID} --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" --role="roles/artifactregistry.writer"
    # Cloud Deploy Developer
    gcloud projects add-iam-policy-binding ${PROJECT_ID} --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" --role="roles/clouddeploy.developer"
    # Cloud Run Admin
    gcloud projects add-iam-policy-binding ${PROJECT_ID} --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" --role="roles/run.admin"
    # Service Account User (to act as runtime SA)
    gcloud projects add-iam-policy-binding ${PROJECT_ID} --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" --role="roles/iam.serviceAccountUser"
    # Storage Admin (to allow Cloud Deploy to create GCS buckets for artifacts)
    gcloud projects add-iam-policy-binding ${PROJECT_ID} --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" --role="roles/storage.admin"
    ```
7.  **Allow GitHub Actions to Impersonate Service Account:**
    ```bash
    gcloud iam service-accounts add-iam-policy-binding ${SERVICE_ACCOUNT_EMAIL} \
      --project=${PROJECT_ID} \
      --role="roles/iam.workloadIdentityUser" \
      --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${GITHUB_OWNER}/${GITHUB_REPO}"
    ```
8.  **Get Provider Name and SA Email for GitHub Secrets:**
    ```bash
    export WIF_PROVIDER=$(gcloud iam workload-identity-pools providers describe ${PROVIDER_ID} --project=${PROJECT_ID} --location="global" --workload-identity-pool=${POOL_ID} --format='value(name)')
    echo "WIF Provider Name (for GitHub Secret WIF_PROVIDER): ${WIF_PROVIDER}"
    echo "Service Account Email (for GitHub Secret WIF_SERVICE_ACCOUNT): ${SERVICE_ACCOUNT_EMAIL}"
    ```

**GitHub Secrets:**

Add the outputs from the last command as secrets in your `ragable-dev/ragable` repository settings (`Settings` > `Secrets and variables` > `Actions`):
*   `WIF_PROVIDER`: Full provider name (e.g., `projects/123.../providers/github-provider`)
*   `WIF_SERVICE_ACCOUNT`: Service account email (e.g., `github-actions-deployer@ragable.iam.gserviceaccount.com`)
*   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (needed for build)
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key (needed for build)

---

## Step 6: Create GitHub Actions Workflow (`.github/workflows/deploy.yml`)

This workflow automates the build, push, and deploy process on pushes to the `main` branch. It passes necessary build arguments (`--build-arg`) during the `docker build` step and generates a release name using the short commit SHA to avoid exceeding character limits.

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloud Run via Cloud Deploy

on:
  push:
    branches:
      - main # Trigger deployment on pushes to the main branch

env:
  PROJECT_ID: ragable
  REGION: us-central1
  GAR_LOCATION: us-central1 # Artifact Registry location (can differ from REGION)
  APP_NAME: ragable # Base name for image/service if needed, adjust as necessary
  PIPELINE_NAME: ragable-v2
  CLOUD_RUN_SERVICE_NAME: ragable-uscentral1-prod # Target service name

jobs:
  build-and-deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    permissions:
      contents: 'read'
      id-token: 'write' # Needed for Workload Identity Federation

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Google Auth via WIF
      id: auth
      uses: google-github-actions/auth@v2
      with:
        workload_identity_provider: ${{ secrets.WIF_PROVIDER }} # From GitHub secrets
        service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }} # From GitHub secrets

    - name: Set up Cloud SDK
      uses: google-github-actions/setup-gcloud@v2
      with:
        project_id: ${{ env.PROJECT_ID }}

    - name: Docker Auth - Configure Docker to use gcloud credential helper
      run: gcloud auth configure-docker ${{ env.GAR_LOCATION }}-docker.pkg.dev --quiet

    - name: Build and Push Container Image
      run: |-
        docker build \
          --build-arg GOOGLE_VERTEX_PROJECT=${{ env.PROJECT_ID }} \
          --build-arg GOOGLE_VERTEX_LOCATION=${{ env.REGION }} \
          --build-arg NEXT_PUBLIC_SUPABASE_URL=${{ secrets.NEXT_PUBLIC_SUPABASE_URL }} \
          --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }} \
          -t "${{ env.GAR_LOCATION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/ragable-prod/${{ env.APP_NAME }}:${{ github.sha }}" \
          --file Dockerfile .
        docker push "${{ env.GAR_LOCATION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/ragable-prod/${{ env.APP_NAME }}:${{ github.sha }}"

    - name: Get short SHA
      id: sha
      run: echo "short_sha=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT

    - name: Create Cloud Deploy Release
      id: create_release
      uses: google-github-actions/create-cloud-deploy-release@v1
      with:
        delivery_pipeline: ${{ env.PIPELINE_NAME }}
        region: ${{ env.REGION }}
        skaffold_file: skaffold.yaml
        # Pass the specific image built in the previous step
        images: ${{ env.APP_NAME }}_image=${{ env.GAR_LOCATION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/ragable-prod/${{ env.APP_NAME }}:${{ github.sha }}
        # Optional: Add description
        # description: "Triggered by GitHub Actions commit ${{ github.sha }}"
        name: "release-${{ steps.sha.outputs.short_sha }}" # Use output from previous step
```

---

## Step 7: Final Steps & Deployment

1.  Commit and push all created/modified files (`Dockerfile`, `next.config.ts`, `skaffold.yaml`, `clouddeploy.yaml`, `.github/workflows/deploy.yml`, `deploy.md`) to your `ragable-dev/ragable` GitHub repository's `main` branch.
2.  Ensure the WIF setup (Step 5c) is complete and all required secrets (WIF and Supabase public keys) are added to GitHub.
3.  Ensure the runtime secrets (Step 5b) are created in Google Cloud Secret Manager.
4.  Ensure the Cloud Deploy configuration has been applied to GCP using the command in Step 4.
5.  Pushing to the `main` branch should now trigger the GitHub Action, build the image, create a release in Cloud Deploy, and deploy to your Cloud Run service (`ragable-uscentral1-prod`).
6.  Monitor the GitHub Actions run and the Cloud Deploy pipeline in the Google Cloud Console.
