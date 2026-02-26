import mongoose, { Schema, models, model } from "mongoose";
import "./User";
import "./Hotel";

export interface IReview {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  hotelId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hotelId: { type: Schema.Types.ObjectId, ref: "Hotel", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const Review = models.Review || model<IReview>("Review", ReviewSchema);
export default Review;