import "dotenv/config";
import projectConfig from "@root/config.json" with { type: "json" };
import { Config } from "tailwind-merge";

const defaultConfig = {
	services: {
		core: {
			http: {
				port: 3000
			},
			websocket: {
				enabled: true
			}
		}
	}
};

type DefaultConfigType = typeof defaultConfig;
type ProjectConfigType = typeof projectConfig;
type ConfigType = DefaultConfigType & ProjectConfigType;
type EitherConfigType = DefaultConfigType | ProjectConfigType;

function replaceEnvVariables(value: string): string {
	return value.replaceAll(/env\.(\w+)/g, (_, key) => process.env[key] ?? "");
}

function replaceEnvVariablesInObject(obj: EitherConfigType): EitherConfigType {
	for (const key in obj) {
		const value = obj[key as keyof EitherConfigType];
		if (typeof value === "string") {
			console.log(key, value);
			// @ts-expect-error - This is a hack to make TypeScript happy
			obj[key] = replaceEnvVariables(value);
		} else if (typeof value === "object" && value !== null) {
			replaceEnvVariablesInObject(value as unknown as EitherConfigType);
		}
	}
	return obj;
}

const config: ProjectConfigType = { ...replaceEnvVariablesInObject(defaultConfig), ...replaceEnvVariablesInObject(projectConfig) } as ProjectConfigType;

export default config;
