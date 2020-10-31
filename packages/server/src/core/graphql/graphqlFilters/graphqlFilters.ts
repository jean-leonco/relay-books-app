import { JSObject } from '@booksapp/types';

export type BuiltConditionSet = {
  conditions: JSObject;
  pipeline: JSObject[];
};

interface IBuildAggregatePipeline {
  defaultConditions: JSObject;
  builtMongoConditions: BuiltConditionSet;
}
export function buildAggregatePipeline({
  defaultConditions,
  builtMongoConditions,
}: IBuildAggregatePipeline): JSObject[] {
  const conditions = {
    ...defaultConditions,
    ...builtMongoConditions.conditions,
  };

  const aggregatePipeline = [
    ...(Object.values(conditions).length ? [{ $match: conditions }] : []),
    ...builtMongoConditions.pipeline,
  ];

  return aggregatePipeline;
}
