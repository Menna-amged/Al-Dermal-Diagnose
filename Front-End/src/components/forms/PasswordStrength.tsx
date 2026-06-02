import { Ionicons } from "@expo/vector-icons";
import { useFormikContext } from "formik";
import { Text, View } from "react-native";

function PasswordStrength() {
  const { values } = useFormikContext<any>();
  const password = values.password || "";
  if (!password) return null;
  const checks = [
    { label: "At least 6 characters", valid: password.length >= 6 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Number", valid: /[0-9]/.test(password) },
    { label: "Special character", valid: /[@$!%*?&]/.test(password) },
  ];

  return (
    <View style={{ marginBottom: 20 }}>
      {checks.map((item, index) => (
        <View key={index} style={{ flexDirection: "row", marginBottom: 5 }}>
          <Ionicons
            name={item.valid ? "checkmark-circle" : "ellipse-outline"}
            size={18}
            color={item.valid ? "green" : "#aaa"}
          />
          <Text style={{ marginLeft: 8 }}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
export default PasswordStrength;