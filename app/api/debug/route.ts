import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Hotel from "@/models/Hotel";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();

  const total = await Hotel.countDocuments({});
  const approved = await Hotel.countDocuments({ isApproved: true });
  const hotels = await Hotel.find({}).limit(10).populate("ownerId", "name email").lean();

  return NextResponse.json({
    status: "ok",
    counts: { total, approved, users: await User.countDocuments({}) },
    hotels: hotels.map((h: any) => ({
      _id: h._id,
      name: h.name,
      isApproved: h.isApproved,
      owner: h.ownerId ? "populated" : "MISSING",
      ownerData: h.ownerId
    }))
  });
}
