import { describe, it, expect, beforeAll } from "vitest";
import { checkPassword, getBearerToken, hashPassword, makeJWT, validateJWT } from "../api/auth/auth.js";
import type { Request } from "express";

const secret = "test-secret";
const wrongSecret = "wrong-secret";
const userId = "123e4567-e89b-12d3-a456-426614174000";

describe("Password Hashing", () => {
    const password = "correctPassword123!";
    let hash: string;

    beforeAll(async () => {
        hash = await hashPassword(password);
    });

    it("should return true for the correct password", async () => {
        expect(await checkPassword(password, hash)).toBe(true);
    });

    it("should return false for an incorrect password", async () => {
        expect(await checkPassword("wrongPassword", hash)).toBe(false);
    });
});

describe("JWT", () => {
    it("should create and validate a JWT", () => {
        const token = makeJWT(userId, 3600, secret);
        const result = validateJWT(token, secret);
        expect(result).toBe(userId);
    });

    it("should reject a JWT signed with the wrong secret", () => {
        const token = makeJWT(userId, 3600, secret);
        expect(() => validateJWT(token, wrongSecret)).toThrow();
    });

    it("should reject an expired JWT", async () => {
        const token = makeJWT(userId, -1, secret); 
        expect(() => validateJWT(token, secret)).toThrow();
    });
});

describe("getBearerToken", () => {
    it("should return the token from a valid Authorization header", () => {
        const req = { get: (key: string) => key === "Authorization" ? "Bearer mytoken123" : undefined } as unknown as Request;
        expect(getBearerToken(req)).toBe("mytoken123");
    });

    it("should throw if Authorization header is missing", () => {
        const req = { get: () => undefined } as unknown as Request;
        expect(() => getBearerToken(req)).toThrow();
    });

    it("should throw if Authorization header has no Bearer prefix", () => {
        const req = { get: () => "mytoken123" } as unknown as Request;
        expect(() => getBearerToken(req)).toThrow();
    });
});