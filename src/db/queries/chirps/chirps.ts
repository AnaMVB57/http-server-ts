import { desc, eq } from "drizzle-orm";
import { db } from "../../index.js";
import { chirps, NewChirp } from "../../schema.js";

export async function createChirps(chirp: NewChirp) {
  const [result] = await db.insert(chirps).values(chirp).returning();

  if (!result) {
    throw new Error("Failed to create chirp");
  }

  return result;
}

export async function getAllChirps(authorId?: string) {
  const result = await db
    .select()
    .from(chirps)
    .where(authorId ? eq(chirps.userId, authorId) : undefined)
    .orderBy(desc(chirps.createdAt));

  if (!result) {
    throw new Error("Failed to fetch chirps");
  }

  return result;
}

export async function getChirpById(chirpId: string) {
  const result = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, chirpId))
    .limit(1);

  if (!result) {
    throw new Error(`Failed to fetch chirp with id ${chirpId}`);
  }

  return result[0];
}

export async function deleteChirpById(chirpId: string) {
  const result = await db
    .delete(chirps)
    .where(eq(chirps.id, chirpId))
    .returning();

  if (!result) {
    throw new Error(`Failed to delete chirp with id ${chirpId}`);
  }

  return result[0];
}
