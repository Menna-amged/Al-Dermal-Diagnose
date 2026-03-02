import { useFormikContext } from "formik";
import React from "react";
import AppButton from "../lists/Button";

type SubmitButtonProps = {
  title: string;
};

function SubmitButton({ title }: SubmitButtonProps) {
  const { handleSubmit, isValid, dirty } = useFormikContext<any>();
      

  return (
    <AppButton
      title={title}
      onPress={handleSubmit}
      disabled={!isValid }
    />
  );
}

export default SubmitButton;