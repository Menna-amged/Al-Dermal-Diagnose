import React from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import AuthLayout from "../components/layout/AuthLayout";
import CustomForm from "../components/forms/Form";
import CustomFormField from "../components/forms/FormField";
import SubmitButton from "../components/forms/SubmitButton";
import colors from "../config/colors";
import { Ionicons } from "@expo/vector-icons";
import * as Yup from "yup";
import { checkEmail } from "../services/auth.service";


const validationSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format")
    .transform((value) => value.trim())
    .lowercase()
    .matches(
      /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook)\.com$/,
      "Email must be valid "
    ),
});
export default function CreateAccountScreen({ navigation, route }: any) {
  const returnTo = route.params?.returnTo || "PatientLogin";
  return (
    <AuthLayout>
      
      <View style={styles.cardHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>

        <Text style={styles.cardTitle}>Create Account</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Stepper */}
      <View style={styles.stepper}>
        <View style={styles.activeDot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

  <CustomForm
  initialValues={{ email: "" }}
  validationSchema={validationSchema}
  onSubmit={async (values, { setFieldError }) => {
    try {
      await checkEmail(values.email);
      navigation.navigate("UserDetails", { email: values.email, returnTo });
    } catch (err: any) {
      setFieldError("email", err.response?.data?.error || "This email is already registered");
    }
  }}
>
   

  <>
    {/* Content */}
    <View style={styles.content}>
      <Text style={styles.title}>Let’s start with your email</Text>
      <Text style={styles.subtitle}>
        This will be used to login and recover your account
      </Text>

      <CustomFormField
        name="email"
        label="Email"
        placeholder="name@example.com"
      />
    </View>

    {/* Footer */}
    <View style={styles.footer}>
      <SubmitButton title="Next" />

      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  </>
</CustomForm>

    </AuthLayout>
  );
}


const styles = StyleSheet.create({
   cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  stepper: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
    marginRight: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.main,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    alignSelf: "center",
  },
  subtitle: {
    color: colors.gray,
    marginBottom: 30,
    textAlign: "center",
  },

  content: {
    flex: 1,
    marginTop: 15,
    
  },

footer: {
  justifyContent: "flex-end",
  paddingBottom: 20,
  alignItems: "center",
},

  loginRow: {
    flexDirection: "row",
    
  },

  loginText: {
    color: colors.gray,
    fontSize: 14,
  },

  loginLink: {
    color: colors.main,
    fontWeight: "600",
    fontSize: 14,
  },
})


