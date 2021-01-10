import React from 'react';
import { ToastAndroid, TouchableOpacity, Keyboard } from 'react-native';
import { useMutation } from 'react-relay/hooks';
import { FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

import { Column, FormikButton, FormikInput, Space, Text } from '@workspace/ui';

import useTranslation from '../../locales/useTranslation';
import useRouterAuth from '../../router/useRouterAuth';

import { UserLogin } from './mutations/UserLoginMutation';
import { UserLoginMutation } from './mutations/__generated__/UserLoginMutation.graphql';

const containerCss = css`
  padding: 0 24px;
  background: ${(p) => p.theme.colors.background};
`;

const Login = () => {
  const { t } = useTranslation();
  const { signIn } = useRouterAuth();

  const [userLogin] = useMutation<UserLoginMutation>(UserLogin);

  const navigation = useNavigation();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: yup.object().shape({
      email: yup.string().email(t('must_be_a_valid_email')).required(t('email_is_required')),
      password: yup.string().required(t('password_is_required')),
    }),
    onSubmit: (input, { setSubmitting }) => {
      userLogin({
        variables: { input },
        onCompleted: ({ UserLogin }) => {
          setSubmitting(false);

          if (!UserLogin || UserLogin.error || !UserLogin.token) {
            ToastAndroid.show(UserLogin?.error || t('unable_to_login'), ToastAndroid.SHORT);
            return;
          }

          Keyboard.dismiss();
          signIn(UserLogin.token);
        },
        onError: (error) => {
          setSubmitting(false);
          Keyboard.dismiss();
          ToastAndroid.show(error?.message || t('unable_to_login'), ToastAndroid.SHORT);
        },
      });
    },
  });

  const { handleSubmit } = formik;

  return (
    <Column align="center" justify="center" flex={1} css={containerCss}>
      <Text size="h2" weight="bold" center>
        {t('welcome_back')}
      </Text>
      <Space height={40} />
      <FormikProvider value={formik}>
        <FormikInput name="email" label={t('email')} placeholder="email@example.com" textContentType="emailAddress" />
        <Space height={10} />
        <FormikInput name="password" label={t('password')} placeholder={t('your_password')} secureTextEntry />
        <Space height={40} />
        <FormikButton onPress={() => handleSubmit()}>{t('submit')}</FormikButton>
      </FormikProvider>
      <Space height={30} />
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={{ paddingVertical: 20 }}>
        <Text>{t('dont_have_an_account_create_now')}</Text>
      </TouchableOpacity>
    </Column>
  );
};

export default Login;
