import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { I18n } from "i18n-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { I18nManager } from "react-native";
import { translations, Language } from "@/constants/translations";

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = "en";

const LANGUAGE_KEY = "@collablink_language";

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguageState] = useState<Language>("en");
  const [isRTL, setIsRTL] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (stored && (stored === "en" || stored === "ar" || stored === "fr")) {
        const storedLang = stored as Language;
        setLanguageState(storedLang);
        i18n.locale = storedLang;
        setIsRTL(storedLang === "ar");
      }
    } catch (error) {
      console.error("Failed to load language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = useCallback(async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, newLanguage);
      setLanguageState(newLanguage);
      i18n.locale = newLanguage;
      const rtl = newLanguage === "ar";
      setIsRTL(rtl);
      
      if (I18nManager.isRTL !== rtl) {
        I18nManager.forceRTL(rtl);
      }
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  }, []);

  const t = useCallback((key: string, options?: Record<string, string | number>) => {
    return i18n.t(key, options);
  }, []);

  return useMemo(() => ({
    language,
    setLanguage,
    isRTL,
    isLoading,
    t,
  }), [language, setLanguage, isRTL, isLoading, t]);
});
