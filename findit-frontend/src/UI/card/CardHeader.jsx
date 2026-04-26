/**
 * Card header — typically holds a title and optional subtitle.
 */
export default function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  )
}
