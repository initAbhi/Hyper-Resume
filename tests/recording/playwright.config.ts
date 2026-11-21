import { definePlaywrightConfig } from "./.kit/core/playwright.ts";
import project from "./recording.config.ts";

export default await definePlaywrightConfig(project);
