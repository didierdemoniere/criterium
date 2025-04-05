export function limit(value: number) {
  return <T>(datas: T[]) => datas.slice(0, value);
}
