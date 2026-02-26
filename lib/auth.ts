import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export async function getTokenFromRequest(request: Request): Promise<TokenPayload | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    if (tokenMatch) {
      return verifyToken(tokenMatch[1]);
    }
  }

  return null;
}

export async function authorizeRole(request: Request, allowedRoles: string[]) {
  const payload = await getTokenFromRequest(request);
  if (!payload) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!allowedRoles.includes(payload.role)) {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user: payload, error: null };
}