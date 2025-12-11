import { Ayet } from "@/models/Ayet";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAdmin } from "@/middleware/auth";

// GET /api/admin/ayets - List all ayets
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const sure = searchParams.get("sure") || "";

        const skip = (page - 1) * limit;

        // Build filter
        const filter: any = {};
        if (sure) {
            filter.sure = sure;
        }

        const [ayets, total] = await Promise.all([
            Ayet.find(filter)
                .skip(skip)
                .limit(limit)
                .populate("createdBy", "name email")
                .sort({ sure: 1, ayetNo: 1 })
                .lean(),
            Ayet.countDocuments(filter)
        ]);

        return NextResponse.json({
            data: ayets,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching ayets:", error);
        return NextResponse.json(
            { error: "Failed to fetch ayets" },
            { status: 500 }
        );
    }
}

// POST /api/admin/ayets - Create new ayet (admin only)
export async function POST(req: Request) {
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

        // Check if ayet already exists
        const existing = await Ayet.findOne({ sure, ayetNo });
        if (existing) {
            return NextResponse.json(
                { error: "This ayet already exists" },
                { status: 409 }
            );
        }

        const ayet = await Ayet.create({
            sure,
            ayetNo,
            arapca,
            createdBy: authResult.id
        });

        return NextResponse.json(ayet, { status: 201 });
    } catch (error) {
        console.error("Error creating ayet:", error);
        return NextResponse.json(
            { error: "Failed to create ayet" },
            { status: 500 }
        );
    }
}
