import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Augmenter le timeout par défaut
jest.setTimeout(30000);

// Mock des logs
jest.mock('../src/config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Nettoyage après tous les tests
afterAll(async () => {
  const { AppDataSource } = await import('../src/config/database');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});