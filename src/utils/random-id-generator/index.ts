import { createHash } from "crypto";

export async function generateHashed(
  UUID_1: string,
  UUID_2: string,
  length: number = 50
): Promise<string> {
  const { nanoid } = await import("nanoid");
  if (UUID_1.length !== 36 || UUID_2.length !== 36) {
    return nanoid(length);
  }

  const randomSeed = nanoid();
  const combined = `${UUID_1}${randomSeed}${UUID_2}`;

  const hashBuffer = createHash("sha512").update(combined).digest("base64url");

  if (hashBuffer.length >= length) return hashBuffer.slice(0, length);

  const extra = nanoid(length - hashBuffer.length);
  return hashBuffer + extra;
}
