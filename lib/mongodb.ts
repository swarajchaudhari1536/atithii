import mongoose from "mongoose";
import dns from "dns";
import { promisify } from "util";

// ── Set custom DNS servers IMMEDIATELY at module load ──
// This ensures ALL DNS lookups (including mongoose's own SRV resolution)
// use Google/Cloudflare DNS instead of the OS resolver that may block SRV.
dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

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
 * Manually resolve mongodb+srv:// to a plain mongodb:// URI.
 * This bypasses any DNS SRV resolution issues inside the Next.js runtime.
 */
async function resolveSrvUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) return uri;

  try {
    const url = new URL(uri.replace("mongodb+srv://", "http://"));
    const host = url.hostname;

    console.log(`[MongoDB] Resolving SRV for _mongodb._tcp.${host} …`);
    const srvRecords = await resolveSrv(`_mongodb._tcp.${host}`);

    if (!srvRecords || srvRecords.length === 0) {
      throw new Error("No SRV records found");
    }

    const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");
    console.log(`[MongoDB] SRV resolved: ${hosts}`);

    // Get TXT options (authSource, replicaSet etc.)
    let txtOptions = "ssl=true&authSource=admin&retryWrites=true&w=majority";
    try {
      const txtRecords = await resolveTxt(host);
      if (txtRecords && txtRecords.length > 0) {
        txtOptions = txtRecords.flat().join("&");
        console.log(`[MongoDB] TXT options: ${txtOptions}`);
      }
    } catch {
      // TXT resolution is optional
    }

    const auth = url.username
      ? `${encodeURIComponent(url.username)}:${encodeURIComponent(decodeURIComponent(url.password))}@`
      : "";
    const pathname = url.pathname; // e.g. /smart_hotel

    const resolved = `mongodb://${auth}${hosts}${pathname}?${txtOptions}`;
    const safe = resolved.replace(/:\/\/([^:]+):([^@]+)@/, "://<user>:<pass>@");
    console.log(`[MongoDB] Resolved URI: ${safe}`);

    return resolved;
  } catch (err: any) {
    console.warn(
      "[MongoDB] Manual SRV resolution failed, falling back to mongoose built-in:",
      err.message
    );
    // Return the original +srv URI — at this point dns.setServers() is already
    // active so mongoose's own SRV lookup will also use Google/Cloudflare DNS.
    return uri;
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  // Return existing verified connection
  if (cache.conn) {
    const state = cache.conn.connection.readyState;
    if (state === 1) return cache.conn;
    console.warn("[MongoDB] Connection dropped (state=%d), reconnecting…", state);
    cache.conn = null;
    cache.promise = null;
  }

  if (!cache.promise) {
    cache.promise = (async () => {
      const uri = await resolveSrvUri(MONGODB_URI!);

      return mongoose
        .connect(uri, {
          serverSelectionTimeoutMS: 30_000,
          connectTimeoutMS: 30_000,
          socketTimeoutMS: 45_000,
          maxPoolSize: 10,
          minPoolSize: 1,
        })
        .then((mg) => {
          console.log(
            "[MongoDB] ✅ Connected — host=%s  db=%s",
            mg.connection.host,
            mg.connection.name
          );
          return mg;
        })
        .catch((err: Error) => {
          console.error("[MongoDB] ❌ Connection failed:", err.message);
          console.error("[MongoDB]    code  =", (err as any).code ?? "N/A");
          console.error("[MongoDB]    name  =", err.name);
          cache.promise = null; // Allow retry on next call
          throw err;
        });
    })();
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export default connectDB;