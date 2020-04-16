import {FormEvent, useCallback, useEffect, useMemo, useReducer} from 'react'
import {formReducer} from './form-reducer'
import {callIfExists} from './utils'
import {IFields, IHandlers} from './useForm.d'

// TODO: handle all native input types
// TODO: trigger invalid field states on submit
// TODO: enable sharing field props through context

/**
 * Custom form hook.
 *
 * ```js
 * const {props, values, errors, touched, submitting, valid} = useForm(
 *   {
 *     name: {initial: '', validate: val => !val ? 'Required' : null},
 *     favColor: {initial: 'blue', onFocus: doSomethingFancy},
 *   },
 *   {
 *     onSubmit: (values, onSuccess, onError) => {
 *       doSomethingWithValues(values)
 *         .then(onSuccess)
 *         .catch(() => onError('Some useful error message'))
 *     },
 *   },
 * )
 * ```
 *
 * @param fields  Field config object.
 * @param handlers  Form handlers.
 */
export const useForm = (fields: IFields, handlers: IHandlers) => {
  const [state, dispatch] = useReducer(formReducer, {
    isValid: false,
    submitting: false,
    touched: {},
    errors: {},
    values: Object.keys(fields).reduce(
      (values, name) => ({
        ...values,
        [name]: fields[name].initial,
      }),
      {},
    ),
  })

  // TODO: async validation
  const validateField = useCallback(
    (name: string, value = state.values[name], el?: HTMLInputElement) => {
      if (typeof fields[name].validate === 'function') {
        const error = fields[name].validate(value)

        dispatch({type: 'SET_ERROR', payload: {name, error}})

        if (el) callIfExists(el, 'setCustomValidity', error || '')

        return !error
      } else return true
    },
    [fields, dispatch],
  )

  const validateForm = useCallback(
    () => {
      const isValid = Object.keys(fields).reduce((formIsValid, name) => {
        // run validation on all fields
        const fieldIsValid = validateField(name)

        return formIsValid ? fieldIsValid : false
      }, true)

      dispatch({type: 'SET_FORM_VALIDITY', payload: {isValid}})

      return isValid
    },
    [fields, validateField, dispatch],
  )

  const handleChange = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      const target = e.target as HTMLInputElement
      const {name, value} = target

      if (state.errors[name] || document.activeElement !== target) {
        validateField(
          name,
          value,
          state.touched[name] || document.activeElement !== target
            ? target
            : undefined,
        )
      }

      if (!state.touched[name] && document.activeElement !== target) {
        dispatch({type: 'SET_FIELD_TOUCHED', payload: {name}})
      }

      dispatch({type: 'SET_FIELD_VALUE', payload: {name, value}})
    },
    [state.errors, dispatch],
  )

  const handleBlur = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      e.persist()
      const target = e.target as HTMLInputElement
      const {name, value} = target

      if (!state.touched[name]) {
        dispatch({type: 'SET_FIELD_TOUCHED', payload: {name}})
      }

      validateField(name, value, target)

      if (fields[name]) callIfExists(fields[name], 'onBlur', e)
    },
    [state.touched, dispatch, validateField, fields],
  )

  const handleFormSubmitSuccess = useCallback(() => {
    dispatch({type: 'SET_ERROR', payload: {name: 'form', error: undefined}})
    dispatch({type: 'SET_SUBMITTING', payload: {submitting: false}})
  }, [dispatch])

  const handleFormSubmitError = useCallback((errorMessage: string) => {
    dispatch({type: 'SET_ERROR', payload: {name: 'form', error: errorMessage}})
    dispatch({type: 'SET_SUBMITTING', payload: {submitting: false}})
  }, [dispatch])

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      e.preventDefault()

      if (state.submitting) return

      if (!validateForm()) return

      callIfExists(handlers, 'onSubmit', state.values, handleFormSubmitSuccess, handleFormSubmitError)
      dispatch({type: 'SET_SUBMITTING', payload: {submitting: true}})
    },
    [validateForm, handlers],
  )

  const fieldProps = useMemo(
    () =>
      Object.keys(state.values).reduce((props, name) => {
        const {validate, ...fieldListeners} = fields[name]

        return {
          ...props,
          [name]: {
            ...fieldListeners,
            onChange: handleChange,
            onBlur: handleBlur,
            value: state.values[name],
          },
        }
      }, {}),
    [state.values, dispatch, handleChange, handleBlur],
  )

  // check validity on mount
  useEffect(() => {
    validateForm()
  }, [])

  useEffect(() => {
    const {form, ...fieldErrors} = state.errors

    dispatch({type: 'SET_FORM_VALIDITY', payload: {
      isValid: Object.values(fieldErrors).every(error => error === null)
    }})
  }, [state.errors, dispatch])

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    submitting: state.submitting,
    valid: state.isValid,
    props: {
      form: {
        ...handlers,
        onSubmit: handleFormSubmit,
      },
      ...fieldProps,
    },
  }
}
