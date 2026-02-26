import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authorizeRole } from "@/lib/auth";

export async function GET(request: Request) {
  const { user, error } = await authorizeRole(request, ["admin"]);
  if (error) return error;

  try {
    await connectDB();
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}