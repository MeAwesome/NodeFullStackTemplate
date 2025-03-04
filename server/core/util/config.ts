import "dotenv/config";
import projectConfig from "../../../config.json" with { type: "json" };

const defaultConfig = {
	enablePWA: true,
	services: {
		core: {
			http: {
				port: 3000
			},
			websocket: {
				enabled: true,
				latencyCheck: {
					enabled: true,
					interval: 1000
				}
			}
		}
	}
};

type DeepReadonly<T> = {
	readonly [K in keyof T]: DeepReadonly<T[K]>;
};

type DefaultConfigType = typeof defaultConfig;
type ProjectConfigType = typeof projectConfig;
type EitherConfigType = DefaultConfigType | ProjectConfigType;

function replaceEnvVariables(value: string): string {
	return value.replaceAll(/env\.(\w+)/g, (_, key) => process.env[key] ?? "");
}

function replaceEnvVariablesInObject(obj: EitherConfigType): EitherConfigType {
	for (const key in obj) {
		const value = obj[key as keyof EitherConfigType];
		if (typeof value === "string") {
			// @ts-expect-error - This is a hack to make TypeScript happy
			obj[key] = replaceEnvVariables(value);
		} else if (typeof value === "object" && value !== null) {
			replaceEnvVariablesInObject(value as unknown as EitherConfigType);
		}
	}
	return obj;
}

const config: DeepReadonly<ProjectConfigType> = {
	...replaceEnvVariablesInObject(defaultConfig),
	...replaceEnvVariablesInObject(projectConfig)
} as ProjectConfigType;

export default config;
