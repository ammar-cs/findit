/**
 * Base card wrapper with white background, rounded corners, and shadow.
 */
export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {children}
    </div>
  )
}
