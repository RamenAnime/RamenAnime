import { Routes, Route } from 'react-router'
import GeoBlock from '@/components/GeoBlock'
import EnhancedAgeGate from '@/components/EnhancedAgeGate'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Prints3D from './pages/Prints3D'
import TradingCards from './pages/TradingCards'
import Contact from './pages/Contact'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Social from './pages/Social'
import ForumPost from './pages/ForumPost'
import Profile from './pages/Profile'
import Friends from './pages/Friends'
import Marketplace from './pages/Marketplace'
import Donations from './pages/Donations'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <GeoBlock>
      <EnhancedAgeGate>
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1">
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </EnhancedAgeGate>
    </GeoBlock>
  )
}
