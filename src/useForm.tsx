import {FormEvent, useCallback, useMemo, useState, useEffect} from 'react'
import {callIfExists} from './utils'
import {IFields, IHandlers} from './useForm.d'

// TODO: handle all native input types
// TODO: trigger invalid field states on submit
// TODO: enable sharing field props through context

export const useForm = (fields: IFields, handlers: IHandlers) => {
  // TODO: refactor to use a reducer
  let [isValid, setIsValid] = useState(false)
  let [submitting, setSubmitting] = useState(false)
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
    (name: string, value = values[name], el?: HTMLInputElement) => {
      if (typeof fields[name].validate === 'function') {
        const error = fields[name].validate(value)

        setErrors(s => {
          const updatedErrors = {...s, [name]: error || null}

          setIsValid(
            Object.values(updatedErrors).every(error => error === null)
          )

          return updatedErrors
        })

        if (el) callIfExists(el, 'setCustomValidity', error || '')

        return !error
      } else return true
    },
    [fields, setErrors],
  )

  const validateForm = useCallback(
    () => {
      const isValid = Object.keys(fields).reduce((formIsValid, name) => {
        // run validation on all fields
        const fieldIsValid = validateField(name)

        return formIsValid ? fieldIsValid : false
      }, true)

      setIsValid(isValid)

      return isValid
    },
    [fields, validateField],
  )

  const handleChange = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      const target = e.target as HTMLInputElement
      const {name, value} = target

      if (errors[name] || document.activeElement !== target) {
        validateField(
          name,
          value,
          touched[name] || document.activeElement !== target
            ? target
            : undefined,
        )
      }

      if (!touched[name] && document.activeElement !== target) {
        setTouched(s => ({...s, [name]: true}))
      }

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

      validateField(name, value, target)

      if (fields[name]) callIfExists(fields[name], 'onBlur', e)
    },
    [touched, setTouched, validateField, fields],
  )

  const handleFormSubmitSuccess = useCallback(() => {
    setErrors(s => ({...s, form: null}))
    setSubmitting(false)
  }, [setErrors, setSubmitting])

  const handleFormSubmitError = useCallback((errorMessage: string) => {
    setErrors(s => ({...s, form: errorMessage}))
    setSubmitting(false)
  }, [setErrors])

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      e.preventDefault()

      if (submitting) return

      if (!validateForm()) return

      callIfExists(handlers, 'onSubmit', values, handleFormSubmitSuccess, handleFormSubmitError)
      setSubmitting(true)
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

  // check validity on mount
  useEffect(() => {
    validateForm()
  }, [])

  return {
    values,
    errors,
    touched,
    submitting,
    valid: isValid,
    props: {
      form: {
        ...handlers,
        onSubmit: handleFormSubmit,
      },
      ...fieldProps,
    },
  }
}
