import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useApp } from '../store.jsx'

const inr = (n) => '₹' + Number(n).toFixed(0)
const STEPS = [['PLACED', '📝', 'Order placed'], ['PREPARING', '👨‍🍳', 'Preparing'], ['OUT_FOR_DELIVERY', '🛵', 'On the way'], ['DELIVERED', '🏠', 'Delivered']]

function FoodRow({ m, restaurant, showRestaurant }) {
  const { cart, add } = useApp(); const n = cart.items[m.id]?.qty
  return (
    <div className="mitem">
      <div className="memoji">{m.emoji || '🍽️'}</div>
      <div className="mtext"><b><i className={m.veg ? 'dot veg' : 'dot nonveg'} />{m.name}</b><span>{m.description}</span>
        {showRestaurant && <Link className="rtag" to={`/restaurant/${restaurant.id}`}>{restaurant.emoji} {restaurant.name}</Link>}<strong>{inr(m.price)}</strong></div>
      <button className="add" onClick={() => add(restaurant, m)}>{n ? `Added ×${n}` : 'ADD'}</button>
    </div>
  )
}

export function Home() {
  const { user } = useApp(); const [list, setList] = useState([]); const [cuisine, setCuisine] = useState('All'); const [q, setQ] = useState('')
  useEffect(() => { api.restaurants().then(setList).catch(() => {}) }, [])
  const cuisines = ['All', ...new Set(list.map((r) => r.cuisine))]
  const shown = list.filter((r) => (cuisine === 'All' || r.cuisine === cuisine) && (r.name + r.cuisine).toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <section className="hero"><h2>Hi {user.name.split(' ')[0]}, hungry? 🍽️</h2><p>Pick a restaurant and get your food delivered hot.</p></section>
      <div className="toolbar"><div className="chips">{cuisines.map((c) => <button key={c} className={c === cuisine ? 'chip on' : 'chip'} onClick={() => setCuisine(c)}>{c}</button>)}</div>
        <input className="search" placeholder="Search restaurants…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="grid">{shown.map((r) => (
        <Link key={r.id} to={`/restaurant/${r.id}`} className="rcard"><div className="thumb">{r.emoji}</div>
          <div className="info"><b>{r.name}</b><span>{r.cuisine}</span><div className="meta"><em>★ {r.rating}</em><span>⏱ {r.etaMins} min</span></div></div></Link>))}</div>
    </>
  )
}

export function RestaurantPage() {
  const { id } = useParams(); const [r, setR] = useState(null); const [items, setItems] = useState([]); const [veg, setVeg] = useState(false)
  useEffect(() => { api.restaurant(id).then(setR); api.menu(id).then(setItems) }, [id])
  if (!r) return null
  return (
    <>
      <Link className="link" to="/">← All restaurants</Link>
      <h2 className="title">{r.emoji} {r.name} <small>{r.cuisine} · ★ {r.rating} · ⏱ {r.etaMins} min</small></h2>
      <label className="check"><input type="checkbox" checked={veg} onChange={(e) => setVeg(e.target.checked)} /> Veg only</label>
      <div className="menu">{items.filter((m) => !veg || m.veg).map((m) => <FoodRow key={m.id} m={m} restaurant={r} />)}</div>
    </>
  )
}

export function Foods() {
  const [rs, setRs] = useState([]); const [foods, setFoods] = useState([]); const [q, setQ] = useState(''); const [veg, setVeg] = useState(false); const [rid, setRid] = useState('')
  useEffect(() => { api.restaurants().then(setRs); api.foods().then(setFoods) }, [])
  const shown = foods.filter((m) => (!veg || m.veg) && (!rid || String(m.restaurantId) === rid) && (m.name + m.description).toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <h2 className="title">All dishes 🍽️</h2>
      <div className="toolbar"><input className="search" placeholder="Search dishes…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={rid} onChange={(e) => setRid(e.target.value)}><option value="">All restaurants</option>{rs.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
        <label className="check"><input type="checkbox" checked={veg} onChange={(e) => setVeg(e.target.checked)} /> Veg only</label></div>
      <div className="menu">{shown.map((m) => { const r = rs.find((x) => x.id === m.restaurantId); return r && <FoodRow key={m.id} m={m} restaurant={r} showRestaurant /> })}</div>
    </>
  )
}

export function Orders() {
  const [orders, setOrders] = useState([])
  useEffect(() => { const load = () => api.orders().then(setOrders).catch(() => {}); load(); const t = setInterval(load, 5000); return () => clearInterval(t) }, [])
  return (
    <>
      <h2 className="title">My orders</h2>
      {orders.length === 0 && <p className="empty">No orders yet. Go order something tasty 🍕</p>}
      {orders.map((o) => { const step = STEPS.findIndex((s) => s[0] === o.status); return (
        <div key={o.id} className="order">
          <div className="ohead"><b>#{o.id} · {o.restaurantName}</b><span>{inr(o.total)}</span></div>
          <small>{o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</small>
          <div className="steps">{STEPS.map((s, i) => <div key={s[0]} className={'step' + (i <= step ? ' done' : '') + (i === step ? ' now' : '')}><div className="ic">{s[1]}</div><span>{s[2]}</span></div>)}</div>
        </div>) })}
    </>
  )
}

export function CartDrawer() {
  const { cart, change, clearCart, setCartOpen } = useApp(); const nav = useNavigate()
  const [address, setAddress] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { api.profile().then((p) => setAddress(p.address || '')).catch(() => {}) }, [])
  const lines = Object.values(cart.items); const sub = lines.reduce((s, l) => s + l.item.price * l.qty, 0)
  const place = async () => {
    setBusy(true)
    try { await api.placeOrder({ restaurantId: cart.restaurant.id, address, items: lines.map((l) => ({ menuItemId: l.item.id, qty: l.qty })) }); clearCart(); setCartOpen(false); nav('/orders') }
    catch (e) { alert(e.message) }
    setBusy(false)
  }
  return (
    <div className="overlay" onClick={() => setCartOpen(false)}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <h3>Your cart {cart.restaurant && <small>· {cart.restaurant.name}</small>}</h3>
        {lines.length === 0 ? <p className="empty">Your cart is empty 🛒</p> : <>
          <div>{lines.map((l) => <div key={l.item.id} className="line"><span>{l.item.name}</span>
            <div className="qty"><button onClick={() => change(l.item.id, -1)}>−</button>{l.qty}<button onClick={() => change(l.item.id, 1)}>+</button></div><b>{inr(l.item.price * l.qty)}</b></div>)}</div>
          <div className="bill"><span>Subtotal</span><span>{inr(sub)}</span></div><div className="bill"><span>Delivery fee</span><span>₹30</span></div>
          <div className="bill total"><span>Total</span><span>{inr(sub + 30)}</span></div>
          <textarea rows="2" placeholder="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <button className="primary" disabled={busy || !address} onClick={place}>{busy ? 'Placing…' : 'Place order'}</button></>}
      </aside>
    </div>
  )
}
