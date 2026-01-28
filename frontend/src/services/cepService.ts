export interface CepLookupResult {
  cep: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export async function lookupCep(cep: string): Promise<CepLookupResult | null> {
  const digits = (cep ?? '').replace(/\D/g, '');
  if (digits.length !== 8) return null;

  const resp = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!resp.ok) return null;
  const data = (await resp.json()) as CepLookupResult;
  if (data.erro) return null;
  return data;
}

