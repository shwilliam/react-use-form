export const swallow = (fn: any) => {
  try {
    fn()
  } catch {}
}
