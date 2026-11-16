const RUC_PREFIXES = ['10', '15', '16', '17', '20'];
const RUC_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

/**
 * Validates a Peruvian RUC: 11 digits, an allowed issuing-entity prefix
 * (10/15/16/17/20) and the modulo-11 check digit used by SUNAT.
 * Mirrors the backend implementation in cocos-back
 * (src/clients/validators/identification.validator.ts).
 */
export function isValidRuc(identification: string): boolean {
  if (!/^\d{11}$/.test(identification)) {
    return false;
  }

  if (!RUC_PREFIXES.includes(identification.slice(0, 2))) {
    return false;
  }

  const digits = identification.split('').map(Number);
  const weightedSum = digits
    .slice(0, 10)
    .reduce((sum, digit, index) => sum + digit * RUC_WEIGHTS[index], 0);
  const remainder = 11 - (weightedSum % 11);
  const expectedCheckDigit =
    remainder === 10 ? 0 : remainder === 11 ? 1 : remainder;

  return digits[10] === expectedCheckDigit;
}
