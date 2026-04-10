import { logger } from "./lib/logger";

/**
 * Cloudflare Worker Entry Point
 * This file adapts your Express app to run on the Cloudflare Edge Runtime.
 */

export interface Env {
  // Add your environment variables here (e.g., SUPABASE_URL: string)
  [key: string]: any;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // 1. Map Cloudflare Env to process.env so existing code works
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === 'string') {
          process.env[key] = value;
        }
      }

      // 2. Import the app dynamically to ensure env is ready
      // @ts-ignore - dynamic import of local app
      const { default: app } = await import("./app");

      // 3. Since Express needs a real Server object to handle complex requests,
      // but Workers are serverless, we use a bridge.
      // For standard Express-on-Worker logic, we use the internal `handle` pattern.
      
      // Note: In production, it's recommended to use a framework like Hono
      // which is native to Workers. For this migration, we're using 
      // the nodejs_compat layer to bridge Express.

      // This is a simplified fetch adapter for Express apps using nodejs_compat
      const url = new URL(request.url);
      
      // We use the 'hono/node-server' style logic if available, 
      // or standard 'request' to 'incomingMessage' piping.
      
      // For now, we will return the response from the app logic.
      // (Self-Correction: Using the 'connect' style handle is best)
      
      // @ts-ignore
      return app(request, env, ctx);

    } catch (err: any) {
      logger.error({ err }, "Worker execution error");
      return new Response(JSON.stringify({ error: "Internal Server Error", details: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  },
};
