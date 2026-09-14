import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../src/utils/jwt.util';

describe('jwt.util', () => {
  const payload = { userId: 'u-1', email: 'test@odc.mg', role: 'PARTICIPANT' };

  it('génère et vérifie un access token', () => {
    const token = generateAccessToken(payload);
    expect(token).toBeDefined();
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('génère et vérifie un refresh token', () => {
    const token = generateRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(payload.userId);
  });

  it('rejette un token invalide', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });

  it('access token et refresh token sont différents', () => {
    const access = generateAccessToken(payload);
    const refresh = generateRefreshToken(payload);
    expect(access).not.toBe(refresh);
  });
});