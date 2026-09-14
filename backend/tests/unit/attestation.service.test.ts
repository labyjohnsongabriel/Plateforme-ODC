import {
  genererNumeroAttestation,
  genererHashAttestation,
} from '../../src/utils/attestation-number.util';

describe('attestation-number.util', () => {
  it('génère un numéro au format ODC-AAAA-DOMAINE-XXXXXX', () => {
    const numero = genererNumeroAttestation('WEB');
    expect(numero).toMatch(/^ODC-\d{4}-WEB-[A-Z0-9]{6}$/);
  });

  it('génère des numéros uniques', () => {
    const a = genererNumeroAttestation('WEB');
    const b = genererNumeroAttestation('WEB');
    expect(a).not.toBe(b);
  });

  it('normalise le domaine (accents, longueur)', () => {
    const numero = genererNumeroAttestation('Développement');
    expect(numero).toContain('DEV');
  });

  it('génère un hash SHA-256 de 64 caractères', () => {
    const hash = genererHashAttestation({
      numero: 'ODC-2026-WEB-A1B2C3',
      participantId: 'p-1',
      sessionId: 's-1',
      dateEmission: new Date('2026-01-01'),
    });
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it('produit le même hash pour mêmes données', () => {
    const data = {
      numero: 'ODC-2026-WEB-XYZ',
      participantId: 'p-1',
      sessionId: 's-1',
      dateEmission: new Date('2026-01-01'),
    };
    expect(genererHashAttestation(data)).toBe(genererHashAttestation(data));
  });
});