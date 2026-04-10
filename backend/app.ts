import fs from "node:fs";
import path from "node:path";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify";
import { registerApiRoutes } from "./api-routes";
import type { BuildAppOptions, ErrorResponse } from "./types";

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: options.logger ?? false,
  });
  const staticRoot = resolveStaticRoot(options.staticRoot);

  app.get("/healthz", async () => ({
    status: "ok",
  }));

  app.register((api, _pluginOptions, done) => {
    registerApiRoutes(api, {
      store: options.store,
      getNow: options.getNow,
      createId: options.createId,
    });
    done();
  }, { prefix: "/api" });

  if (staticRoot) {
    app.register(fastifyStatic, {
      root: staticRoot,
      prefix: "/",
    });
  }

  app.setNotFoundHandler((request, reply) => {
    if (isApiOrHealthRequest(request) || isLegacyApiRequest(request)) {
      reply.status(404).send(createNotFoundPayload(request));
      return;
    }

    if (staticRoot && shouldServeSpa(request)) {
      reply.type("text/html; charset=utf-8").sendFile("index.html");
      return;
    }

    reply.status(404).send(createNotFoundPayload(request));
  });

  return app;
}

function resolveStaticRoot(staticRoot: string | null | undefined): string | null {
  if (staticRoot === null) {
    return null;
  }

  const candidates = staticRoot
    ? [staticRoot]
    : [path.resolve(process.cwd(), "frontend/dist")];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function isApiOrHealthRequest(request: FastifyRequest): boolean {
  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  return pathname === "/healthz" || pathname === "/api" || pathname.startsWith("/api/");
}

function shouldServeSpa(request: FastifyRequest): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }

  const pathname = new URL(request.url, "http://127.0.0.1").pathname;

  if (
    pathname === "/healthz"
    || pathname === "/api"
    || pathname.startsWith("/api/")
    || isLegacyApiPath(pathname)
  ) {
    return false;
  }

  return path.extname(pathname) === "";
}

function createNotFoundPayload(request: FastifyRequest): ErrorResponse {
  return {
    code: "NOT_FOUND",
    message: `Route ${request.method} ${request.url} not found.`,
  };
}

function isLegacyApiRequest(request: FastifyRequest): boolean {
  return isLegacyApiPath(new URL(request.url, "http://127.0.0.1").pathname);
}

function isLegacyApiPath(pathname: string): boolean {
  return pathname === "/event-types"
    || pathname.startsWith("/event-types/")
    || pathname === "/bookings"
    || pathname.startsWith("/bookings/")
    || pathname === "/owner"
    || pathname.startsWith("/owner/");
}
