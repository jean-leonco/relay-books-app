import { useField, useFormikContext } from 'formik';
import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components/native';

import { Column, Space, Text } from '@workspace/ui';

import Rating, { RatingProps } from './Rating';

const Label = styled(Text)`
  color: ${(p) => p.theme.colors.black};
  font-size: ${(p) => p.theme.fontSizes.label};
  font-weight: ${(p) => p.theme.fontWeights.semiBold};
`;

const Error = styled(Text)`
  color: #ef3d52;
  font-size: 13px;
`;

interface FormikRatingProps extends RatingProps {
  name: string;
  label?: string;
}

const FormikRating = ({ name, label, ...props }: FormikRatingProps) => {
  const [touched, setTouched] = useState(false);
  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched } = useFormikContext<any>();

  const error = useMemo(() => (meta.error && meta.touched ? meta.error : ''), [meta.error, meta.touched]);

  const handleChange = useCallback(
    (value: number) => {
      if (!touched) {
        setFieldTouched(name, true);
        setTouched(true);
      }

      setFieldValue(name, value);
    },
    [name, setFieldTouched, setFieldValue, touched],
  );

  return (
    <Column align="flex-start">
      {label && (
        <>
          <Label>{label}</Label>
          <Space height={14} />
        </>
      )}
      <Rating onFinishRating={handleChange} initialRating={field.value} {...props} />
      <>
        <Space height={4} />
        <Error>{error}</Error>
      </>
    </Column>
  );
};

export default FormikRating;
