import React from "react";
import AuthLoginForm from "../components/auth/AuthLoginForm";

export default function DoctorLoginScreen({ navigation, setIsLoggedIn }: any) {
  return (
    <AuthLoginForm
      navigation={navigation}
      showRegister={false}
      returnTo="DoctorLogin"
      setIsLoggedIn={setIsLoggedIn}
    />
  );
}