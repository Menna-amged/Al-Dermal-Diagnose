import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import colors from "../config/colors";
import { Ionicons } from "@expo/vector-icons";
import AuthLayout from "../components/layout/AuthLayout";



function UserTypeScreen({ navigation }: any) {
  return (
    <AuthLayout
      headerHeight={240}
  showCircles
  showBack={false}
>

      
        <View style={styles.iconWrapper}>
          <Ionicons name="shield-checkmark" size={28} color={colors.main} />
        </View>

        <Text style={styles.cardTitle}>Early detection saves lives.</Text>
        <Text style={styles.cardText}>
          Scan your skin and get instant{"\n"}AI-powered analysis.
        </Text>

        {/* dots */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <View style={styles.buttonsContainer}>

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.primaryButton , styles.buttonShadow]}
          onPress={() => navigation.navigate("PatientLogin")}
        >
          <Text style={styles.primaryButtonText}>Patient</Text>
        </TouchableOpacity>

        <TouchableOpacity
         style={[styles.secondaryButton, styles.buttonShadow]}
          onPress={() => navigation.navigate("DoctorLogin")}
        >
          <Text style={styles.secondaryButtonText}>Doctor</Text>
        </TouchableOpacity>
          </View>
    
    </AuthLayout>
  );
}

export default UserTypeScreen;
const styles = StyleSheet.create({



  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
    letterSpacing: 1,
  },

  subtitle: {
    fontSize: 12,
    color: colors.white,
    marginTop:20,
    opacity: 0.9,
  },


  iconWrapper: {
    width: 55,
    height: 55,
    borderRadius: 27,
    backgroundColor: "#EAF1FF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
        alignSelf: "center",
    
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },

  cardText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    marginBottom: 15,
  },

  dots: {
    flexDirection: "row",
    marginBottom: 25,
    justifyContent: "center",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: colors.main,
  },

  primaryButton: {
    width: "100%",
    backgroundColor: colors.main,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
  },
buttonsContainer: {
  width: "100%",
  marginTop: "auto",   
  paddingBottom: 20,
},
 buttonShadow: {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.35,
  shadowRadius: 12,
  elevation: 14,
},

  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButton: {
      width: "100%",
  backgroundColor: colors.white,
  paddingVertical: 14,
  borderRadius: 30,
  alignItems: "center",
  
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
