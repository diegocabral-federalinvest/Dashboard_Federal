import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { createId } from '@paralleldrive/cuid2';

async function main() {
  try {
    const args = new Map<string, string | undefined>(
      process.argv.slice(2).map((arg) => {
        const [k, v] = arg.split('=');
        return [k.replace(/^--/, '').toLowerCase(), v];
      })
    );

    const email = (args.get('email') || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const password = args.get('password') || process.env.ADMIN_PASSWORD || 'admin123!@#';
    const name = args.get('name') || 'Administrator';

    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }

    if (!email) {
      throw new Error('Missing --email or ADMIN_EMAIL');
    }

    const client = postgres(DATABASE_URL, {
      ssl: DATABASE_URL.includes('sslmode=require') ? 'require' : false,
      max: 1,
    });

    const db = drizzle(client, { schema });

    const existing = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const hashedPassword = await hash(password, 10);

    if (existing.length > 0) {
      await db
        .update(users)
        .set({ role: 'ADMIN', hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, existing[0].id));

      console.log(`✅ Updated existing user to ADMIN: ${email}`);
    } else {
      const id = createId();
      await db.insert(users).values({
        id,
        name,
        email,
        hashedPassword,
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Created ADMIN user: ${email}`);
    }

    await client.end();
    console.log('🎉 Done');
  } catch (err) {
    console.error('❌ Failed:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();