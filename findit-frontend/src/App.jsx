import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from './store/AuthProvider'
import Layout from './UI/layout/Layout'
import PageWrapper from './UI/layout/PageWrapper'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

// Public pages
import HomePage from './pages/home/HomePage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// Protected pages
import PersonalDashboardPage from './pages/dashboard/PersonalDashboardPage'
import CreateLostItemPage from './pages/items/CreateLostItemPage'
import CreateFoundItemPage from './pages/items/CreateFoundItemPage'
import ItemDetailPage from './pages/items/ItemDetailPage'
import EditItemPage from './pages/items/EditItemPage'
import SearchPage from './pages/search/SearchPage'
import ClaimDetailPage from './pages/claims/ClaimDetailPage'
import ClaimSubmissionPage from './pages/claims/ClaimSubmissionPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import HistoryPage from './pages/history/HistoryPage'
import ClaimHistoryPage from './pages/history/ClaimHistoryPage'
import EvidencePage from './pages/evidence/EvidencePage'
import FinderResponsePage from './pages/finderResponse/FinderResponsePage'

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'
import CategoryManagementPage from './pages/admin/CategoryManagementPage'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Pages that manage their own full-width layout (no PageWrapper) */
const FullWidth = ({ children }) => (
  <Layout>{children}</Layout>
)

/** Pages that need the standard centered content wrapper */
const Padded = ({ children }) => (
  <Layout><PageWrapper>{children}</PageWrapper></Layout>
)

/** Protected + padded */
const Protected = ({ children, adminOnly }) => (
  <Layout>
    <PageWrapper>
      <ProtectedRoute adminOnly={adminOnly}>{children}</ProtectedRoute>
    </PageWrapper>
  </Layout>
)

/** Admin only + padded */
const AdminProtected = ({ children }) => (
  <Layout>
    <PageWrapper>
      <AdminRoute>{children}</AdminRoute>
    </PageWrapper>
  </Layout>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Redirects ─────────────────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* ── Public — full-width (hero gradient etc.) ──────────────── */}
          <Route path="/home"   element={<FullWidth><HomePage /></FullWidth>} />

          {/* ── Public — auth pages (manage own layout) ───────────────── */}
          <Route path="/login"  element={<FullWidth><LoginPage /></FullWidth>} />
          <Route path="/signup" element={<FullWidth><SignupPage /></FullWidth>} />

          {/* ── Protected — padded inner pages ────────────────────────── */}
          <Route path="/dashboard"       element={<Protected><PersonalDashboardPage /></Protected>} />
          <Route path="/items/lost/new"  element={<Protected><CreateLostItemPage /></Protected>} />
          <Route path="/items/found/new" element={<Protected><CreateFoundItemPage /></Protected>} />
          <Route path="/items/:id"       element={<Protected><ItemDetailPage /></Protected>} />
          <Route path="/items/:id/edit"  element={<Protected><EditItemPage /></Protected>} />
          <Route path="/search"          element={<Protected><SearchPage /></Protected>} />
          <Route path="/claims/new"      element={<Protected><ClaimSubmissionPage /></Protected>} />
          <Route path="/claims/:id"      element={<Protected><ClaimDetailPage /></Protected>} />
          <Route path="/notifications"   element={<Protected><NotificationsPage /></Protected>} />
          <Route path="/history"         element={<Protected><HistoryPage /></Protected>} />
          <Route path="/history/claims"  element={<Protected><ClaimHistoryPage /></Protected>} />
          <Route path="/evidence/:claimId" element={<Protected><EvidencePage /></Protected>} />
          <Route path="/finder-responses/:id" element={<Protected><FinderResponsePage /></Protected>} />

          {/* ── Admin — admin only routes ─────────────────────────────── */}
          <Route path="/admin"             element={<AdminProtected><AdminDashboardPage /></AdminProtected>} />
          <Route path="/admin/reports"     element={<AdminProtected><AdminReportsPage /></AdminProtected>} />
          <Route path="/admin/categories"  element={<AdminProtected><CategoryManagementPage /></AdminProtected>} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
