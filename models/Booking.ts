import mongoose, { Schema, models, model } from "mongoose";
import "./User";
import "./Hotel";
import "./Room";

export interface IBooking {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  hotelId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  bookingStatus: "confirmed" | "cancelled" | "completed";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hotelId: { type: Schema.Types.ObjectId, ref: "Hotel", required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    bookingStatus: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);
export default Booking;