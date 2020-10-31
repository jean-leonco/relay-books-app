export interface Action<Payload = any> {
  type: string;
  payload?: Payload;
}
export interface JSObject<Value = any> {
  [key: string]: Value | undefined;
}
export type TypedFunction<Args extends any[] = any[], Return = void> = (...args: Args) => Return;
export type Unpack<Arg extends any[]> = Arg extends (infer Element)[] ? Element : never;
export type Writeable<T> = { -readonly [P in keyof T]-?: T[P] };
export function defined<T>(input: T): input is Exclude<T, undefined | null | false> {
  return !!input;
}
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? DeepPartial<U>[]
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};
export type Diff<T, U> = T extends U ? never : T;
// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
export type Value = string | boolean | null | undefined | IValueObject | Value[] | object | number;
export interface IValueObject {
  [x: string]: Value;
}
