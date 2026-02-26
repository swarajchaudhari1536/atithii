import mongoose, { Schema, models, model } from "mongoose";
import "./Hotel";

export interface IRoom {
  _id?: string;
  hotelId: mongoose.Types.ObjectId;
  type: string;
  price: number;
  capacity: number;
  availabilityStatus: boolean;
  images: string[];
  description: string;
}

const RoomSchema = new Schema<IRoom>(
  {
    hotelId: { type: Schema.Types.ObjectId, ref: "Hotel", required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    availabilityStatus: { type: Boolean, default: true },
    images: [{ type: String }],
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const Room = models.Room || model<IRoom>("Room", RoomSchema);
export default Room;