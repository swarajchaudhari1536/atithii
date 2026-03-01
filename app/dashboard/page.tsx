"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import StatsCard from "@/components/StatsCard";
import { formatINR, formatDate } from "@/utils/formatCurrency";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CustomerDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  console.log("Dashboard State:", { authLoading, user: !!user, loading });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setLoading(false);
        router.push("/login?redirect=/dashboard");
        return;
      }
      if (user.role === "admin") {
        router.push("/admin");
        return;
      }
      if (user.role === "owner") {
        router.push("/owner");
        return;
      }
      fetchBookings();
    }
  }, [user, authLoading, router]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  const activeBookings = bookings.filter(
    (b) => b.bookingStatus === "confirmed" && b.paymentStatus === "paid"
  );
  const totalSpent = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">
            Welcome back, {user?.name?.split(" ")[0]}! 🙏
          </h1>
          <p className="text-gray-500 mt-1">Here's your booking overview</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Bookings" value={bookings.length} icon="📋" color="bg-gradient-to-br from-saffron-500 to-saffron-600" index={0} />
          <StatsCard title="Active Bookings" value={activeBookings.length} icon="✅" color="bg-gradient-to-br from-india-green to-green-600" index={1} />
          <StatsCard title="Total Spent" value={formatINR(totalSpent)} icon="💰" color="bg-gradient-to-br from-blue-500 to-blue-600" index={2} />
          <StatsCard title="Reviews Given" value="–" icon="⭐" color="bg-gradient-to-br from-purple-500 to-purple-600" index={3} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link href="/hotels" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-saffron-200 transition text-center">
            <span className="text-3xl block mb-2">🔍</span>
            <span className="font-medium text-gray-700">Browse Hotels</span>
          </Link>
          <Link href="/dashboard/bookings" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-saffron-200 transition text-center">
            <span className="text-3xl block mb-2">📅</span>
            <span className="font-medium text-gray-700">My Bookings</span>
          </Link>
          <Link href="/dashboard/profile" className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-saffron-200 transition text-center">
            <span className="text-3xl block mb-2">👤</span>
            <span className="font-medium text-gray-700">Edit Profile</span>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>
            <Link href="/dashboard/bookings" className="text-saffron-500 text-sm font-medium hover:underline">
              View All →
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl block mb-3">🏨</span>
              <p className="text-gray-500">No bookings yet</p>
              <Link href="/hotels" className="text-saffron-500 font-medium mt-2 inline-block hover:underline">
                Browse Hotels →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 font-medium">Hotel</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Check-in</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Check-out</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.slice(0, 5).map((booking: any) => (
                    <tr key={booking._id} className="hover:bg-gray-50 transition">
                      <td className="py-3">
                        <p className="font-medium text-gray-800">{booking.hotelId?.name || "N/A"}</p>
                        <p className="text-xs text-gray-400">{booking.hotelId?.city}</p>
                      </td>
                      <td className="py-3 hidden sm:table-cell text-gray-600">
                        {formatDate(booking.checkInDate)}
                      </td>
                      <td className="py-3 hidden sm:table-cell text-gray-600">
                        {formatDate(booking.checkOutDate)}
                      </td>
                      <td className="py-3 font-semibold text-india-green">
                        {formatINR(booking.totalAmount)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${booking.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : booking.paymentStatus === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}