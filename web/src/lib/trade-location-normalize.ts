/** Display-time cleanup when deal origin/destination were saved as raw port text from PDFs. */

function nonEmpty(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function looksLikePortOrTerminal(text: string): boolean {
  const upper = text.toUpperCase();
  return (
    /\b(PORTS?|PUERTOS?|TERMINAL|WHARF|HARBOUR|HARBOR|DEPOT)\b/.test(upper) ||
    /\bSERVICE\s+CONTRACT\b/.test(upper)
  );
}

export function inferCountryFromTradeLocation(location?: string | null): string | undefined {
  const raw = nonEmpty(location);
  if (!raw) return undefined;
  const upper = raw.toUpperCase();

  const known: Array<[RegExp, string]> = [
    [/\bPERU\b|\bPERUVIAN\b|\bLIMA\b|\bCALLAO\b/i, "Peru"],
    [/\bDOMINICAN\b|\bCAUCEDO\b|\bSANTO\s+DOMINGO\b/i, "Dominican Republic"],
    [/\bCHILE\b|\bVALPARAISO\b/i, "Chile"],
    [/\bUSA\b|\bUNITED\s+STATES\b|\bMIAMI\b/i, "United States"],
    [/\bNETHERLANDS\b|\bROTTERDAM\b/i, "Netherlands"],
    [/\bSPAIN\b|\bALGECIRAS\b/i, "Spain"],
    [/\bECUADOR\b/i, "Ecuador"],
    [/\bCOLOMBIA\b/i, "Colombia"],
  ];

  for (const [pattern, country] of known) {
    if (pattern.test(upper)) return country;
  }

  if (looksLikePortOrTerminal(raw) || raw.length > 35) return undefined;
  if (/^[A-Za-zÀ-ÿ\s.'-]{2,35}$/.test(raw) && !looksLikePortOrTerminal(raw)) {
    return raw
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  return undefined;
}

export function sanitizeTradePortName(value?: string | null): string | undefined {
  let raw = nonEmpty(value);
  if (!raw) return undefined;

  raw = raw
    .replace(/\s+service\s+contract\b.*$/i, "")
    .replace(/\s+contract\s+no\.?\s*.*$/i, "")
    .replace(/\s+no\.?\s*#?\s*\d*.*$/i, "")
    .trim();

  const canonical: Array<[RegExp, string]> = [
    [/\bCALLAO\b/i, "CALLAO"],
    [/\bCAUCEDO\b/i, "CAUCEDO"],
    [/\bLIMA\b/i, "LIMA"],
    [/\bVALPARAISO\b/i, "VALPARAISO"],
    [/\bROTTERDAM\b/i, "ROTTERDAM"],
    [/\bSANTO\s+DOMINGO\b/i, "SANTO DOMINGO"],
  ];

  for (const [pattern, name] of canonical) {
    if (pattern.test(raw)) return name;
  }

  if (looksLikePortOrTerminal(raw)) return undefined;
  if (raw.length <= 28) return raw.toUpperCase();
  return undefined;
}

/** Normalize country + port for agreement UI when DB has port text in origin field. */
export function normalizeTradeRouteField(
  countryField?: string | null,
  portField?: string | null,
): { country: string; port: string } {
  const port =
    sanitizeTradePortName(portField) ??
    sanitizeTradePortName(countryField) ??
    nonEmpty(portField) ??
    "";

  const country =
    inferCountryFromTradeLocation(countryField) ??
    inferCountryFromTradeLocation(portField) ??
    inferCountryFromTradeLocation(port) ??
    (countryField && !looksLikePortOrTerminal(countryField) ? countryField : "") ??
    "";

  return { country, port };
}
