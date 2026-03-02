import React from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthLayout from "../components/layout/AuthLayout";
import CustomForm from "../components/forms/Form";
import CustomFormField from "../components/forms/FormField";
import SubmitButton from "../components/forms/SubmitButton";
import colors from "../config/colors";
import * as Yup from "yup";

const forgotPasswordValidationSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .trim()
    .lowercase()
    .email("Enter a valid email address")
    .max(254, "Email is too long"),
});
export default function ForgotPasswordScreen({ navigation }: any) {
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
  onSubmit={(values) => {
    navigation.navigate("OTPCheck", { email: values.email });
  }}
>
        <>
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Enter your email then we will send you a code to reset your password
            </Text>

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
  content: {
    flex: 1,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 20,
  },
});
