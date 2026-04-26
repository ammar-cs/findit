import Navbar from '../navbar/Navbar'

/**
 * Layout wraps every page with the sticky Navbar.
 * Pages are responsible for their own width constraints and padding
 * so full-bleed sections (hero gradients, footers) can go edge-to-edge.
 */
export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}
