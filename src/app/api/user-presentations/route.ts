import { Tefsir } from "@/models/Tefsir";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAuth } from "@/middleware/auth";

// GET /api/user-presentations - Get user's own presentations
export async function GET(req: Request) {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        const skip = (page - 1) * limit;

        const [presentations, total] = await Promise.all([
            Tefsir.find({ createdBy: authResult?.id })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            Tefsir.countDocuments({ createdBy: authResult?.id })
        ]);

        return NextResponse.json({
            data: presentations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching user presentations:", error);
        return NextResponse.json(
            { error: "Failed to fetch presentations" },
            { status: 500 }
        );
    }
}

// POST /api/user-presentations - Create new presentation
export async function POST(req: Request) {
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

        const presentation = await Tefsir.create({
            kitap,
            mufessir,
            sure,
            ayetNo,
            arapca,
            aciklama,
            createdBy: authResult?.id
        });

        return NextResponse.json(presentation, { status: 201 });
    } catch (error) {
        console.error("Error creating presentation:", error);
        return NextResponse.json(
            { error: "Failed to create presentation" },
            { status: 500 }
        );
    }
}
