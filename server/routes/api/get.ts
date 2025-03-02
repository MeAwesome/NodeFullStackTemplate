import { FastifyReply, FastifyRequest } from "fastify";

export default async function get(req: FastifyRequest, res: FastifyReply) {
    res.send({ hello: "world" });
}