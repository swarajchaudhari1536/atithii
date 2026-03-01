"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatINR } from "@/utils/formatCurrency";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiPlus, FiEdit2, FiGrid, FiCalendar, FiTrendingUp, FiHome, FiExternalLink } from "react-icons/fi";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function OwnerDashboard() {
  const { user, token } = useAuth();
  const [hotels, setHotels] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const [hRes, bRes] = await Promise.all([
        fetch(`/api/hotels?ownerId=${user?._id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/bookings", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const hData = await hRes.json();
      const bData = await bRes.json();
      setHotels(hData.hotels || []);
      setBookings(bData.bookings || []);
    } catch { }
    finally { setLoading(false); }
  };

  const totalRevenue = bookings.filter((b) => b.paymentStatus === "paid").reduce((s, b) => s + b.totalAmount, 0);
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  const STATS = [
    { label: "My Properties", value: hotels.length, icon: "🏨", color: "from-gold-400 to-saffron-500", shadow: "shadow-gold" },
    { label: "Total Bookings", value: bookings.length, icon: "📋", color: "from-blue-400 to-indigo-500", shadow: "" },
    { label: "Total Revenue", value: formatINR(totalRevenue), icon: "💰", color: "from-india-green to-emerald-600", shadow: "" },
    { label: "Pending", value: pendingBookings, icon: "⏳", color: "from-amber-400 to-orange-500", shadow: "" },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <div className="text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-gold-400 to-saffron-500 rounded-2xl flex items-center justify-center text-2xl shadow-gold mx-auto mb-4 animate-pulse">🏨</div>
        <p className="text-stone-400 font-medium">Loading your dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50">
      {/* ── Header Banner ── */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0c0a09 0%,#1c1917 60%,#292524 100%)" }}>
        <div className="india-stripe" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 py-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-gold-400 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Owner Dashboard</p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-white mb-1">
              Namaste, <span className="italic gradient-gold">{user?.name?.split(" ")[0]}</span> 🙏
            </h1>
            <p className="text-stone-500 mt-1 text-base">Here's an overview of your properties.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-8">

        {/* ── Stats ── */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-8 mb-8 relative z-10">
          {STATS.map((s) => (
            <motion.div key={s.label} variants={fadeUp}
              className={`bg-white rounded-2xl p-5 shadow-luxury border border-stone-100 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
              <div className={`absolute top-3 right-3 w-12 h-12 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide mb-2">{s.label}</p>
              <p className="font-display text-3xl font-semibold text-stone-900">{s.value}</p>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          ))}
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { href: "/owner/hotels/new", icon: <FiPlus size={20} />, label: "Add New Hotel", color: "from-gold-500 to-saffron-600", isGold: true },
            { href: "/owner/hotels", icon: <FiGrid size={20} />, label: "Manage Hotels", color: "from-blue-50 to-blue-50", isGold: false },
            { href: "/owner/bookings", icon: <FiCalendar size={20} />, label: "View Bookings", color: "from-green-50 to-green-50", isGold: false },
          ].map((a) => (
            <motion.div key={a.href} variants={fadeUp}>
              <Link href={a.href}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${a.isGold
                  ? "bg-gradient-to-r from-gold-500 to-saffron-600 border-transparent text-white shadow-gold hover:shadow-[0_12px_40px_rgba(217,119,6,0.4)]"
                  : "bg-white border-stone-100 text-stone-700 hover:border-gold-200 hover:shadow-luxury"
                  }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${a.isGold ? "bg-white/20" : "bg-gold-50 text-gold-600"}`}>
                  {a.icon}
                </div>
                <span className={`font-semibold text-base ${a.isGold ? "text-white" : "text-stone-800"}`}>{a.label}</span>
                <FiExternalLink size={14} className="ml-auto opacity-40" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Hotels Table ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl border border-stone-100 shadow-luxury overflow-hidden">
          <div className="flex items-center justify-between px-7 py-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <FiHome className="text-gold-500" size={18} />
              <h2 className="font-display text-xl font-semibold text-stone-900">My Properties</h2>
              {hotels.length > 0 && (
                <span className="text-xs bg-gold-50 text-gold-700 border border-gold-100 px-2.5 py-1 rounded-full font-semibold">{hotels.length}</span>
              )}
            </div>
            <Link href="/owner/hotels/new"
              className="flex items-center gap-2 text-sm text-gold-600 font-semibold hover:text-gold-700 bg-gold-50 hover:bg-gold-100 px-3.5 py-2 rounded-xl transition-all">
              <FiPlus size={14} /> Add Hotel
            </Link>
          </div>

          {hotels.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-5">🏗️</span>
              <h3 className="font-display text-2xl text-stone-700 mb-2">No properties yet</h3>
              <p className="text-stone-400 mb-7">Add your first hotel and start earning.</p>
              <Link href="/owner/hotels/new" className="btn-gold">+ Add Your First Hotel</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <table className="w-full hidden sm:table">
                <thead>
                  <tr className="bg-cream-50 border-b border-stone-100 text-left">
                    {["Property", "Location", "Price / Night", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {hotels.map((hotel) => (
                    <tr key={hotel._id} className="hover:bg-cream-50/70 transition-colors group">
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                            <img src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=70"}
                              alt={hotel.name} className="w-full h-full object-cover" />
                          </div>
                          <p className="font-display font-semibold text-stone-800 text-base group-hover:text-gold-600 transition-colors">{hotel.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500 text-left">{hotel.city}, {hotel.state}</td>
                      <td className="px-6 py-4 font-display font-semibold gradient-green text-base text-left">
                        <span style={{ background: "linear-gradient(135deg,#064e3b,#138808)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                          {formatINR(hotel.pricePerNight)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className={`chip ${hotel.isApproved ? "chip-paid" : "chip-pending"}`}>
                          {hotel.isApproved ? "✓ Live" : "⏳ Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex gap-2">
                          <Link href={`/owner/hotels/${hotel._id}/edit`}
                            className="flex items-center gap-1 text-xs font-semibold text-gold-600 hover:text-gold-700 bg-gold-50 hover:bg-gold-100 px-2.5 py-1.5 rounded-lg transition-all">
                            <FiEdit2 size={11} /> Edit
                          </Link>
                          <Link href={`/owner/rooms/${hotel._id}`}
                            className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-all">
                            <FiGrid size={11} /> Rooms
                          </Link>
                          <Link href={`/hotels/${hotel._id}`}
                            className="flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-700 bg-stone-50 hover:bg-stone-100 px-2.5 py-1.5 rounded-lg transition-all">
                            <FiExternalLink size={11} /> View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-stone-100">
                {hotels.map((hotel) => (
                  <div key={hotel._id} className="p-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=70"}
                          alt={hotel.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-stone-800 text-lg line-clamp-1">{hotel.name}</p>
                        <p className="text-sm text-stone-400">{hotel.city}, {hotel.state}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`chip ${hotel.isApproved ? "chip-paid" : "chip-pending"}`}>
                        {hotel.isApproved ? "✓ Live" : "⏳ Pending"}
                      </span>
                      <p className="font-display font-bold text-lg text-emerald-700">{formatINR(hotel.pricePerNight)}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Link href={`/owner/hotels/${hotel._id}/edit`}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-50">
                        <FiEdit2 size={12} /> Edit
                      </Link>
                      <Link href={`/owner/rooms/${hotel._id}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-50">
                        <FiGrid size={12} /> Rooms
                      </Link>
                      <Link href={`/hotels/${hotel._id}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-50">
                        <FiExternalLink size={12} /> View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Developer credit ── */}
        <div className="text-center mt-12 py-6 border-t border-stone-100">
          <p className="text-xs text-stone-400">
            Atithi — Smart Hotel Management System &nbsp;·&nbsp; Designed & developed by{" "}
            <span className="text-gold-600 font-semibold">Swaraj Chaudhari</span>
            <span className="text-stone-300 mx-2">·</span>
            <a href="tel:+919373235696" className="text-gold-500 hover:underline">+91 70392 19698</a>
          </p>
        </div>
      </div>
    </div>
  );
}