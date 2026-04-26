import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiX, FiCamera } from 'react-icons/fi'

const gradientPurple = {
  background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #f97316 100%)',
}
const gradientGreen  = { background: '#22c55e' }
const gradientOrange = { background: 'linear-gradient(135deg, #f97316, #ec4899)' }

/**
 * Speed-dial FAB that expands into:
 *   🟢  Camera — opens device camera to capture item photo,
 *               then navigates to /items/lost/new with the captured image
 *   🟠  Report — navigates to /items/lost/new
 *   ✕   Close  — collapses the menu
 *
 * Clicking the main "+" button toggles the menu open/closed.
 * Clicking outside collapses it automatically.
 */
export default function SpeedDial({ isAuthenticated = true }) {
  const [open, setOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const containerRef = useRef(null)
  const videoRef     = useRef(null)
  const streamRef    = useRef(null)
  const [showCamera, setShowCamera] = useState(false)
  const navigate = useNavigate()

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Stop camera stream on unmount
  useEffect(() => {
    return () => stopStream()
  }, [])

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }

  const handleCameraClick = async () => {
    setOpen(false)
    setCameraError('')

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Use file input with capture="environment" as the most compatible approach
    // This opens the native camera on mobile and a file picker on desktop
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'   // rear camera on mobile
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      // Store the captured file in sessionStorage as a flag,
      // then navigate to the report page — the page will pick it up
      const url = URL.createObjectURL(file)
      sessionStorage.setItem('capturedImageUrl', url)
      sessionStorage.setItem('capturedImageName', file.name)
      navigate('/items/lost/new')
    }
    input.click()
  }

  const handleReportClick = () => {
    setOpen(false)
    navigate(isAuthenticated ? '/items/lost/new' : '/login')
  }

  return (
    <>
      {/* Camera error toast */}
      {cameraError && (
        <div className="fixed bottom-24 right-6 bg-red-600 text-white text-xs px-4 py-2 rounded-lg shadow-lg z-50 max-w-xs">
          {cameraError}
          <button onClick={() => setCameraError('')} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* Speed dial container */}
      <div ref={containerRef} className="fixed bottom-6 right-6 flex flex-col items-center gap-2 z-50">

        {/* Sub-actions — visible when open */}
        {open && (
          <div className="flex flex-col items-center gap-2 mb-1">

            {/* Camera button (green) */}
            <div className="relative group">
              <button
                onClick={handleCameraClick}
                className="w-11 h-11 rounded-full text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-all"
                style={gradientGreen}
                aria-label="Take a photo of the item"
              >
                <FiCamera size={18} />
              </button>
              {/* Tooltip */}
              <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Take Photo
              </span>
            </div>

            {/* Report button (orange-pink) */}
            <div className="relative group">
              <button
                onClick={handleReportClick}
                className="w-11 h-11 rounded-full text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-all"
                style={gradientOrange}
                aria-label="Report an item"
              >
                <FiPlus size={18} />
              </button>
              <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Report Item
              </span>
            </div>

          </div>
        )}

        {/* Main toggle button */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-12 h-12 rounded-full text-white shadow-xl flex items-center justify-center transition-all hover:opacity-90"
          style={open ? { background: '#374151' } : gradientPurple}
          aria-label={open ? 'Close menu' : 'Open quick actions'}
          aria-expanded={open}
        >
          {open
            ? <FiX size={20} />
            : <FiPlus size={22} />
          }
        </button>

      </div>
    </>
  )
}
