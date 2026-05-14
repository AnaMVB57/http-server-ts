import { asc, eq } from "drizzle-orm";
import { db } from "../../index.js";
import { chirps, NewChirp } from "../../schema.js";

export async function createChirps(chirp: NewChirp) {
  const [result] = await db.insert(chirps).values(chirp).returning();

  if (!result) {
    throw new Error("Failed to create chirp");
  }

  return result;
}

export async function getAllChirps() {
  const result = await db.select().from(chirps).orderBy(asc(chirps.createdAt));

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
