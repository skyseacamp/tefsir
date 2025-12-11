import { Ayet } from "@/models/Ayet";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAdmin } from "@/middleware/auth";

// GET /api/admin/ayets/[id] - Get single ayet
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const ayet = await Ayet.findById(params.id)
            .populate("createdBy", "name email")
            .lean();

        if (!ayet) {
            return NextResponse.json(
                { error: "Ayet not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(ayet);
    } catch (error) {
        console.error("Error fetching ayet:", error);
        return NextResponse.json(
            { error: "Failed to fetch ayet" },
            { status: 500 }
        );
    }
}

// PUT /api/admin/ayets/[id] - Update ayet (admin only)
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await connectDB();

        const body = await req.json();
        const { sure, ayetNo, arapca } = body;

        if (!sure || !ayetNo || !arapca) {
            return NextResponse.json(
                { error: "Sure, ayetNo, and arapca are required" },
                { status: 400 }
            );
        }

        // Check if another ayet has this sure+ayetNo combination
        const existing = await Ayet.findOne({
            sure,
            ayetNo,
            _id: { $ne: params.id }
        });

        if (existing) {
            return NextResponse.json(
                { error: "Another ayet with this sure and ayetNo already exists" },
                { status: 409 }
            );
        }

        const ayet = await Ayet.findByIdAndUpdate(
            params.id,
            { sure, ayetNo, arapca },
            { new: true, runValidators: true }
        );

        if (!ayet) {
            return NextResponse.json(
                { error: "Ayet not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(ayet);
    } catch (error) {
        console.error("Error updating ayet:", error);
        return NextResponse.json(
            { error: "Failed to update ayet" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/ayets/[id] - Delete ayet (admin only)
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await connectDB();

        const ayet = await Ayet.findByIdAndDelete(params.id);

        if (!ayet) {
            return NextResponse.json(
                { error: "Ayet not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Ayet deleted successfully" });
    } catch (error) {
        console.error("Error deleting ayet:", error);
        return NextResponse.json(
            { error: "Failed to delete ayet" },
            { status: 500 }
        );
    }
}
