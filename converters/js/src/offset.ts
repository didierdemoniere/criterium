export function offset(value: number) {
  return <T>(datas: T[]) => datas.slice(value);
}
