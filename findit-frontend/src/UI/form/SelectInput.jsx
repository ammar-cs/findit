import FormInputError from './FormInputError'

/**
 * Reusable select dropdown wired to react-hook-form.
 *
 * @param {string}   label    - visible label text
 * @param {string}   name     - field name (used for id + htmlFor)
 * @param {object}   register - react-hook-form register object
 * @param {object}   error    - react-hook-form FieldError object
 * @param {Array<{ value: string, label: string }>} options - select options
 * @param {string}   placeholder - optional empty first option label
 */
export default function SelectInput({
  label,
  name,
  register,
  error,
  options = [],
  placeholder = '',
}) {
  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-secondary mb-1">
          {label}
        </label>
      )}
      <select
        id={name}
        {...register}
        className={`w-full px-4 py-2.5 rounded-lg border text-sm text-secondary
          outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white
          ${error ? 'border-error bg-red-50' : 'border-gray-300'}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FormInputError message={error?.message} />
    </div>
  )
}
