import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return salt + ":" + derivedKey.toString("hex");
}

export async function verifyPassword(
  storedPassword: string,
  suppliedPassword: string
): Promise<boolean> {
  try {
    if (!storedPassword || !suppliedPassword) {
      console.error("verifyPassword: Missing storedPassword or suppliedPassword");
      return false;
    }
    console.log(storedPassword)
    const [salt, hashedPassword] = storedPassword.split(":");
    
    if (!salt || !hashedPassword) {
      console.error("verifyPassword: Invalid storedPassword format");
      return false;
    }

    const derivedKey = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    const keyBuffer = Buffer.from(hashedPassword, "hex");
    
    return timingSafeEqual(derivedKey, keyBuffer);
  } catch (error) {
    console.error("verifyPassword error:", error);
    return false;
  }
}

// Helper function to check if a password is hashed
export function isPasswordHashed(password: string): boolean {
  return password.includes(':') && password.length > 32;
}