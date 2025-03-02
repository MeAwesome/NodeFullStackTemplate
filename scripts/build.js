import prompts from "prompts";
import chalk from "chalk";
import fs from "node:fs";
import path from "node:path";
import util from "node:util";
import { exec } from "node:child_process";
import { exit } from "node:process";
import relative from "relative";
import { minimatch } from "minimatch";
import packageJSON from "../package.json" with { type: "json" };
import tsconfigJSON from "../tsconfig.json" with { type: "json" };
import configJSON from "../config.json" with { type: "json" };
const execAsync = util.promisify(exec);

const buildDir = path.join(process.cwd(), "build");
const distDir = path.join(process.cwd(), "dist");

const spinnerFrames = ["-", "\\", "|", "/"];
let spinnerInterval;

async function main() {
	const args = process.argv.slice(2);

	if (args.includes("--noprompts")) {
		info("Skipping prompts...");
		prompts.override({
			shouldBuild: true,
			options: ["backend", "frontend"],
			shouldClearDist: true,
			shouldClearBuild: true,
			shouldContinue: true
		});
	}

	const { shouldBuild } = await prompts({
		type: "confirm",
		name: "shouldBuild",
		message: "Begin build process for " + packageJSON.name + "?",
		initial: true
	});

	if (shouldBuild) {
		await build();
	}
}

async function build() {
	const { options } = await prompts({
		type: "multiselect",
		name: "options",
		message: "Select build options",
		choices: [
			{ title: "Backend", value: "backend", selected: true },
			{ title: "Frontend", value: "frontend", selected: true },
			{ title: "Docker Image (will build backend and frontend itself)", value: "docker" }
		],
		hint: "- Space to select. A to toggle. Return to submit",
		instructions: false
	});

	if (options == undefined) {
		error("Build process aborted. Exiting...");
		exit(1);
	}

	if (options.length === 0) {
		error("No options selected. Exiting...");
		exit(1);
	}

	if (options.includes("backend")) {
		await buildBackend();
	}

	if (options.includes("frontend")) {
		await buildFrontend();
	}

	if (options.includes("docker")) {
		await buildDocker();
	}

	celebrate("Build process completed.");
}

async function buildBackend() {
	const { shouldClearDist } = await prompts({
		type: "confirm",
		name: "shouldClearDist",
		message: "Clear dist directory before building?",
		initial: true
	});

	if (shouldClearDist) {
		spin("Clearing dist directory...");
		fs.rmSync(distDir, { recursive: true, force: true });
		success("Dist directory cleared.");
	} else {
		warn("Dist directory will not be cleared. This may cause issues if there are old files.");
		const { shouldContinue } = await prompts({
			type: "confirm",
			name: "shouldContinue",
			message: "Continue?",
			initial: false
		});

		if (!shouldContinue) {
			return;
		}
	}

	spin("Formatting code...");

	try {
		await execAsync("prettier ./server --check --write");
		success("Code formatted successfully.");
	} catch (e) {
		error(`Code formatting failed. \n\n${e.stdout}`);
		exit(1);
	}

	spin("Linting code...");

	try {
		await execAsync("eslint ./server --fix");
		success("Code linted successfully.");
	} catch (e) {
		error(`Code linting failed. \n\n${e.stdout}`);
		exit(1);
	}

	spin("Compiling backend...");

	try {
		await execAsync("tsc -p tsconfig.build.json");
		success("Backend compiled successfully.");
	} catch (e) {
		error(`Backend compilation failed. \n\n${e.stdout}`);
		exit(1);
	}

	spin("Removing JSON files from dist directory...");

	const files = fs.readdirSync(distDir);
	const removedFiles = [];

	files.forEach((file) => {
		if (file.endsWith(".json")) {
			fs.unlinkSync(path.join(distDir, file));
			removedFiles.push(file);
		}
	});

	if (removedFiles.length > 0) {
		success(`Removed ${removedFiles.length} JSON files from dist directory:`);
		for (const file of removedFiles) {
			log(`- ${file}`);
		}
	} else {
		success("No JSON files to remove from dist directory.");
	}

	spin("Moving files from dist/server to dist...");
	const serverDir = path.join(distDir, "server");

	try {
		fs.readdirSync(serverDir).forEach((file) => {
			const serverPath = path.join(serverDir, file);
			const destPath = path.join(distDir, file);
			fs.renameSync(serverPath, destPath);
		});
		fs.rmdirSync(serverDir);
	} catch (e) {
		error(`Failed to move files from dist/server to dist. \n\n${e}`);
		exit(1);
	}

	success("Files moved from dist/server to dist successfully.");

	spin("Resolving module imports...");

	const nodeModulesDir = path.join(process.cwd(), "node_modules");
	const nodeModules = fs.readdirSync(nodeModulesDir);

	const filesToUpdate = fs
		.readdirSync(distDir, {
			recursive: true
		})
		.filter((file) => file.endsWith(".js"));
	const importRegex = /^import\s(.*?)\sfrom\s+['"](@[\w/-]+|[^]+?)?['"]/gms;
	const resolvedImports = [];
	const unresolvedImports = [];

	for (const file of filesToUpdate) {
		const filePath = path.join(distDir, file);
		const fileDir = path.dirname(filePath);
		let fileContent = fs.readFileSync(filePath, "utf8");
		for (const match of fileContent.matchAll(importRegex)) {
			const importNames = match[1];
			const importPath = match[2];
			if (importPath.startsWith(".")) {
				continue;
			}
			if (nodeModules.includes(importPath) || nodeModules.includes(importPath.split("/")[0])) {
				continue;
			}
			if (importPath.startsWith("node:")) {
				continue;
			}

			let resolvedPath = relative(filePath, getFullPathFromAlias(importPath)).replaceAll(path.sep, "/");

			if (!resolvedPath.startsWith(".")) {
				resolvedPath = `./${resolvedPath}`;
			}

			let fullResolvedPath = path.resolve(fileDir, resolvedPath);

			const tryAsFile = fullResolvedPath + ".js";

			if (fs.existsSync(tryAsFile)) {
				fullResolvedPath = tryAsFile;
				resolvedPath = resolvedPath + ".js";
			} else if (fs.statSync(fullResolvedPath).isDirectory()) {
				const indexPath = path.join(fullResolvedPath, "index.js");
				if (fs.existsSync(indexPath)) {
					fullResolvedPath = indexPath;
					resolvedPath += "/index.js";
				}
			}

			if (fs.existsSync(fullResolvedPath)) {
				fileContent = fileContent.replace(match[0], `import ${importNames} from '${resolvedPath}'`);
				fs.writeFileSync(filePath, fileContent, "utf8");
				resolvedImports.push(`${file} : ${importPath} -> ${resolvedPath}`);
			} else {
				unresolvedImports.push(`${file} : ${importPath} -> ${resolvedPath}`);
			}
		}
	}

	if (resolvedImports.length > 0) {
		success(`Resolved ${resolvedImports.length} imports.`);
	}

	if (unresolvedImports.length > 0) {
		error(`Could not resolve ${unresolvedImports.length} imports:`);
		for (const file of unresolvedImports) {
			log(`- ${file}`);
		}
		exit(1);
	}
}

async function buildFrontend() {
	const { shouldClearBuild } = await prompts({
		type: "confirm",
		name: "shouldClearBuild",
		message: "Clear build directory before building?",
		initial: true
	});

	if (shouldClearBuild) {
		spin("Clearing build directory...");
		fs.rmSync(buildDir, { recursive: true, force: true });
		success("Build directory cleared.");
	} else {
		warn("Build directory will not be cleared. This may cause issues if there are old files.");
		const { shouldContinue } = await prompts({
			type: "confirm",
			name: "shouldContinue",
			message: "Continue?",
			initial: false
		});

		if (!shouldContinue) {
			return;
		}
	}

	spin("Formatting code...");

	try {
		await execAsync("prettier ./app --check --write");
		success("Code formatted successfully.");
	} catch (e) {
		error(`Code formatting failed. \n\n${e.stdout}`);
		exit(1);
	}

	spin("Linting code...");

	try {
		await execAsync("eslint ./app --fix");
		success("Code linted successfully.");
	} catch (e) {
		error(`Code linting failed. \n\n${e.stdout}`);
		exit(1);
	}

	spin("Building frontend...");

	try {
		await execAsync("remix vite:build");
		success("Frontend built successfully.");
	} catch (e) {
		error(`Frontend build failed. \n\n${e.stdout}`);
		exit(1);
	}
}

async function buildDocker() {
	const NODE_VERSION = (await execAsync("node --version")).stdout.trim().replace("v", "");
	const PORT = configJSON.services.core.http.port;
	const envFile = path.join(process.cwd(), ".env");

	try {
		await execAsync("docker version");
	} catch (e) {
		error(`Docker is not running or installed. \n\n${e}`);
		exit(1);
	}

	const { shouldRemoveContainer } = await prompts({
		type: "confirm",
		name: "shouldRemoveContainer",
		message: "Remove old Docker container?",
		initial: true
	});

	if (shouldRemoveContainer) {
		spin("Removing old Docker container...");

		try {
			const { stdout } = await execAsync(
				`docker ps -a --filter "name=${packageJSON.name}" --format "{{.Names}}"`
			);
			if (stdout.trim() === packageJSON.name) {
				await execAsync(`docker stop ${packageJSON.name}`);
				await execAsync(`docker rm ${packageJSON.name}`);
			}
			success("Old Docker container removed.");
		} catch (e) {
			error(`Failed to remove old Docker container. \n\n${e}`);
			exit(1);
		}
	} else {
		warn("Old Docker container will not be removed. This may cause issues and consume more storage space.");
		const { shouldContinue } = await prompts({
			type: "confirm",
			name: "shouldContinue",
			message: "Continue?",
			initial: false
		});

		if (!shouldContinue) {
			return;
		}
	}

	const { shouldRemoveOldImage } = await prompts({
		type: "confirm",
		name: "shouldRemoveOldImage",
		message: "Remove old Docker image?",
		initial: true
	});

	if (shouldRemoveOldImage) {
		spin("Removing old Docker image...");

		try {
			const { stdout } = await execAsync(`docker images --format "{{.Repository}}"`);
			if (stdout.trim().indexOf(packageJSON.name) !== -1) {
				await execAsync(`docker rmi ${packageJSON.name}`);
			}
			success("Old Docker image removed.");
		} catch (e) {
			error(`Failed to remove old Docker image. \n\n${e}`);
			exit(1);
		}
	} else {
		warn("Old Docker image will not be removed. This may cause issues and consume more storage space.");
		const { shouldContinue } = await prompts({
			type: "confirm",
			name: "shouldContinue",
			message: "Continue?",
			initial: false
		});

		if (!shouldContinue) {
			return;
		}
	}

	spin("Building Docker image...");

	try {
		await execAsync(
			`docker build -t ${packageJSON.name} --build-arg NODE_VERSION=${NODE_VERSION} --build-arg PORT=${PORT} .`
		);
		success("Docker image built successfully.");
	} catch (e) {
		error(`Docker image build failed. \n\n${e}`);
		exit(1);
	}

	const { shouldRunContainer } = await prompts({
		type: "confirm",
		name: "shouldRunContainer",
		message: "Create and run Docker container?",
		initial: true
	});

	if (shouldRunContainer) {
		spin("Creating Docker container...");

		try {
			await execAsync(
				`docker run -d --env-file ${envFile} -p ${PORT}:${PORT} --name ${packageJSON.name} ${packageJSON.name}`
			);
			success("Docker container running successfully.");
		} catch (e) {
			error(`Failed to run Docker container. \n\n${e}`);
			exit(1);
		}
	}
}

function log(message) {
	if (spinnerInterval) {
		stopSpinner();
	}
	console.log(chalk.bold(message));
}

function success(message) {
	if (spinnerInterval) {
		stopSpinner();
	}
	console.log(`${chalk.green("√")} ${chalk.bold(message)}`);
}

function warn(message) {
	if (spinnerInterval) {
		stopSpinner();
	}
	console.warn(`${chalk.yellow("⚠")} ${chalk.bold(message)}`);
}

function error(message) {
	if (spinnerInterval) {
		stopSpinner();
	}
	console.error(`${chalk.red("×")} ${chalk.bold(message)}`);
}

function celebrate(message) {
	if (spinnerInterval) {
		stopSpinner();
	}
	console.log(`🎉 ${chalk.bold(message)}`);
}

function info(message) {
	if (spinnerInterval) {
		stopSpinner();
	}
	console.log(`${chalk.blue("ℹ")} ${chalk.bold(message)}`);
}

function spin(message) {
	if (spinnerInterval) {
		stopSpinner();
	}
	let frame = 0;
	spinnerInterval = setInterval(() => {
		process.stdout.write(`\r${spinnerFrames[frame]} ${chalk.bold(message)}`);
		frame = (frame + 1) % spinnerFrames.length;
	}, 100);
}

function stopSpinner() {
	if (spinnerInterval) {
		clearInterval(spinnerInterval);
		spinnerInterval = null;
		process.stdout.write("\r");
	}
}

function getFullPathFromAlias(alias) {
	const baseUrl = path.resolve("dist");
	const paths = tsconfigJSON.compilerOptions.paths;

	for (const [key, value] of Object.entries(paths)) {
		if (minimatch(alias, key.replace("*", "**/*"))) {
			return path.resolve(baseUrl, value[0].replace("*", alias.replace(key.replace("*", ""), "")));
		}
	}

	return alias;
}

main();
