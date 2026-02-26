"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import HotelCard from "@/components/HotelCard";
import { HotelCardSkeleton } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

const WHY = [
  {
    icon: "🔐", gradient: "from-amber-400 to-orange-500", bg: "bg-amber-50",
    title: "Secure Payments",
    desc: "Razorpay-secured transactions with instant booking confirmation and zero-hassle refunds.",
  },
  {
    icon: "🏆", gradient: "from-gold-400 to-gold-500", bg: "bg-yellow-50",
    title: "Curated Hotels",
    desc: "Every property personally verified for quality, cleanliness, and authentic Indian hospitality.",
  },
  {
    icon: "🇮🇳", gradient: "from-emerald-500 to-india-green", bg: "bg-green-50",
    title: "100% Indian",
    desc: "Proudly supporting local hospitality businesses across every beautiful state of India.",
  },
];

const CITIES = [
  { name: "Jaipur", emoji: "🏰", tag: "Pink City" },
  { name: "Mumbai", emoji: "🌆", tag: "City of Dreams" },
  { name: "Goa", emoji: "🏖️", tag: "Beach Paradise" },
  { name: "Kerala", emoji: "🌴", tag: "God's Own Country" },
  { name: "Delhi", emoji: "🕌", tag: "Capital City" },
  { name: "Varanasi", emoji: "🕉️", tag: "City of Light" },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hotels?limit=6")
      .then((r) => r.json())
      .then((d) => { setHotels(d.hotels || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <HeroSection />

      {/* ══ Featured Hotels ══ */}
      <section className="max-w-7xl mx-auto px-5 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold text-gold-600 bg-gold-50 border border-gold-100 px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase">
            ✦ Handpicked For You
          </span>
          <h2 className="font-display text-5xl md:text-6xl font-semibold text-stone-900 mb-4 leading-tight">
            Featured <span className="italic gradient-gold">Stays</span>
          </h2>
          <p className="text-stone-400 max-w-lg mx-auto text-lg font-light">
            Curated properties across India for an unforgettable experience.
          </p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <HotelCardSkeleton key={i} />)
            : hotels.map((h, i) => <HotelCard key={h._id} hotel={h} index={i} />)}
        </motion.div>

        {!loading && hotels.length === 0 && (
          <div className="text-center py-20">
            <span className="text-7xl block mb-5">🏗️</span>
            <h3 className="font-display text-2xl text-stone-700 mb-2">No stays yet</h3>
            <p className="text-stone-400 mb-7">Be the first to list on Atithi.</p>
            <Link href="/register" className="btn-gold">List Your Property</Link>
          </div>
        )}

        {!loading && hotels.length > 0 && (
          <div className="text-center mt-14">
            <Link href="/hotels"
              className="inline-flex items-center gap-2.5 btn-gold !text-base !rounded-2xl !px-10 !py-4">
              Explore All Hotels <FiArrowRight size={18} />
            </Link>
          </div>
        )}
      </section>

      {/* ══ Destinations (Dark) ══ */}
      <section className="relative overflow-hidden py-24"
        style={{ background: "linear-gradient(135deg,#0c0a09 0%,#1c1917 50%,#0c0a09 100%)" }}>
        {/* Decorative orbs */}
        <div className="absolute top-8 left-1/4 w-96 h-96 bg-gold-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-8 right-1/4 w-96 h-96 bg-saffron-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="india-stripe absolute top-0 left-0 right-0" />

        <div className="max-w-7xl mx-auto px-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14"
          >
            <span className="inline-block text-xs font-semibold text-gold-400 bg-gold-500/10 border border-gold-500/20 px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase">
              ✦ Explore India
            </span>
            <h2 className="font-display text-5xl md:text-6xl font-semibold text-white mb-4 leading-tight">
              Where to <span className="italic gradient-gold">Wander</span>
            </h2>
            <p className="text-stone-500 text-lg font-light">India's most captivating destinations await.</p>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {CITIES.map((c) => (
              <motion.div key={c.name} variants={fadeUp}>
                <Link href={`/hotels?city=${c.name}`}
                  className="group block border border-white/6 bg-white/3 hover:bg-white/8 hover:border-gold-500/30 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                >
                  <span className="text-4xl block mb-3 group-hover:scale-125 transition-transform duration-300">{c.emoji}</span>
                  <p className="font-semibold text-white/90 text-sm">{c.name}</p>
                  <p className="text-stone-600 text-xs mt-0.5">{c.tag}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ Why Atithi ══ */}
      <section className="max-w-7xl mx-auto px-5 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold text-india-green bg-green-50 border border-green-100 px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase">
            ✦ Why Atithi
          </span>
          <h2 className="font-display text-5xl md:text-6xl font-semibold text-stone-900 mb-4 leading-tight">
            Travel with <span className="italic gradient-green">Confidence</span>
          </h2>
          <p className="text-stone-400 text-lg font-light">Everything you need for a perfect journey.</p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {WHY.map((w) => (
            <motion.div key={w.title} variants={fadeUp}
              className={`group ${w.bg} rounded-3xl p-9 border border-white hover:shadow-luxury transition-all duration-400 hover:-translate-y-3`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${w.gradient} rounded-2xl flex items-center justify-center text-3xl mb-7 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {w.icon}
              </div>
              <h3 className="font-display text-2xl font-semibold text-stone-900 mb-3">{w.title}</h3>
              <p className="text-stone-500 leading-relaxed">{w.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══ CTA Banner ══ */}
      <section className="mx-5 mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto relative overflow-hidden rounded-[2rem] px-10 py-16 text-center"
          style={{ background: "linear-gradient(135deg, #92400e 0%, #d97706 40%, #f97316 70%, #b45309 100%)" }}
        >
          {/* Texture overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(0,0,0,0.12),transparent_60%)] pointer-events-none" />

          <div className="relative z-10">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-[0.2em] mb-3">For Hotel Owners</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mb-4 leading-tight">
              List on Atithi.<br className="hidden md:block" />
              <span className="italic">Grow Instantly.</span>
            </h2>
            <p className="text-white/75 text-lg mb-10 max-w-lg mx-auto font-light">
              Join hundreds of Indian hoteliers reaching thousands of guests every day.
              Free to list, instant visibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register"
                className="bg-white text-gold-700 font-bold px-10 py-4 rounded-2xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 text-base">
                List Your Hotel — Free
              </Link>
              <Link href="/hotels"
                className="border-2 border-white/40 text-white font-semibold px-10 py-4 rounded-2xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 text-base">
                Browse Hotels
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}