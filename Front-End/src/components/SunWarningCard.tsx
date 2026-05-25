import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const API_KEY = "20ddfaabbc356e08643951331011bebf";

const SUN_SENSITIVE_DISEASES = [
  "skincancer",
  "skin cancer",
  "actinic keratosis",
  "actinic",
  "acne",
  "rosacea",
  "vitiligo",
  "eczema",
  "chickenpox",
  "monkeypox",
];

function isSunSensitive(disease: string): boolean {
  const lower = disease.toLowerCase().trim();

  if (
    lower === "normal" ||
    lower.includes("nail fungus") ||
    lower.includes("nail")
  ) {
    return false;
  }

  return SUN_SENSITIVE_DISEASES.some((d) =>
    lower.includes(d)
  );
}

function getRiskLevel(
  temp: number,
  condition: string,
  uv: number
): {
  level: "high" | "medium" | "low";
  message: string;
  tip: string;
} {
  if (uv >= 8) {
    return {
      level: "high",
      message: "⚠️ Very high UV risk today!",
      tip: "Avoid direct sun exposure between 10am–4pm. Wear SPF 50+, sunglasses, and protective clothing.",
    };
  }

  if (uv >= 5) {
    return {
      level: "medium",
      message: "☀️ Moderate UV exposure today",
      tip: "Use SPF 30+ sunscreen and limit long exposure to sunlight.",
    };
  }

  return {
    level: "low",
    message: "🌤️ Low UV risk today",
    tip: "Sun conditions are generally safe, but sunscreen is still recommended.",
  };
}

interface Props {
  disease: string;
}

export default function SunWarningCard({ disease }: Props) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [uvIndex, setUvIndex] = useState<number>(0);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLoading(false);
        return;
      }

      const location =
        await Location.getCurrentPositionAsync({});

      const {
        latitude: lat,
        longitude: lon,
      } = location.coords;

      // Weather API
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );

      const data = await res.json();

      setWeather(data);
      setCity(data.name ?? "");

      // UV API
      const uvRes = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}`
      );

      const uvData = await uvRes.json();

      setUvIndex(uvData.current.uvi ?? 0);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isSunSensitive(disease)) return null;

  if (loading) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: "#FFFBEB",
            borderColor: "#FCD34D",
          },
        ]}
      >
        <ActivityIndicator color="#D97706" />
        <Text style={styles.loadingText}>
          Checking sun conditions...
        </Text>
      </View>
    );
  }

  const temp = weather
    ? Math.round(weather.main.temp)
    : 35;

  const condition =
    weather?.weather?.[0]?.main ?? "Clear";

  const risk = getRiskLevel(
    temp,
    condition,
    uvIndex
  );

  const cardColors = {
    high: {
      bg: "#FEF2F2",
      border: "#FCA5A5",
      icon: "#DC2626",
      text: "#991B1B",
    },
    medium: {
      bg: "#FFFBEB",
      border: "#FCD34D",
      icon: "#D97706",
      text: "#92400E",
    },
    low: {
      bg: "#F0FDF4",
      border: "#86EFAC",
      icon: "#16A34A",
      text: "#14532D",
    },
  };

  const c = cardColors[risk.level];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.bg,
          borderColor: c.border,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: c.icon + "20",
            },
          ]}
        >
          <MaterialCommunityIcons
            name="white-balance-sunny"
            size={20}
            color={c.icon}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.riskTitle,
              { color: c.text },
            ]}
          >
            {risk.message}
          </Text>

          <Text style={styles.weatherInfo}>
            {temp}°C · UV {uvIndex} · {condition}
            {city ? ` · ${city}` : ""}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.divider,
          {
            backgroundColor: c.border,
          },
        ]}
      />

      <View style={styles.tipRow}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={c.icon}
          style={{ marginTop: 1 }}
        />

        <Text
          style={[
            styles.tipText,
            {
              color: c.text,
            },
          ]}
        >
          {risk.tip}
        </Text>
      </View>

      <View
        style={[
          styles.sensitiveBadge,
          {
            backgroundColor: c.icon + "15",
          },
        ]}
      >
        <Text
          style={[
            styles.sensitiveText,
            {
              color: c.icon,
            },
          ]}
        >
          ⚡ {disease} is sun-sensitive
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },

  loadingText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  riskTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },

  weatherInfo: {
    fontSize: 12,
    color: "#6B7280",
  },

  divider: {
    height: 1,
    marginBottom: 12,
  },

  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 12,
  },

  tipText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },

  sensitiveBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  sensitiveText: {
    fontSize: 12,
    fontWeight: "600",
  },
});