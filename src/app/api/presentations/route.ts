import { Tefsir } from "@/models/Tefsir";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";

export async function GET(req: Request) {
    try {
        await connectDB();

        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const kitap = searchParams.get("kitap");
        const mufessir = searchParams.get("mufessir");
        const ayetNo = searchParams.get("ayetNo");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "100");

        // Build filter object
        const filter: any = {};
        if (kitap) filter.kitap = kitap;
        if (mufessir) filter.mufessir = mufessir;
        if (ayetNo) filter.ayetNo = ayetNo;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query with filters and pagination
        const [presentations, total] = await Promise.all([
            Tefsir.find(filter)
                .skip(skip)
                .limit(limit)
                .lean(),
            Tefsir.countDocuments(filter)
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
        console.error("Error fetching presentations:", error);
        return NextResponse.json(
            { error: "Failed to fetch presentations" },
            { status: 500 }
        );
    }
}