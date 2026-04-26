/**
 * Standard content wrapper for inner pages.
 * Provides max-width, horizontal padding, and vertical spacing
 * that the old Layout used to inject automatically.
 */
export default function PageWrapper({ children, className = '' }) {
  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {children}
    </div>
  )
}
