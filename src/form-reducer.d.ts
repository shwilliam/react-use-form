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

