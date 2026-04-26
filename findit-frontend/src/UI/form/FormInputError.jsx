/**
 * Displays a validation error message in red beneath a form field.
 * @param {string} message - the error text to display
 */
export default function FormInputError({ message }) {
  if (!message) return null
  return (
    <p className="mt-1 text-xs text-error" role="alert">
      {message}
    </p>
  )
}
