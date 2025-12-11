import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name:  { type: String },
    password: { type: String }, 
    role: { type: String, enum: ["member", "admin"], default: "member" },
  },
  { timestamps: true }
);

export type UserDoc = {
  _id: string;
  email: string;
  name?: string;
  role: "member" | "admin";
};

export const User = models.User || model("User", UserSchema);
