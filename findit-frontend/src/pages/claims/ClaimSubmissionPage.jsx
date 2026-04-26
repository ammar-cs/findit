import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiPaperclip, FiX } from 'react-icons/fi'
import { getItem, submitClaim } from '../../api/index'
import Card from '../../UI/card/Card'
import CardHeader from '../../UI/card/CardHeader'
import CardBody from '../../UI/card/CardBody'
import CardActions from '../../UI/card/CardActions'
import TextAreaInput from '../../UI/form/TextAreaInput'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

// ── Item summary (read-only) ──────────────────────────────────────────────────

function ItemSummary({ item, loading }) {
  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="flex gap-4 animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }
  if (!item) return null

  const location = item.location ?? item.locationFound
  const date = item.dateLost ?? item.dateFound

  return (
    <Card>
      <CardHeader>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Item You Are Claiming</p>
      </CardHeader>
      <CardBody>
        <div className="flex gap-4">
          {item.imageUrl
            ? <img src={item.imageUrl} alt={item.title} className="w-20 h-20 object-cover rounded-lg shrink-0" />
            : <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-400 text-xs">No img</div>
          }
          <div className="space-y-1">
            <p className="font-semibold text-secondary">{item.title}</p>
            {item.category && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-primary">
                {item.category}
              </span>
            )}
            {location && <p className="text-xs text-gray-500">📍 {location}</p>}
            {date && <p className="text-xs text-gray-400">{formatDate(date)}</p>}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ClaimSubmissionPage() {
  const [searchParams] = useSearchParams()
  const itemId = searchParams.get('itemId') ?? ''
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm()

  const [item, setItem] = useState(null)
  const [itemLoading, setItemLoading] = useState(!!itemId)
  const [evidenceFiles, setEvidenceFiles] = useState([])
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch item summary
  useEffect(() => {
    if (!itemId) return
    setItemLoading(true)
    getItem(itemId)
      .then((res) => setItem(res.data))
      .catch(() => setItem(null))
      .finally(() => setItemLoading(false))
  }, [itemId])

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files).filter((f) =>
      ['image/jpeg', 'image/png', 'application/pdf'].includes(f.type)
    )
    setEvidenceFiles((prev) => [...prev, ...selected])
    // Reset input so same file can be re-added after removal
    e.target.value = ''
  }

  const removeFile = (index) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data) => {
    setApiError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('itemId', itemId)
      formData.append('description', data.description)
      formData.append('uniqueDetails', data.uniqueDetails ?? '')
      evidenceFiles.forEach((f) => formData.append('evidence', f))

      await submitClaim(formData)
      navigate('/dashboard', { state: { message: 'Claim submitted successfully!' } })
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Failed to submit claim. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-secondary">Submit a Claim</h1>

      {/* Item summary */}
      <ItemSummary item={item} loading={itemLoading} />

      {/* Claim form */}
      <Card>
        <CardHeader>
          <p className="text-sm text-gray-500">
            Provide evidence that this item belongs to you. Be as specific as possible.
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardBody className="space-y-5">

            {/* Why is this yours */}
            <TextAreaInput
              label="Why is this yours?"
              name="description"
              placeholder="Describe why you believe this item is yours. Include any relevant details…"
              rows={4}
              register={register('description', {
                required: 'This field is required.',
                minLength: { value: 20, message: 'Please provide at least 20 characters.' },
              })}
              error={errors.description}
            />

            {/* Unique identifying details */}
            <TextAreaInput
              label="Unique identifying details"
              name="uniqueDetails"
              placeholder="Serial number, brand marks, personal engravings, scratches, stickers…"
              rows={3}
              register={register('uniqueDetails')}
              error={errors.uniqueDetails}
            />

            {/* Evidence upload */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Evidence files{' '}
                <span className="text-gray-400 font-normal">(JPG, PNG, PDF)</span>
              </label>

              <label
                htmlFor="evidence-upload"
                className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors w-fit"
              >
                <FiPaperclip size={15} className="text-gray-400" />
                <span className="text-sm text-gray-500">Attach files</span>
                <input
                  id="evidence-upload"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={handleFilesChange}
                />
              </label>

              {evidenceFiles.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {evidenceFiles.map((f, i) => (
                    <li key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm text-secondary truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="ml-2 text-gray-400 hover:text-error transition-colors shrink-0"
                        aria-label="Remove file"
                      >
                        <FiX size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* API error */}
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
              {loading ? 'Submitting…' : 'Submit Claim'}
            </button>
          </CardActions>
        </form>
      </Card>
    </div>
  )
}
