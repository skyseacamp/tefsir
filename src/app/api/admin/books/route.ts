import { Book } from "@/models/Book";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAdmin } from "@/middleware/auth";

// GET /api/admin/books - List all books
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

        const [books, total] = await Promise.all([
            Book.find(filter)
                .skip(skip)
                .limit(limit)
                .populate("author", "name")
                .populate("createdBy", "name email")
                .lean(),
            Book.countDocuments(filter)
        ]);

        return NextResponse.json({
            data: books,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching books:", error);
        return NextResponse.json(
            { error: "Failed to fetch books" },
            { status: 500 }
        );
    }
}

// POST /api/admin/books - Create new book (admin only)
export async function POST(req: Request) {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await connectDB();

        const body = await req.json();
        const { name, author } = body;

        if (!name || !author) {
            return NextResponse.json(
                { error: "Book name and author are required" },
                { status: 400 }
            );
        }

        // Check if book already exists
        const existing = await Book.findOne({ name });
        if (existing) {
            return NextResponse.json(
                { error: "Book with this name already exists" },
                { status: 409 }
            );
        }

        const book = await Book.create({
            name,
            author,
            createdBy: authResult.id
        });

        const populatedBook = await Book.findById(book._id)
            .populate("author", "name")
            .lean();

        return NextResponse.json(populatedBook, { status: 201 });
    } catch (error) {
        console.error("Error creating book:", error);
        return NextResponse.json(
            { error: "Failed to create book" },
            { status: 500 }
        );
    }
}
