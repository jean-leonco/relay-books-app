import React from 'react';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay/hooks';
import { ToastAndroid } from 'react-native';
import { FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

import { Column, FormikButton, FormikInput, Space, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';

import { MeEdit } from './mutations/MeEditMutation';
import { MeEditMutation } from './mutations/__generated__/MeEditMutation.graphql';
import { EditProfileQuery } from './__generated__/EditProfileQuery.graphql';

const containerCss = css`
  padding: 0 24px;
  background: ${(p) => p.theme.colors.background};
`;

const EditProfile = () => {
  const { t } = useTranslation();

  const data = useLazyLoadQuery<EditProfileQuery>(
    graphql`
      query EditProfileQuery {
        me {
          fullName
          email
        }
      }
    `,
    {},
  );
  const [meEdit] = useMutation<MeEditMutation>(MeEdit);

  const navigation = useNavigation();

  const formik = useFormik({
    initialValues: {
      name: data.me.fullName,
      email: data.me.email,
      password: '',
    },
    validationSchema: yup.object().shape({
      name: yup.string(),
      email: yup.string().email(t('must_be_a_valid_email')),
      password: yup.string().min(6, t('password_must_be_at_least_6_characters')),
    }),
    onSubmit: ({ name, email, password }, { setSubmitting }) => {
      const input = {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(password ? { password } : {}),
      };

      meEdit({
        variables: { input },
        onCompleted: ({ MeEdit }) => {
          setSubmitting(false);

          if (!MeEdit || MeEdit.error) {
            ToastAndroid.show(MeEdit.error || t('unable_to_update_account'), ToastAndroid.SHORT);
            return;
          }

          navigation.goBack();
        },
        onError: (error) => {
          setSubmitting(false);
          ToastAndroid.show(error?.message || t('unable_to_update_account'), ToastAndroid.SHORT);
        },
      });
    },
  });

  const { handleSubmit } = formik;

  return (
    <Column align="center" justify="center" flex={1} css={containerCss}>
      <Text size="h2" weight="bold" center>
        {t('edit_profile')}
      </Text>
      <Space height={40} />
      <FormikProvider value={formik}>
        <FormikInput name="name" label={t('name')} placeholder={t('full_name')} textContentType="name" />
        <Space height={10} />
        <FormikInput name="email" label={t('email')} placeholder="email@example.com" textContentType="emailAddress" />
        <Space height={10} />
        <FormikInput name="password" label={t('password')} placeholder={t('your_password')} secureTextEntry />
        <Space height={40} />
        <FormikButton onPress={() => handleSubmit()}>{t('submit')}</FormikButton>
      </FormikProvider>
    </Column>
  );
};

export default EditProfile;
