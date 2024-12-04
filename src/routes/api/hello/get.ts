import { FastifyRequest, FastifyReply } from "fastify";

export default function GET(req: FastifyRequest, res: FastifyReply): void {
    res.send({ hello: "world" });
}
