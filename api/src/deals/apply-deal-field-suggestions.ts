import type { DealFieldSuggestions } from './deal-field-suggestions.types';
import type { Deal, DealCompany } from './deals.entities';
import { normalizeTransportMode, TransportMode } from './transport-mode';

export type ApplyDealSuggestionsOptions = {
  /** When true, only set fields that are empty, zero, or default placeholders. */
  onlyFillEmpty?: boolean;
  /**
   * When true, apply all extracted values from trade PDFs (overwrites existing deal fields).
   * Use after document upload so invoice dates/amounts replace wizard defaults.
   */
  preferDocumentValues?: boolean;
};

function isBlank(value?: string | null): boolean {
  return !value?.trim();
}

function isUnsetNumber(value?: number | null): boolean {
  return value == null || Number.isNaN(Number(value)) || Number(value) === 0;
}

function isDefaultTransport(value?: string): boolean {
  const normalized = normalizeTransportMode(value);
  return !normalized || normalized === TransportMode.BySea;
}

function mergeCompany(
  current: DealCompany | undefined,
  patch: Partial<DealCompany>,
  onlyFillEmpty: boolean,
): DealCompany | undefined {
  const base: DealCompany = {
    name: current?.name ?? '',
    country: current?.country ?? '',
    taxId: current?.taxId ?? '',
  };

  let changed = false;
  const next = { ...base };

  for (const key of ['name', 'country', 'taxId'] as const) {
    const incoming = patch[key]?.trim();
    if (!incoming) continue;
    if (onlyFillEmpty && !isBlank(base[key])) continue;
    if (next[key] !== incoming) {
      next[key] = incoming;
      changed = true;
    }
  }

  return changed ? next : undefined;
}

/**
 * Builds a partial deal update from PDF extraction suggestions.
 */
export function buildDealUpdateFromSuggestions(
  deal: Deal,
  suggestions: DealFieldSuggestions,
  options: ApplyDealSuggestionsOptions = {},
): Partial<Deal> {
  const preferDocumentValues = options.preferDocumentValues === true;
  const onlyFillEmpty = preferDocumentValues
    ? false
    : options.onlyFillEmpty !== false;
  const patch: Partial<Deal> = {};

  const maybeString = (
    key: keyof Pick<
      Deal,
      | 'name'
      | 'description'
      | 'origin'
      | 'destination'
      | 'portOfOrigin'
      | 'portOfDestination'
      | 'variety'
      | 'quality'
      | 'presentation'
    >,
    value?: string,
  ) => {
    if (isBlank(value)) return;
    const current = deal[key] as string | undefined;
    if (onlyFillEmpty && !isBlank(current)) return;
    (patch as Record<string, string>)[key] = value!.trim();
  };

  const maybeNumber = (
    key: 'quantity' | 'offerUnitPrice' | 'investmentAmount',
    value?: number,
  ) => {
    if (value == null || Number.isNaN(value) || value <= 0) return;
    if (onlyFillEmpty && !isUnsetNumber(deal[key] as number)) return;
    (patch as Record<string, number>)[key] = value;
  };

  maybeString('name', suggestions.name);
  maybeString('description', suggestions.description);
  maybeString('origin', suggestions.origin);
  maybeString('destination', suggestions.destination);
  maybeString('portOfOrigin', suggestions.portOfOrigin);
  maybeString('portOfDestination', suggestions.portOfDestination);
  maybeString('variety', suggestions.variety);
  maybeString('quality', suggestions.quality);
  maybeString('presentation', suggestions.presentation);

  maybeNumber('quantity', suggestions.quantity);
  maybeNumber('offerUnitPrice', suggestions.offerUnitPrice);

  const total =
    suggestions.totalValue ??
    suggestions.investmentAmount ??
    (suggestions.quantity &&
    suggestions.offerUnitPrice &&
    suggestions.quantity > 0
      ? Math.round(suggestions.quantity * suggestions.offerUnitPrice * 100) /
        100
      : undefined);

  if (total != null && total > 0) {
    if (!onlyFillEmpty || isUnsetNumber(deal.investmentAmount)) {
      patch.investmentAmount = total;
    }
  }

  if (suggestions.transport) {
    const normalized = normalizeTransportMode(suggestions.transport);
    if (normalized) {
      if (!onlyFillEmpty || isDefaultTransport(deal.transport)) {
        patch.transport = normalized;
      }
    }
  }

  if (suggestions.shippingStartDate) {
    const parsed = new Date(suggestions.shippingStartDate);
    if (!Number.isNaN(parsed.getTime())) {
      const current = deal.shippingStartDate;
      if (
        preferDocumentValues ||
        !current ||
        Number.isNaN(new Date(current).getTime())
      ) {
        patch.shippingStartDate = parsed;
      }
    }
  }

  if (suggestions.expectedShippingEndDate) {
    const parsed = new Date(suggestions.expectedShippingEndDate);
    if (!Number.isNaN(parsed.getTime())) {
      const current = deal.expectedShippingEndDate;
      if (
        preferDocumentValues ||
        !current ||
        Number.isNaN(new Date(current).getTime())
      ) {
        patch.expectedShippingEndDate = parsed;
      }
    }
  }

  const buyerCompany = mergeCompany(
    deal.buyerCompany,
    {
      name: suggestions.buyerCompanyName,
      country: suggestions.buyerCompanyCountry,
      taxId: suggestions.buyerCompanyTaxId,
    },
    onlyFillEmpty,
  );
  if (buyerCompany) {
    patch.buyerCompany = buyerCompany;
  }

  const supplierCompany = mergeCompany(
    deal.supplierCompany,
    {
      name: suggestions.supplierCompanyName,
      country: suggestions.supplierCompanyCountry,
      taxId: suggestions.supplierCompanyTaxId,
    },
    onlyFillEmpty,
  );
  if (supplierCompany) {
    patch.supplierCompany = supplierCompany;
  }

  return patch;
}

/** Human-readable snapshot for logs and API responses. */
export function formatSuggestionsForDisplay(
  suggestions: DealFieldSuggestions,
): Record<string, string> {
  const out: Record<string, string> = {};
  const entries: Array<[string, unknown]> = [
    ['origin', suggestions.origin],
    ['destination', suggestions.destination],
    ['portOfOrigin', suggestions.portOfOrigin],
    ['portOfDestination', suggestions.portOfDestination],
    ['quantity', suggestions.quantity],
    ['offerUnitPrice', suggestions.offerUnitPrice],
    ['totalValue', suggestions.totalValue],
    ['investmentAmount', suggestions.investmentAmount],
    ['transport', suggestions.transport],
    ['shippingStartDate', suggestions.shippingStartDate],
    ['expectedShippingEndDate', suggestions.expectedShippingEndDate],
    ['buyerCompanyName', suggestions.buyerCompanyName],
    ['buyerCompanyCountry', suggestions.buyerCompanyCountry],
    ['supplierCompanyName', suggestions.supplierCompanyName],
    ['supplierCompanyCountry', suggestions.supplierCompanyCountry],
    ['variety', suggestions.variety],
    ['name', suggestions.name],
  ];
  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === '') continue;
    out[key] = String(value);
  }
  return out;
}

export function listAppliedPatchKeys(patch: Partial<Deal>): string[] {
  return Object.keys(patch).filter((k) => patch[k as keyof Deal] !== undefined);
}
