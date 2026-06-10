/** Display label for deal transport mode values (API may use sea_freight / legacy sea_fright). */
export function formatTransportLabel(
  transport: string | undefined,
  t: (key: string) => string,
): string {
  if (!transport?.trim()) return "";
  const key = `agreementPreview.transport.${transport.trim()}`;
  const translated = t(key);
  return translated !== key ? translated : transport;
}
