// HyperResume for Runcast: where the app runs,
// how the browser starts and how the video looks.
import { defineProject, loadProjectEnv } from "./.kit/core/project.ts";

// Settings and secrets from .env.local; first, so everything below and in the
// kit sees them.
loadProjectEnv(import.meta.dirname);

export default defineProject({
  dir: import.meta.dirname,
  name: "HyperResume",
  baseURL: process.env.APP_BASE_URL ?? "http://localhost:3000",
  // Scenarios find controls by their labels in this locale.
  locale: "en-US",
  // Seed what the app reads from localStorage on start (e.g. a theme), as raw strings:
  // localStorage: { theme: JSON.stringify("dark") },
  // colorScheme: "dark",
  brand: {
    color: "#5525F5",
    logo: "../../frontend/public/logos/logo-icon.png",
  },
});
