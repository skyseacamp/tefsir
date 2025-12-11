import { authenticateUser } from "@/middleware/auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authResult = await authenticateUser(req);

  if (authResult.error) {
    return NextResponse.json({ message: authResult.error }, { status: authResult.status });
  }

  try {
    await connectDB();
    const user = await User.findById(authResult.user?.id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
