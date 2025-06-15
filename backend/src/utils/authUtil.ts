import redis from '../services/redis';

export const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day

export const generateSecureRandomString = () => {
    const alphabet = "abcdefghijklmnpqrstuvwxyz23456789";
    const alphabetLength = alphabet.length;
    const length = 24;

    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);

	let id = "";

    for (let i = 0; i < bytes.length && id.length < length; i++) {
        const index = bytes[i] % alphabetLength;
        if (bytes[i] - index <= 256 - alphabetLength) {
          id += alphabet[index];
        }
    }

	return id;
}

export function bufferToBase64(buf: Uint8Array): string {
    return Buffer.from(buf).toString("base64");
  }
  
export function base64ToBuffer(str: string): Uint8Array {
    return new Uint8Array(Buffer.from(str, "base64"));
  }

export async function hashSecret(secret: string) {
	const secretBytes = new TextEncoder().encode(secret);
	const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
	return new Uint8Array(secretHashBuffer);
}

export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.byteLength !== b.byteLength) {
		return false;
	}
	let c = 0;
	for (let i = 0; i < a.byteLength; i++) {
		c |= a[i] ^ b[i];
	}
	return c === 0;
}

// Types
export interface SessionWithToken extends Session {
    token: string;
}

export interface Session {
    id: string;
    userId: string;
    hashedSecret: string;
    createdAt: Date;
}

export async function createSession(userId: string): Promise<SessionWithToken> {
    const id = generateSecureRandomString();
    const secret = generateSecureRandomString();
    const hashedSecret = await hashSecret(secret);

    const token = id + ":" + secret;

    const session: SessionWithToken = {
        id,
        userId,
        hashedSecret: bufferToBase64(hashedSecret),
        token,
        createdAt: new Date()
    };

    await redis.setex(id, sessionExpiresInSeconds, JSON.stringify(session));

    return session;
}

export async function validateSessionToken(token: string): Promise<Session | null> {
    const tokenParts = token.split(":");
    if (tokenParts.length !== 2) return null;

    const sessionId = tokenParts[0];
    const sessionSecret = tokenParts[1];

    const sessionData = await redis.get(sessionId);
    if (!sessionData) return null;

    const session = JSON.parse(sessionData) as Session;
    const tokenSecretHash = await hashSecret(sessionSecret);
    const storedHash = base64ToBuffer(session.hashedSecret);
    const validSecret = constantTimeEqual(tokenSecretHash, storedHash);

    if (!validSecret) return null;

    return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
    await redis.del(sessionId);
}