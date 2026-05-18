import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import colors from "../../config/colors";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
};

export default function AppButton({
  title,
  onPress,
  disabled,
  style,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        disabled && { opacity: 0.5 }, 
        style,
    
      ]}
    
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor:colors.main,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    width: '75%',
    marginVertical: 10,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    
  
  }
});


