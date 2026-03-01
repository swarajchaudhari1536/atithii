import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Room from "@/models/Room";
import { getTokenFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  console.log("GET /api/bookings - Request received");
  try {
    const payload = await getTokenFromRequest(request);
    console.log("GET /api/bookings - Payload:", payload ? "found" : "not found");
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get("hotelId");

    let filter: any = {};

    if (payload.role === "customer") {
      filter.userId = payload.userId;
    } else if (payload.role === "owner" && hotelId) {
      filter.hotelId = hotelId;
    } else if (payload.role === "admin") {
      // admin sees all
    } else if (payload.role === "owner") {
      // owner needs to see bookings for their hotels
      const Hotel = (await import("@/models/Hotel")).default;
      const ownerHotels = await Hotel.find({ ownerId: payload.userId }).select("_id");
      const hotelIds = ownerHotels.map((h: any) => h._id);
      filter.hotelId = { $in: hotelIds };
    }

    const bookings = await Booking.find(filter)
      .populate("hotelId", "name city images")
      .populate("roomId", "type price")
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    console.log(`GET /api/bookings - Returning ${bookings.length} bookings`);
    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("GET /api/bookings - Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await getTokenFromRequest(request);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await request.json();

    const booking = await Booking.create({
      ...body,
      userId: payload.userId,
      paymentStatus: "pending",
      bookingStatus: "confirmed",
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}