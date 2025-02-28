import type { Preview } from "@storybook/react";
import "~/public/global.css";

import { themes } from "@storybook/theming";

const preview: Preview = {
	parameters: {
		docs: {
			theme: themes.dark
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},
		backgrounds: {
			default: "dark"
		}
	},
	tags: ["autodocs"]
};

export default preview;
