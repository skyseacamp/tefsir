import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export async function authenticateUser(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return { error: "No token provided", status: 401 };
        }

        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            return { error: "Server configuration error", status: 500 };
        }

        const decoded = jwt.verify(token, secret) as {
            id: string;
            email: string;
            role: string;
        };

        return { user: decoded };
    } catch (error) {
        return { error: "Invalid or expired token", status: 401 };
    }
}

export async function requireAuth(req: Request) {
    const result = await authenticateUser(req);

    if (result.error) {
        return NextResponse.json(
            { error: result.error },
            { status: result.status }
        );
    }

    return result.user;
}

export async function requireAdmin(req: Request) {
    const result = await authenticateUser(req);

    if (result.error) {
        return NextResponse.json(
            { error: result.error },
            { status: result.status }
        );
    }

    if (result.user?.role !== "admin") {
        return NextResponse.json(
            { error: "Admin access required" },
            { status: 403 }
        );
    }

    return result.user;
}
