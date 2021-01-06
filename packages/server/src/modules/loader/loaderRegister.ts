import { GraphQLDataloaders } from '../../types';

const loaders: {
  [Name in keyof GraphQLDataloaders]: () => GraphQLDataloaders[Name];
} = {} as any;

const registerLoader = <Name extends keyof GraphQLDataloaders>(
  key: Name,
  getLoader: () => GraphQLDataloaders[Name],
) => {
  loaders[key] = getLoader as any;
};

const getDataloaders = (): GraphQLDataloaders =>
  (Object.keys(loaders) as (keyof GraphQLDataloaders)[]).reduce(
    (prev, loaderKey) => ({
      ...prev,
      [loaderKey]: loaders[loaderKey](),
    }),
    {},
  ) as any;

export { registerLoader, getDataloaders };
