import mongoose, { Schema, models, model } from "mongoose";
import "./User";

export interface IHotel {
  _id?: string;
  ownerId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  city: string;
  state: string;
  address: string;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  rating: number;
  totalReviews: number;
  isApproved: boolean;
  createdAt: Date;
}

const HotelSchema = new Schema<IHotel>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    amenities: [{ type: String }],
    images: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Hotel = models.Hotel || model<IHotel>("Hotel", HotelSchema);
export default Hotel;