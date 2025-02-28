import fs from "node:fs";
import path from "node:path";
import logger from "@logger";

const fileExtension = process.env.NODE_ENV === "production" ? ".js" : ".ts";

const coreServicesDir = path.resolve(import.meta.dirname, "../../core/services");
const servicesDir = path.resolve(import.meta.dirname, "../../services");

export async function activateServices(): Promise<void> {
	logger.debug("Activating core services...");

	const coreServices = [];

	console.log(coreServicesDir);

	for (const serviceFolder of fs.readdirSync(coreServicesDir)) {
		const service = (await import(`../../core/services/${serviceFolder}/index${fileExtension}`)).default;
		coreServices.push(service.activate());
	}

	await Promise.all(coreServices);

	logger.debug("Activating project services...");

	const projectServices = [];

	for (const serviceFolder of fs.readdirSync(servicesDir)) {
		const service = (await import(`../../services/${serviceFolder}/index${fileExtension}`)).default;
		projectServices.push(service.activate());
	}

	await Promise.all(projectServices);

	logger.debug("Activated all services");
}

export async function deactivateServices(): Promise<void> {
	logger.debug("Deactivating project services...");

	const projectServices = [];

	for (const serviceFolder of fs.readdirSync(servicesDir)) {
		const service = (await import(`../../services/${serviceFolder}/index${fileExtension}`)).default;
		projectServices.push(service.deactivate());
	}

	await Promise.all(projectServices);

	logger.debug("Deactivating core services...");

	const coreServices = [];

	for (const serviceFolder of fs.readdirSync(coreServicesDir)) {
		const service = (await import(`../../core/services/${serviceFolder}/index${fileExtension}`)).default;
		coreServices.push(service.deactivate());
	}

	await Promise.all(coreServices);

	logger.debug("Deactivated all services");
}
