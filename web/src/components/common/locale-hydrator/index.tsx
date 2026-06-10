import { useEffect } from "react";
import moment from "moment";
import "moment/locale/es";

import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { changeAppLocale } from "src/lib/i18n";
import { hydrateLocale, selectLocale } from "src/store/UiSlice";

/** Syncs Redux locale with i18next on mount and when locale changes. */
const LocaleHydrator: React.FC = () => {
  const dispatch = useAppDispatch();
  const locale = useAppSelector(selectLocale);

  useEffect(() => {
    dispatch(hydrateLocale());
  }, [dispatch]);

  useEffect(() => {
    void changeAppLocale(locale);
    moment.locale(locale === "es" ? "es" : "en");
  }, [locale]);

  return null;
};

export default LocaleHydrator;
