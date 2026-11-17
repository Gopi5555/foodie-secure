import { createContext, useContext, useState } from 'react'
const Ctx = createContext()
export const useApp = () => useContext(Ctx)
const EMPTY = { restaurant: null, items: {} }
export function AppProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const [cart, setCart] = useState(EMPTY)
  const [cartOpen, setCartOpen] = useState(false)
  const updateUser = (u) => { localStorage.setItem('user', JSON.stringify(u)); setUser(u) }
  const login = (token, u) => { localStorage.setItem('token', token); updateUser(u) }
  const logout = () => { localStorage.clear(); setUser(null); setCart(EMPTY) }
  const add = (r, item) => setCart((c) => {
    const base = c.restaurant && c.restaurant.id !== r.id ? { restaurant: r, items: {} } : { restaurant: r, items: c.items }
    return { ...base, items: { ...base.items, [item.id]: { item, qty: (base.items[item.id]?.qty || 0) + 1 } } }
  })
  const change = (id, d) => setCart((c) => {
    const items = { ...c.items }; const q = items[id].qty + d
    if (q <= 0) delete items[id]; else items[id] = { ...items[id], qty: q }
    return { ...c, items }
  })
  const clearCart = () => setCart(EMPTY)
  return <Ctx.Provider value={{ user, login, logout, updateUser, cart, add, change, clearCart, cartOpen, setCartOpen }}>{children}</Ctx.Provider>
}
