import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import GeoBlock from '@/components/GeoBlock'
import EnhancedAgeGate from '@/components/EnhancedAgeGate'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { LoadingState } from '@/shared/components/LoadingState'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'

const Prints3D = lazy(() => import('@/pages/Prints3D'))
const TradingCards = lazy(() => import('@/pages/TradingCards'))
const Contact = lazy(() => import('@/pages/Contact'))
const Terms = lazy(() => import('@/pages/Terms'))
const Privacy = lazy(() => import('@/pages/Privacy'))
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail'))
const Social = lazy(() => import('@/pages/Social'))
const ForumPost = lazy(() => import('@/pages/ForumPost'))
const Profile = lazy(() => import('@/pages/Profile'))
const Friends = lazy(() => import('@/pages/Friends'))
const Marketplace = lazy(() => import('@/pages/Marketplace'))
const Donations = lazy(() => import('@/pages/Donations'))
const Login = lazy(() => import('@/pages/Login'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const Admin = lazy(() => import('@/pages/Admin'))
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'))
const CreateListing = lazy(() => import('@/pages/CreateListing'))
const ListingDetail = lazy(() => import('@/pages/ListingDetail'))
const Messages = lazy(() => import('@/pages/Messages'))

export default function App() {
  return (
    <ErrorBoundary>
      <GeoBlock>
        <EnhancedAgeGate>
          <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<LoadingState fullPage />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  
                  {/* Marketplace */}
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/marketplace/new" element={<CreateListing />} />
                  <Route path="/marketplace/:id" element={<ListingDetail />} />
                  
                  {/* Legacy redirects */}
                  <Route path="/shop" element={<Navigate to="/marketplace" replace />} />
                  <Route path="/sell" element={<Navigate to="/marketplace/new" replace />} />
                  <Route path="/start-selling" element={<Navigate to="/marketplace/new" replace />} />
                  <Route path="/list-item" element={<Navigate to="/marketplace/new" replace />} />
                  <Route path="/auction" element={<Navigate to="/marketplace/new" replace />} />
                  <Route path="/start-an-auction" element={<Navigate to="/marketplace/new" replace />} />
                  
                  {/* Categories */}
                  <Route path="/3d-prints" element={<Prints3D />} />
                  <Route path="/trading-cards" element={<TradingCards />} />
                  
                  {/* Info */}
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/donate" element={<Donations />} />
                  
                  {/* Community */}
                  <Route path="/social" element={<Social />} />
                  <Route path="/post/:id" element={<ForumPost />} />
                  
                  {/* User */}
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/mail" element={<Navigate to="/messages" replace />} />
                  
                  {/* Auth */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Admin */}
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/analytics" element={<AdminDashboard />} />
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </EnhancedAgeGate>
      </GeoBlock>
    </ErrorBoundary>
  )
}
