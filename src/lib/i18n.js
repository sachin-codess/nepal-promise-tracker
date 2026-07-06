// Bilingual UI dictionary. Data (promises, names) is handled separately via DB columns.
import { createContext, useContext } from "react";

export const STRINGS = {
  en: {
    tagline: "What was promised. What was delivered. With sources.",
    about: "About & Methodology",
    analytics: "Analytics",
    map: "Map",
    promisesTracked: "Promises tracked",
    kept: "Kept",
    broken: "Broken",
    inProgress: "In progress",
    parties: "Parties:",
    searchPlaceholder: "Search a politician, promise, or party…",
    allCategories: "All categories",
    allStatuses: "All statuses",
    loading: "Loading promises…",
    noMatch: "No promises match. Clear the search or filters to see everything.",
    promised: "Promised",
    deadline: "Deadline",
    viewSource: "View source →",
    viewTimeline: "View timeline",
    footer: "Every entry requires a public source. Statuses reflect documented outcomes, not opinions. Built to inform, not to campaign.",
    promisesByProvince: "Promises by province",
    federalNote: "National (\"Federal\") promises",
    clear: "clear ×",
    showingProvince: "Showing promises for",
    province: "province",
    autoTranslated: "Auto-translated — may contain errors.",
    budget: "Budget (spent / allocated):",
    budgetSource: "Budget source →",
  },
  ne: {
    tagline: "के वाचा गरियो। के पूरा भयो। स्रोतसहित।",
    about: "बारेमा र कार्यविधि",
    analytics: "तथ्याङ्क",
    map: "नक्सा",
    promisesTracked: "कुल वाचाहरू",
    kept: "पूरा भएको",
    broken: "पूरा नभएको",
    inProgress: "प्रगतिमा",
    parties: "दलहरू:",
    searchPlaceholder: "नेता, वाचा वा दल खोज्नुहोस्…",
    allCategories: "सबै वर्ग",
    allStatuses: "सबै स्थिति",
    loading: "वाचाहरू लोड हुँदै…",
    noMatch: "कुनै वाचा मिलेन। सबै हेर्न खोज वा फिल्टर हटाउनुहोस्।",
    promised: "वाचा मिति",
    deadline: "अन्तिम मिति",
    viewSource: "प्रमाण हेर्नुहोस् →",
    viewTimeline: "समयरेखा हेर्नुहोस्",
    footer: "प्रत्येक प्रविष्टिलाई सार्वजनिक स्रोत चाहिन्छ। स्थिति दस्तावेजित परिणामलाई जनाउँछ, विचारलाई होइन। जानकारीका लागि बनाइएको, प्रचारका लागि होइन।",
    promisesByProvince: "प्रदेश अनुसार वाचाहरू",
    federalNote: "राष्ट्रिय (\"संघीय\") वाचाहरू",
    clear: "हटाउनुहोस् ×",
    showingProvince: "यस प्रदेशका वाचाहरू:",
    province: "प्रदेश",
    autoTranslated: "स्वतः अनुवादित — त्रुटि हुन सक्छ।",
    budget: "बजेट (खर्च / विनियोजित):",
    budgetSource: "बजेट स्रोत →",
  },
};

export const LangContext = createContext({ lang: "en", setLang: () => {} });
export const useLang = () => useContext(LangContext);

// Convenience: t("about") returns the string in the current language.
export function useT() {
  const { lang } = useLang();
  return (key) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
}
