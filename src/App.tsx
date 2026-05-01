import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router'
import GeoBlock from '@/components/GeoBlock'
import EnhancedAgeGate from '@/components/EnhancedAgeGate'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

const Shop = lazy(() => import('./pages/Shop'))
const Prints3D = lazy(() => import('./pages/Prints3D'))
const TradingCards = lazy(() => import('./pages/TradingCards'))
const Contact = lazy(() => import('./pages/Contact'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Social = lazy(() => import('./pages/Social'))
const ForumPost = lazy(() => import('./pages/ForumPost'))
const Profile = lazy(() => import('./pages/Profile'))
const Friends = lazy(() => import('./pages/Friends'))
const Marketplace = lazy(() => import('./pages/Marketplace'))
const Donations = lazy(() => import('./pages/Donations'))
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Admin = lazy(() => import('./pages/Admin'))

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
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/3d-prints" element={<Prints3D />} />
                <Route path="/trading-cards" element={<TradingCards />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/donate" element={<Donations />} />
                <Route path="/social" element={<Social />} />
                <Route path="/post/:id" element={<ForumPost />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </EnhancedAgeGate>
    </GeoBlock>
  )
}
