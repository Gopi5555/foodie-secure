import { Routes, Route, NavLink, Navigate, Link } from 'react-router-dom'
import { AppProvider, useApp } from './store.jsx'
import { Login, Register, Forgot } from './pages/Auth.jsx'
import { Home, RestaurantPage, Foods, Orders, CartDrawer } from './pages/Shop.jsx'
import { Profile, Admin } from './pages/Account.jsx'

function Guard({ children, admin }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" replace />
  if (admin && user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}
function Layout({ children }) {
  const { user, cart, cartOpen, setCartOpen } = useApp()
  const count = Object.values(cart.items).reduce((s, l) => s + l.qty, 0)
  const cls = ({ isActive }) => (isActive ? 'tab on' : 'tab')
  return (
    <div className="app">
      <header>
        <Link to="/"><h1>🍔 Foodie</h1></Link>
        <nav>
          <NavLink to="/" end className={cls}>Restaurants</NavLink><NavLink to="/foods" className={cls}>Dishes</NavLink><NavLink to="/orders" className={cls}>Orders</NavLink>
          {user.role === 'ADMIN' && <NavLink to="/admin" className={cls}>Admin</NavLink>}
          <NavLink to="/profile" className={cls}>👤 {user.name.split(' ')[0]}</NavLink>
          <button className="cartbtn" onClick={() => setCartOpen(true)}>🛒 {count > 0 && <i>{count}</i>}</button>
        </nav>
      </header>
      <main>{children}</main>
      {cartOpen && <CartDrawer />}
    </div>
  )
}
export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/forgot" element={<Forgot />} />
        <Route path="/*" element={<Guard><Layout><Routes>
          <Route path="/" element={<Home />} /><Route path="restaurant/:id" element={<RestaurantPage />} /><Route path="foods" element={<Foods />} />
          <Route path="orders" element={<Orders />} /><Route path="profile" element={<Profile />} />
          <Route path="admin" element={<Guard admin><Admin /></Guard>} />
        </Routes></Layout></Guard>} />
      </Routes>
    </AppProvider>
  )
}
