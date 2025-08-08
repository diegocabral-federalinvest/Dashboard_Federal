import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { eq } from "drizzle-orm";

const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = userSchema.parse(body);

    const { name, email, password } = validatedData;

    // Check if user already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Este e-mail já está em uso" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const userId = createId();
    const newUser = await db.insert(users).values({
      id: userId,
      name,
      email: email.toLowerCase(),
      hashedPassword,
      role: "VIEWER", // Default role
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning({ id: users.id });

    return NextResponse.json({
      id: newUser[0].id,
      name,
      email,
      role: "VIEWER",
    }, { status: 201 });

  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 