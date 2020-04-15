# React useForm

> A tiny custom form hook with a small API

## Opinions

This hook has several opinions about using/building forms. Some of these align
closely with similar libraries such as `Formik` or `react-hook-form`, and some
don't. Before you choose to use this package in your project, ensure you agree
with or have a workaround for the following:

- Field validation runs on blur and only on input if field is invalid
- A field is considered touched when left (on blur)
- Each field can have a single error message at a time
- `onSubmit` should only be triggered if all fields are valid
- `onSubmit` handler passed to hook is called with form values
- All form-related values and handlers are accessed from one hook call per form
