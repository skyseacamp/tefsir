import { Tefsir } from "@/models/Tefsir";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAuth } from "@/middleware/auth";

// GET /api/user-presentations/[id] - Get single presentation
export async function GET(
    req: Request,
    { params }: any
) {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await connectDB();

        const presentation = await Tefsir.findOne({
            _id: params.id,
            createdBy: authResult.id
        }).lean();

        if (!presentation) {
            return NextResponse.json(
                { error: "Presentation not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(presentation);
    } catch (error) {
        console.error("Error fetching presentation:", error);
        return NextResponse.json(
            { error: "Failed to fetch presentation" },
            { status: 500 }
        );
    }
}

// PUT /api/user-presentations/[id] - Update presentation (owner only)
export async function PUT(
    req: Request,
    { params }: any
) {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await connectDB();

        const body = await req.json();
        const { kitap, mufessir, sure, ayetNo, arapca, aciklama } = body;

        // Validate required fields
        if (!kitap || !mufessir || !sure || !ayetNo || !arapca || !aciklama) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Find and update only if user is the owner
        const presentation = await Tefsir.findOneAndUpdate(
            { _id: params.id, createdBy: authResult.id },
            { kitap, mufessir, sure, ayetNo, arapca, aciklama },
            { new: true, runValidators: true }
        );

        if (!presentation) {
            return NextResponse.json(
                { error: "Presentation not found or you don't have permission" },
                { status: 404 }
            );
        }

        return NextResponse.json(presentation);
    } catch (error) {
        console.error("Error updating presentation:", error);
        return NextResponse.json(
            { error: "Failed to update presentation" },
            { status: 500 }
        );
    }
}

// DELETE /api/user-presentations/[id] - Delete presentation (owner only)
export async function DELETE(
    req: Request,
    { params }: any
) {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await connectDB();

        // Find and delete only if user is the owner
        const presentation = await Tefsir.findOneAndDelete({
            _id: params.id,
            createdBy: authResult.id
        });

        if (!presentation) {
            return NextResponse.json(
                { error: "Presentation not found or you don't have permission" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Presentation deleted successfully" });
    } catch (error) {
        console.error("Error deleting presentation:", error);
        return NextResponse.json(
            { error: "Failed to delete presentation" },
            { status: 500 }
        );
    }
}
