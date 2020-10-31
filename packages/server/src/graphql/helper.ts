import { DocumentNode } from 'graphql/language';
import DataLoader from 'dataloader';

interface LoaderFactory<T extends DataLoader<any, any>> {
  getLoader: () => T;
}

interface LoaderFactoryMap {
  [key: string]: LoaderFactory<any>;
}

export type ResolvedLoaders<T extends LoaderFactoryMap> = { [K in keyof T]: ReturnType<T[K]['getLoader']> };

export function getDataloaders<T extends LoaderFactoryMap>(loaders: T): ResolvedLoaders<T> {
  const result: ResolvedLoaders<T> = {} as any;
  for (const key in loaders) {
    if (loaders[key].getLoader) {
      result[key] = loaders[key].getLoader();
    }
  }
  return result;
}

export function hasIntrospectionQuery(document: DocumentNode) {
  if (document.definitions.length === 0) {
    return false;
  }
  const definition = document.definitions[0];
  if (definition.kind !== 'OperationDefinition') {
    return false;
  }
  return definition.name && definition.name.value === 'IntrospectionQuery';
}
