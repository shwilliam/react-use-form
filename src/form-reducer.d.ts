export interface IState {
  isValid: boolean
  submitting: boolean
  touched: IStateTouched
  errors: IStateErrors
  values: IStateValues
}

export interface IStateValues {
  [name: string]: string
}

export interface IStateTouched {
  [name: string]: boolean
}

export interface IStateErrors {
  [name: string]: string
}

export interface IFormReducerAction {
  type: string
  payload?: IFormReducerActionPayload
}

export interface IFormReducerActionPayload {
  name?: string
  value?: string
  error?: string
  submitting?: boolean
  isValid?: boolean
}

