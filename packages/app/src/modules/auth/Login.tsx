import React from 'react';
import { ToastAndroid, TouchableOpacity } from 'react-native';
import { FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

import { Column, FormikButton, FormikInput, Space, Text } from '@booksapp/ui';
import { useMutation } from '@booksapp/relay';

import useRouterAuth from '../../router/useRouterAuth';

import { UserLogin } from './mutations/UserLoginMutation';
import { UserLoginMutation } from './mutations/__generated__/UserLoginMutation.graphql';

const containerCss = css`
  padding: 0 24px;
  background: ${(p) => p.theme.colors.background};
`;

const Login = () => {
  const { signIn } = useRouterAuth();
  const [userLogin] = useMutation<UserLoginMutation>(UserLogin);

  const navigation = useNavigation();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: yup.object().shape({
      email: yup.string().email('Must be a valid email').required('Email is required.'),
      password: yup.string().required('Password is required.'),
    }),
    onSubmit: (input, { setSubmitting }) => {
      userLogin({
        variables: { input },
        onCompleted: ({ UserLogin }) => {
          setSubmitting(false);

          if (!UserLogin || UserLogin.error || !UserLogin.token) {
            ToastAndroid.show(UserLogin?.error || 'Unable to login', ToastAndroid.SHORT);
            return;
          }

          signIn(UserLogin.token);
        },
        onError: (error) => {
          setSubmitting(false);
          ToastAndroid.show(error?.message || 'Unable to login', ToastAndroid.SHORT);
        },
      });
    },
  });

  const { handleSubmit } = formik;

  return (
    <Column align="center" justify="center" flex={1} css={containerCss}>
      <Text size="h2" weight="bold" center>
        Welcome Back
      </Text>
      <Space height={40} />
      <FormikProvider value={formik}>
        <FormikInput name="email" label="Email" placeholder="email@example.com" textContentType="emailAddress" />
        <Space height={10} />
        <FormikInput name="password" label="Password" placeholder="Your password" secureTextEntry />
        <Space height={40} />
        <FormikButton onPress={() => handleSubmit()}>Submit</FormikButton>
      </FormikProvider>
      <Space height={30} />
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={{ paddingVertical: 20 }}>
        <Text>Don't have an account? Create now</Text>
      </TouchableOpacity>
    </Column>
  );
};

export default Login;
