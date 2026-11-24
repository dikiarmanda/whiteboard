import { config } from "dotenv";

config({ path: ".env.local" });
config();

function readArg(name: string) {
  const flag = `--${name}`;
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function main() {
  const email = readArg("email");
  const password = readArg("password");
  const nameArg = readArg("name");

  if (!email || !password) {
    console.error(
      "Pakai: npm run user:create -- --email nama@contoh.com --password kata-sandi --name Nama",
    );
    process.exit(1);
  }

  const { createUserSchema } = await import("../lib/validators");
  const parsed = createUserSchema.safeParse({
    email,
    password,
    name: nameArg || email.split("@")[0],
  });
  if (!parsed.success) {
    console.error("Email, nama, atau kata sandi tidak valid. Kata sandi minimal 8 karakter.");
    process.exit(1);
  }

  const normalized = parsed.data.email.toLowerCase();
  const { createDb } = await import("../db");
  const { users } = await import("../db/schema");
  const { eq } = await import("drizzle-orm");
  const bcrypt = await import("bcryptjs");
  const { BCRYPT_ROUNDS } = await import("../lib/scene");

  const db = createDb(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL);
  const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);

  if (existing[0]) {
    await db
      .update(users)
      .set({
        name: parsed.data.name,
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing[0].id));
    console.log(`Akun diperbarui untuk ${normalized}.`);
    return;
  }

  await db.insert(users).values({
    email: normalized,
    name: parsed.data.name,
    passwordHash,
  });
  console.log(`Akun dibuat untuk ${normalized}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Gagal membuat akun.");
  process.exit(1);
});
