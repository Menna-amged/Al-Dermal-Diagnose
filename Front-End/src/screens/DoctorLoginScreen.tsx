import React from "react";
import AuthLoginForm from "../components/auth/AuthLoginForm";

export default function DoctorLoginScreen({ navigation, setIsLoggedIn, setUserType, setIsProfileComplete }: any) {
  return (
    <AuthLoginForm
      navigation={navigation}
      showRegister={false}
      returnTo="DoctorLogin"
      setIsLoggedIn={setIsLoggedIn}
      setUserType={setUserType}
      setIsProfileComplete={setIsProfileComplete}
    />
  );
}