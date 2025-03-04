import config from "@config";
import logger from "@logger";
import sourceMapSupport from "source-map-support";

import { activateServices, deactivateServices } from "@/core/util/serviceOperations";

async function main() {
	sourceMapSupport.install();

	process.on("SIGINT", quit);
	process.on("SIGTERM", quit);

	console.dir(config, { depth: null });

	await activateServices();
}

async function quit() {
	logger.info("Stopping...");
	await deactivateServices();
	logger.info("Successfully shut down. Exiting...");
	process.exit(0);
}

main();
