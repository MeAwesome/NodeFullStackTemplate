import { FastifyRequest, FastifyReply } from "fastify";

import DiscordService from "@/services/DiscordService";

export default async function GET(
	req: FastifyRequest<{
		Params: {
			userID: string;
			test: string;
		};
	}>,
	res: FastifyReply
): Promise<void> {
	const user = await DiscordService.getUserFromID(req.params.userID);
	res.send(user);
}
