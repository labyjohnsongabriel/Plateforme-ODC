import { AuthService } from '../../src/services/auth.service';
import { AppDataSource } from '../../src/config/database';
import { ConflictError, UnauthorizedError } from '../../src/errors/AppError';

describe('AuthService (unit)', () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  describe('register', () => {
    it('rejette un email déjà existant', async () => {
      const data = {
        nom: 'Test',
        prenom: 'User',
        email: 'admin@odc.mg', // email seed
        motDePasse: 'Password123',
      };
      await expect(AuthService.register(data)).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    it('rejette un email inconnu', async () => {
      await expect(
        AuthService.login({
          email: 'unknown@odc.mg',
          motDePasse: 'WrongPassword',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('rejette un mauvais mot de passe', async () => {
      await expect(
        AuthService.login({
          email: 'admin@odc.mg',
          motDePasse: 'WrongPassword',
        })
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});