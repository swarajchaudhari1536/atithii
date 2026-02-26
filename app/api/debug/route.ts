import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    time: new Date().toISOString(),
    env: {
      url: process.env.NEXT_PUBLIC_APP_URL,
      mongo: !!process.env.MONGODB_URI,
    }
  });
}
