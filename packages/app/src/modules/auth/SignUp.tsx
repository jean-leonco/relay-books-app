import React from 'react';
import { ToastAndroid, TouchableOpacity } from 'react-native';
import { FormikProvider, useFormik } from 'formik';
import * as yup from 'yup';
import { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';

import { Column, FormikButton, FormikInput, Space, Text } from '@booksapp/ui';
import { useMutation } from '@booksapp/relay';

import useRouterAuth from '../../router/useRouterAuth';

import { UserRegistration } from './mutations/UserRegistrationMutation';
import { UserRegistrationMutation } from './mutations/__generated__/UserRegistrationMutation.graphql';

const containerCss = css`
  padding: 0 24px;
  background: ${(p) => p.theme.colors.background};
`;

const SignUp = () => {
  const { signIn } = useRouterAuth();
  const [userRegistration] = useMutation<UserRegistrationMutation>(UserRegistration);

  const navigation = useNavigation();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema: yup.object().shape({
      name: yup.string().required('Name is required.'),
      email: yup.string().email('Must be a valid email').required('Email is required.'),
      password: yup.string().required('Password is required.').min(6, 'Password must be at least 6 characters.'),
    }),
    onSubmit: (input, { setSubmitting }) => {
      userRegistration({
        variables: { input },
        onCompleted: ({ UserRegistration }) => {
          setSubmitting(false);

          if (!UserRegistration || UserRegistration.error || !UserRegistration.token) {
            ToastAndroid.show(UserRegistration?.error || 'Unable to create account', ToastAndroid.SHORT);
            return;
          }

          signIn(UserRegistration.token);
        },
        onError: (error) => {
          setSubmitting(false);
          ToastAndroid.show(error?.message || 'Unable to create account', ToastAndroid.SHORT);
        },
      });
    },
  });

  const { handleSubmit } = formik;

  return (
    <Column align="center" justify="center" flex={1} css={containerCss}>
      <Text size="h2" weight="bold" center>
        Create your account
      </Text>
      <Space height={40} />
      <FormikProvider value={formik}>
        <FormikInput name="name" label="Name" placeholder="Full name" textContentType="name" />
        <Space height={10} />
        <FormikInput name="email" label="Email" placeholder="email@example.com" textContentType="emailAddress" />
        <Space height={10} />
        <FormikInput name="password" label="Password" placeholder="Your password" secureTextEntry />
        <Space height={40} />
        <FormikButton onPress={() => handleSubmit()}>Submit</FormikButton>
      </FormikProvider>
      <Space height={30} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ paddingVertical: 20 }}>
        <Text>Already have an account? Go back to login</Text>
      </TouchableOpacity>
    </Column>
  );
};

export default SignUp;
