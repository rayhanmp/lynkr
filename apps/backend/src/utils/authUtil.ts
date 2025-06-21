import redis from '../services/redis';
import { createHash } from 'crypto';
import { Resend } from 'resend';
import { constantTimeEqual, generateSecureRandomString, bufferToBase64, base64ToBuffer } from '@lynkr/shared';

export const sessionExpiresInSeconds = 60 * 60 * 24; // 1 day

export async function hashSecret(secret: string) {
	const secretBytes = new TextEncoder().encode(secret);
	const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
	return new Uint8Array(secretHashBuffer);
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
    const id = generateSecureRandomString(24);
    const secret = generateSecureRandomString(24);
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

export async function createVerificationToken(userId: string): Promise<string> {
  const verificationToken = generateSecureRandomString(24);
  const hashedVerificationToken = createHash('sha256').update(verificationToken, 'utf8').digest('hex');
  
  // Set the verification token in Redis with a 15 minute expiration
  await redis.set(`verify:${hashedVerificationToken}`, userId, 'EX', 900, 'NX');

  return verificationToken;
}

export async function sendVerificationEmail(email: string, verificationToken: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const frontendUrl = process.env.FRONTEND_URL;

  if (!resendApiKey || !frontendUrl) {
    throw new Error('Missing required environment variables: RESEND_API_KEY or FRONTEND_URL');
  }

  const resend = new Resend(resendApiKey);
  const verificationLink = `${frontendUrl}/api/verify?token=${verificationToken}`;

  await resend.emails.send({
    from: 'Lynkr <noreply@lynkr.rayhan.id>',
    to: [email],
    subject: 'Confirm your email address',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a; line-height: 1.5;">
        <h2 style="color: #333;">Welcome to <strong>Lynkr</strong> 👋</h2>
        <p>You're almost ready to start using Lynkr. Please confirm your email address by clicking the button below:</p>
        <p style="margin: 20px 0;">
          <a href="${verificationLink}" 
             style="display: inline-block; background-color: #4f46e5; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px;">
            Verify Email
          </a>
        </p>
        <p>If the button doesn't work, you can also copy and paste this URL into your browser:</p>
        <p style="word-break: break-all;">
          <a href="${verificationLink}">${verificationLink}</a>
        </p>
        <hr style="margin: 32px 0;" />
        <p style="font-size: 0.9em; color: #555;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <p style="font-size: 0.9em; color: #555;">— The Lynkr Team</p>
      </div>
    `,
    text: `
Welcome to Lynkr!

Please confirm your email address by visiting the following link:
${verificationLink}

The link will expire in 15 minutes. If you need a new link, kindly request a new verification email.

If you didn't request this, you can safely ignore this email.

— The Lynkr Team
    `,
  });
}