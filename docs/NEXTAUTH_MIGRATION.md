# Migration from Clerk to NextAuth.js

This document outlines the steps taken to migrate from Clerk to NextAuth.js for authentication in the Federal Invest platform.

## 1. Installed Packages

```bash
npm install next-auth@latest @auth/prisma-adapter @prisma/client bcrypt
npm install --save-dev @types/bcrypt
npm install @auth/drizzle-adapter
```

## 2. Database Schema Updates

Added `hashedPassword` field to the `users` table in `db/schema.ts`.

## 3. NextAuth Configuration Files

### API Route

Created NextAuth API route at `app/api/auth/[...nextauth]/route.ts` with:
- JWT session strategy
- Credentials provider
- Google OAuth provider
- Custom callbacks for role management

### Type Declarations

Created type declarations in `types/next-auth.d.ts` to include role field in the session and JWT.

## 4. User Registration and Authentication

Created a registration API at `app/api/auth/register/route.ts` for new user registration with:
- Input validation with Zod
- Password hashing with bcrypt
- Default role assignment

## 5. Authentication UI

Implemented new authentication pages:
- Sign-in page at `app/(auth)/sign-in/page.tsx`
- Sign-up page at `app/(auth)/sign-up/page.tsx`

## 6. Authentication Context

Created `AuthProvider` in `providers/auth-provider.tsx` to wrap the application with NextAuth's `SessionProvider`.

## 7. Middleware Update

Replaced Clerk middleware with custom NextAuth middleware that:
- Handles public routes
- Authenticates users with JWT
- Enforces role-based access control
- Redirects users based on roles

## 8. Component Updates

### Header

Updated the Header component to:
- Use `useSession()` from NextAuth instead of Clerk's `useUser()`
- Implement user dropdown with sign-out functionality

### Role Guard

Updated the RoleGuard component to use NextAuth's session for role verification.

## 9. Environment Variables

Added required NextAuth environment variables:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 10. Cleanup

Removed Clerk-related files and dependencies:
- Removed Clerk packages from package.json
- Deleted Clerk webhook handler
- Removed Clerk sign-in/sign-up pages
- Deleted Clerk synchronization scripts

## Testing Authentication Flow

1. Register a new user via `/sign-up`
2. Sign in via `/sign-in`
3. Verify session contains user data and role
4. Test role-based redirects
5. Test sign-out functionality

## Known Issues and Limitations

1. Existing Clerk users need to be migrated to use the new authentication system
2. Password reset functionality needs to be implemented
3. Two-factor authentication to be implemented

---

**Note**: This migration preserves all existing role-based access control logic while replacing the authentication provider. 