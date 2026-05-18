import React from "react";
import AuthLoginForm from "../components/auth/AuthLoginForm";

export default function PatientLoginScreen({ navigation, setIsLoggedIn }: any) {
  return (
    <AuthLoginForm
      navigation={navigation}
      showRegister={true}
      returnTo="PatientLogin"
      setIsLoggedIn={setIsLoggedIn}
    />
  );
}