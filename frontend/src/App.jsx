import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { initTelegramWebApp } from './utils/telegram'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  useEffect(() => {
    // Инициализация Telegram WebApp
    initTelegramWebApp();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header />
        
        <main className="container mx-auto px-4 py-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        
        <BottomNav />
      </div>
    </Router>
  )
}

export default App
