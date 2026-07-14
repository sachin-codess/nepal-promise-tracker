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
    askBtn: "Ask",
    askTitle: "Ask the database",
    askSub: "Ask about any promise, politician, party, or project. Every answer comes from recorded data.",
    askPlaceholder: "Ask a question…",
    askSend: "Ask",
    askThinking: "Checking the records…",
    askStagePromises: "Reading promise records…",
    askStageProjects: "Reading project records…",
    askStageStats: "Counting the records…",
    askStageCompare: "Comparing party records…",
    askCitedClose: "Close",
    askDisclaimer: "Answers are generated from this database only. Always check the cited sources yourself.",
    askS1: "Which party has the most broken promises?",
    askS2: "What happened to Pokhara Airport?",
    askS3: "Show all promises about education.",
    askS4: "Compare UML and Nepali Congress.",
    budget: "Budget (spent / allocated):",
    budgetSource: "Budget source →",
    budgetBtn: "Budget",
    budgetTitle: "National budget by sector",
    budgetYear: "Fiscal year",
    budgetTop: "Top ministries:",
    budgetOfNational: "of the national budget of",
    budgetNote: "Shows the largest ministry allocations. The full federal budget (~Rs 1.96 trillion) also includes debt servicing, transfers to provincial and local governments, and smaller offices.",
    budgetNoteA: "Shows the largest ministry allocations. The full federal budget for this year (",
    budgetNoteB: ") also includes debt servicing, transfers to provincial and local governments, and smaller offices.",
    budgetAllocatedLabel: "Allocated",
    execTitle: "Allocation vs. actual spending",
    execIntro: "Nepal consistently allocates far more than it spends — especially on development. The gap is one of the country's biggest accountability issues.",
    execFact1: "Only ~42% of the capital (development) budget was spent by late May in FY 2023/24.",
    execFact2: "Over the past decade, budgets averaged 33.7% of GDP but actual spending averaged just 26.8%.",
    execFact3: "Typically only about 80% of the total budget is spent each year.",
    aboutTitle: "About",
    aboutLead: "An independent platform that helps citizens track government promises with evidence and a transparent, consistent methodology.",
    missionH: "Our mission",
    missionP: "Political promises are easy to make and easy to forget. This project keeps a public, sourced record of what Nepal's political figures have promised and what has actually been delivered — so citizens, journalists, students, and researchers can hold power to account with facts rather than memory.",
    classifyH: "How we classify a promise",
    classifyP: "Every promise is given one of three statuses:",
    keptDef: "The promise has been officially fulfilled, confirmed by official documentation or proof of completion.",
    progressDef: "Work has visibly started or partial action has been taken, but the promise is not yet officially complete. This is also our default when the evidence is unclear or disputed — we do not mark something broken without solid grounds.",
    brokenDef: "The deadline has passed with no fulfillment, or the responsible party has explicitly abandoned or reversed the commitment.",
    evidenceH: "Our evidence standard",
    evidenceP: "Every entry must be backed by a public source. We rely on official government and court documents and reporting from reputable news outlets. Where sources conflict, we favour official records and note the uncertainty rather than pick a side.",
    fairH: "How we stay fair",
    fair1: "Promises are worded neutrally, in plain language, without spin.",
    fair2: "We cover parties across the spectrum, not one side.",
    fair3: "Status reflects documented outcomes, not opinions or intentions.",
    fair4: "When evidence is thin, we stay conservative rather than accuse.",
    correctionsH: "Corrections",
    correctionsP: "We may get things wrong. If you spot an error or have a source that changes a status, please report it and we will review it. Accuracy matters more to us than being right the first time.",
    notH: "What this is not",
    notP: "This is an independent project. It is not affiliated with, funded by, or endorsed by any political party, candidate, or government body. It exists to inform — not to campaign for or against anyone.",
    close: "Close",
    tlTitle: "Evidence timeline",
    tlEmpty: "No timeline events recorded yet for this promise.",
    tlSource: "Source →",
    tlMade: "Promised",
    tlProgress: "Progress",
    tlEvidence: "Evidence",
    promisesLabel: "Promises",
    submitBtn: "Submit a promise",
    submitTitle: "Submit a promise",
    submitLead: "Know a promise we've missed? Send it with a public source and we'll review it. Every submission is checked against our methodology before it goes live.",
    fPolitician: "Politician",
    fPromise: "The promise (in their words, plainly)",
    fCategory: "Category",
    fProvince: "Province",
    fDateMade: "Date promised",
    fDeadline: "Deadline (if any)",
    fSource: "Source URL",
    fNotes: "Anything else we should know",
    fRequired: "required",
    fOptional: "optional",
    submitSend: "Submit for review",
    submitSending: "Sending\u2026",
    submitOk: "Thank you. Your submission is in the review queue.",
    submitErr: "Something went wrong. Please try again.",
    submitNeedSource: "A public source is required \u2014 we don't publish anything unsourced.",
    submitAnother: "Submit another",
    mapAria: "Map of Nepal provinces",
    mapLegendA: "Darker = more promises tracked. National (\"Federal\") promises:",
    analyticsTitle: "Promise analytics",
    donutAria: "Status breakdown donut chart",
    donutCenter: "promises",
    politiciansH: "Politicians",
    promisesH: "Promises",
    ofTotal: "of",
    projectsBtn: "Projects",
    apiLink: "Open data API",
    projectsTitle: "Mega-projects",
    projectsLead: "National infrastructure that outlives the politicians who promised it. Every missed deadline, on the record.",
    projLoading: "Loading projects\u2026",
    projEmpty: "No projects tracked yet.",
    projAgency: "Implementing agency",
    projProgress: "Physical progress",
    projBudget: "Cost",
    projOriginal: "Originally due",
    projCurrent: "Now due",
    projSlipped: "Slipped",
    projOverrun: "Cost overrun",
    projEstimated: "Approved estimate",
    projFinalCost: "Final cost",
    projYears: "years",
    projFromPromise: "From a tracked promise",
    projTimeline: "Delay record",
    projSource: "Source \u2192",
    projStart: "Started",
    projDelay: "Delay",
    projRevision: "Deadline revised",
    projProgressEv: "Progress",
    projCompletion: "Completed",
    stPlanned: "Planned",
    stInProgress: "In progress",
    stStalled: "Stalled",
    stCompleted: "Completed",
    stAbandoned: "Abandoned",
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
    askBtn: "सोध्नुहोस्",
    askTitle: "डाटाबेसलाई सोध्नुहोस्",
    askSub: "कुनै पनि प्रतिज्ञा, नेता, पार्टी वा आयोजनाबारे सोध्नुहोस्। हरेक उत्तर अभिलेखित तथ्यांकबाट आउँछ।",
    askPlaceholder: "प्रश्न सोध्नुहोस्…",
    askSend: "सोध्नुहोस्",
    askThinking: "अभिलेख हेर्दै…",
    askStagePromises: "प्रतिज्ञाका अभिलेख पढ्दै…",
    askStageProjects: "आयोजनाका अभिलेख पढ्दै…",
    askStageStats: "अभिलेख गन्दै…",
    askStageCompare: "दलहरूको अभिलेख तुलना गर्दै…",
    askCitedClose: "बन्द गर्नुहोस्",
    askDisclaimer: "उत्तरहरू यही डाटाबेसबाट मात्र बनेका हुन्। उद्धृत स्रोतहरू आफैं जाँच्नुहोस्।",
    askS1: "कुन पार्टीले सबैभन्दा धेरै प्रतिज्ञा तोड्यो?",
    askS2: "पोखरा विमानस्थलको के भयो?",
    askS3: "शिक्षासम्बन्धी सबै प्रतिज्ञा देखाउनुहोस्।",
    askS4: "एमाले र नेपाली कांग्रेस तुलना गर्नुहोस्।",
    budget: "बजेट (खर्च / विनियोजित):",
    budgetSource: "बजेट स्रोत →",
    budgetBtn: "बजेट",
    budgetTitle: "क्षेत्रअनुसार राष्ट्रिय बजेट",
    budgetYear: "आर्थिक वर्ष",
    budgetTop: "प्रमुख मन्त्रालयहरू:",
    budgetOfNational: "कुल राष्ट्रिय बजेट",
    budgetNote: "यसले सबैभन्दा ठूला मन्त्रालय विनियोजन देखाउँछ। सम्पूर्ण संघीय बजेट (~रु १९.६ खर्ब) मा ऋण भुक्तानी, प्रदेश तथा स्थानीय सरकारमा हस्तान्तरण, र साना कार्यालयहरू पनि समावेश छन्।",
    budgetNoteA: "यसले सबैभन्दा ठूला मन्त्रालय विनियोजन देखाउँछ। यस वर्षको सम्पूर्ण संघीय बजेट (",
    budgetNoteB: ") मा ऋण भुक्तानी, प्रदेश तथा स्थानीय सरकारमा हस्तान्तरण, र साना कार्यालयहरू पनि समावेश छन्।",
    budgetAllocatedLabel: "विनियोजित",
    execTitle: "विनियोजन बनाम वास्तविक खर्च",
    execIntro: "नेपालले खर्च गर्नेभन्दा धेरै बढी बजेट विनियोजन गर्छ — विशेषगरी विकास खर्चमा। यो अन्तर देशकै ठूलो जवाफदेहिता समस्या हो।",
    execFact1: "आ.व. २०८०/८१ मा जेठको अन्त्यसम्म पुँजीगत (विकास) बजेटको करिब ४२% मात्र खर्च भयो।",
    execFact2: "विगत दशकमा बजेट औसत कुल गार्हस्थ्य उत्पादनको ३३.७% थियो, तर वास्तविक खर्च औसत २६.८% मात्र।",
    execFact3: "सामान्यतया प्रत्येक वर्ष कुल बजेटको करिब ८०% मात्र खर्च हुन्छ।",
    aboutTitle: "बारेमा",
    aboutLead: "एक स्वतन्त्र प्लेटफर्म, जसले नागरिकलाई प्रमाण र पारदर्शी, एकरूप कार्यविधिका आधारमा सरकारी वाचाहरू निगरानी गर्न सघाउँछ।",
    missionH: "हाम्रो उद्देश्य",
    missionP: "राजनीतिक वाचा गर्न सजिलो, बिर्सन झनै सजिलो। यो परियोजनाले नेपालका राजनीतिक व्यक्तित्वहरूले के वाचा गरे र वास्तवमा के पूरा भयो भन्ने स्रोतसहितको सार्वजनिक अभिलेख राख्छ — ताकि नागरिक, पत्रकार, विद्यार्थी र अनुसन्धानकर्ताले स्मृतिको भरमा होइन, तथ्यका आधारमा सत्तालाई जवाफदेही बनाउन सकून्।",
    classifyH: "वाचालाई कसरी वर्गीकरण गर्छौं",
    classifyP: "प्रत्येक वाचालाई तीनमध्ये एउटा स्थिति दिइन्छ:",
    keptDef: "वाचा आधिकारिक रूपमा पूरा भएको, सरकारी कागजात वा सम्पन्नताको प्रमाणबाट पुष्टि भएको।",
    progressDef: "काम देखिने गरी सुरु भएको वा आंशिक रूपमा भएको, तर वाचा आधिकारिक रूपमा सम्पन्न नभएको। प्रमाण अस्पष्ट वा विवादित हुँदा पनि हामी यही स्थिति राख्छौं — ठोस आधारबिना हामी कुनै वाचालाई पूरा नभएको भन्दैनौं।",
    brokenDef: "अन्तिम मिति नाघिसक्दा पनि पूरा नभएको, वा जिम्मेवार पक्षले स्पष्ट रूपमा त्यागेको वा उल्टाएको।",
    evidenceH: "हाम्रो प्रमाण मापदण्ड",
    evidenceP: "प्रत्येक प्रविष्टि सार्वजनिक स्रोतमा आधारित हुनुपर्छ। हामी आधिकारिक सरकारी तथा अदालती कागजात र प्रतिष्ठित सञ्चारमाध्यमका समाचारमा भर पर्छौं। स्रोतहरू बाझिँदा हामी कुनै पक्ष लिनुको सट्टा आधिकारिक अभिलेखलाई प्राथमिकता दिन्छौं र अनिश्चितता उल्लेख गर्छौं।",
    fairH: "हामी कसरी निष्पक्ष रहन्छौं",
    fair1: "वाचाहरू तटस्थ, सरल भाषामा, बङ्ग्याइविना लेखिन्छन्।",
    fair2: "हामी एउटै पक्ष होइन, सबै विचारधाराका दललाई समेट्छौं।",
    fair3: "स्थितिले विचार वा नियत होइन, दस्तावेजित परिणाम जनाउँछ।",
    fair4: "प्रमाण कमजोर हुँदा हामी आरोप लगाउनुको सट्टा संयमित रहन्छौं।",
    correctionsH: "सुधार",
    correctionsP: "हामीबाट गल्ती हुन सक्छ। तपाईंले त्रुटि भेट्नुभयो वा स्थिति बदल्ने स्रोत छ भने कृपया जानकारी दिनुहोस्, हामी पुनरावलोकन गर्नेछौं। पहिलो पटकमै सही हुनुभन्दा शुद्धता हाम्रा लागि बढी महत्त्वपूर्ण छ।",
    notH: "यो के होइन",
    notP: "यो एक स्वतन्त्र परियोजना हो। यो कुनै पनि राजनीतिक दल, उम्मेदवार वा सरकारी निकायसँग सम्बद्ध, तिनबाट वित्तपोषित वा अनुमोदित होइन। यो जानकारी दिन बनेको हो — कसैको पक्ष वा विपक्षमा प्रचार गर्न होइन।",
    close: "बन्द गर्नुहोस्",
    tlTitle: "प्रमाणको समयरेखा",
    tlEmpty: "यस वाचाका लागि अहिलेसम्म कुनै घटना अभिलेख गरिएको छैन।",
    tlSource: "स्रोत →",
    tlMade: "वाचा गरिएको",
    tlProgress: "प्रगति",
    tlEvidence: "\u092a\u094d\u0930\u092e\u093e\u0923",
    promisesLabel: "वाचाहरू",
    submitBtn: "वाचा पठाउनुहोस्",
    submitTitle: "वाचा पठाउनुहोस्",
    submitLead: "हामीले छुटाएको कुनै वाचा थाहा छ? सार्वजनिक स्रोतसहित पठाउनुहोस्, हामी समीक्षा गर्नेछौं। प्रत्येक प्रविष्टि प्रकाशित हुनुअघि हाम्रो कार्यविधिअनुसार जाँचिन्छ।",
    fPolitician: "नेता",
    fPromise: "वाचा (उनकै शब्दमा, सरल रूपमा)",
    fCategory: "वर्ग",
    fProvince: "प्रदेश",
    fDateMade: "वाचा गरिएको मिति",
    fDeadline: "अन्तिम मिति (भए)",
    fSource: "स्रोत URL",
    fNotes: "थप जानकारी",
    fRequired: "अनिवार्य",
    fOptional: "वैकल्पिक",
    submitSend: "समीक्षाका लागि पठाउनुहोस्",
    submitSending: "पठाउँदै\u2026",
    submitOk: "धन्यवाद। तपाईंको प्रविष्टि समीक्षा सूचीमा छ।",
    submitErr: "केही गडबड भयो। कृपया फेरि प्रयास गर्नुहोस्।",
    submitNeedSource: "सार्वजनिक स्रोत अनिवार्य छ \u2014 स्रोतबिना हामी केही प्रकाशित गर्दैनौं।",
    submitAnother: "अर्को पठाउनुहोस्",
    mapAria: "नेपालका प्रदेशहरूको नक्सा",
    mapLegendA: "गाढा = बढी वाचा अभिलेख गरिएको। राष्ट्रिय (\"संघीय\") वाचाहरू:",
    analyticsTitle: "वाचा तथ्याङ्क",
    donutAria: "स्थिति विभाजन डोनट चार्ट",
    donutCenter: "वाचा",
    politiciansH: "नेताहरू",
    promisesH: "वाचाहरू",
    ofTotal: "मध्ये",
    apiLink: "खुला डाटा API",
    projectsBtn: "\u0906\u092f\u094b\u091c\u0928\u093e",
    projectsTitle: "\u0930\u093e\u0937\u094d\u091f\u094d\u0930\u093f\u092f \u0917\u094c\u0930\u0935\u0915\u093e \u0906\u092f\u094b\u091c\u0928\u093e",
    projectsLead: "\u0935\u093e\u091a\u093e \u0917\u0930\u094d\u0928\u0947 \u0928\u0947\u0924\u093e\u0939\u0930\u0942\u092d\u0928\u094d\u0926\u093e \u0932\u093e\u092e\u094b \u091a\u0932\u094d\u0928\u0947 \u0930\u093e\u0937\u094d\u091f\u094d\u0930\u093f\u092f \u092a\u0942\u0930\u094d\u0935\u093e\u0927\u093e\u0930\u0964 \u0928\u093e\u0918\u093f\u090f\u0915\u093e \u0939\u0930\u0947\u0915 \u092e\u093f\u0924\u093f, \u0905\u092d\u093f\u0932\u0947\u0916\u0938\u0939\u093f\u0924\u0964",
    projLoading: "\u0906\u092f\u094b\u091c\u0928\u093e \u0932\u094b\u0921 \u0939\u0941\u0901\u0926\u0948\u2026",
    projEmpty: "\u0905\u0939\u093f\u0932\u0947\u0938\u092e\u094d\u092e \u0915\u0941\u0928\u0948 \u0906\u092f\u094b\u091c\u0928\u093e \u0905\u092d\u093f\u0932\u0947\u0916 \u0917\u0930\u093f\u090f\u0915\u094b \u091b\u0948\u0928\u0964",
    projAgency: "\u0915\u093e\u0930\u094d\u092f\u093e\u0928\u094d\u0935\u092f\u0928 \u0928\u093f\u0915\u093e\u092f",
    projProgress: "\u092d\u094c\u0924\u093f\u0915 \u092a\u094d\u0930\u0917\u0924\u093f",
    projBudget: "\u0932\u093e\u0917\u0924",
    projOriginal: "\u092a\u0939\u093f\u0932\u094b \u092e\u093f\u0924\u093f",
    projCurrent: "\u0905\u0939\u093f\u0932\u0947\u0915\u094b \u092e\u093f\u0924\u093f",
    projSlipped: "\u092a\u0930\u094d\u0916\u093f\u092f\u094b",
    projOverrun: "लागत बढ्यो",
    projEstimated: "स्वीकृत अनुमान",
    projFinalCost: "अन्तिम लागत",
    projYears: "\u0935\u0930\u094d\u0937",
    projFromPromise: "\u0905\u092d\u093f\u0932\u0947\u0916 \u0917\u0930\u093f\u090f\u0915\u094b \u0935\u093e\u091a\u093e\u092c\u093e\u091f",
    projTimeline: "\u0922\u093f\u0932\u093e\u0908\u0915\u094b \u0905\u092d\u093f\u0932\u0947\u0916",
    projSource: "\u0938\u094d\u0930\u094b\u0924 \u2192",
    projStart: "\u0938\u0941\u0930\u0941",
    projDelay: "\u0922\u093f\u0932\u093e\u0908",
    projRevision: "\u092e\u093f\u0924\u093f \u0938\u093e\u0930\u093f\u092f\u094b",
    projProgressEv: "\u092a\u094d\u0930\u0917\u0924\u093f",
    projCompletion: "\u0938\u092e\u094d\u092a\u0928\u094d\u0928",
    stPlanned: "\u092f\u094b\u091c\u0928\u093e\u092e\u093e",
    stInProgress: "\u092a\u094d\u0930\u0917\u0924\u093f\u092e\u093e",
    stStalled: "\u0905\u0932\u092a\u0924\u094d\u0930",
    stCompleted: "\u0938\u092e\u094d\u092a\u0928\u094d\u0928",
    stAbandoned: "\u0924\u094d\u092f\u093e\u0917\u093f\u090f\u0915\u094b",
  },
};

// Category labels come from the DB (English). This maps them for display only —
// filter comparisons still use the raw DB value, so nothing breaks.
export const CATEGORY_NE = {
  "Infrastructure": "पूर्वाधार",
  "Energy": "ऊर्जा",
  "Education": "शिक्षा",
  "Health": "स्वास्थ्य",
  "Economy": "अर्थतन्त्र",
  "Environment": "वातावरण",
  "Employment": "रोजगारी",
  "Tourism": "पर्यटन",
  "Transport": "यातायात",
  "Governance": "सुशासन",
  "Anti-corruption": "भ्रष्टाचारविरुद्ध",
  "Social Welfare": "सामाजिक कल्याण",
  "Peace & Justice": "शान्ति र न्याय",
  "Governance & Reform": "सुशासन र सुधार",
  "Governance & Transparency": "सुशासन र पारदर्शिता",
  "Governance & Constitution": "सुशासन र संविधान",
  "Foreign Policy & Economy": "परराष्ट्र नीति र अर्थतन्त्र",
  "Development & Infrastructure": "विकास र पूर्वाधार",
  "Sovereignty & Foreign Policy": "सार्वभौमिकता र परराष्ट्र नीति",
};

// cat("Health") -> "स्वास्थ्य" in Nepali, "Health" in English.
// Unmapped categories fall back to the raw DB value, so new rows never break.
const CATEGORY_NE_LC = Object.fromEntries(
  Object.entries(CATEGORY_NE).map(([k, v]) => [k.toLowerCase(), v])
);

// Title-case an all-caps or lowercase DB value: "ANTI-CORRUPTION" -> "Anti-corruption"
function tidy(c) {
  if (!c) return c;
  return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
}

export function useCat() {
  const { lang } = useLang();
  return (c) => {
    if (!c) return c;
    if (lang === "ne") return CATEGORY_NE_LC[c.toLowerCase()] ?? c;
    // English: if we know the category, show our canonical casing.
    const known = Object.keys(CATEGORY_NE).find(
      (k) => k.toLowerCase() === c.toLowerCase()
    );
    return known ?? tidy(c);
  };
}

// Province names come from the DB / GeoJSON keys (English). Display-only, like categories.
export const PROVINCE_NE = {
  "Koshi": "कोशी",
  "Madhesh": "मधेश",
  "Bagmati": "बागमती",
  "Gandaki": "गण्डकी",
  "Lumbini": "लुम्बिनी",
  "Karnali": "कर्णाली",
  "Sudurpashchim": "सुदूरपश्चिम",
  "Federal": "संघीय",
};

export function useProv() {
  const { lang } = useLang();
  return (p) => (lang === "ne" ? PROVINCE_NE[p] ?? p : p);
}

// Single source of truth for date rendering across the app.
// Swap the body here (e.g. to Bikram Sambat) and every date on the site follows.
export function fmtDate(d, lang) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString(
    lang === "ne" ? "ne-NP" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" }
  );
}

// Hook form: const fd = useDate(); fd(p.date_made)
// Display-only content fallback. Returns the Nepali column when the UI is in
// Nepali AND a translation exists; otherwise the English original. Untranslated
// rows keep showing English rather than a blank — so translation can be
// incremental and a missing row is never a broken row.
// Money formatting, single source of truth. NPR reads in Arba (1e9) and Crore
// (1e7), how Nepalis read large sums; USD in B/M. In Nepali the numerals go
// Devanagari and the unit words go Nepali, so the whole string is one script —
// otherwise a NE page shows "Rs 22 Arba" next to a Devanagari date.
const DEV = "\u0966\u0967\u0968\u0969\u096a\u096b\u096c\u096d\u096e\u096f";
function toDev(str) {
  return String(str).replace(/[0-9]/g, (d) => DEV[+d]);
}

export function fmtMoney(amount, currency, lang) {
  if (amount == null) return "\u2014";
  const ne = lang === "ne";
  const dec = (v, unit) => v.toFixed(amount % unit === 0 ? 0 : 1);

  if (currency === "USD") {
    if (amount >= 1e9) return `$${dec(amount / 1e9, 1e9)}B`;
    if (amount >= 1e6) return `$${dec(amount / 1e6, 1e6)}M`;
    return `$${amount.toLocaleString()}`;
  }

  let n, unit;
  if (amount >= 1e9)      { n = dec(amount / 1e9, 1e9); unit = ne ? "\u0905\u0930\u094d\u092c" : "Arba"; }
  else if (amount >= 1e7) { n = (amount / 1e7).toFixed(1); unit = ne ? "\u0915\u0930\u094b\u0921" : "Crore"; }
  else                    { n = amount.toLocaleString(ne ? "ne-NP" : "en-GB"); unit = ""; }

  const rs = ne ? "\u0930\u0941" : "Rs";
  const num = ne ? toDev(n) : n;
  return unit ? `${rs} ${num} ${unit}` : `${rs} ${num}`;
}

export function useMoney() {
  const { lang } = useLang();
  return (amount, currency) => fmtMoney(amount, currency, lang);
}

export function useNe() {
  const { lang } = useLang();
  return (row, field) => {
    if (!row) return "";
    if (lang === "ne" && row[field + "_ne"]) return row[field + "_ne"];
    return row[field] ?? "";
  };
}

export function useDate() {
  const { lang } = useLang();
  return (d) => fmtDate(d, lang);
}

export const LangContext = createContext({ lang: "en", setLang: () => {} });
export const useLang = () => useContext(LangContext);

// Convenience: t("about") returns the string in the current language.
export function useT() {
  const { lang } = useLang();
  return (key) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
}
