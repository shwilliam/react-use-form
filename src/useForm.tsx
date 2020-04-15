import {FormEvent, useCallback, useMemo, useState} from 'react'
import {swallow} from './utils'
import {IFields, IHandlers} from './useForm.d'

// TODO: handle all native input types

export const useForm = (fields: IFields, handlers: IHandlers) => {
  // TODO: refactor to use a reducer
  // TODO: track and expose `isSubmitting`
  let [touched, setTouched] = useState({})
  let [errors, setErrors] = useState({})
  // TODO: persist form values with local storage
  const [values, setValues] = useState(
    Object.keys(fields).reduce(
      (values, name) => ({
        ...values,
        [name]: fields[name].initial,
      }),
      {},
    ),
  )

  // TODO: async validation
  const validateField = useCallback(
    (name: string, el?: HTMLInputElement, value = values[name]) => {
      if (typeof fields[name].validate === 'function') {
        const error = fields[name].validate(value)

        setErrors(s => ({...s, [name]: error || null}))

        swallow(() => el?.setCustomValidity(error || ''))

        return !error
      } else return true
    },
    [fields, setErrors],
  )

  const validateForm = useCallback(
    () =>
      Object.keys(fields).reduce((formIsValid, name) => {
        const fieldError = validateField(name)

        return !fieldError || formIsValid
      }, true),
    [fields, validateField],
  )

  const handleChange = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      const target = e.target as HTMLInputElement
      const {name, value} = target

      if (errors[name]) validateField(name, target, value)

      setValues({
        ...values,
        [name]: value,
      })
    },
    [setValues, errors],
  )

  const handleBlur = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      e.persist()
      const target = e.target as HTMLInputElement
      const {name, value} = target

      if (!touched[name]) setTouched(s => ({...s, [name]: true}))

      validateField(name, target, value)

      swallow(() => fields[name].onBlur(e))
    },
    [touched, setTouched, validateField, fields],
  )

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      e.preventDefault()

      const isFormValid = validateForm()
      if (!isFormValid) return

      swallow(() => handlers.onSubmit(values))
    },
    [validateForm, handlers],
  )

  const fieldProps = useMemo(
    () =>
      Object.keys(values).reduce((props, name) => {
        const {validate, ...fieldListeners} = fields[name]

        return {
          ...props,
          [name]: {
            ...fieldListeners,
            onChange: handleChange,
            onBlur: handleBlur,
            value: values[name],
          },
        }
      }, {}),
    [values, handleChange, handleBlur],
  )

  return {
    values,
    errors,
    touched,
    props: {
      form: {
        ...handlers,
        onSubmit: handleFormSubmit,
      },
      ...fieldProps,
    },
  }
}
