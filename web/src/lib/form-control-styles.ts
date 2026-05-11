import { cn } from "src/lib/utils";

/**
 * Shared dashboard form control styling (payments, bank, shipment forms).
 * Borders and focus ring follow TruMarket green (`tm-green`).
 */
const inputBase =
  "flex min-h-[42px] h-auto w-full rounded-xl bg-white px-4 py-2.5 text-sm font-medium leading-normal text-slate-900 shadow-none transition-colors " +
  "placeholder:font-normal placeholder:text-slate-400 " +
  "outline-none focus-visible:border-tm-green " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900";

export function tmFormControlInputClassName(options?: {
  invalid?: boolean;
  className?: string;
}): string {
  const border = options?.invalid
    ? "border-2 border-tm-danger focus-visible:border-tm-danger"
    : "border border-[#E5E7EB] hover:border-slate-300";
  return cn(inputBase, border, options?.className);
}

export function tmFormControlTextareaClassName(options?: {
  invalid?: boolean;
  className?: string;
}): string {
  return cn(
    inputBase,
    "min-h-[80px] items-start resize-y py-[10px]",
    options?.invalid
      ? "border-2 border-tm-danger focus-visible:border-tm-danger"
      : "border border-[#E5E7EB] hover:border-slate-300",
    options?.className,
  );
}

/** Native `<select>` – same chrome as text inputs (currency, simple lists). */
export function tmFormControlNativeSelectClassName(options?: {
  invalid?: boolean;
  className?: string;
}): string {
  return cn(
    tmFormControlInputClassName({ invalid: options?.invalid }),
    "cursor-pointer appearance-auto pr-10",
    options?.className,
  );
}
