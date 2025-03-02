import EventEmitter from "node:events";

export default abstract class Service extends EventEmitter {
	private active: boolean;

	constructor() {
		super();
		this.active = false;
	}

	public async activate(): Promise<void> {
		await this.start();
		this.active = true;
		this.emit("activated");
	}

	public async deactivate(): Promise<void> {
		await this.stop();
		this.active = false;
		this.emit("deactivated");
	}

	public isActive(): boolean {
		return this.active;
	}

	public async waitForActivation(): Promise<void> {
		if (this.isActive()) return;
		return new Promise((resolve) => {
			this.once("activated", resolve);
		});
	}

	public async waitForDeactivation(): Promise<void> {
		if (!this.isActive()) return;
		return new Promise((resolve) => {
			this.once("deactivated", resolve);
		});
	}

	public abstract start(): Promise<void>;
	public abstract stop(): Promise<void>;
}
