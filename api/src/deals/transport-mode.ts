/** Canonical deal transport mode values (stored on deal.transport). */
export const TransportMode = {
  BySea: 'sea_freight',
  ByAir: 'by_air',
} as const;

export type TransportModeValue =
  (typeof TransportMode)[keyof typeof TransportMode];

/** Legacy typo kept on older deals; normalize on read/write. */
export const LEGACY_TRANSPORT_BY_SEA = 'sea_fright';

export function normalizeTransportMode(
  value?: string | null,
): TransportModeValue | undefined {
  if (!value) return undefined;
  if (value === LEGACY_TRANSPORT_BY_SEA) return TransportMode.BySea;
  if (value === TransportMode.BySea || value === TransportMode.ByAir) {
    return value;
  }
  return undefined;
}
