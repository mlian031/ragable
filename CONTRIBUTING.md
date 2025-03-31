# Contributing Guidelines

We use the GitHub Flow branching strategy.

## Branching Strategy

1.  **`main` Branch:**
    *   The `main` branch represents the production-ready code.
    *   All development branches are created from `main`.
    *   Direct commits to `main` are prohibited; changes must go through Pull Requests.

2. **`develop` Branch:**
    *   The `develop` branch is used for integration testing.
    *   All feature branches are merged into `develop` first for testing.
    *   Once tested in `develop`, changes are then merged into `main` through PRs.
    *   This branch serves as a staging area before production deployment.

3.  **Feature Branches:**
    *   Create a new branch from `main` for every feature, bug fix, or task.
    *   Use descriptive names, prefixed appropriately (e.g., `feature/`, `fix/`, `refactor/`, `chore/`).
        *   Example: `git checkout -b feature/add-molecule-viewer`
    *   Commit your changes regularly on your feature branch.

4.  **Pull Requests (PRs):**
    *   Once your work is complete and tested locally, push your feature branch to the remote repository.
        *   Example: `git push origin feature/add-molecule-viewer`
    *   Open a Pull Request targeting the `main` branch.
    *   Ensure your PR includes a clear description of the changes.
    *   Address any feedback or required changes from code reviews.

5.  **Merging:**
    *   Once the PR is approved and all automated checks (CI) pass, it will be merged into `main`.
    *   The feature branch should typically be deleted after merging.

6.  **Deployment:**
    *   Deployments to production are made from the `main` branch.

## Versioning

We use Git tags to mark release versions. When a deployment occurs from `main`, a corresponding version tag (e.g., `v1.0.0`) will be created on the deployed commit.
