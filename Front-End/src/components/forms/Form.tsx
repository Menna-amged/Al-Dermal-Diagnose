import { Formik, FormikHelpers, FormikValues } from "formik";
import React, { ReactNode } from "react";

type CustomFormProps<T extends FormikValues> = {
  initialValues: T;
  onSubmit: (values: T, formikHelpers: FormikHelpers<T>) => void | Promise<any>;
  validationSchema?: any;
  children: ReactNode;
};

function CustomForm<T extends FormikValues>({
  initialValues,
  onSubmit,
  validationSchema,
  children,
}: CustomFormProps<T>) {
  return (
    <Formik
      
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      validateOnChange={true}
      validateOnMount
    >
    
      {children}
    </Formik>
  );
}

export default CustomForm;
