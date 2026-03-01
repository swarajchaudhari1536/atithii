import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "❌ Please define the MONGODB_URI environment variable inside .env.local"
  );
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

if (!global._mongooseCache) {
  global._mongooseCache = { conn: null, promise: null };
}

const cache = global._mongooseCache;

/**
 * Manually resolve mongodb+srv:// to a direct mongodb:// URI.
 * Dynamic imports are used to prevent this from breaking the Vercel Edge Runtime (Middleware).
 */
async function resolveMongoSrv(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) return uri;

  // IMPORTANT: The Edge Runtime does not have the 'dns' module.
  // We avoid importing it if we're not in a Node.js environment.
  if (typeof process !== "undefined" && (process as any).env?.NEXT_RUNTIME === "edge") {
    console.log("[MongoDB] Skipping manual resolution in Edge Runtime.");
    return uri;
  }

  try {
    const url = new URL(uri.replace("mongodb+srv://", "http://"));
    const host = url.hostname;

    // Dynamically import the DNS utility only in Node.js
    const { resolveMongoSrvManual } = await import("./dns-util");
    const result = await resolveMongoSrvManual(host);

    if (!result) {
      console.warn("[MongoDB] Manual SRV resolution failed or returned no hosts.");
      return uri;
    }

    const { hosts, txtOptions } = result;
    const auth = url.username ? `${url.username}:${url.password}@` : "";
    const dbName = url.pathname;
    const originalParams = url.search.substring(1);

    // Merge options
    const combinedOptions = [txtOptions, originalParams, "ssl=true"].filter(Boolean).join("&");
    const resolvedUri = `mongodb://${auth}${hosts}${dbName}?${combinedOptions}`;

    console.log(`[MongoDB] Manual resolution successful. Hosts: ${hosts.split(',').length}`);
    return resolvedUri;
  } catch (err: any) {
    console.warn("[MongoDB] Manual resolution error:", err.message);
    return uri;
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) {
    const state = cache.conn.connection.readyState;
    if (state === 1) return cache.conn;
    cache.conn = null;
    cache.promise = null;
  }

  if (!cache.promise) {
    cache.promise = (async () => {
      const uri = await resolveMongoSrv(MONGODB_URI!);

      return mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        maxPoolSize: 10,
        // Buffering commands can lead to 404/500 during build if not careful
        bufferCommands: true,
      }).then((m) => {
        console.log(`[MongoDB] ✅ Connected! DB: ${m.connection.name}`);
        return m;
      }).catch((err) => {
        console.error(`[MongoDB] ❌ Connection error: ${err.message}`);
        cache.promise = null; // Allow retry
        throw err;
      });
    })();
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export default connectDB;