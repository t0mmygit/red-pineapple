export default function CustomPick<T extends Record<string, unknown>, K extends keyof T>(
  object: T,
  ...keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key in keys) {
    if (key in object) {
      result[key] = object[key];
    }
  }

  return result;
}
