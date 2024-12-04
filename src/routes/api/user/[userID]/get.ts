import { FastifyRequest, FastifyReply } from "fastify";

export default function GET(
    req: FastifyRequest<{
        Params: {
            userID: string;
            test: string;
        };
    }>,
    res: FastifyReply
): void {
    res.send({ user: req.params.userID });
}
