import { Schema, model, models } from "mongoose";

const AuthorSchema = new Schema(
    {
        name: { type: String, required: true, unique: true, index: true },
        bio: { type: String },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export type AuthorDoc = {
    _id: string;
    name: string;
    bio?: string;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
};

export const Author = models.Author || model("Author", AuthorSchema);
