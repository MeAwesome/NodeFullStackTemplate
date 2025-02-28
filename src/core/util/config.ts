import "dotenv/config";
import projectConfig from "@root/config.json" with { type: "json" };

const defaultConfig = {
	services: {
		core: {
			http: {
				port: 3000
			},
			websocket: true
		},
		project: {
			discord: {
				token: "default-token"
			}
		}
	}
} as const;

function replaceEnvVariables(value: string): string {
	return value.replaceAll(/env\.(\w+)/g, (_, key) => process.env[key] ?? "");
}

type ConfigType = {
	[key: string]: string | number | boolean | ConfigType;
};

function replaceEnvVariablesInObject(obj: ConfigType): ConfigType {
	for (const key in obj) {
		if (typeof obj[key] === "string") {
			obj[key] = replaceEnvVariables(obj[key]);
		} else if (typeof obj[key] === "object" && obj[key] !== null) {
			replaceEnvVariablesInObject(obj[key]);
		}
	}
	return obj;
}

type ProjectConfigType = typeof projectConfig;

// replace default config with project config
const config: ProjectConfigType = { ...defaultConfig, ...replaceEnvVariablesInObject(projectConfig) } as const;

export default config;
