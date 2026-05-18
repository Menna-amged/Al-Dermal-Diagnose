import { StyleSheet } from "react-native";
import colors from "./colors";

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

export const radius = { sm: 8, md: 12, lg: 14, xl: 16, pill: 20, full: 999 };

export const shadow = {
  sm: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  md: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
};

// Disease severity — single source of truth
export const SEVERITY_MAP: Record<string, { priority: number; label: string; color: string; bg: string }> = {
  "Skin Cancer":       { priority: 1, label: "Critical",  color: "#7B0000", bg: "#FFE5E5" },
  "Actinic Keratosis": { priority: 2, label: "High Risk", color: "#C0392B", bg: "#FDECEA" },
  "Monkeypox":         { priority: 3, label: "High Risk", color: "#E8524A", bg: "#FFE8E7" },
  "Chickenpox":        { priority: 4, label: "Moderate",  color: "#E67E22", bg: "#FEF0E7" },
  "Eczema":            { priority: 5, label: "Moderate",  color: "#F5A623", bg: "#FFF4E0" },
  "Vitiligo":          { priority: 6, label: "Low Risk",  color: "#8E44AD", bg: "#F5EEF8" },
  "Nail Fungus":       { priority: 7, label: "Low Risk",  color: "#27AE60", bg: "#E9F7EF" },
  "Acne & Rosacea":    { priority: 8, label: "Low Risk",  color: "#4A90D9", bg: "#E8F2FF" },
  "Normal":            { priority: 9, label: "Normal",    color: "#7F8C8D", bg: "#F2F3F4" },
};

// Disease condition priority for sorting
export const CONDITION_PRIORITY: Record<string, number> = Object.fromEntries(
  Object.entries(SEVERITY_MAP).map(([k, v]) => [k, v.priority])
);

// Condition info for DiagnosisReportScreen
export const CONDITION_INFO: Record<string, { subtitle: string; overview: string; steps: string[] }> = {
  "Eczema":            { subtitle: "Atopic Dermatitis",     overview: "Eczema is a common condition that causes your skin to become itchy, dry, and inflamed. While it can affect anyone, it is most frequently diagnosed in children. It is a chronic condition that typically involves periodic flare-ups followed by periods of clear skin.", steps: ["Apply prescribed moisturizer twice daily.", "Avoid known triggers like harsh soaps.", "Use prescribed topical corticosteroids during flare-ups.", "Follow up in 4 weeks."] },
  "Skin Cancer":       { subtitle: "Malignant Skin Cancer", overview: "Skin cancer is the abnormal growth of skin cells, most often developing on skin exposed to the sun. Early detection is critical for successful treatment.", steps: ["Immediate referral to dermatologist/oncologist.", "Schedule biopsy as soon as possible.", "Avoid sun exposure completely.", "Urgent follow-up within 1 week."] },
  "Actinic Keratosis": { subtitle: "Pre-cancerous Lesion",  overview: "Actinic keratosis is a rough, scaly patch on the skin caused by years of sun exposure. It's considered a precancerous condition.", steps: ["Apply prescribed cryotherapy or topical treatment.", "Avoid prolonged sun exposure.", "Use SPF 50+ sunscreen daily.", "Follow up in 6 weeks."] },
  "Monkeypox":         { subtitle: "Viral Infection",       overview: "Monkeypox is a viral disease that causes a rash with blisters. It spreads through close contact with an infected person.", steps: ["Isolate the patient immediately.", "Report to public health authorities.", "Prescribe antiviral treatment.", "Follow up in 3 days."] },
  "Chickenpox":        { subtitle: "Varicella Virus",       overview: "Chickenpox is a highly contagious disease caused by the varicella-zoster virus. It causes an itchy rash with small, fluid-filled blisters.", steps: ["Rest and stay hydrated.", "Use antihistamines to relieve itching.", "Avoid scratching the blisters.", "Follow up in 1 week."] },
  "Vitiligo":          { subtitle: "Pigmentation Disorder", overview: "Vitiligo is a condition in which patches of skin lose their pigment. It occurs when pigment-producing cells die or stop functioning.", steps: ["Apply prescribed topical corticosteroids.", "Consider phototherapy.", "Use sunscreen on affected areas.", "Follow up in 8 weeks."] },
  "Nail Fungus":       { subtitle: "Onychomycosis",         overview: "Nail fungus is a common infection of the nail. It begins as a white or yellow-brown spot under the tip of your fingernail or toenail.", steps: ["Apply prescribed antifungal nail lacquer.", "Keep nails clean and dry.", "Avoid walking barefoot in public areas.", "Follow up in 12 weeks."] },
  "Acne & Rosacea":    { subtitle: "Inflammatory Skin",     overview: "Acne and rosacea are common skin conditions that cause redness, pimples, and visible blood vessels in the face.", steps: ["Use gentle cleanser twice daily.", "Apply prescribed topical retinoid.", "Avoid triggers like spicy food and alcohol.", "Follow up in 6 weeks."] },
};

// Shared reusable styles
export const common = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: colors.background },
  screenBg:  { flex: 1, backgroundColor: colors.background },
  card:      { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  row:       { flexDirection: "row", alignItems: "center" },
  rowBetween:{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge:     { backgroundColor: "#EAF0FF", borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: "700", color: colors.main },
  emptyContainer: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: colors.darkGray },
  title:     { fontSize: 18, fontWeight: "700", color: colors.black },
  subtitle:  { fontSize: 13, color: colors.darkGray },
  label:     { fontSize: 12, fontWeight: "600", color: colors.darkGray, letterSpacing: 0.8 },
});