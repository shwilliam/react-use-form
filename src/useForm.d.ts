export interface IHandlers {
  onSubmit: (
    values: IValues,
    onCompleteCallback: () => void,
    onErrorCallback: (errorMessage: string) => void,
  ) => any
}

export interface IValues {
  string?: string
}

export interface IFields {
  string: {
    initial?: string
    validate?: validationFn
  }
}

export type validationFn = (value: string) => boolean
