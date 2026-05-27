export type DiseaseReport = {
  name: string;
  description: string;
  causes: string[];
  firstAid: string[];
  visitDoctor: boolean;
  visitDoctorNote: string;
  additionalInfo: string[];
};

const REPORTS: Record<string, DiseaseReport> = {
  "Acne & Rosacea": {
    name: "Acne & Rosacea",
    description:
      "Acne is a skin condition that occurs when hair follicles become clogged with oil and dead skin cells, leading to pimples, blackheads, and cysts. Rosacea is a chronic inflammatory condition causing redness, visible blood vessels, and sometimes pus-filled bumps, typically on the face.",
    causes: [
      "Excess oil (sebum) production clogging pores",
      "Hormonal changes (puberty, menstruation, pregnancy)",
      "Bacterial overgrowth (Cutibacterium acnes)",
      "High UV exposure and sun triggers (rosacea)",
      "Dietary factors: high-glycemic foods, dairy products",
      "Stress and emotional triggers",
      "Cosmetics and heavy skincare products that block pores",
      "Hot beverages, alcohol, and spicy food (rosacea triggers)",
    ],
    firstAid: [
      "Wash the affected area gently with a mild, fragrance-free cleanser twice daily",
      "Do not pick, squeeze, or pop pimples — this causes scarring",
      "Apply a non-comedogenic (oil-free) moisturizer",
      "Use over-the-counter benzoyl peroxide (2.5–5%) or salicylic acid cream",
      "Apply SPF 30+ mineral sunscreen every morning",
      "Avoid touching your face throughout the day",
      "Change pillowcases every 2–3 days",
      "Use cool water (not hot) when washing your face",
    ],
    visitDoctor: true,
    visitDoctorNote:
      "See a dermatologist if over-the-counter treatments show no improvement after 6–8 weeks, if cystic acne appears (deep painful nodules), if rosacea causes significant redness or eye symptoms, or if scarring is beginning to form.",
    additionalInfo: [
      "Acne affects up to 85% of people aged 12–24 and can continue into adulthood",
      "Rosacea is more common in fair-skinned people and worsens with age if untreated",
      "Prescription treatments include topical retinoids, antibiotics, and isotretinoin",
      "Diet changes — reducing dairy and high-sugar foods — can reduce breakout frequency",
      "Stress management (sleep, exercise) significantly helps reduce flares",
    ],
  },

  "Actinic Keratosis": {
    name: "Actinic Keratosis",
    description:
      "Actinic keratosis (AK) is a rough, scaly patch on the skin caused by years of sun exposure. It is considered a pre-cancerous lesion — if left untreated, it can develop into squamous cell carcinoma, a type of skin cancer. It typically appears on sun-exposed areas like the face, scalp, forearms, and hands.",
    causes: [
      "Cumulative long-term UV radiation from sunlight",
      "Use of indoor tanning beds",
      "Fair skin with low melanin protection",
      "Weakened immune system (organ transplant patients, HIV)",
      "Age over 40 with history of extensive sun exposure",
      "Living in high-altitude or sunny climates",
    ],
    firstAid: [
      "Apply broad-spectrum SPF 50+ sunscreen immediately and every 2 hours outdoors",
      "Cover affected areas with clothing (long sleeves, wide-brimmed hat)",
      "Avoid the sun entirely between 10 AM and 4 PM",
      "Do NOT attempt to scratch, pick, or remove the lesion yourself",
      "Keep the area moisturized with an unscented lotion",
      "Document the lesion (take a photo) to track any changes",
    ],
    visitDoctor: true,
    visitDoctorNote:
      "Actinic keratosis MUST be evaluated by a dermatologist — it is a pre-cancerous condition. Treatment options include cryotherapy (freezing), topical chemotherapy creams, photodynamic therapy, or surgical removal. Do not delay a consultation.",
    additionalInfo: [
      "Approximately 5–10% of untreated actinic keratoses progress to squamous cell carcinoma",
      "People with multiple AK lesions are at higher risk for skin cancer",
      "Treatment is highly effective when caught early",
      "Regular annual skin checks are essential for anyone with a history of AK",
      "Vitamin D supplements may be needed if you must avoid sun entirely",
    ],
  },

  Chickenpox: {
    name: "Chickenpox",
    description:
      "Chickenpox (varicella) is a highly contagious viral infection caused by the varicella-zoster virus. It produces an itchy, blister-like rash that covers the body. The disease is most common in children but can be more severe in adults. After infection, the virus stays dormant and can reactivate later in life as shingles.",
    causes: [
      "Varicella-zoster virus (VZV) infection",
      "Direct contact with the rash or fluid from blisters",
      "Airborne transmission through coughing or sneezing",
      "Contact with contaminated surfaces or objects",
      "Not having received the varicella vaccine",
    ],
    firstAid: [
      "Stay home immediately — you are contagious until all blisters have crusted over (5–7 days)",
      "Apply calamine lotion to itchy spots to reduce itching",
      "Take cool oatmeal baths to soothe the skin",
      "Trim fingernails short to prevent scratching and secondary infection",
      "Wear loose, soft cotton clothing to minimize irritation",
      "Use paracetamol (acetaminophen) for fever — NEVER aspirin in children",
      "Apply cool, damp cloths to soothe irritated areas",
      "Keep the patient well-hydrated with fluids",
    ],
    visitDoctor: true,
    visitDoctorNote:
      "Seek immediate medical attention if: fever exceeds 39°C, the rash spreads to eyes, breathing becomes difficult, the patient is an adult, immunocompromised, newborn, or pregnant. A doctor may prescribe antiviral medication (acyclovir) to reduce severity.",
    additionalInfo: [
      "Chickenpox vaccination (2 doses) provides 98% protection",
      "Adults who get chickenpox typically have a more severe case than children",
      "The varicella virus remains in nerve cells for life and can cause shingles decades later",
      "Avoid contact with pregnant women, newborns, and immunocompromised individuals",
      "Most healthy children recover completely within 1–2 weeks",
    ],
  },

  Eczema: {
    name: "Eczema (Atopic Dermatitis)",
    description:
      "Eczema is a chronic inflammatory skin condition characterized by dry, itchy, inflamed patches. It occurs when the skin barrier is weakened, making it unable to retain moisture and protect against irritants and allergens. It often appears in childhood and can persist into adulthood with periodic flare-ups.",
    causes: [
      "Genetic predisposition — mutations in the filaggrin gene weaken the skin barrier",
      "Dry, cold weather stripping the skin of moisture",
      "Allergens: dust mites, pet dander, pollen, mold",
      "Irritants: soaps, detergents, synthetic fabrics, fragrances",
      "Stress and emotional triggers",
      "Hormonal changes",
      "Excessive sweating and heat",
      "Hard water with high mineral content",
    ],
    firstAid: [
      "Moisturize immediately — apply a thick, fragrance-free ointment or cream within 3 minutes of bathing",
      "Use only lukewarm water (never hot) for bathing — limit baths to 10 minutes",
      "Pat skin dry gently with a soft towel — never rub",
      "Identify and avoid personal triggers (dust, certain soaps, fabrics)",
      "Switch to fragrance-free, hypoallergenic laundry detergent and skincare",
      "Wear loose, 100% cotton clothing — avoid wool and synthetic fabrics",
      "Use a humidifier indoors (target 40–60% humidity)",
      "Apply over-the-counter hydrocortisone 1% cream during mild flares",
    ],
    visitDoctor: true,
    visitDoctorNote:
      "Consult a dermatologist if itching is severe and disrupting sleep, if the rash becomes infected (yellow crust, warmth, pus), if flares are very frequent, or if over-the-counter treatments are not sufficient. Prescription treatments include stronger corticosteroids, immunomodulators, and biologic injections.",
    additionalInfo: [
      "Eczema affects about 10–20% of children and 1–3% of adults worldwide",
      "There is no cure, but consistent skincare routine dramatically reduces flares",
      "Food allergies (especially in children) can sometimes trigger eczema flares",
      "The condition often improves naturally as children grow older",
      "Wet wrap therapy can be highly effective for severe flares",
    ],
  },

  Monkeypox: {
    name: "Monkeypox (Mpox)",
    description:
      "Monkeypox (now officially called Mpox) is a viral zoonotic disease caused by the monkeypox virus. It causes a rash similar to smallpox, with fever, lymph node swelling, and skin lesions that progress from flat spots to raised bumps, fluid-filled blisters, and eventually scabs. It spreads through close physical contact.",
    causes: [
      "Direct contact with infected skin, rash, sores, or body fluids",
      "Close contact (including sexual contact) with an infected person",
      "Contact with contaminated clothing, bedding, or towels",
      "Respiratory droplets during prolonged face-to-face contact",
      "Contact with infected animals (rodents, non-human primates)",
    ],
    firstAid: [
      "Isolate immediately — stay home in a separate room from family members",
      "Keep all skin lesions clean and dry — do not touch or scratch them",
      "Wear loose, breathable cotton clothing over affected areas",
      "Maintain strict hand hygiene — wash hands frequently with soap and water",
      "Use separate towels, bedding, and utensils that must be washed at high temperature",
      "Cover any exposed lesions with clean bandages when around others",
      "Avoid sharing personal items with anyone in the household",
      "Pain relievers (paracetamol/ibuprofen) can help manage discomfort and fever",
    ],
    visitDoctor: true,
    visitDoctorNote:
      "Contact a healthcare provider immediately if you suspect monkeypox. It is a notifiable disease in most countries. Testing is required for confirmation. Antiviral treatments (tecovirimat) are available for severe cases or high-risk individuals. Follow local public health authority guidelines.",
    additionalInfo: [
      "Monkeypox is usually self-limiting and most people recover within 2–4 weeks",
      "The 2022 global outbreak was primarily spread through close skin-to-skin contact",
      "Vaccination against smallpox provides significant cross-protection (~85%)",
      "Mpox vaccines (JYNNEOS) are available for high-risk individuals",
      "Lesions leave temporary dark spots — sun protection is critical to prevent permanent hyperpigmentation",
    ],
  },

  "Nail Fungus": {
    name: "Nail Fungus (Onychomycosis)",
    description:
      "Nail fungus is a common infection of the fingernails or toenails caused by dermatophyte fungi, yeasts, or molds. It causes the nail to become thickened, discolored (yellow, brown, or white), brittle, and distorted. Toenails are far more commonly affected than fingernails.",
    causes: [
      "Walking barefoot in moist public places (pools, gyms, locker rooms)",
      "Wearing tight or non-breathable footwear that traps moisture",
      "Nail injury creating an entry point for fungi",
      "Excessive sweating of the feet",
      "Weakened immune system or diabetes",
      "Poor circulation in the feet",
      "History of athlete's foot (tinea pedis) — fungi can spread to nails",
      "Age — older nails grow slower and are more susceptible",
    ],
    firstAid: [
      "Keep nails trimmed short and filed smooth",
      "Dry feet thoroughly after bathing — especially between toes",
      "Apply over-the-counter antifungal cream or nail lacquer (clotrimazole, tolnaftate)",
      "Wear breathable, moisture-wicking cotton socks and change them daily",
      "Wear sandals or open shoes when possible to allow air circulation",
      "Disinfect nail clippers and files after each use",
      "Never walk barefoot in public pools, locker rooms, or gyms",
      "Spray shoes with antifungal powder or spray to reduce fungal load",
    ],
    visitDoctor: true,
    visitDoctorNote:
      "See a dermatologist if the infection covers more than half the nail, affects multiple nails, is painful, or has not responded to over-the-counter treatment after 3 months. Prescription options include oral antifungals (terbinafine, itraconazole) which are far more effective than topical treatments for established nail infections.",
    additionalInfo: [
      "Nail fungus affects approximately 10% of the general population worldwide",
      "Treatment is slow — nails grow at 1–2mm per month, so full resolution can take 12–18 months",
      "Oral antifungal medications cure nail fungus in about 70–80% of cases",
      "Reinfection is common — preventive hygiene must continue after cure",
      "Laser treatment is an emerging option with good results for resistant cases",
    ],
  },

  SkinCancer: {
    name: "Skin Cancer",
    description:
      "Skin cancer is the abnormal growth of skin cells, most often developing in skin exposed to the sun. The three main types are basal cell carcinoma (BCC), squamous cell carcinoma (SCC), and melanoma. Melanoma is the most dangerous as it can spread rapidly to other organs. Early detection is critical for successful treatment.",
    causes: [
      "Ultraviolet (UV) radiation from sunlight — the primary cause",
      "Tanning beds and artificial UV sources",
      "Fair skin, light hair, and light eye color (less melanin protection)",
      "History of sunburns, especially blistering burns",
      "Weakened immune system",
      "Exposure to radiation or certain chemicals (arsenic)",
      "Family history of skin cancer or personal history of skin cancer",
      "Large number of moles or atypical (dysplastic) moles",
    ],
    firstAid: [
      "URGENT: if you notice any suspicious lesion, do not wait — seek medical evaluation immediately",
      "Apply SPF 50+ sunscreen on all exposed skin and reapply every 2 hours",
      "Cover all skin with UV-protective clothing (UPF 50+ rated)",
      "Wear a wide-brimmed hat and UV-blocking sunglasses",
      "Stay completely out of the sun between 10 AM and 4 PM",
      "Do not attempt to remove, scratch, or treat any suspicious lesion yourself",
      "Photograph all lesions with a ruler for size reference to track changes",
      "Avoid tanning beds completely",
    ],
    visitDoctor: true,
    visitDoctorNote:
      "THIS IS A MEDICAL EMERGENCY — see a dermatologist or oncologist urgently. Early treatment of skin cancer dramatically improves outcomes. Use the ABCDE rule for self-monitoring: Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolution (change over time). Any suspicious change warrants same-week evaluation.",
    additionalInfo: [
      "Skin cancer is the most common cancer globally — over 1 million new cases each year",
      "When detected early, the 5-year survival rate for melanoma is 99%",
      "Annual full-body skin exams by a dermatologist are recommended for high-risk individuals",
      "The ABCDE rule is a reliable self-examination guide",
      "Mohs surgery is highly effective for BCC and SCC on the face with very high cure rates",
    ],
  },

  Vitiligo: {
    name: "Vitiligo",
    description:
      "Vitiligo is a chronic autoimmune skin condition in which the immune system mistakenly destroys melanocytes — the cells that produce pigment (melanin). This results in white or light-colored patches on the skin. Vitiligo can affect any part of the body and can also involve hair, the inside of the mouth, and the eyes. It is not contagious.",
    causes: [
      "Autoimmune attack on melanocytes by the body's own immune system",
      "Genetic predisposition — family history significantly increases risk",
      "Triggers: sunburn, emotional stress, skin injury (Koebner phenomenon)",
      "Associated autoimmune conditions (thyroid disease, type 1 diabetes)",
      "Chemical exposure to certain phenolic compounds",
    ],
    firstAid: [
      "Apply SPF 50+ mineral sunscreen to all depigmented patches every morning — they have NO sun protection",
      "Reapply sunscreen every 2 hours when outdoors",
      "Cover white patches with UV-protective clothing or UV-blocking fabric",
      "Avoid mid-day sun (10 AM – 4 PM) to prevent severe burning of unprotected patches",
      "Use skin-safe, water-resistant camouflage makeup for cosmetic coverage if desired",
      "Avoid skin trauma to unaffected skin (cuts, injuries can trigger new patches)",
      "Moisturize regularly to keep skin healthy",
    ],
    visitDoctor: true,
    visitDoctorNote:
      "Consult a dermatologist to confirm diagnosis and discuss treatment options. Early treatment with narrow-band UVB phototherapy, topical calcineurin inhibitors, or corticosteroids can slow progression and sometimes restore pigment. New JAK inhibitor medications (ruxolitinib cream) show significant repigmentation results.",
    additionalInfo: [
      "Vitiligo affects 0.5–2% of the world's population — it is not rare",
      "Vitiligo is NOT contagious — it cannot spread through touch or contact",
      "About 25% of people with vitiligo have a family member with the condition",
      "Repigmentation is possible — treatment success is higher when started early",
      "Support groups are valuable — vitiligo significantly impacts quality of life and mental health",
    ],
  },
};

export default REPORTS;

export function getReport(diseaseName: string): DiseaseReport | null {
  // Direct key match
  if (REPORTS[diseaseName]) return REPORTS[diseaseName];
  // Case-insensitive match
  const key = Object.keys(REPORTS).find(
    (k) => k.toLowerCase() === diseaseName.toLowerCase()
  );
  return key ? REPORTS[key] : null;
}

export const ALL_DISEASES = Object.keys(REPORTS);
