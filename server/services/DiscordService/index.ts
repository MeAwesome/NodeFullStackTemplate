import config from "@config";
import logger from "@logger";
import Service from "@/core/Service";

import { Client, GatewayIntentBits, Partials, REST, User } from "discord.js";

export class DiscordService extends Service {
	private readonly client: Client;
	private readonly rest: REST;

	constructor() {
		super();

		this.client = new Client({
			intents: [
				GatewayIntentBits.GuildExpressions,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.Guilds,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildMessageReactions
			],
			partials: [Partials.Message, Partials.Channel, Partials.Reaction]
		});
		this.rest = new REST({ version: "10" }).setToken(config.services.project.discord.token);
	}

	public async start(): Promise<void> {
		await this.client.login(config.services.project.discord.token);
		logger.info("Discord service started");
	}

	public async stop(): Promise<void> {
		await this.client.destroy();
		logger.info("Discord service stopped");
	}

	public getClient(): Client {
		return this.client;
	}

	public getRest(): REST {
		return this.rest;
	}

	public async getUserFromID(id: string): Promise<User> {
		return await this.client.users.fetch(id);
	}
}

export default new DiscordService();
