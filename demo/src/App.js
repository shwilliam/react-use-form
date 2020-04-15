import React from 'react'
import useForm from './react-use-form'

const validateName = value => {
  if (!value) {
    return 'Name required'
  } else if (value.length < 5) {
    return 'Name too short'
  }
}

const validateAge = value => {
  if (!value) {
    return 'Age required'
  } else if (value < 18) {
    return 'Must be at least 18'
  }
}

export const App = () => {
  const {props, values, errors, touched} = useForm(
    {
      name: {initial: '', validate: validateName},
      age: {
        initial: 18,
        validate: validateAge,
        onBlur: console.log,
        onFocus: console.log,
      },
      nickname: {initial: ''},
    },
    {
      onSubmit: values => console.log('Submitted: ', values),
    },
  )

  return (
    <>
      <form {...props.form}>
        <label>
          Name:
          <input name="name" type="text" {...props.name} />
        </label>

        <label>
          Nickname:
          <input name="nickname" type="text" {...props.nickname} />
        </label>

        <label>
          Age:
          <input name="age" type="number" {...props.age} />
        </label>

        <button type="submit">Submit</button>
      </form>

      <section>
        <hr />
        Touched: {JSON.stringify(touched)}
        <hr />
        Values: {JSON.stringify(values)}
        <hr />
        Errors: {JSON.stringify(errors)}
        <hr />
      </section>
    </>
  )
}
