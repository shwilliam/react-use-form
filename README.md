# React useForm

> A tiny custom form hook with a small API

## Installation

```shell
npm i @shwilliam/react-use-form
```

## Usage

The following example demonstrates how to use the `useForm` hook in a simple
form component. Refer to the [documentation](https://react-use-form.netlify.app/)
for more details.

```jsx
import React from 'react'
import {useForm} from '@shwilliam/react-use-form'
import {doSomethingFancy} from './fancy-things'

const validateName = value => (!value ? 'Name required' : null)

export const App = () => {
  const {props, values, errors, touched, submitting, valid} = useForm(
    {
      name: {initial: '', validate: validateName},
      favColor: {initial: 'blue', onFocus: doSomethingFancy},
    },
    {
      onSubmit: (values, onSuccess, onError) => {
        doSomethingWithValues(values)
          .then(onSuccess)
          .catch(() => onError('Something went wrong'))
      },
    },
  )

  return (
    <form {...props.form}>
      <label>
        Name:
        <input name="name" type="text" {...props.name} />
      </label>

      <label>
        Favorite color:
        <input name="favColor" type="text" {...props.favColor} />
      </label>

      <button type="submit" disabled={!valid}>
        Submit
      </button>
    </form>
  )
}
```

## Opinions

This hook has several opinions about using/building forms. Some of these align
closely with similar libraries such as [`Formik`](https://jaredpalmer.com/formik/)
or [`react-hook-form`](https://react-hook-form.com/), and some don't. Before you
choose to use this package in your project, ensure you agree with or have a
workaround for the following:

- Field validation runs on blur and only on input if field is invalid
- A field is considered touched when left (on blur)
- Each field can have a single error message at a time
- `onSubmit` should only be triggered if all fields are valid
- `onSubmit` handler passed to hook is called with form values
- All form-related values and handlers are accessed from one hook call per form

## Development

To start local development, simply install npm dependencies (`npm i`) and run
`npm run dev` to watch ts files in `src/`. Built files can be found in `dist/`.

## Demo

To run the demo, ensure you have run the build script and have a `dist` dir in
your project root. Then run `npm run demo:setup` to copy these to the demo.
Navigate to the demo and install its dependencies (`cd demo && npm i`). You can
now start the demo app locally by running `npm start`.
