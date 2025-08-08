import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-config";
import { getServerSession } from "next-auth";
import { db } from "@/db/drizzle";
import { users, permissions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import logger from "@/lib/logger";

export async function GET() {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get current user to check role
    const currentUser = await db.select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    
    // Only ADMIN can access user list
    if (!currentUser.length || currentUser[0].role !== "ADMIN") {
      logger.warn("Non-admin user attempted to access users list", {
        context: "api/users",
        source: "backend"
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Get all users
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      lastLogin: users.lastLogin,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));
    
    // Get allowed users from permissions table
    const allowedUsers = await db.select({
      email: permissions.email,
      access: permissions.access,
    })
    .from(permissions);
    
    // Create a map for quick lookup
    const accessMap = new Map();
    allowedUsers.forEach(user => {
      accessMap.set(user.email, user.access);
    });
    
    // Combine user data with permissions
    const usersWithPermissions = allUsers.map(user => {
      // Default to true if no permission record exists
      const isAllowed = accessMap.has(user.email) ? accessMap.get(user.email) : true;
      
      return {
        ...user,
        isAllowed,
      };
    });
    
    return NextResponse.json(usersWithPermissions);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    logger.error(`Error fetching users: ${errorMessage}`, {
      context: "api/users",
      source: "backend"
    });
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
} 