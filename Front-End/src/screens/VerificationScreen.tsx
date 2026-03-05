import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFormikContext } from "formik";
import colors from "../config/colors";
import SubmitButton from "../components/forms/SubmitButton";
import CustomForm from "../components/forms/Form";
import AuthLayout from "../components/layout/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import { verifyOtp, resendOtp } from "../services/auth.service";

function OTPInputs() {
  const { setFieldValue } = useFormikContext<any>();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);

  const updateCode = (newDigits: string[]) => {
    setDigits(newDigits);
    setFieldValue("code", newDigits.join(""));
  };

  const handleChange = (text: string, index: number) => {
  
    const newDigits = [...digits];
    const chars = text.split("").filter((c) => /\d/.test(c));
    chars.forEach((c, i) => {
      if (index + i < 6) newDigits[index + i] = c;
    });
    updateCode(newDigits);

    
    const nextIndex = Math.min(index + chars.length, 5);
    inputs.current[nextIndex]?.focus();
  };

  return (
    <View style={styles.otpContainer}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputs.current[index] = ref!)}
          style={styles.otpInput}
          keyboardType="number-pad"
          maxLength={1}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
              inputs.current[index - 1]?.focus();
            }
          }}
        />
      ))}
    </View>
  );
}

export default function VerificationScreen({ navigation, setIsLoggedIn  , route}: any) {
  const email = route.params?.email || "user@example.com";
  const returnTo = route.params?.returnTo || "PatientLogin";
  const [timer, setTimer] = useState(60);
  const [otpKey, setOtpKey] = useState(0);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <AuthLayout>
      <View style={{ flex: 1 }}>
      <AuthHeader title="Verification" step={1} navigation={navigation} />
      <Text style={styles.title} >Check your Email</Text>
    

      <CustomForm
        initialValues={{ code: "" }}
        onSubmit={async (values, { setFieldError, setSubmitting, setFieldValue }) => {
          try {
            await verifyOtp(email, values.code);
            navigation.replace(returnTo);
          } catch (error: any) {
            const message = error?.response?.data?.error || "Invalid or expired code";
            setFieldError("code", message);
            setOtpKey((k) => k + 1);
            setFieldValue("code", "");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <>
          <OTPInputs key={otpKey} />

           <View style={styles.resendRow}>
            <Text style={styles.grayText}>Didn't get a code? </Text>
            <TouchableOpacity
              onPress={async () => {
                if (timer === 0) {
                  try {
                    await resendOtp(email);
                    setTimer(60);
                  } catch {}
                }
              }}
              disabled={timer !== 0}
            >
              <Text style={[styles.resendText, timer === 0 ? styles.resendActive : styles.resendDisabled]}>
                Re-send
              </Text>
            </TouchableOpacity>
            {timer !== 0 && (
              <Text style={styles.timer}>{formatTime()}</Text>
            )}
          </View>

          <View style={styles.footer}>
            <SubmitButton title="Verify" />
          </View>
        </>
      </CustomForm>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
    title: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 20,
    justifyContent: "center",
    alignSelf: "center",

  },
  subtitle: {
    textAlign: "center",
    color: colors.gray,
    marginVertical: 30,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  otpInput: {
    width: 48,
    height: 55,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
    textAlign: "center",
    fontSize: 18,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  grayText: { color: colors.gray },
   resendText: {
    fontWeight: "600",
  },
  resendActive: {
    color: colors.main,
  },
  resendDisabled: {
    color: colors.gray,
  },
  link: { color: colors.main, fontWeight: "600" },
  timer: { color: colors.gray, marginLeft: 5 },
  footer: { alignItems: "center", paddingBottom: 20 , marginTop: 40},
});