import { NotFoundError } from "../../../app/middleware/error/errors.js";
import { db } from "../../index.js";
import { NewUser, users } from "../../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();

  if (!result) {
    throw new Error("User already exists");
  }

  return result;
}

export async function getUserByEmail(email: string) {
  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!result) {
    throw new NotFoundError("User not found");
  }

  return result;
}

export async function deleteAllUsers() {
  await db.delete(users);
}

export async function updateUser(userId: string, email: string, hashedPassword: string) {
    const [result] = await db
        .update(users)
        .set({ email, hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

    if (!result) {
        throw new Error("User not found");
    }

    return result;
}

export async function upgradeChirpyRed(userId: string) {
    const [result] = await db
        .update(users)
        .set({ isChirpyRed: true })
        .where(eq(users.id, userId))
        .returning();

    if (!result) {
        throw new Error("User not found");
    }

    return result;
}