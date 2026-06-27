import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Layout } from '@/components/Layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const AuthPage = lazy(() => import('@/pages/AuthPage').then(m => ({ default: m.AuthPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const DrawsPage = lazy(() => import('@/pages/DrawsPage').then(m => ({ default: m.DrawsPage })))
const DrawDetailPage = lazy(() => import('@/pages/DrawDetailPage').then(m => ({ default: m.DrawDetailPage })))
const BuyTicketPage = lazy(() => import('@/pages/BuyTicketPage').then(m => ({ default: m.BuyTicketPage })))
const MyTicketsPage = lazy(() => import('@/pages/MyTicketsPage').then(m => ({ default: m.MyTicketsPage })))
const WalletPage = lazy(() => import('@/pages/WalletPage').then(m => ({ default: m.WalletPage })))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return <Layout>{children}</Layout>
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/auth"
            element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
          />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/draws" element={<ProtectedRoute><DrawsPage /></ProtectedRoute>} />
          <Route path="/draws/:id" element={<ProtectedRoute><DrawDetailPage /></ProtectedRoute>} />
          <Route path="/draws/:id/buy" element={<ProtectedRoute><BuyTicketPage /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-center space-y-4">
                <h1 className="text-6xl font-black text-gold">404</h1>
                <p className="text-muted-foreground">Page not found</p>
                <a href="/" className="inline-block px-6 py-2 bg-gold text-background rounded-xl font-medium hover:bg-gold/90 transition-colors">
                  Go Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
