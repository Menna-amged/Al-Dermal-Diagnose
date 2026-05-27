// ============================================================================
// Disease-Weather Rules Engine
// ----------------------------------------------------------------------------
// For each of the 8 skin conditions the AI detects, defines how UV, temperature,
// humidity, wind and dust affect the condition and produces actionable alerts.
// Rules are evidence-based dermatology principles, not strict medical advice.
// ============================================================================

export type Severity = "high" | "medium" | "low";

export type WeatherSnapshot = {
  temp:      number;  // °C
  uvIndex:   number;  // 0-11+
  humidity:  number;  // %
  windSpeed: number;  // m/s
  condition: string;  // OpenWeatherMap main string: Clear, Clouds, Rain, Dust, Sand, Haze, Smoke, Mist, …
};

export type DiseaseAlert = {
  severity: Severity;
  title:    string;
  reason:   string;
  guidance: string[];
};

export const DISEASES = [
  "Acne & Rosacea",
  "Actinic Keratosis",
  "Chickenpox",
  "Eczema",
  "Monkeypox",
  "Nail Fungus",
  "SkinCancer",
  "Vitiligo",
] as const;

export type DiseaseName = typeof DISEASES[number];

const isDusty = (cond: string) => {
  const c = cond.toLowerCase();
  return c.includes("dust") || c.includes("sand") || c.includes("haze") || c.includes("smoke");
};

// ── Per-disease rule functions ───────────────────────────────────────────────
const RULES: Record<DiseaseName, (w: WeatherSnapshot) => DiseaseAlert[]> = {

  "Acne & Rosacea": (w) => {
    const alerts: DiseaseAlert[] = [];
    if (w.uvIndex >= 6) {
      alerts.push({
        severity: "high",
        title: "Strong sun will trigger rosacea flushing",
        reason: `UV index is ${w.uvIndex.toFixed(1)}. Sun is the #1 trigger for rosacea flares and worsens acne pigmentation.`,
        guidance: ["Apply mineral SPF 50+ every 2 hours", "Wear a wide-brimmed hat", "Avoid sun between 10 AM – 4 PM"],
      });
    } else if (w.uvIndex >= 3) {
      alerts.push({
        severity: "medium",
        title: "Moderate UV — protect your skin",
        reason: `UV index is ${w.uvIndex.toFixed(1)}. Even moderate sun can flare rosacea and worsen acne marks.`,
        guidance: ["Use SPF 30+ sunscreen", "Stay in the shade when possible"],
      });
    }
    if (w.temp >= 28 || w.humidity >= 70) {
      alerts.push({
        severity: "high",
        title: "Hot & humid weather will worsen breakouts",
        reason: `${w.temp.toFixed(0)}°C with ${w.humidity}% humidity increases sweat and oil production, clogging pores and flaring rosacea.`,
        guidance: ["Stay in cool, air-conditioned spaces", "Cleanse gently after sweating", "Avoid spicy food & hot drinks today"],
      });
    } else if (w.temp >= 24) {
      alerts.push({
        severity: "medium",
        title: "Warm weather can cause flushing",
        reason: `${w.temp.toFixed(0)}°C may cause rosacea flushing.`,
        guidance: ["Carry a thermal water spray", "Avoid hot drinks"],
      });
    }
    if (w.temp <= 8 && w.windSpeed >= 6) {
      alerts.push({
        severity: "medium",
        title: "Cold wind triggers rosacea",
        reason: `Cold + wind (${w.windSpeed.toFixed(0)} m/s) breaks down skin barrier and triggers flushing.`,
        guidance: ["Cover your face with a soft scarf", "Apply a rich barrier moisturizer before going out"],
      });
    }
    if (isDusty(w.condition)) {
      alerts.push({
        severity: "medium",
        title: "Dust will clog your pores",
        reason: "Dust and air pollutants settle on the skin and inflame acne and rosacea.",
        guidance: ["Wear a face mask outdoors", "Double-cleanse when you return home"],
      });
    }
    return alerts;
  },

  "Actinic Keratosis": (w) => {
    const alerts: DiseaseAlert[] = [];
    if (w.uvIndex >= 6) {
      alerts.push({
        severity: "high",
        title: "Danger — UV directly worsens actinic keratosis",
        reason: `UV index ${w.uvIndex.toFixed(1)}. Sun is the direct cause of AK and can push lesions toward skin cancer.`,
        guidance: ["Do not go outside between 10 AM – 4 PM today", "If you must go out, wear SPF 50+, long sleeves and a hat", "Cover affected areas with clothing — sunscreen alone isn't enough"],
      });
    } else if (w.uvIndex >= 3) {
      alerts.push({
        severity: "high",
        title: "Even moderate UV damages AK skin",
        reason: `UV index ${w.uvIndex.toFixed(1)}. AK lesions are extremely sun-sensitive.`,
        guidance: ["Apply SPF 50+ broad-spectrum", "Cover affected areas with clothing"],
      });
    } else if (w.uvIndex >= 1) {
      alerts.push({
        severity: "medium",
        title: "Low UV — still wear sunscreen",
        reason: `UV index ${w.uvIndex.toFixed(1)}. Even cloudy days damage AK skin.`,
        guidance: ["Apply SPF 30+ before going out"],
      });
    }
    if (w.temp >= 30 && w.uvIndex >= 2) {
      alerts.push({
        severity: "high",
        title: "Hot + sunny = high cumulative damage",
        reason: `${w.temp.toFixed(0)}°C means you'll be outside longer — every minute compounds skin damage.`,
        guidance: ["Stay indoors as much as possible", "Reapply sunscreen every 90 minutes"],
      });
    }
    return alerts;
  },

  "Chickenpox": (w) => {
    const alerts: DiseaseAlert[] = [];
    // Chickenpox is contagious — always remind to stay home
    alerts.push({
      severity: "high",
      title: "Stay home — chickenpox is highly contagious",
      reason: "You can infect others until all blisters have crusted over (usually 5–7 days).",
      guidance: ["Avoid public places, school and work", "Avoid contact with pregnant women, infants and immunocompromised people"],
    });
    if (w.temp >= 25 || w.humidity >= 70) {
      alerts.push({
        severity: "high",
        title: "Heat will make itching unbearable",
        reason: `${w.temp.toFixed(0)}°C and ${w.humidity}% humidity intensify itching and increase scarring risk from scratching.`,
        guidance: ["Stay in air conditioning", "Take cool oatmeal baths", "Wear loose, cotton clothing", "Use calamine lotion"],
      });
    }
    if (w.uvIndex >= 3) {
      alerts.push({
        severity: "high",
        title: "Sun on blisters causes permanent dark spots",
        reason: `UV ${w.uvIndex.toFixed(1)}. Active chickenpox lesions exposed to UV leave long-term hyperpigmentation.`,
        guidance: ["Keep lesions fully covered with loose clothing", "If you go outside, stay in shade"],
      });
    }
    return alerts;
  },

  "Eczema": (w) => {
    const alerts: DiseaseAlert[] = [];
    if (w.temp <= 10) {
      alerts.push({
        severity: "high",
        title: "Cold air will dry out and crack your skin",
        reason: `${w.temp.toFixed(0)}°C strips natural oils and damages the skin barrier — the #1 eczema flare trigger.`,
        guidance: ["Apply a thick ointment-based moisturizer before going out", "Cover hands and face", "Avoid hot showers — use lukewarm water"],
      });
    }
    if (w.humidity <= 30) {
      alerts.push({
        severity: "high",
        title: "Air is too dry — barrier will crack",
        reason: `Humidity is only ${w.humidity}%. Dry air pulls moisture from skin and triggers flares.`,
        guidance: ["Use a humidifier indoors (aim for 40–60%)", "Reapply moisturizer 3–4 times today", "Drink plenty of water"],
      });
    }
    if (w.temp >= 28) {
      alerts.push({
        severity: "medium",
        title: "Sweat will irritate eczema patches",
        reason: `${w.temp.toFixed(0)}°C. Sweat trapped on the skin worsens itching and inflammation.`,
        guidance: ["Stay cool and dry", "Pat — don't rub — sweat away gently", "Wear loose cotton fabrics, avoid wool & synthetics"],
      });
    }
    if (isDusty(w.condition)) {
      alerts.push({
        severity: "high",
        title: "Dust is a major eczema trigger",
        reason: "Airborne particles are common allergens that flare eczema.",
        guidance: ["Wear a face mask outdoors", "Shower and change clothes when you get home", "Keep windows closed"],
      });
    }
    if (w.windSpeed >= 8) {
      alerts.push({
        severity: "medium",
        title: "Strong wind will dehydrate your skin",
        reason: `Wind speed ${w.windSpeed.toFixed(0)} m/s strips skin moisture.`,
        guidance: ["Apply an occlusive moisturizer (petroleum jelly) on exposed areas", "Cover face and hands"],
      });
    }
    return alerts;
  },

  "Monkeypox": (w) => {
    const alerts: DiseaseAlert[] = [];
    alerts.push({
      severity: "high",
      title: "Isolate at home — monkeypox is contagious",
      reason: "Spreads through close contact, respiratory droplets and contaminated objects until all scabs have fallen off.",
      guidance: ["Stay home until lesions fully heal (2–4 weeks)", "Sleep in a separate room from family", "Don't share towels, bedding or utensils"],
    });
    if (w.temp >= 25 || w.humidity >= 70) {
      alerts.push({
        severity: "high",
        title: "Sweating on lesions is painful and risks infection",
        reason: `${w.temp.toFixed(0)}°C and ${w.humidity}% humidity will cause sweat on open lesions.`,
        guidance: ["Stay in a cool, air-conditioned room", "Wear loose, breathable cotton", "Keep lesions clean and dry"],
      });
    }
    if (w.uvIndex >= 3) {
      alerts.push({
        severity: "high",
        title: "Sun on lesions causes permanent dark scars",
        reason: `UV ${w.uvIndex.toFixed(1)}. Monkeypox lesions hyperpigment severely with sun exposure.`,
        guidance: ["Cover all lesions with loose clothing", "Stay completely out of direct sun"],
      });
    }
    return alerts;
  },

  "Nail Fungus": (w) => {
    const alerts: DiseaseAlert[] = [];
    if (w.humidity >= 60 && w.temp >= 25) {
      alerts.push({
        severity: "high",
        title: "Hot & humid — perfect conditions for fungal growth",
        reason: `${w.temp.toFixed(0)}°C with ${w.humidity}% humidity creates the ideal environment for fungus to spread.`,
        guidance: ["Wear breathable open shoes (sandals if possible)", "Change socks twice today", "Dry between toes thoroughly after washing", "Avoid swimming pools and shared showers"],
      });
    } else if (w.humidity >= 60) {
      alerts.push({
        severity: "medium",
        title: "High humidity feeds the fungus",
        reason: `Humidity is ${w.humidity}%. Damp environment slows healing.`,
        guidance: ["Wear moisture-wicking socks", "Use antifungal foot powder", "Air out your shoes"],
      });
    }
    if (w.temp >= 30) {
      alerts.push({
        severity: "medium",
        title: "Heat means more foot sweat",
        reason: `${w.temp.toFixed(0)}°C will make your feet sweat heavily.`,
        guidance: ["Carry a spare pair of socks", "Don't wear closed shoes for long periods"],
      });
    }
    return alerts;
  },

  "SkinCancer": (w) => {
    const alerts: DiseaseAlert[] = [];
    if (w.uvIndex >= 6) {
      alerts.push({
        severity: "high",
        title: "Critical — extreme UV is dangerous for skin cancer",
        reason: `UV index ${w.uvIndex.toFixed(1)}. Any sun exposure can worsen lesions and trigger new ones.`,
        guidance: ["Stay indoors between 10 AM – 4 PM", "If outside: SPF 50+, long sleeves, wide-brimmed hat, UV sunglasses", "Reapply sunscreen every 2 hours"],
      });
    } else if (w.uvIndex >= 3) {
      alerts.push({
        severity: "high",
        title: "Moderate UV is still dangerous for you",
        reason: `UV index ${w.uvIndex.toFixed(1)}. People with skin cancer history need stricter protection than the general public.`,
        guidance: ["Apply SPF 50+ before going out", "Cover affected areas with clothing", "Stay in shade"],
      });
    } else if (w.uvIndex >= 1) {
      alerts.push({
        severity: "medium",
        title: "Even low UV needs protection",
        reason: `UV index ${w.uvIndex.toFixed(1)}. Clouds let through up to 80% of UV.`,
        guidance: ["Apply SPF 30+ broad-spectrum", "Wear long sleeves"],
      });
    }
    if (w.temp >= 28 && w.uvIndex >= 1) {
      alerts.push({
        severity: "high",
        title: "Hot weather increases sun exposure time",
        reason: `${w.temp.toFixed(0)}°C means you're more likely to be outdoors and to wear less clothing.`,
        guidance: ["Plan errands for early morning or evening", "Choose UV-protective clothing (UPF 50)"],
      });
    }
    return alerts;
  },

  "Vitiligo": (w) => {
    const alerts: DiseaseAlert[] = [];
    if (w.uvIndex >= 6) {
      alerts.push({
        severity: "high",
        title: "Vitiligo patches will burn severely",
        reason: `UV index ${w.uvIndex.toFixed(1)}. Depigmented skin has no melanin protection — it burns 10× faster than normal skin and burns can spread vitiligo.`,
        guidance: ["Apply SPF 50+ on every white patch", "Cover patches with UV-protective clothing", "Avoid mid-day sun completely"],
      });
    } else if (w.uvIndex >= 3) {
      alerts.push({
        severity: "medium",
        title: "Protect your vitiligo patches",
        reason: `UV ${w.uvIndex.toFixed(1)}. Even moderate UV can burn depigmented skin.`,
        guidance: ["Apply SPF 50+ generously", "Reapply every 2 hours if outdoors"],
      });
    } else if (w.uvIndex >= 1) {
      alerts.push({
        severity: "low",
        title: "Low UV — apply sunscreen as routine",
        reason: `UV ${w.uvIndex.toFixed(1)}. Best practice is daily sunscreen on all depigmented areas.`,
        guidance: ["Apply SPF 30+ to vitiligo patches"],
      });
    }
    return alerts;
  },
};

export function evaluateWeather(disease: DiseaseName | null, w: WeatherSnapshot): DiseaseAlert[] {
  if (!disease) return [];
  const fn = RULES[disease];
  if (!fn) return [];
  return fn(w);
}

export function overallRisk(alerts: DiseaseAlert[]): Severity | null {
  if (alerts.some(a => a.severity === "high"))   return "high";
  if (alerts.some(a => a.severity === "medium")) return "medium";
  if (alerts.some(a => a.severity === "low"))    return "low";
  return null;
}
