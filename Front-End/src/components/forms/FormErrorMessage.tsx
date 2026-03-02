import { useFormikContext, getIn } from "formik";
import React from "react";
import { Text, StyleSheet } from "react-native";
import colors from "../../config/colors";

type Props = {
  name: string;
};

function FormErrorMessage({ name }: Props) {
  const { errors, touched } = useFormikContext<any>();

  const error = getIn(errors, name);
  const isTouched = getIn(touched, name);

  if (!isTouched || !error) return null;

  return <Text style={styles.error}>{error}</Text>;
}

const styles = StyleSheet.create({
  error: {
    color: colors.red,
    fontSize: 13,
    marginTop: 5,
    marginBottom: 10,
    marginLeft: 5,
  },
});

export default FormErrorMessage;
