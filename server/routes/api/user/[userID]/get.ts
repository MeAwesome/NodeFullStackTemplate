import DiscordService from "@/services/DiscordService";
import { FastifyRequest, FastifyReply } from "fastify";

export default async function get(
	req: FastifyRequest<{
		Params: {
			userID: string;
		};
	}>,
	res: FastifyReply
) {
	const user = await DiscordService.getUserFromID(req.params.userID);
	res.send(user);
}
