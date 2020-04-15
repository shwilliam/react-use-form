import {nullOrUndefined} from './utils'
import {IFormReducerAction} from './form-reducer.d'

export const formReducer = (state: any, action: IFormReducerAction): any => {
  switch (action.type) {
    case 'SET_ERROR':
      if (!action.payload || !action.payload.name) {
        throw new Error('Unable to set error without field name')
      }

      const updatedErrors = {
        ...state.errors,
        [action.payload.name]: action.payload.error || null,
      }
      const {form, ...fieldErrors} = updatedErrors

      return {
        ...state,
        errors: updatedErrors,
        isValid: Object.values(fieldErrors).every(error => error === null),
      }

    case 'SET_SUBMITTING':
      if (!action.payload || nullOrUndefined(action.payload.submitting)) {
        throw new Error('Unable to set submitting without submitting state')
      }

      return {
        ...state,
        submitting: action.payload.submitting,
      }

    case 'SET_FORM_VALIDITY':
      if (!action.payload || nullOrUndefined(action.payload.isValid)) {
        throw new Error('New form validity not passed')
      }

      return {
        ...state,
        isValid: action.payload.isValid,
      }

    case 'SET_FIELD_VALUE':
      if (!action.payload || !action.payload.name) {
        throw new Error('Unable to update field value without field name')
      }

      return {
        ...state,
        values: {
          ...state.values,
          [action.payload.name]: action.payload.value || '',
        },
      }

    case 'SET_FIELD_TOUCHED':
      if (!action.payload || !action.payload.name) {
        throw new Error('Unable to update touched field without field name')
      }

      return {
        ...state,
        touched: {
          ...state.touched,
          [action.payload.name]: true,
        },
      }

    default:
      throw new Error('Invalid action type')
  }
}

