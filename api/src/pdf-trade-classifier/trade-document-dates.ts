function nonEmpty(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const MONTH_TO_NUMBER: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function monthNumber(name: string): number | undefined {
  return MONTH_TO_NUMBER[name.toLowerCase().replace(/\./g, '')];
}

function toIsoDate(
  year: number,
  month: number,
  day: number,
): string | undefined {
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    year < 1900 ||
    year > 2100
  ) {
    return undefined;
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Normalize dates from trade PDFs (DD/MM/YYYY, DD-MMM-YYYY, month names) to YYYY-MM-DD. */
export function parseTradeDocumentDate(
  value: string | null | undefined,
): string | undefined {
  const raw = nonEmpty(value);
  if (!raw) return undefined;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const dmyNumeric = raw.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (dmyNumeric) {
    let year = Number(dmyNumeric[3]);
    if (year < 100) year += 2000;
    return toIsoDate(year, Number(dmyNumeric[2]), Number(dmyNumeric[1]));
  }

  const dmyMonthAbbr = raw.match(
    /(\d{1,2})[\s./-]([A-Za-z]{3,9})[\s./-](\d{2,4})/,
  );
  if (dmyMonthAbbr) {
    const month = monthNumber(dmyMonthAbbr[2]);
    if (!month) return undefined;
    let year = Number(dmyMonthAbbr[3]);
    if (year < 100) year += 2000;
    return toIsoDate(year, month, Number(dmyMonthAbbr[1]));
  }

  const monthFirst = raw.match(/([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/);
  if (monthFirst) {
    const month = monthNumber(monthFirst[1]);
    if (!month) return undefined;
    return toIsoDate(Number(monthFirst[3]), month, Number(monthFirst[2]));
  }

  const dayFirst = raw.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/);
  if (dayFirst) {
    const month = monthNumber(dayFirst[2]);
    if (!month) return undefined;
    return toIsoDate(Number(dayFirst[3]), month, Number(dayFirst[1]));
  }

  return undefined;
}

export function pickFirstParsedDate(
  ...candidates: (string | null | undefined)[]
): string | undefined {
  for (const candidate of candidates) {
    const parsed = parseTradeDocumentDate(candidate);
    if (parsed) return parsed;
  }
  return undefined;
}

/**
 * Arrival date from transport docs only; never reuse invoice/issue dates (same as departure).
 */
export function pickArrivalDateDistinctFromDeparture(
  departure: string | undefined,
  ...candidates: (string | null | undefined)[]
): string | undefined {
  const arrival = pickLatestParsedDateAfter(departure, ...candidates);
  if (!arrival) return undefined;
  if (departure && arrival === departure) return undefined;
  return arrival;
}

/** Prefer the earliest ETD / on-board date when several trade PDFs disagree. */
export function pickEarliestParsedDate(
  ...candidates: (string | null | undefined)[]
): string | undefined {
  let earliest: string | undefined;
  for (const candidate of candidates) {
    const parsed = parseTradeDocumentDate(candidate);
    if (!parsed) continue;
    if (!earliest || parsed < earliest) earliest = parsed;
  }
  return earliest;
}

/** Prefer the latest arrival/ETA that is strictly after departure. */
export function pickLatestParsedDateAfter(
  departure: string | undefined,
  ...candidates: (string | null | undefined)[]
): string | undefined {
  let latest: string | undefined;
  for (const candidate of candidates) {
    const parsed = parseTradeDocumentDate(candidate);
    if (!parsed) continue;
    if (departure && parsed <= departure) continue;
    if (!latest || parsed > latest) latest = parsed;
  }
  return latest;
}

/** Parse YYYY-MM-DD as local calendar date (avoids UTC off-by-one in US timezones). */
export function parseDealDateFromIso(isoDate: string): Date | undefined {
  const parsed = parseTradeDocumentDate(isoDate);
  if (!parsed) return undefined;
  const [year, month, day] = parsed.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
