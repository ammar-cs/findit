import FormInputError from './FormInputError'

/**
 * Reusable text input wired to react-hook-form.
 *
 * @param {string}   label       - visible label text
 * @param {string}   name        - field name (used for id + htmlFor)
 * @param {string}   type        - input type (default: "text")
 * @param {object}   register    - react-hook-form register object ({ ref, name, onChange, onBlur })
 * @param {object}   error       - react-hook-form FieldError object
 * @param {string}   placeholder - input placeholder
 */
export default function TextInput({
  label,
  name,
  type = 'text',
  register,
  error,
  placeholder = '',
}) {
  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-secondary mb-1">
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register}
        className={`w-full px-4 py-2.5 rounded-lg border text-sm text-secondary placeholder-gray-400
          outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary
          ${error ? 'border-error bg-red-50' : 'border-gray-300 bg-white'}`}
      />
      <FormInputError message={error?.message} />
    </div>
  )
}
