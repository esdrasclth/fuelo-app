export interface CurrencyOption {
  code: string;
  label: string;
  locale: string;
}

// El lempira hondureño es la moneda por defecto de la app.
export const CURRENCIES: CurrencyOption[] = [
  { code: "HNL", label: "Lempira hondureño (L)", locale: "es-HN" },
  { code: "USD", label: "Dólar estadounidense ($)", locale: "en-US" },
  { code: "GTQ", label: "Quetzal guatemalteco (Q)", locale: "es-GT" },
  { code: "NIO", label: "Córdoba nicaragüense (C$)", locale: "es-NI" },
  { code: "CRC", label: "Colón costarricense (₡)", locale: "es-CR" },
  { code: "MXN", label: "Peso mexicano (MX$)", locale: "es-MX" },
  { code: "COP", label: "Peso colombiano (COL$)", locale: "es-CO" },
  { code: "EUR", label: "Euro (€)", locale: "es-ES" },
];

export const DEFAULT_CURRENCY = "HNL";

export function currencyLocale(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.locale ?? "es-HN";
}
