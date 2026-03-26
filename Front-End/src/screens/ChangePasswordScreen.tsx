import React, { useState } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthLayout from "../components/layout/AuthLayout";
import CustomForm from "../components/forms/Form";
import CustomFormField from "../components/forms/FormField";
import SubmitButton from "../components/forms/SubmitButton";
import colors from "../config/colors";
import { useFormikContext } from "formik";
import * as Yup from "yup";
import PasswordStrength from "../components/forms/PasswordStrength";
import { resetPassword } from "../services/auth.service";

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required("Password is required")
    .min(6, "At least 6 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(/[@$!%*?&]/, "Must contain a special character"),

  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords do not match"),
});

export default function ChangePasswordScreen({ navigation, route }: any) {
  const { email, returnTo = "PatientLogin" } = route.params;
  const [error, setError] = useState("");

  return (
    <AuthLayout>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 22 }} />
      </View>

      <CustomForm
  initialValues={{ password: "", confirmPassword: "" }}
  validationSchema={validationSchema}
  onSubmit={async (values) => {
    try {
      setError("");
      await resetPassword(email, values.password, values.confirmPassword);
      navigation.replace(returnTo);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }}
>
        <>
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Your password must be at least 6 characters and should include
              letters, numbers and special characters.
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <CustomFormField
              name="password"
              placeholder="New password"
              secureTextEntry
            />
            <PasswordStrength />
            <CustomFormField
              name="confirmPassword"
              placeholder="Re-type new password"
              secureTextEntry
            />
          </View>

          <View style={styles.footer}>
            <SubmitButton title="Change password" />
          </View>
        </>
      </CustomForm>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.gray,
    marginBottom: 30,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  content: {
    flex: 1,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 20,
  },
});

