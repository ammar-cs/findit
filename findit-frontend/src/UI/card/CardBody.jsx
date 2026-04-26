/**
 * Card body — main content area with standard padding.
 */
export default function CardBody({ children, className = '' }) {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  )
}
