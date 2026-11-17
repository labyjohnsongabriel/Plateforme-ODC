import { prisma } from '@/lib/prisma';

/* ============================================================================
   CONSOMMATION (anti-replay)
   ============================================================================ */

/**
 * Vérifie si un nonce a déjà été consommé par un participant.
 * Empêche le rejeu du même token par le même utilisateur.
 */
export async function isNonceConsumed(
  nonce: string,
  participantId: string,
): Promise<boolean> {
  const existing = await prisma.qrTokenConsumption.findUnique({
    where: {
      nonce_participantId: { nonce, participantId },
    },
  });
  return !!existing;
}

/**
 * Marque un nonce comme consommé.
 * La contrainte unique `(nonce, participantId)` empêche les doublons.
 */
export async function consumeNonce(
  nonce: string,
  participantId: string,
  sessionId: string,
): Promise<void> {
  await prisma.qrTokenConsumption.create({
    data: { nonce, participantId, sessionId },
  });
}

/* ============================================================================
   RÉVOCATION (optionnelle)
   ============================================================================ */

/**
 * Révoque tous les tokens d'une session.
 * Utile si le formateur clique "Fermer le QR".
 */
export async function revokeSessionTokens(sessionId: string): Promise<void> {
  await prisma.qrTokenRevocation.create({
    data: {
      sessionId,
      revokedAt: new Date(),
    },
  });
}

/**
 * Vérifie si les tokens d'une session sont révoqués.
 */
export async function isSessionRevoked(sessionId: string): Promise<boolean> {
  const revocation = await prisma.qrTokenRevocation.findFirst({
    where: { sessionId },
    orderBy: { revokedAt: 'desc' },
  });
  return !!revocation;
}