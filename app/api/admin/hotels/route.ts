import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Hotel from "@/models/Hotel";
import { authorizeRole } from "@/lib/auth";

export async function GET(request: Request) {
  const { user, error } = await authorizeRole(request, ["admin"]);
  if (error) return error;

  try {
    await connectDB();
    const hotels = await Hotel.find()
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });
    return NextResponse.json({ hotels });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}