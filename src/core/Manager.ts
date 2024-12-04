import Server from "@/core/Server";

export default class Manager {
    protected server: Server;

    constructor(server: Server) {
        this.server = server;
    }

    public async onSetup(): Promise<void> {
        await this.setup();
    }

    public async onStart(): Promise<void> {
        await this.start();
    }

    public async onStop(): Promise<void> {
        await this.stop();
    }

    public async setup(): Promise<void> {
        // Override this method
    }

    public async start(): Promise<void> {
        // Override this method
    }

    public async stop(): Promise<void> {
        // Override this method
    }
}
