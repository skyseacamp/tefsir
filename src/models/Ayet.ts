import { Schema, model, models } from "mongoose";

const AyetSchema = new Schema(
    {
        sure: { type: String, required: true, index: true },
        ayetNo: { type: String, required: true },
        arapca: { type: String, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

// Create compound index for unique sure + ayetNo combination
AyetSchema.index({ sure: 1, ayetNo: 1 }, { unique: true });

export type AyetDoc = {
    _id: string;
    sure: string;
    ayetNo: string;
    arapca: string;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
};

export const Ayet = models.Ayet || model("Ayet", AyetSchema);
