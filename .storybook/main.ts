import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: [
		"../tests/stories/**/*.mdx",
		"../tests/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
		"../app/components/**/*stories.@(js|jsx|mjs|ts|tsx)"
	],
	addons: [
		"@storybook/addon-essentials",
		"@storybook/addon-onboarding",
		"@storybook/experimental-addon-test",
		"@storybook/addon-a11y"
	],
	framework: {
		name: "@storybook/react-vite",
		options: {
			builder: {
				viteConfigPath: ".storybook/sb-vite.config.ts"
			}
		}
	}
};
export default config;
