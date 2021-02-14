import { useField, useFormikContext } from 'formik';
import React, { useCallback, useMemo, useState } from 'react';

import TextInput, { TextInputProps } from '../common/TextInput';

interface FormikInputProps extends TextInputProps {
  name: string;
}

const FormikInput = ({ name, ...props }: FormikInputProps) => {
  const [touched, setTouched] = useState(false);

  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched } = useFormikContext<any>();

  const error = useMemo(() => (meta.error && meta.touched ? meta.error : ''), [meta.error, meta.touched]);

  const handleChange = useCallback(
    (value: string) => {
      if (!touched) {
        setFieldTouched(name, true);
        setTouched(true);
      }

      setFieldValue(name, value);
    },
    [name, setFieldTouched, setFieldValue, touched],
  );

  return <TextInput error={error} /* {...field} */ {...props} onChangeText={handleChange} value={field.value} />;
};

export default FormikInput;
