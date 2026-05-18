import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import CustomFormField from '../components/forms/FormField';
import SubmitButton from '../components/forms/SubmitButton';
import AuthHeader from '../components/auth/AuthHeader';
import AuthLayout from '../components/layout/AuthLayout';
import * as Yup from "yup";
import CustomForm from '../components/forms/Form';
import SearchablePickerField from '../components/forms/SearchablePickerField';

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First name is required")
    .min(2, "Too short")
    .max(30, "Too long")
    .matches(/^[A-Za-z\s]+$/, "Only letters allowed"),
  lastName: Yup.string()
    .required("Last name is required")
    .min(2, "Too short")
    .max(30, "Too long")
    .matches(/^[A-Za-z\s]+$/, "Only letters allowed"),
  gender: Yup.string()
    .required("Gender is required")
    .oneOf(["Male", "Female"], "Select a valid option"),
  age: Yup.number()
    .typeError("Age must be a number")
    .required("Age is required")
    .min(13, "You must be at least 13")
    .max(100, "Invalid age"),
  location: Yup.string().max(50, "Too long").optional(),
});

function UserDetailsScreen({ navigation, route }: any) {
  const email = route.params?.email;
  const returnTo = route.params?.returnTo || "PatientLogin";
  return (
    <AuthLayout>
      <AuthHeader title="Your Details" step={2} navigation={navigation} />

      <CustomForm
        initialValues={{
          firstName: "",
          lastName: "",
          gender: "",
          age: "",
          location: "",
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          navigation.navigate("CreatePassword", { email, returnTo, ...values });
        }}
      >
        <>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Tell us more about yourself</Text>

            <CustomFormField
              name="firstName"
              label="First name"
              placeholder="Enter your first name"
              autoCapitalize="words"
            />
            <CustomFormField
              name="lastName"
              label="Last name"
              placeholder="Enter your last name"
              autoCapitalize="words"
            />
            <CustomFormField
              name="gender"
              label="Gender"
              placeholder="Select gender"
              options={["Male", "Female"]}
            />
            <CustomFormField
              name="age"
              label="Age"
              placeholder="Enter your age"
              keyboardType="numeric"
            />
            <SearchablePickerField
              name="location"
              label="Location"
              options={[
                "Cairo", "Giza", "Alexandria", "Dakahlia", "Sharqia",
                "Qalyubia", "Kafr El Sheikh", "Gharbia", "Monufia", "Beheira",
                "Damietta", "Port Said", "Suez", "Ismailia", "Beni Suef",
                "Faiyum", "Minya", "Asyut", "Sohag", "Qena", "Luxor",
                "Aswan", "Red Sea", "New Valley", "Matruh", "North Sinai",
                "South Sinai"
              ]}
              placeholder="Select your location"
            />
          </View>

          <View style={styles.footer}>
            <SubmitButton title="Next" />
          </View>
        </>
      </CustomForm>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 25,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 20,
  },
});

export default UserDetailsScreen;