import logger from "@logger";
import Manager from "@/core/Manager";

import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import next from "next";
import { NextServer, RequestHandler } from "next/dist/server/next";
import fs from "fs";
import path from "path";

export default class WebServerManager extends Manager {
    private fastifyServer!: FastifyInstance;
    private nextApp!: NextServer;
    private nextHandler!: RequestHandler;

    public async setup(): Promise<void> {
        this.fastifyServer = fastify();
        this.nextApp = next({ dev: process.env.NODE_ENV === "development" });
        this.nextHandler = this.nextApp.getRequestHandler();
        await this.nextApp.prepare();
        await this.registerRoutes();
    }

    public async start(): Promise<void> {
        await this.fastifyServer.listen({
            port: 3000,
            host: "0.0.0.0"
        });
    }

    public async stop(): Promise<void> {
        await this.nextApp.close();
        await this.fastifyServer.close();
    }

    private async registerRoutes(): Promise<void> {
        let routesPath = path.resolve(process.env.PROJECT_SRC ?? "src", "routes");
        let routes = fs.readdirSync(routesPath, {
            recursive: true,
            withFileTypes: true
        });
        // sort routes by depth (largest to smallest) and then by name (alphabetical with underscores last)
        routes.sort((a, b) => {
            let aDepth = a.parentPath.split(path.sep).length;
            let bDepth = b.parentPath.split(path.sep).length;
            if (aDepth !== bDepth) {
                return bDepth - aDepth;
            }
            return a.name.localeCompare(b.name);
        });
        routes.forEach((dirent) => {
            if (!dirent.isFile()) return;
            if (!dirent.name.endsWith(".ts")) return;
            let route = dirent.parentPath
                .substring(routesPath.length)
                .replaceAll("\\", "/")
                .replace(/\[_(.*?)\]/g, ":$1?")
                .replace(/\[(.*?)\]/g, ":$1");
            let routeFunction = require(path.resolve(dirent.parentPath, dirent.name)).default;
            let routeMethod = dirent.name.replace(".ts", "").replace("_", "").toLowerCase();
            let isWildcard = dirent.name.startsWith("_");
            if (isWildcard) {
                route += "*";
            }
            switch (routeMethod) {
                case "get":
                    this.fastifyServer.get(route, routeFunction);
                    break;
                case "post":
                    this.fastifyServer.post(route, routeFunction);
                    break;
                case "put":
                    this.fastifyServer.put(route, routeFunction);
                    break;
                case "delete":
                    this.fastifyServer.delete(route, routeFunction);
                    break;
                case "patch":
                    this.fastifyServer.patch(route, routeFunction);
                    break;
                case "options":
                    this.fastifyServer.options(route, routeFunction);
                    break;
                case "head":
                    this.fastifyServer.head(route, routeFunction);
                    break;
                case "all":
                    this.fastifyServer.all(route, routeFunction);
                    break;
                default:
                    logger.warn(`Unknown route method: ${routeMethod}`);
            }
            logger.verbose(`Registered route: ${routeMethod.toUpperCase()} ${route.replace("*", "/*")}`);
        });

        this.fastifyServer.all("*", (req: FastifyRequest, res: FastifyReply) => {
            this.nextHandler(req.raw, res.raw);
        });
    }
}
