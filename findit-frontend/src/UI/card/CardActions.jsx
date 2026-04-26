/**
 * Card actions — footer area for buttons / action links.
 */
export default function CardActions({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-gray-100 flex items-center gap-3 ${className}`}>
      {children}
    </div>
  )
}
