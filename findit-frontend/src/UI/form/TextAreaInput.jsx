import FormInputError from './FormInputError'

/**
 * Reusable textarea wired to react-hook-form.
 *
 * @param {string}  label       - visible label text
 * @param {string}  name        - field name (used for id + htmlFor)
 * @param {object}  register    - react-hook-form register object
 * @param {object}  error       - react-hook-form FieldError object
 * @param {string}  placeholder - textarea placeholder
 * @param {number}  rows        - number of visible rows (default: 4)
 */
export default function TextAreaInput({
  label,
  name,
  register,
  error,
  placeholder = '',
  rows = 4,
}) {
  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-secondary mb-1">
          {label}
        </label>
      )}
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        {...register}
        className={`w-full px-4 py-2.5 rounded-lg border text-sm text-secondary placeholder-gray-400
          outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y
          ${error ? 'border-error bg-red-50' : 'border-gray-300 bg-white'}`}
      />
      <FormInputError message={error?.message} />
    </div>
  )
}
