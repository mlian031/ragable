import type { NextConfig } from "next";
import CopyPlugin from "copy-webpack-plugin";
import path from "path";
// Removed bundle analyzer import and configuration for dev mode compatibility

const nextConfig: NextConfig = {
  output: 'standalone', // <--- Add this line
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
