import { FastifyReply, FastifyRequest } from "fastify";

export default function ALL(req: FastifyRequest, res: FastifyReply): void {
    res.status(404).send({ error: "Not Found" });
}
