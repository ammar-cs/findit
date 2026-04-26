import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiUpload, FiX, FiFileText, FiShield, FiInfo, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { getEvidence, uploadEvidence } from '../../api/index'
import { approveClaim, rejectClaim } from '../../api/index'
import useAuth from '../../store/useAuth'
import { getImageUrl } from '../../utils/helpers'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const Spinner = ({ cls = 'h-4 w-4 text-white' }) => (
  <svg className={`animate-spin ${cls}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

const isImage = (f) => {
  const name = f.filename ?? f.name ?? ''
  const mime = f.mimeType ?? f.type ?? ''
  return mime.startsWith('image/') || /\.(jpe?g|png|gif|webp)$/i.test(name)
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-5 animate-pulse max-w-3xl mx-auto">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="h-12 bg-gray-100 rounded-lg" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  )
}

// ── File card ─────────────────────────────────────────────────────────────────

function FileCard({ file, onClick }) {
  const img = isImage(file)
  const url = file.url ?? file.fileUrl ?? null
  const name = file.filename ?? file.name ?? 'File'

  return (
    <div
      className={`rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm ${img && onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
      onClick={img && onClick ? () => onClick(url) : undefined}
    >
      {img && url
        ? <img src={getImageUrl(url)} alt={name} className="w-full h-32 object-cover" />
        : (
          <div className="w-full h-32 bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-400">
            <FiFileText size={28} />
            <span className="text-xs text-center px-2 truncate w-full text-center">{name}</span>
          </div>
        )
      }
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-500 truncate">{formatDate(file.uploadedAt ?? file.createdAt)}</span>
        {!img && url && (
          <a href={url} download className="text-xs text-primary hover:underline shrink-0 ml-1">Download</a>
        )}
      </div>
    </div>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
        aria-label="Close"
      >
        <FiX size={28} />
      </button>
      <img
        src={getImageUrl(src)}
        alt="Full size"
        className="max-w-full max-h-full rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EvidencePage() {
  const { claimId } = useParams()
  const navigate = useNavigate()
  const { id: userId } = useAuth()

  const [evidence, setEvidence] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  // Upload state
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [uploadError, setUploadError] = useState('')

  // Action state
  const [actionLoading, setActionLoading] = useState('')

  const fetchEvidence = useCallback(() => {
    setLoading(true)
    getEvidence(claimId)
      .then((res) => setEvidence(res.data))
      .catch(() => setEvidence(null))
      .finally(() => setLoading(false))
  }, [claimId])

  useEffect(() => { fetchEvidence() }, [fetchEvidence])

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).filter((f) =>
      ['image/jpeg', 'image/png', 'application/pdf'].includes(f.type)
    )
    setFiles((prev) => [...prev, ...selected])
    e.target.value = ''
  }

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const handleUpload = async () => {
    if (!files.length) return
    setUploadError('')
    setUploadSuccess('')
    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach((f) => formData.append('files', f))
      await uploadEvidence(claimId, formData)
      setFiles([])
      setUploadSuccess('Evidence uploaded successfully!')
      fetchEvidence()
    } catch (err) {
      setUploadError(err?.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleClaimAction = async (action, apiFn) => {
    setActionLoading(action)
    try {
      await apiFn(claimId)
      navigate(-1)
    } catch {
      setActionLoading('')
    }
  }

  if (loading) return <Skeleton />

  const files_ = evidence?.files ?? evidence?.evidenceFiles ?? []
  const isClaimant = userId && (evidence?.claimantId === userId || evidence?.claimant?.id === userId)
  const claimStatus = evidence?.claimStatus ?? evidence?.status ?? 'pending'
  const reviewed = evidence?.reviewed ?? false

  // ── CLAIMANT VIEW ──────────────────────────────────────────────────────────
  if (isClaimant) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold text-secondary">Your Evidence</h1>

        {/* Status banner */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
          reviewed
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {reviewed ? <FiCheckCircle size={16} /> : <FiInfo size={16} />}
          <span className="text-sm font-medium">
            {reviewed ? 'Evidence reviewed' : 'Evidence submitted — awaiting review'}
          </span>
        </div>

        {/* Uploaded files */}
        {files_.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-secondary mb-3">Uploaded Files</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {files_.map((f, i) => (
                <FileCard key={i} file={f} />
              ))}
            </div>
          </div>
        )}

        {/* Upload more */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-secondary">Upload More Evidence</h2>

          {/* Dropzone */}
          <label
            htmlFor="ev-upload"
            className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors text-center"
          >
            <FiUpload size={24} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Drag and drop files here or click to upload</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF accepted</p>
            <input
              id="ev-upload"
              type="file"
              multiple
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Selected files */}
          {files.length > 0 && (
            <ul className="space-y-1.5">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm text-secondary truncate">{f.name}</span>
                  <button type="button" onClick={() => removeFile(i)} className="ml-2 text-gray-400 hover:text-error shrink-0">
                    <FiX size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {uploadSuccess && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
              <p className="text-sm text-green-700">{uploadSuccess}</p>
            </div>
          )}
          {uploadError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-error">{uploadError}</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {uploading && <Spinner />}
            {uploading ? 'Uploading…' : 'Upload Evidence'}
          </button>
        </div>

        {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      </div>
    )
  }

  // ── FINDER VIEW ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-secondary">Evidence Review</h1>
        <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-error">
          <FiShield size={11} /> Private &amp; Confidential
        </span>
      </div>

      {/* Confidentiality notice */}
      <div className="flex items-start gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
        <FiInfo size={16} className="text-gray-400 mt-0.5 shrink-0" />
        <p className="text-sm text-gray-600">
          This evidence was submitted by the claimant and is confidential. Review it carefully before making a decision.
        </p>
      </div>

      {/* Evidence gallery */}
      {files_.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-secondary mb-3">Evidence Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {files_.map((f, i) => (
              <FileCard
                key={i}
                file={f}
                onClick={isImage(f) ? (url) => setLightbox(url) : null}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">No evidence files uploaded yet.</p>
      )}

      {/* Image analysis placeholder */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-secondary mb-1">Image Analysis</h2>
        <p className="text-xs text-gray-400 mb-3">Tags and labels detected from uploaded images</p>
        <div className="flex items-center justify-center h-24 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-sm text-gray-400">Azure Vision analysis results will appear here</p>
        </div>
      </div>

      {/* Action buttons */}
      {claimStatus === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => handleClaimAction('approve', approveClaim)}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {actionLoading === 'approve' ? <Spinner /> : <FiCheckCircle size={14} />}
            Approve Claim
          </button>
          <button
            onClick={() => handleClaimAction('reject', rejectClaim)}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-error text-white rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
          >
            {actionLoading === 'reject' ? <Spinner /> : <FiXCircle size={14} />}
            Reject Claim
          </button>
        </div>
      )}

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  )
}
