import "node:http";
import "node:https";
import { logger } from "./lib/logger";
import process from "node:process";
import { Buffer } from "node:buffer";

/**
 * Cloudflare Worker Entry Point
 * This file adapts your Express app to run on the Cloudflare Edge Runtime
 * using a robust manual bridge that avoids library conflicts.
 */

export interface Env {
  [key: string]: any;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Baseline Health Check
    if (url.pathname === "/ping") {
      return new Response("pong", { status: 200 });
    }

    try {
      // 2. Map Cloudflare Env to process.env
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === 'string' && !process.env[key]) {
          process.env[key] = value;
        }
      }

      // 3. Import the app dynamically
      const module = await import("./app");
      const app = module.default;

      // 4. Manual Bridge: Convert Worker Request to Express req/res
      const headers = Object.fromEntries(request.headers);
      const method = request.method;
      const path = url.pathname + url.search;
      const bodyBuffer = method === "GET" || method === "HEAD"
        ? undefined
        : Buffer.from(await request.arrayBuffer());

      // BUG-10 FIX: Replaced `new Promise(async ...)` anti-pattern.
      // Old code could hang indefinitely if app() threw synchronously without
      // calling resShim.end(). Now uses explicit timeout + try/catch guard.
      const BRIDGE_TIMEOUT_MS = 30_000;

      const bridgeResponse = await Promise.race([
        new Promise<Response>((resolve, reject) => {
          let resStatusCode = 200;
          const resHeaders = new Headers();
          const chunks: Uint8Array[] = [];

          const resShim: any = {
            statusCode: 200,
            setHeader: (name: string, value: string) => resHeaders.set(name, value),
            getHeader: (name: string) => resHeaders.get(name),
            getHeaders: () => Object.fromEntries(resHeaders.entries()),
            removeHeader: (name: string) => resHeaders.delete(name),
            writeHead: (status: number, hdrs?: any) => {
              resStatusCode = status;
              if (hdrs) Object.entries(hdrs).forEach(([k, v]) => resHeaders.set(k, v as string));
            },
            write: (chunk: any) => {
              if (chunk) chunks.push(new Uint8Array(Buffer.from(chunk)));
              return true;
            },
            end: (chunk: any) => {
              if (chunk) chunks.push(new Uint8Array(Buffer.from(chunk)));
              const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
              const body = new Uint8Array(totalLength);
              let offset = 0;
              for (const c of chunks) { body.set(c, offset); offset += c.length; }
              resolve(new Response(body, { status: resStatusCode || resShim.statusCode, headers: resHeaders }));
            },
            status: (code: number) => { resStatusCode = code; resShim.statusCode = code; return resShim; },
            json: (data: any) => {
              resHeaders.set("Content-Type", "application/json");
              resShim.end(JSON.stringify(data));
            },
            send: (data: any) => {
              if (typeof data === 'object') return resShim.json(data);
              resShim.end(data);
            },
          };

          const ip = headers["cf-connecting-ip"] || "127.0.0.1";
          const reqShim: any = {
            method,
            url: path,
            headers,
            body: bodyBuffer,
            params: {},
            query: Object.fromEntries(url.searchParams),
            socket: { remoteAddress: ip },
            connection: { remoteAddress: ip },
            unpipe: () => {},
            resume: () => {},
            on: () => {},
            once: () => {},
            emit: () => {},
          };

          try {
            app(reqShim, resShim);
          } catch (syncErr: any) {
            reject(syncErr);
          }
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Bridge timeout after ${BRIDGE_TIMEOUT_MS}ms`)), BRIDGE_TIMEOUT_MS)
        ),
      ]);

      return bridgeResponse;

    } catch (err: any) {
      console.error("Manual Bridge Error:", err);
      return new Response(JSON.stringify({ error: "Bridge Error", details: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
};
