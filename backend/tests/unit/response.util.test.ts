import { getPagination } from '../../src/utils/pagination.util';

describe('pagination.util', () => {
  it('retourne des valeurs par défaut', () => {
    const p = getPagination();
    expect(p.page).toBe(1);
    expect(p.limit).toBe(10);
    expect(p.skip).toBe(0);
  });

  it('calcule correctement le skip', () => {
    const p = getPagination(3, 20);
    expect(p.page).toBe(3);
    expect(p.limit).toBe(20);
    expect(p.skip).toBe(40);
  });

  it('limite le limit à 100', () => {
    const p = getPagination(1, 500);
    expect(p.limit).toBe(100);
  });

  it('force page >= 1', () => {
    const p = getPagination(-5, 10);
    expect(p.page).toBe(1);
  });
});