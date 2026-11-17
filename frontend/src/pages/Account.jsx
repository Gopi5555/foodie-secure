import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useApp } from '../store.jsx'

export function Profile() {
  const { user, updateUser, logout } = useApp(); const nav = useNavigate()
  const [info, setInfo] = useState(null); const [p, setP] = useState({ name: '', phone: '', address: '' }); const [msg, setMsg] = useState('')
  useEffect(() => { api.profile().then((d) => { setInfo(d); setP({ name: d.name || '', phone: d.phone || '', address: d.address || '' }) }) }, [])
  const save = async () => { try { const d = await api.saveProfile(p); setInfo(d); updateUser({ ...user, name: d.name }); setMsg('Profile updated ✅') } catch (e) { setMsg(e.message) } }
  if (!info) return null
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value })
  return (
    <div className="panel profile">
      <div className="avatar">{info.name[0]?.toUpperCase()}</div>
      <h2>{info.name}</h2><p className="sub">{info.email} <span className="badge">{info.role}</span></p>
      <div className="form">
        <label>Full name<input value={p.name} onChange={set('name')} /></label>
        <label>Phone<input value={p.phone} onChange={set('phone')} /></label>
        <label>Default delivery address<textarea rows="3" value={p.address} onChange={set('address')} /></label>
        {msg && <p className="ok">{msg}</p>}
        <button className="primary" onClick={save}>Save changes</button>
        <button className="ghost" onClick={() => { logout(); nav('/login') }}>Log out</button>
      </div>
    </div>
  )
}

export function Admin() {
  const [rs, setRs] = useState([]); const [foods, setFoods] = useState([]); const [tab, setTab] = useState('restaurants'); const [msg, setMsg] = useState('')
  const [r, setR] = useState({ name: '', cuisine: '', emoji: '🍽️', rating: 4, etaMins: 30 })
  const [m, setM] = useState({ restaurantId: '', name: '', description: '', emoji: '🍽️', price: '', veg: true })
  const load = () => { api.restaurants().then(setRs); api.foods().then(setFoods) }
  useEffect(load, [])
  const act = async (fn, ok) => { try { await fn(); setMsg(ok); load() } catch (e) { setMsg(e.message) } }
  const addR = () => act(async () => { await api.addRestaurant({ ...r, rating: +r.rating, etaMins: +r.etaMins }); setR({ ...r, name: '', cuisine: '' }) }, 'Restaurant added ✅')
  const addF = () => act(async () => { await api.addFood(m.restaurantId, { ...m, price: +m.price }); setM({ ...m, name: '', description: '', price: '' }) }, 'Food item added ✅')
  return (
    <>
      <h2 className="title">Admin dashboard 🛠️</h2>
      <div className="tabs"><button className={tab === 'restaurants' ? 'tab on' : 'tab'} onClick={() => setTab('restaurants')}>Restaurants</button>
        <button className={tab === 'foods' ? 'tab on' : 'tab'} onClick={() => setTab('foods')}>Food items</button></div>
      {msg && <p className="ok">{msg}</p>}
      {tab === 'restaurants' ? (
        <div className="panel"><h3>Add restaurant</h3>
          <div className="row2"><input placeholder="Name" value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} /><input placeholder="Cuisine" value={r.cuisine} onChange={(e) => setR({ ...r, cuisine: e.target.value })} />
            <input placeholder="Emoji" value={r.emoji} onChange={(e) => setR({ ...r, emoji: e.target.value })} /><input type="number" step="0.1" placeholder="Rating" value={r.rating} onChange={(e) => setR({ ...r, rating: e.target.value })} />
            <input type="number" placeholder="ETA (min)" value={r.etaMins} onChange={(e) => setR({ ...r, etaMins: e.target.value })} /></div>
          <button className="primary" disabled={!r.name || !r.cuisine} onClick={addR}>Add restaurant</button>
          <table className="table"><thead><tr><th>Restaurant</th><th>Cuisine</th><th>Rating</th><th /></tr></thead><tbody>
            {rs.map((x) => <tr key={x.id}><td>{x.emoji} {x.name}</td><td>{x.cuisine}</td><td>★ {x.rating}</td>
              <td><button className="danger" onClick={() => confirm('Delete restaurant and its menu?') && act(() => api.deleteRestaurant(x.id), 'Restaurant deleted')}>Delete</button></td></tr>)}</tbody></table></div>
      ) : (
        <div className="panel"><h3>Add food item</h3>
          <div className="row2"><select value={m.restaurantId} onChange={(e) => setM({ ...m, restaurantId: e.target.value })}><option value="">Select restaurant</option>{rs.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
            <input placeholder="Dish name" value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} /><input placeholder="Description" value={m.description} onChange={(e) => setM({ ...m, description: e.target.value })} />
            <input placeholder="Emoji" value={m.emoji} onChange={(e) => setM({ ...m, emoji: e.target.value })} /><input type="number" placeholder="Price ₹" value={m.price} onChange={(e) => setM({ ...m, price: e.target.value })} />
            <label className="check"><input type="checkbox" checked={m.veg} onChange={(e) => setM({ ...m, veg: e.target.checked })} /> Vegetarian</label></div>
          <button className="primary" disabled={!m.restaurantId || !m.name || !m.price} onClick={addF}>Add food item</button>
          <table className="table"><thead><tr><th>Dish</th><th>Restaurant</th><th>Price</th><th /></tr></thead><tbody>
            {foods.map((f) => <tr key={f.id}><td>{f.emoji} {f.name} {f.veg ? '🟢' : '🔴'}</td><td>{rs.find((x) => x.id === f.restaurantId)?.name}</td><td>₹{f.price}</td>
              <td><button className="danger" onClick={() => act(() => api.deleteFood(f.id), 'Food item deleted')}>Delete</button></td></tr>)}</tbody></table></div>
      )}
    </>
  )
}
