import { createServer } from "node:http";
import { fileURLToPath } from "url";
import { hostname } from "node:os";
import { resolve } from "node:path";
import { dirname } from "node:path";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";

// Get Ultraviolet dist path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uvPath = resolve(__dirname, "../node_modules/@titaniumnetwork-dev/ultraviolet/dist");

const publicPath = fileURLToPath(new URL("../public/", import.meta.url));

const fastify = Fastify({
  serverFactory: (handler) => {
    return createServer()
      .on("request", (req, res) => {
        // ------------------------------------------------------------------
        // ✅ Apply COOP/COEP ONLY for Ultraviolet proxy resources
        //    This prevents TMDB posters & external images from breaking.
        // ------------------------------------------------------------------
        if (
          req.url.startsWith("/uv/") ||
          req.url.startsWith("/sw.js") ||
          req.url.startsWith("/service/")
        ) {
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        }

        // Continue normally
        handler(req, res);
      });
  },
});

// Static public files
fastify.register(fastifyStatic, {
  root: publicPath,
  decorateReply: true,
});

// Ultraviolet static files
fastify.register(fastifyStatic, {
  root: uvPath,
  prefix: "/uv/",
  decorateReply: false,
});

// 404 Handler
fastify.setNotFoundHandler((res, reply) => {
  return reply.code(404).type("text/html").sendFile("404.html");
});

// Logging listener
fastify.server.on("listening", () => {
  const address = fastify.server.address();
  console.log("Listening on:");
  console.log(`\thttp://localhost:${address.port}`);
  console.log(`\thttp://${hostname()}:${address.port}`);
  console.log(
    `\thttp://${
      address.family === "IPv6" ? `[${address.address}]` : address.address
    }:${address.port}`
  );
});

// Shutdown handlers
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("SIGTERM signal received: closing HTTP server");
  fastify.close();
  process.exit(0);
}

// Port config
let port = parseInt(process.env.PORT || "");
if (isNaN(port)) port = 8080;

fastify.listen({
  port,
  host: "0.0.0.0",
});
