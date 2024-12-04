import type { ProjectConfig } from "@/types/ProjectConfig";

import fs from "fs";

const defaultConfig: ProjectConfig = {
    PROJECT_NAME: "Node Full Stack Template",
    PROJECT_DESCRIPTION: "MeAwesome's Node Full Stack Template",
    PROJECT_VERSION: "1.0.0",
    PROJECT_AUTHOR: "Isaac Robbins (MeAwesome) <isaacprobbins@gmail.com>",
    PROJECT_REPOSITORY: "https://github.com/MeAwesome/NodeFullStackTemplate",
    CONSOLE_LOG: true,
    CONSOLE_LOG_LEVEL: "DEBUG",
    FILE_LOG: false,
    FILE_LOG_LEVEL: "DEBUG",
    FILE_LOG_PATH: "./data/logs/NodeFullStackTemplate.log"
} as const;

let projectConfig: Partial<ProjectConfig> = {};
try {
    let configFileData = fs.readFileSync("./project.conf", "utf8");
    for (const line of configFileData.split("\n")) {
        const [key, value] = line.split("=");
        if (key && value) {
            let keyTrimmed = key.trim();
            if (!Object.keys(defaultConfig).includes(keyTrimmed)) {
                continue;
            }
            projectConfig[keyTrimmed as keyof ProjectConfig] = value.trim() as any;
        }
    }
} catch (error) {
    // do nothing, fall back to default config
}

const config = { ...defaultConfig, ...projectConfig } as const;

export default config;
