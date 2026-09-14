import { hashPassword, comparePassword } from '../../src/utils/password.util';

describe('password.util', () => {
  it('hache un mot de passe', async () => {
    const hash = await hashPassword('Password123');
    expect(hash).toBeDefined();
    expect(hash).not.toBe('Password123');
    expect(hash.length).toBeGreaterThan(50);
  });

  it('vérifie un mot de passe correct', async () => {
    const password = 'Password123';
    const hash = await hashPassword(password);
    const valid = await comparePassword(password, hash);
    expect(valid).toBe(true);
  });

  it('rejette un mot de passe incorrect', async () => {
    const hash = await hashPassword('Password123');
    const valid = await comparePassword('WrongPassword', hash);
    expect(valid).toBe(false);
  });

  it('génère 2 hash différents pour le même mot de passe (salt)', async () => {
    const pwd = 'Password123';
    const hash1 = await hashPassword(pwd);
    const hash2 = await hashPassword(pwd);
    expect(hash1).not.toBe(hash2);
  });
});