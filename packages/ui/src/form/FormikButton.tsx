import { useFormikContext } from 'formik';
import React from 'react';

import Button, { ButtonProps } from '../common/Button';

const FormikButton = (props: ButtonProps) => {
  const { isValid, isSubmitting, handleSubmit } = useFormikContext();

  return (
    <Button loading={isSubmitting} disabled={!isValid || isSubmitting} onPress={() => handleSubmit()} {...props} />
  );
};

export default FormikButton;
