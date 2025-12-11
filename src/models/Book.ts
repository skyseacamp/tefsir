import { Schema, model, models } from "mongoose";

const BookSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export type BookDoc = {
  _id: string;
  name: string;
  author: string; // Author ID
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const Book = models.Book || model("Book", BookSchema);
