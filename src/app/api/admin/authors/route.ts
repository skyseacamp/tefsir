import { Author } from "@/models/Author";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAdmin } from "@/middleware/auth";

// GET /api/admin/authors - List all authors
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const search = searchParams.get("search") || "";

        const skip = (page - 1) * limit;

        // Build search filter
        const filter: any = {};
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        const [authors, total] = await Promise.all([
            Author.find(filter)
                .skip(skip)
                .limit(limit)
                .populate("createdBy", "name email")
                .lean(),
            Author.countDocuments(filter)
        ]);

        return NextResponse.json({
            data: authors,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching authors:", error);
        return NextResponse.json(
            { error: "Failed to fetch authors" },
            { status: 500 }
        );
    }
}

// POST /api/admin/authors - Create new author (admin only)
export async function POST(req: Request) {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await connectDB();

        const body = await req.json();
        const { name, bio } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Author name is required" },
                { status: 400 }
            );
        }

        // Check if author already exists
        const existing = await Author.findOne({ name });
        if (existing) {
            return NextResponse.json(
                { error: "Author with this name already exists" },
                { status: 409 }
            );
        }

        const author = await Author.create({
            name,
            bio,
            createdBy: authResult.id
        });

        return NextResponse.json(author, { status: 201 });
    } catch (error) {
        console.error("Error creating author:", error);
        return NextResponse.json(
            { error: "Failed to create author" },
            { status: 500 }
        );
    }
}
