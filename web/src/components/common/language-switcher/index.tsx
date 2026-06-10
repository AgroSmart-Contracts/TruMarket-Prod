import React from "react";
import classNames from "classnames";

import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { APP_LOCALES, type AppLocale } from "src/lib/i18n";
import { selectLocale, setLocale } from "src/store/UiSlice";

const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "EN",
  es: "ES",
};

const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const dispatch = useAppDispatch();
  const locale = useAppSelector(selectLocale);

  return (
    <div
      className={classNames(
        "inline-flex h-9 shrink-0 items-center rounded-md border border-[#E2E8F0] bg-white p-0.5 shadow-sm",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {APP_LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => dispatch(setLocale(code))}
          className={classNames(
            "flex h-full items-center rounded px-2.5 text-xs font-semibold leading-none transition-colors",
            locale === code ? "bg-[#4E8C37] text-white" : "text-[#62748E] hover:bg-gray-50",
          )}
          aria-pressed={locale === code}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
