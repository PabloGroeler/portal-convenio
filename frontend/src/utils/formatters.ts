export function onlyDigits(value: string): string {
  return (value ?? '').replace(/\D/g, '');
}

export function formatCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatPhoneBR(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (!digits) return '';

  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);
  if (!digits) return '';

  // 00.000.000/0000-00
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function isValidEmail(email: string): boolean {
  const v = (email ?? '').trim();
  // simple and robust enough for frontend validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isValidUrl(url: string): boolean {
  const v = (url ?? '').trim();
  if (!v) return true; // optional
  try {
    const parsed = new URL(v);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// CNPJ validation (digits + check digits)
export function isValidCnpj(cnpj: string): boolean {
  const v = onlyDigits(cnpj);
  if (v.length !== 14) return false;
  if (/^(\d)\1+$/.test(v)) return false;

  const calc = (base: string, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += parseInt(base.charAt(i), 10) * weights[i];
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const d1 = calc(v.substring(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(v.substring(0, 12) + d1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return v.endsWith(`${d1}${d2}`);
}

/**
 * Format a number to Brazilian currency format
 * @param value Number in reais (e.g., 50 = R$ 50,00)
 * @returns Formatted string (e.g., "R$ 50,00")
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'R$ 0,00';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

/**
 * Parse a Brazilian currency string to number (in reais for API)
 * @param value Currency string (e.g., "R$ 50,00" or "50,00")
 * @returns Number in reais (e.g., 50.00)
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;

  // Remove currency symbol, spaces, and dots (thousands separator)
  // Keep only digits and comma (decimal separator)
  const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
  const numValue = parseFloat(cleaned);

  if (isNaN(numValue)) return 0;

  return numValue;
}
