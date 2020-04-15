export const callIfExists = (obj: any, method: string, ...args: any[]): any => {
  if (obj[method] && typeof obj[method] === 'function') {
    return obj[method](...args)
  }
}
