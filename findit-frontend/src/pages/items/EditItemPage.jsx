import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { FiUpload, FiX } from 'react-icons/fi'
import { getItem, updateItem } from '../../api/index'
import Card from '../../UI/card/Card'
import CardHeader from '../../UI/card/CardHeader'
import CardBody from '../../UI/card/CardBody'
import CardActions from '../../UI/card/CardActions'
import TextInput from '../../UI/form/TextInput'
import TextAreaInput from '../../UI/form/TextAreaInput'
import SelectInput from '../../UI/form/SelectInput'
import FormInputError from '../../UI/form/FormInputError'

const CATEGORY_OPTIONS = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Wallet/Bag', label: 'Wallet/Bag' },
  { value: 'Keys', label: 'Keys' },
  { value: 'Documents', label: 'Documents' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Pets', label: 'Pets' },
  { value: 'Other', label: 'Other' },
]

const Spinner = ({ className = 'h-4 w-4 text-white' }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

export default function EditItemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const [fetchLoading, setFetchLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageError, setImageError] = useState('')
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch item and populate form
  useEffect(() => {
    let cancelled = false
    setFetchLoading(true)
    setFetchError('')

    getItem(id)
      .then((res) => {
        if (cancelled) return
        const item = res.data
        // Normalise datetime to datetime-local format (strip seconds/timezone)
        const toDatetimeLocal = (val) => {
          if (!val) return ''
          return new Date(val).toISOString().slice(0, 16)
        }
        reset({
          title: item.title ?? '',
          category: item.category ?? '',
          description: item.description ?? '',
          dateLost: toDatetimeLocal(item.dateLost ?? item.dateFound),
          location: item.location ?? item.locationFound ?? '',
        })
        if (item.imageUrl) setImagePreview(item.imageUrl)
      })
      .catch(() => {
        if (!cancelled) setFetchError('Failed to load item. Please go back and try again.')
      })
      .finally(() => {
        if (!cancelled) setFetchLoading(false)
      })

    return () => { cancelled = true }
  }, [id, reset])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setImageError('')
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setImageError('Only JPG and PNG files are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be under 5MB.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageError('')
  }

  const onSubmit = async (data) => {
    setApiError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('category', data.category)
      formData.append('description', data.description)
      formData.append('dateLost', data.dateLost)
      formData.append('location', data.location)
      if (imageFile) formData.append('image', imageFile)

      await updateItem(id, formData)
      navigate(`/items/${id}`)
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Failed to update item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Loading skeleton
  if (fetchLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <Card>
          <CardBody className="space-y-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    )
  }

  // ── Fetch error
  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-4">
          <p className="text-sm text-error">{fetchError}</p>
          <button onClick={() => navigate(-1)} className="mt-2 text-sm text-primary hover:underline">
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-secondary mb-6">Edit Item</h1>

      <Card>
        <CardHeader>
          <p className="text-sm text-gray-500">Update the details for this item report.</p>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardBody className="space-y-5">

            <TextInput
              label="Title"
              name="title"
              placeholder="e.g. Black leather wallet"
              register={register('title', { required: 'Title is required.' })}
              error={errors.title}
            />

            <SelectInput
              label="Category"
              name="category"
              placeholder="Select a category"
              options={CATEGORY_OPTIONS}
              register={register('category', { required: 'Category is required.' })}
              error={errors.category}
            />

            <TextAreaInput
              label="Description"
              name="description"
              placeholder="Describe the item in detail…"
              rows={4}
              register={register('description', {
                required: 'Description is required.',
                minLength: { value: 20, message: 'Description must be at least 20 characters.' },
              })}
              error={errors.description}
            />

            <TextInput
              label="Date & Time Lost"
              name="dateLost"
              type="datetime-local"
              register={register('dateLost', { required: 'Date and time is required.' })}
              error={errors.dateLost}
            />

            <TextInput
              label="Last Seen Location"
              name="location"
              placeholder="e.g. Central Park, New York"
              register={register('location', { required: 'Location is required.' })}
              error={errors.location}
            />

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Image <span className="text-gray-400 font-normal">(optional, JPG/PNG, max 5MB)</span>
              </label>
              {!imagePreview ? (
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors"
                >
                  <FiUpload size={20} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Click to upload image</span>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              ) : (
                <div className="relative w-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50 transition-colors"
                    aria-label="Remove image"
                  >
                    <FiX size={16} className="text-error" />
                  </button>
                </div>
              )}
              <FormInputError message={imageError} />
            </div>

            {apiError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-error">{apiError}</p>
              </div>
            )}

          </CardBody>

          <CardActions className="justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-medium text-secondary border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Spinner />}
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </CardActions>
        </form>
      </Card>
    </div>
  )
}
