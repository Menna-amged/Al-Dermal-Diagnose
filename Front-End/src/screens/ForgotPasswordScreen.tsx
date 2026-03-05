import React, { useState } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthLayout from "../components/layout/AuthLayout";
import CustomForm from "../components/forms/Form";
import CustomFormField from "../components/forms/FormField";
import SubmitButton from "../components/forms/SubmitButton";
import colors from "../config/colors";
import * as Yup from "yup";
import { forgotPassword } from "../services/auth.service";

const forgotPasswordValidationSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .trim()
    .lowercase()
    .email("Enter a valid email address")
    .max(254, "Email is too long"),
});
export default function ForgotPasswordScreen({ navigation, route }: any) {
  const returnTo = route.params?.returnTo || "PatientLogin";
  const [error, setError] = useState("");

  return (
    <AuthLayout>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={{ width: 22 }} />
      </View>

    <CustomForm
  initialValues={{ email: "" }}
  validationSchema={forgotPasswordValidationSchema}
  onSubmit={async (values) => {
    try {
      setError("");
      await forgotPassword(values.email);
      navigation.navigate("OTPCheck", { email: values.email, returnTo });
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }}
>
        <>
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Enter your email then we will send you a code to reset your password
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

          <CustomFormField
          name="email"
          placeholder="Enter your Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
          </View>

          <View style={styles.footer}>
            <SubmitButton title="Send" />
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
