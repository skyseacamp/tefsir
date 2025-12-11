import { Schema, model, models } from "mongoose";

const TefsirSchema = new Schema(
  {
    // Support both old (string) and new (reference) formats for backward compatibility
    kitap: { type: Schema.Types.Mixed, required: true }, // String or ObjectId ref to Book
    mufessir: { type: Schema.Types.Mixed, required: true, index: true }, // String or ObjectId ref to Author
    sure: { type: String, required: true, index: true },
    ayetNo: { type: String, required: true },
    arapca: { type: String, required: true },
    aciklama: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Create compound index for better query performance
TefsirSchema.index({ sure: 1, ayetNo: 1 });
TefsirSchema.index({ mufessir: 1, sure: 1 });

export type TefsirDoc = {
  _id: string;
  kitap: string; // Book name or ID
  mufessir: string; // Author name or ID
  sure: string;
  ayetNo: string;
  arapca: string;
  aciklama: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const Tefsir = models.Tefsir || model("Tefsir", TefsirSchema);
