import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Hotel from "@/models/Hotel";
import Booking from "@/models/Booking";
import { authorizeRole } from "@/lib/auth";

export async function GET(request: Request) {
  const { user, error } = await authorizeRole(request, ["admin"]);
  if (error) return error;

  try {
    await connectDB();

    const totalUsers = await User.countDocuments();
    const totalHotels = await Hotel.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingApprovals = await Hotel.countDocuments({ isApproved: false });

    const revenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    const monthlyRevenue = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const recentBookings = await Booking.find()
      .populate("userId", "name email")
      .populate("hotelId", "name city")
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      totalUsers,
      totalHotels,
      totalBookings,
      totalRevenue,
      pendingApprovals,
      monthlyRevenue,
      recentBookings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}