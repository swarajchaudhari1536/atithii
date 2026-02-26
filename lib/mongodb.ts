import mongoose from "mongoose";
import dns from "dns";
import { promisify } from "util";

const resolveSrv = promisify(dns.resolveSrv);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    };

    let connectionString = MONGODB_URI!;

    // Manual SRV resolution if local DNS is failing
    if (connectionString.startsWith("mongodb+srv://")) {
      try {
        console.log("=> Attempting manual SRV resolution...");
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        const url = new URL(connectionString.replace("mongodb+srv://", "http://"));
        const host = url.hostname;
        const srvRecords = await resolveSrv(`_mongodb._tcp.${host}`);

        if (srvRecords && srvRecords.length > 0) {
          const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(",");
          const params = url.search;
          const auth = url.username ? `${url.username}:${url.password}@` : "";
          const pathname = url.pathname;

          connectionString = `mongodb://${auth}${hosts}${pathname}${params}${params ? '&' : '?'}ssl=true&authSource=admin`;
          console.log("=> Manual SRV resolution successful");
        }
      } catch (dnsError) {
        console.warn("=> Manual SRV resolution failed, falling back to original URI:", dnsError);
      }
    }

    cached.promise = mongoose.connect(connectionString, opts).then((mongoose) => {
      console.log("=> New MongoDB Connection Established");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("=> MongoDB Connection Error:", e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;