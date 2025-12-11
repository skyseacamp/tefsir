import { Book } from "@/models/Book";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAdmin } from "@/middleware/auth";

// GET /api/admin/books/[id] - Get single book
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const book = await Book.findById(params.id)
            .populate("author", "name")
            .populate("createdBy", "name email")
            .lean();

        if (!book) {
            return NextResponse.json(
                { error: "Book not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(book);
    } catch (error) {
        console.error("Error fetching book:", error);
        return NextResponse.json(
            { error: "Failed to fetch book" },
            { status: 500 }
        );
    }
}

// PUT /api/admin/books/[id] - Update book (admin only)
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
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

        // Check if another book has this name
        const existing = await Book.findOne({
            name,
            _id: { $ne: params.id }
        });

        if (existing) {
            return NextResponse.json(
                { error: "Another book with this name already exists" },
                { status: 409 }
            );
        }

        const book = await Book.findByIdAndUpdate(
            params.id,
            { name, author },
            { new: true, runValidators: true }
        ).populate("author", "name");

        if (!book) {
            return NextResponse.json(
                { error: "Book not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(book);
    } catch (error) {
        console.error("Error updating book:", error);
        return NextResponse.json(
            { error: "Failed to update book" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/books/[id] - Delete book (admin only)
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await connectDB();

        const book = await Book.findByIdAndDelete(params.id);

        if (!book) {
            return NextResponse.json(
                { error: "Book not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error("Error deleting book:", error);
        return NextResponse.json(
            { error: "Failed to delete book" },
            { status: 500 }
        );
    }
}
