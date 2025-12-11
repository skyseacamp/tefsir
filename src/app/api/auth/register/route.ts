import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, name, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  await connectDB();

  const exists = await User.findOne({ email });
  if (exists) return NextResponse.json({ message: "Email already in use" }, { status: 409 });

  const created = await User.create({ email, name, password });

  return NextResponse.json({ user: { id: String(created._id), email: created.email, name: created.name } }, { status: 201 });
}