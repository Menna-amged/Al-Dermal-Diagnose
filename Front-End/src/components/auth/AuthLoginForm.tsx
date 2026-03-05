import React from "react";
import { login } from '../../services/auth.service';
import * as Yup from "yup";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomForm from "../forms/Form";
import CustomFormField from "../forms/FormField";
import SubmitButton from "../forms/SubmitButton";
import colors from "../../config/colors";
import AuthLayout from "../layout/AuthLayout";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .trim()
    .lowercase()
    .email("Enter a valid email address"),

  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

interface Props {
  navigation: any;
  showRegister?: boolean;
  returnTo?: string;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

export default function AuthLoginForm({
  navigation,
  showRegister = false,
  returnTo = "PatientLogin",
  setIsLoggedIn,
}: Props) {
  return (
    // <KeyboardAwareScrollView
    //   contentContainerStyle={{ flexGrow: 1 }}
    //   enableOnAndroid
    //   extraScrollHeight={20}
    //   keyboardShouldPersistTaps="handled"
    // >
      <AuthLayout
        headerHeight={240}
        image={require("../../assets/login2.png")}
      onBack={() => navigation.navigate("UserType")}
      >
        <Text style={styles.title}>Login</Text>

        <CustomForm
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setFieldError, setSubmitting }) => {
            try {
              await login(values.email, values.password);
              setIsLoggedIn(true);
            } catch (error: any) {
              const message =
                error?.response?.data?.message || "Invalid email or password";
              setFieldError("password", message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <>
            <CustomFormField
              name="email"
              label="Email"
              icon="mail"
              placeholder="Enter your email"
              keyboardType="email-address"
            />

            <CustomFormField
              name="password"
              label="Password"
              icon="lock-closed"
              placeholder="Enter your password"
              secureTextEntry
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword", { returnTo })}
            >
              <Text style={styles.forgotPassword}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <SubmitButton title="Login" />
            </View>

            {showRegister && (
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>
                  Don’t have an account?{" "}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("CreateAccount", { returnTo })
                  }
                >
                  <Text style={styles.registerLink}>
                    Register
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        </CustomForm>
      </AuthLayout>
    // </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.main,
    marginBottom: 40,
    marginTop: 20,
  },

  buttonContainer: {
    alignItems: "center",
  },

  forgotPassword: {
    alignSelf: "flex-end",
    color: colors.darkGray,
    fontSize: 14,
    marginTop: -20,
    marginBottom: 20,
    marginRight: 5,
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },

  registerText: {
    fontSize: 14,
    color: colors.gray,
  },

  registerLink: {
    fontSize: 14,
    color: colors.main,
    fontWeight: "bold",
  },
});