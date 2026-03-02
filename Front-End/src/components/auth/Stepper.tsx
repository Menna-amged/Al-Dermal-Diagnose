import React from "react";
import { View, StyleSheet } from "react-native";
import colors from "../../config/colors";

type Props = {
  currentStep: number; 
  totalSteps?: number;
};

export default function Stepper({ currentStep, totalSteps = 3 }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.step,
            currentStep === index + 1 && styles.activeStep,
          ]}
        />
      ))}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
    paddingHorizontal: 30, 
  },
  step: {
    flex: 1,              
    height: 3,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 6,
  },
  activeStep: {
    backgroundColor: colors.main,
  },
});

