import { useFormikContext } from "formik";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Modal,
} from "react-native";
import colors from "../../config/colors";
import { Ionicons } from "@expo/vector-icons";

type CustomFormFieldProps = {
  name: string;
  width?: number | string;
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  options?: string[]; // ✅ Dropdown options
  placeholder?: string;
  rightLabel?: string;
  [key: string]: any;
};
function CustomFormField({
  name,
  label,
  width,
  icon,
  options,
  placeholder,
  rightLabel,
  secureTextEntry,
  ...otherProps
}: CustomFormFieldProps & { secureTextEntry?: boolean }) {
  const {
    values,
    setFieldTouched,
    setFieldValue,
    errors,
    touched,
  } = useFormikContext<Record<string, any>>();

  const [visible, setVisible] = useState(false);
  const [secure, setSecure] = useState(secureTextEntry ?? false);

  const containerStyle = [
    styles.inputContainer,
    width ? { width } : undefined,
  ];

  const value = values[name];
  return (
    <>
      {/* Label row */}
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {rightLabel && <Text style={styles.rightLabel}>{rightLabel}</Text>}
        </View>
      )}

      {/* Dropdown */}
      {options ? (
        <>
          <TouchableOpacity
            style={containerStyle}
            onPress={() => setVisible(true)}
            activeOpacity={0.8}
          >
            {icon && (
              <Ionicons
                name={icon}
                size={22}
                color={colors.darkGray}
                style={styles.icon}
              />
            )}
            <Text
              style={[
                styles.input,
                !value && { color: colors.gray },
              ]}
            >
              {value || placeholder}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.darkGray} />
          </TouchableOpacity>

          {/* Modal */}
          <Modal transparent animationType="fade" visible={visible}>
            <TouchableOpacity
              style={styles.overlay}
              onPress={() => setVisible(false)}
              activeOpacity={1}
            >
              <View style={styles.modal}>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.option}
                  onPress={() => {
                    setFieldValue(name, option);
                    setFieldTouched(name);
                    setVisible(false);
}}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      ) : (
        /* Normal TextInput */
      <View style={{ marginBottom: 30 }}>
<View>
<View
  style={[
    containerStyle,
    touched[name] && errors[name] && styles.errorBorder,
    { position: "relative" },
  ]}
>
    {icon && (
      <Ionicons
        name={icon}
        size={22}
        color={colors.darkGray}
        style={styles.icon}
      />
    )}

<TextInput
  onBlur={() => setFieldTouched(name)}
onChangeText={(text) => {
  setFieldValue(name, text);
  setFieldTouched(name, true, false); 
}}
  value={value ?? ""}
  style={[styles.input, secureTextEntry && { paddingRight: 40 }]}
  placeholder={placeholder}
  placeholderTextColor={colors.darkGray}
  secureTextEntry={secure}
  {...otherProps}
/>

{secureTextEntry && (
  <TouchableOpacity
    onPress={() => setSecure(!secure)}
    style={{
      position: "absolute",
      right: 15,
      top: "50%",
      transform: [{ translateY: -11 }],
    }}
  >
    <Ionicons
      name={secure ? "eye-off" : "eye"}
      size={22}
      color={colors.darkGray}
    />
  </TouchableOpacity>
)}
  
  </View>

  {touched[name] && errors[name] && (
    <Text style={styles.errorText}>
      {errors[name] as string}
    </Text>
  )}
</View>


</View>
      )}
    </>
  );
}


const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: colors.darkGray,
  },

  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 16,
  },

  icon: {
    marginRight: 10,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 6,
    marginLeft: 5,
    alignSelf: "flex-start",
  }, 
  overlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.3)",
  justifyContent: "center",
  padding: 30,
},

modal: {
  backgroundColor: "#fff",
  borderRadius: 15,
  overflow: "hidden",
},

option: {
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
},

optionText: {
  fontSize: 16,
},
 labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    marginLeft: 5,
  },
  rightLabel: {
    fontSize: 14,
    color: colors.gray, 
    fontWeight: "500",
  },
errorText: {
  color: colors.red,
  fontSize: 13,
  marginTop: 6,
  marginBottom: 10,
  marginLeft: 5,
},

errorBorder: {
  borderWidth: 1,
  borderColor: "red",
},

});

export default CustomFormField;
export type { CustomFormFieldProps };
