import mongoose from "mongoose";
import dns from "dns";
import { promisify } from "util";

// Resolve SRV and TXT records for MongoDB SRV URIs
const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

// Set global DNS servers (Google/Cloudflare) to bypass local DNS issues
// This is critical for resolving MongoDB Atlas SRV records in many environments
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
  console.warn("[MongoDB] Failed to set custom DNS servers:", e);
}

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
 * Manually resolve mongodb+srv:// to a direct mongodb:// URI with multiple hosts.
 * This is used as a workaround for environments where SRV resolution fails natively.
 */
async function resolveMongoSrv(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) return uri;

  try {
    const url = new URL(uri.replace("mongodb+srv://", "http://"));
    const host = url.hostname;

    console.log(`[MongoDB] SRV Manual Resolution Started: ${host}`);

    // Resolve SRV records (_mongodb._tcp.host)
    const srvRecords = await resolveSrv(`_mongodb._tcp.${host}`);
    if (!srvRecords || srvRecords.length === 0) {
      throw new Error("No SRV records found for " + host);
    }

    // Join all host:port into a comma-separated list
    const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(",");

    // Pull options from TXT record if available
    let txtOptions = "";
    try {
      const txt = await resolveTxt(host);
      if (txt && txt.length > 0) {
        txtOptions = txt.flat().join("&");
      }
    } catch {
      // TXT is optional
    }

    // Combine credentials, database, and all options
    const auth = url.username ? `${url.username}:${url.password}@` : "";
    const dbName = url.pathname; // includes the "/"

    // Merge options from both TXT and the original URI query string
    const originalParams = url.search.substring(1);
    const combinedOptions = [txtOptions, originalParams, "ssl=true"].filter(Boolean).join("&");

    const resolvedUri = `mongodb://${auth}${hosts}${dbName}?${combinedOptions}`;

    // Mask for logging
    const masked = resolvedUri.replace(/:\/\/([^:]+):([^@]+)@/, "://user:pass@");
    console.log(`[MongoDB] SRV Manual Resolution Success. Hosts: ${srvRecords.length}`);

    return resolvedUri;
  } catch (err: any) {
    console.warn("[MongoDB] SRV Manual Resolution Failed:", err.message);
    return uri; // Fallback to original
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
    // Reset DNS servers just before connecting to be safe
    try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch { }

    cache.promise = (async () => {
      // Apply manual resolution
      const uri = await resolveMongoSrv(MONGODB_URI!);

      return mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        // More pool for higher traffic
        maxPoolSize: 10,
      }).then((m) => {
        console.log(`[MongoDB] Connected! DB: ${m.connection.name}`);
        return m;
      }).catch((err) => {
        console.error(`[MongoDB] ❌ Connection error: ${err.message}`);
        cache.promise = null;
        throw err;
      });
    })();
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export default connectDB;