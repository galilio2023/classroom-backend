import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon, type Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

/**
 * Creates a custom fetch function with a manual timeout.
 * This is necessary to handle the "cold start" of serverless databases like Neon,
 * which can take several seconds to wake up.
 * @param url The URL to fetch.
 * @param options The fetch options.
 * @returns A fetch Promise.
 */
const customFetch = (url: RequestInfo, options?: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });
};

// Configure the Neon client to use our custom fetch function
const sql = neon(process.env.DATABASE_URL, {
  fetch: customFetch,
});

export const db = drizzle(sql);

export const pool: Pool | null = null;
