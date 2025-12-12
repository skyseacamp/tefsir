import { Author } from "@/models/Author";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAdmin } from "@/middleware/auth";

// GET /api/admin/authors/[id] - Get single author
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const author = await Author.findById(params.id)
      .populate("createdBy", "name email")
      .lean();

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    return NextResponse.json(author);
  } catch (error) {
    console.error("Error fetching author:", error);
    return NextResponse.json(
      { error: "Failed to fetch author" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/authors/[id] - Update author (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if another author has this name
    const existing = await Author.findOne({
      name,
      _id: { $ne: params.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Another author with this name already exists" },
        { status: 409 }
      );
    }

    const author = await Author.findByIdAndUpdate(
      params.id,
      { name, bio },
      { new: true, runValidators: true }
    );

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    return NextResponse.json(author);
  } catch (error) {
    console.error("Error updating author:", error);
    return NextResponse.json(
      { error: "Failed to update author" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/authors/[id] - Delete author (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    await connectDB();

    const author = await Author.findByIdAndDelete(params.id);

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Author deleted successfully" });
  } catch (error) {
    console.error("Error deleting author:", error);
    return NextResponse.json(
      { error: "Failed to delete author" },
      { status: 500 }
    );
  }
}
