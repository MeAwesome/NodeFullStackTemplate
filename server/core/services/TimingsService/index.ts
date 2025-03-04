import logger from "@logger";
import Service from "@/core/Service";

export class TimingsService extends Service {
	private readonly timings: Map<string, NodeJS.Timeout>;

	constructor() {
		super();
		this.timings = new Map<string, NodeJS.Timeout>();
	}

	public async start(): Promise<void> {
		logger.verbose("Timings service started");
	}
	public async stop(): Promise<void> {
		this.clearAllTimings();
		logger.verbose("Timings service stopped");
	}

	public setTimeout(key: string, callback: () => void, delay: number): void {
		if (this.timings.has(key)) {
			clearTimeout(this.timings.get(key));
			this.timings.delete(key);
		}
		const timeout = setTimeout(() => {
			callback();
			this.timings.delete(key);
		}, delay);
		this.timings.set(key, timeout);
	}

	public setInterval(key: string, callback: () => void, delay: number): void {
		if (this.timings.has(key)) {
			clearTimeout(this.timings.get(key));
			this.timings.delete(key);
		}
		const interval = setInterval(() => {
			callback();
		}, delay);
		this.timings.set(key, interval);
	}

	public clearTiming(key: string): void {
		if (this.timings.has(key)) {
			clearTimeout(this.timings.get(key));
			this.timings.delete(key);
		}
	}

	public getTiming(key: string): NodeJS.Timeout | undefined {
		return this.timings.get(key);
	}

	public hasTiming(key: string): boolean {
		return this.timings.has(key);
	}

	public clearAllTimings(): void {
		this.timings.forEach((timeout, key) => {
			clearTimeout(timeout);
			this.timings.delete(key);
		});
	}

	public getAllTimings(): Map<string, NodeJS.Timeout> {
		return this.timings;
	}

	public getTimingCount(): number {
		return this.timings.size;
	}

	public getTimingKeys(): string[] {
		return Array.from(this.timings.keys());
	}

	public getTimingValues(): NodeJS.Timeout[] {
		return Array.from(this.timings.values());
	}

	public getTimingEntries(): [string, NodeJS.Timeout][] {
		return Array.from(this.timings.entries());
	}

	public getTimingType(key: string): "timeout" | "interval" | undefined {
		const timing = this.timings.get(key);
		if (timing) {
			return timing.hasRef() ? "interval" : "timeout";
		}
		return undefined;
	}
}

export default new TimingsService();
