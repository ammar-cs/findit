import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FiUpload, FiX, FiAlertCircle, FiSearch, FiInfo, FiCheckCircle } from 'react-icons/fi'
import { createLostItem, createFoundItem } from '../../api/index'
import FormInputError from '../../UI/form/FormInputError'
import SpeedDial from '../../UI/SpeedDial'
import MapPicker from '../../components/MapPicker'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select a category' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Wallet/Bag', label: 'Wallet/Bag' },
  { value: 'Keys', label: 'Keys' },
  { value: 'Documents', label: 'Documents' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Pets', label: 'Pets' },
  { value: 'Other', label: 'Other' },
]

const gradientGreen = {
  background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
}

const gradientOrange = {
  background: 'linear-gradient(90deg, #f97316 0%, #ec4899 100%)',
}

const gradientPurple = {
  background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #f97316 100%)',
}

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

const inputCls = (hasError) =>
  `w-full px-3 py-2 rounded-lg border text-xs text-gray-700 placeholder-gray-300
   outline-none transition focus:ring-2 focus:ring-purple-200 focus:border-purple-400
   ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`

// ── Shared Report Item form ───────────────────────────────────────────────────

export default function ReportItemPage({ defaultType = 'lost' }) {
  // ── All existing logic preserved ─────────────────────────────────────────
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const [itemType, setItemType] = useState(defaultType)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageError, setImageError] = useState('')
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedCoordinates, setSelectedCoordinates] = useState(null)

  const description = watch('description', '')

  // Pick up image captured via SpeedDial camera button
  useEffect(() => {
    const capturedUrl  = sessionStorage.getItem('capturedImageUrl')
    const capturedName = sessionStorage.getItem('capturedImageName')
    if (capturedUrl && capturedName) {
      setImagePreview(capturedUrl)
      // Convert object URL back to a File-like blob for FormData
      fetch(capturedUrl)
        .then((r) => r.blob())
        .then((blob) => {
          const file = new File([blob], capturedName, { type: blob.type })
          setImageFile(file)
        })
        .catch(() => {})
      sessionStorage.removeItem('capturedImageUrl')
      sessionStorage.removeItem('capturedImageName')
    }
  }, [])

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

  const handleLocationChange = (locationData) => {
    setSelectedCoordinates(locationData)
  }

  const onSubmit = async (data) => {
    setApiError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('type', itemType)
      formData.append('category', data.category)
      formData.append('description', data.description)
      // Backend validator expects shared keys for both lost/found submissions.
      formData.append('date', data.date)
      
      // Use coordinates and address from map picker
      if (selectedCoordinates) {
        formData.append('location', selectedCoordinates.address || 'Unknown location')
        formData.append('coordinates', JSON.stringify({
          lat: selectedCoordinates.lat,
          lng: selectedCoordinates.lng
        }))
      } else {
        // Fallback to text input if no coordinates selected
        formData.append('location', data.location)
      }
      
      if (imageFile) formData.append('image', imageFile)

      if (itemType === 'lost') {
        await createLostItem(formData)
        navigate('/dashboard', { state: { message: 'Lost item reported successfully!' } })
      } else {
        await createFoundItem(formData)
        navigate('/dashboard', { state: { message: 'Found item reported successfully!' } })
      }
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const isLost  = itemType === 'lost'
  const isFound = itemType === 'found'

  return (
    <div className="bg-gray-50 min-h-screen pb-16">

      {/* ── Page header ── */}
      <div className="text-center pt-8 pb-6 px-4">
        <h1 className="text-2xl font-bold text-gray-800">Report an Item</h1>
        <p className="text-xs text-gray-400 mt-1">
          Help reunite lost items with their owners or find your lost belongings.
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4 space-y-4">

        {/* ── Type selector cards ── */}
        <div className="grid grid-cols-2 gap-3">

          {/* Lost card */}
          <button
            type="button"
            onClick={() => setItemType('lost')}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              isLost
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
              isLost ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <FiAlertCircle size={16} className={isLost ? 'text-red-500' : 'text-gray-400'} />
            </div>
            <p className={`text-xs font-bold ${isLost ? 'text-red-600' : 'text-gray-500'}`}>
              I Lost Something
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
              Report an item that you lost and we will help someone find it or return it to you.
            </p>
          </button>

          {/* Found card */}
          <button
            type="button"
            onClick={() => setItemType('found')}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              isFound
                ? 'border-green-400 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
              isFound ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <FiSearch size={16} className={isFound ? 'text-green-500' : 'text-gray-400'} />
            </div>
            <p className={`text-xs font-bold ${isFound ? 'text-green-600' : 'text-gray-500'}`}>
              I Found Something
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
              Report an item that you found so the owner can be found and the item returned.
            </p>
          </button>
        </div>

        {/* ── Form card ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Card header */}
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-800">
              {isLost ? 'Lost Item Details' : 'Found Item Details'}
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Fill in all the required information below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="px-5 py-4 space-y-4">

              {/* Item Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Item Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder={isLost
                    ? 'e.g. Black Leather Wallet, iPhone 13 Pro...'
                    : 'e.g. Black Leather Wallet, iPhone 13 Pro...'}
                  {...register('title', { required: 'Item name is required.' })}
                  className={inputCls(errors.title)}
                />
                <FormInputError message={errors.title?.message} />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Category <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register('category', { required: 'Category is required.' })}
                    className={`${inputCls(errors.category)} appearance-none pr-8`}
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value} disabled={o.value === ''}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                </div>
                <FormInputError message={errors.category?.message} />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide a detailed description including color, brand, size, and any unique features or markings..."
                  {...register('description', {
                    required: 'Description is required.',
                    minLength: { value: 20, message: 'Description must be at least 20 characters.' },
                  })}
                  className={`${inputCls(errors.description)} resize-none`}
                />
                <div className="flex items-center justify-between mt-0.5">
                  <FormInputError message={errors.description?.message} />
                  <span className="text-[10px] text-gray-300 ml-auto">
                    {description?.length ?? 0} characters (min 20)
                  </span>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {isLost ? 'Date & Time Lost' : 'Date & Time Found'}{' '}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...register('date', { required: 'Date is required.' })}
                  className={inputCls(errors.date)}
                />
                <FormInputError message={errors.date?.message} />
              </div>

              {/* Location Map Picker */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Location <span className="text-red-400">*</span>
                </label>
                <MapPicker onLocationChange={handleLocationChange} />
                {!selectedCoordinates && (
                  <input
                    type="hidden"
                    {...register('location', { required: 'Please select a location on the map.' })}
                    className={inputCls(errors.location)}
                  />
                )}
                <FormInputError message={errors.location?.message} />
              </div>

              {/* Item Photo */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Item Photo <span className="text-gray-300 font-normal">*</span>
                </label>

                {!imagePreview ? (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <FiUpload size={18} className="text-gray-300 mb-1.5" />
                    <span className="text-xs text-gray-400">Click to upload image</span>
                    <span className="text-[10px] text-gray-300 mt-0.5">JPG or PNG, max 5MB</span>
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
                      className="w-full max-h-40 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50 transition-colors"
                      aria-label="Remove image"
                    >
                      <FiX size={14} className="text-red-400" />
                    </button>
                  </div>
                )}
                <FormInputError message={imageError} />
              </div>

              
              {/* API error */}
              {apiError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                  <p className="text-xs text-red-600">{apiError}</p>
                </div>
              )}

              {/* Submit button — green for found, orange-pink for lost */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
                style={isFound ? gradientGreen : gradientOrange}
              >
                {loading && <Spinner />}
                {loading
                  ? 'Submitting…'
                  : isLost ? 'Submit Lost Item Report' : 'Submit Found Item Report'
                }
              </button>
            </div>
          </form>

          {/* Important Information */}
          <div className="mx-5 mb-4 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FiInfo size={12} className="text-blue-500 shrink-0" />
              <p className="text-[10px] font-semibold text-blue-700">Important Information</p>
            </div>
            <ul className="space-y-0.5 text-[10px] text-blue-600">
              <li>• All reports are reviewed by our admin team before being published.</li>
              <li>• Providing accurate details increases the chance of recovery.</li>
              <li>• Do not share sensitive personal information in the description.</li>
              <li>• You will be notified when someone responds to your report.</li>
              <li>• Once submitted, you can monitor the status in your dashboard.</li>
            </ul>
          </div>

          {/* Quick Tip */}
          <div className="mx-5 mb-5 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <FiCheckCircle size={12} className="text-amber-500 shrink-0" />
              <p className="text-[10px] font-semibold text-amber-700">Quick Tip</p>
            </div>
            <p className="text-[10px] text-amber-600 leading-relaxed">
              Items with photos are 3x more likely to be recovered. Use the{' '}
              <span className="font-medium">Add Photo</span> button to upload an image of your item or a similar one from the internet.
            </p>
          </div>

        </div>
      </div>

      {/* Floating Speed Dial */}
      <SpeedDial isAuthenticated={true} />

    </div>
  )
}
