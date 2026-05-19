import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router'
import TosGate from './components/TosGate'
import AdminRoute from './components/AdminRoute'
import ErrorBoundary from './components/ErrorBoundary'
import GeoBlock from '@/components/GeoBlock'
import EnhancedAgeGate from '@/components/EnhancedAgeGate'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AIAssistant from './components/AIAssistant'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import { useBehaviorTracking } from './hooks/useBehaviorTracking'

const Prints3D = lazy(() => import('./pages/Prints3D'))
const TradingCards = lazy(() => import('./pages/TradingCards'))
const Contact = lazy(() => import('./pages/Contact'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Tokushoho = lazy(() => import('./pages/Tokushoho'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const Social = lazy(() => import('./pages/Social'))
const ForumPost = lazy(() => import('./pages/ForumPost'))
const Profile = lazy(() => import('./pages/Profile'))
const Friends = lazy(() => import('./pages/Friends'))
const Marketplace = lazy(() => import('./pages/Marketplace'))
const Donations = lazy(() => import('./pages/Donations'))
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'))
const Admin = lazy(() => import('./pages/Admin'))
const SiteDoctor = lazy(() => import('./pages/SiteDoctor'))
const SwarmDashboard = lazy(() => import('./pages/SwarmDashboard'))
const CreateListing = lazy(() => import('./pages/CreateListing'))
const ListingDetail = lazy(() => import('./pages/ListingDetail'))
const SellerStripeReturn = lazy(() => import('./pages/SellerStripeReturn'))
const Messages = lazy(() => import('./pages/Messages'))
const Orders = lazy(() => import('./pages/Orders'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))


function AnalyticsTracker() {
  const location = useLocation();
  return <AnalyticsTrackerInner key={location.pathname + location.search} />;
}

function AnalyticsTrackerInner() {
  useBehaviorTracking();
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  )
}

export default function App() {
  return (
    <GeoBlock>
      <EnhancedAgeGate>
        <ErrorBoundary>
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1">
            <AnalyticsTracker />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                
                {/* Marketplace routes */}
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/new" element={<CreateListing />} />
                <Route path="/marketplace/create" element={<CreateListing />} />
                <Route path="/marketplace/:id" element={<ListingDetail />} />
                <Route path="/seller/stripe-return" element={<SellerStripeReturn />} />
                
                {/* Legacy redirects */}
                <Route path="/shop" element={<Navigate to="/marketplace" replace />} />
                <Route path="/sell" element={<Navigate to="/marketplace/new" replace />} />
                <Route path="/start-selling" element={<Navigate to="/marketplace/new" replace />} />
                <Route path="/list-item" element={<Navigate to="/marketplace/new" replace />} />
                <Route path="/auction" element={<Navigate to="/marketplace/new" replace />} />
                <Route path="/start-an-auction" element={<Navigate to="/marketplace/new" replace />} />
                
                {/* Category pages */}
                <Route path="/3d-prints" element={<Prints3D />} />
                <Route path="/prints3d" element={<Navigate to="/3d-prints" replace />} />
                <Route path="/trading-cards" element={<TradingCards />} />
                <Route path="/cards" element={<Navigate to="/trading-cards" replace />} />
                
                {/* Info pages */}
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/legal/tokushoho" element={<Tokushoho />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/donate" element={<Donations />} />
                
                {/* Social / Forum */}
                <Route path="/social" element={<Social />} />
                <Route path="/post/:id" element={<ForumPost />} />
                
                {/* User */}
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/mail" element={<Navigate to="/messages" replace />} />
                
                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Login initialMode="register" />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Admin */}
                <Route path="/admin" element={<TosGate><AdminRoute><Admin /></AdminRoute></TosGate>} />
                <Route path="/admin/analytics" element={<TosGate><AdminRoute><AdminAnalytics /></AdminRoute></TosGate>} />
                <Route path="/admin/site-doctor" element={<TosGate><AdminRoute><SiteDoctor /></AdminRoute></TosGate>} />
                <Route path="/admin/swarm" element={<TosGate><AdminRoute><SwarmDashboard /></AdminRoute></TosGate>} />
                
                {/* Orders */}
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <AIAssistant />
        </div>
        </ErrorBoundary>
      </EnhancedAgeGate>
    </GeoBlock>
  )
}
