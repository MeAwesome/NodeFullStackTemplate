import { FastifyReply, FastifyRequest } from "fastify";

export default function GET(
    req: FastifyRequest<{
        Params: {
            postID: string;
        };
    }>,
    res: FastifyReply
): void {
    if (req.params.postID == undefined) {
        res.send({ post: "0" });
        return;
    }
    res.send({ post: req.params.postID });
}
