import config from "@config";
import logger from "@logger";

import Manager from "@/core/Manager";
import { WebServerManager } from "@/core/managers";

export default class Server {
    private readonly managers: Manager[];

    private readonly webServerManager: WebServerManager;

    constructor() {
        this.webServerManager = new WebServerManager(this);

        this.managers = [this.webServerManager];
    }

    public async start() {
        await this.setupAllManagers();
        await this.startAllManagers();

        process.on("SIGINT", this.stop.bind(this));
    }

    public async stop(): Promise<void> {
        logger.info("Stopping...");
        setTimeout(() => {
            logger.error("Forcing stop! Timeout reached!");
            process.exit(1);
        }, 5000);
        await this.stopAllManagers();
        logger.info("Stopped!");
        process.exit(0);
    }

    public async setupAllManagers(): Promise<void> {
        const promises = [];
        for (const manager of this.managers) {
            promises.push(manager.onSetup());
        }
        await Promise.all(promises);
    }

    public async startAllManagers(): Promise<void> {
        const promises = [];
        for (const manager of this.managers) {
            promises.push(manager.onStart());
        }
        await Promise.all(promises);
    }

    public async stopAllManagers(): Promise<void> {
        const promises = [];
        for (const manager of this.managers) {
            promises.push(manager.onStop());
        }
        await Promise.all(promises);
    }
}
