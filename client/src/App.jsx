import React, { useEffect, useMemo, useState } from "react";
const API = "http://localhost:5000/api"; const cash = n => "₹" + Number(n).toLocaleString("en-IN");
const script = () => new Promise(ok => { let s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js"; s.onload = () => ok(true); s.onerror = () => ok(false); document.body.append(s) });
export default function App() {
    const [products, setProducts] = useState([]), [cart, setCart] = useState([]), [search, setSearch] = useState(""), [cat, setCat] = useState("All"), [token, setToken] = useState(localStorage.token || ""), [user, setUser] = useState(JSON.parse(localStorage.user || "null")), [panel, setPanel] = useState(""), [mode, setMode] = useState("login"), [form, setForm] = useState({ name: "", email: "", password: "" }), [msg, setMsg] = useState(""), [orders, setOrders] = useState([]);
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) };
    const refresh = () => fetch(API + "/products").then(r => r.json()).then(setProducts).catch(() => setMsg("Start the backend server first."));
    useEffect(() => { refresh() }, []);
    const cats = ["All", ...new Set(products.map(p => p.category))], shown = useMemo(() => products.filter(p => (cat === "All" || p.category === cat) && p.name.toLowerCase().includes(search.toLowerCase())), [products, cat, search]), total = cart.reduce((s, p) => s + p.price * p.qty, 0), count = cart.reduce((s, p) => s + p.qty, 0);
    const add = p => setCart(old => old.some(x => x._id === p._id) ? old.map(x => x._id === p._id ? { ...x, qty: x.qty + 1 } : x) : [...old, { ...p, qty: 1 }]);
    async function account(e) { e.preventDefault(); try { let r = await fetch(API + "/auth/" + mode, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }), d = await r.json(); if (!r.ok) throw Error(d.message); setToken(d.token); setUser(d.user); localStorage.token = d.token; localStorage.user = JSON.stringify(d.user); setPanel(""); setMsg("Welcome, " + d.user.name) } catch (e) { setMsg(e.message) } }
    async function checkout() {
  if (!user) {
    setPanel("account");
    setMsg("Please log in before checkout.");
    return;
  }

  if (cart.length === 0) {
    setMsg("Your cart is empty.");
    return;
  }

  const payment = window.confirm(
    "ShopEase Demo Payment\n\nClick OK to simulate a successful payment.\nClick Cancel to simulate a cancelled payment.\n\nNo real money will be charged."
  );

  if (!payment) {
    setMsg("Demo payment cancelled.");
    return;
  }

  setCart([]);
  setPanel("success");
  setMsg("Demo payment successful! No real money was charged.");
}
    async function myOrders() { let r = await fetch(API + "/orders/my", { headers }); setOrders(await r.json()); setPanel("orders") }
    return <><div className="top">FREE DELIVERY ON ORDERS ABOVE ₹1,999 · EASY RETURNS</div><header><a className="logo" href="#">S<span>hopEase.</span></a><input className="search" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} /><div><button onClick={() => setPanel("account")}> {user ? user.name : "Account"} </button><button onClick={() => setPanel("cart")}>Cart ({count})</button></div></header>
        <main><section className="hero"><div><small>THE EVERYDAY EDIT</small><h1>Good things.<br /><i>Better living.</i></h1><p>Thoughtful picks for your everyday — from tech to home essentials.</p><button className="dark" onClick={() => document.getElementById("shop").scrollIntoView({ behavior: "smooth" })}>Explore collection ↗</button></div><div className="heroart"><span>CURATED FOR YOU</span><b>✳</b><h2>Find your<br />new favourite.</h2></div></section>
            <div className="perks"><span>✧ Curated quality</span><span>✓ Secure Razorpay checkout</span><span>⌁ Quick delivery</span><span>♡ Easy returns</span></div>
            <section id="shop"><div className="heading"><div><small>OUR COLLECTION</small><h2>Find your <i>everyday.</i></h2></div><span>{shown.length} PRODUCTS</span></div><nav>{cats.map(c => <button className={cat === c ? "active" : ""} onClick={() => setCat(c)} key={c}>{c}</button>)}</nav><div className="grid">{shown.map(p => <article key={p._id}><div className="photo"><img src={p.image} alt={p.name} /><button onClick={() => add(p)}>＋ Add to cart</button></div><small>{p.category}</small><div className="prodname"><b>{p.name}</b><b>{cash(p.price)}</b></div><p>{p.description}</p></article>)}</div>{!shown.length && <p>No matching products.</p>}</section>
            <section className="closing"><small>A BETTER WAY TO SHOP</small><h2>Small upgrades.<br /><i>Big everyday energy.</i></h2></section></main><footer>ShopEase. <span>Student major project demo · Payments secured by Razorpay</span></footer>
        {msg && <div className="notice" onClick={() => setMsg("")}>{msg} ×</div>}
        {panel && <div className="shade" onClick={e => { if (e.target === e.currentTarget) setPanel("") }}><aside><div className="drawerhead"><h2>{panel === "cart" ? "Your cart" : panel === "account" ? "Your account" : panel === "orders" ? "Your orders" : "Order confirmed"}</h2><button onClick={() => setPanel("")}>✕</button></div>
            {panel === "cart" && <><div className="cartlist">{cart.map(p => <div className="cartrow" key={p._id}><img src={p.image} /><div><b>{p.name}</b><p>{cash(p.price)} × {p.qty}</p><button onClick={() => setCart(c => c.filter(x => x._id !== p._id))}>Remove</button></div><div><button onClick={() => setCart(c => c.map(x => x._id === p._id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))}>−</button> {p.qty} <button onClick={() => setCart(c => c.map(x => x._id === p._id ? { ...x, qty: x.qty + 1 } : x))}>＋</button></div></div>)}{!cart.length && <p>Your cart is empty.</p>}</div><div className="cartbottom"><h3>Subtotal <span>{cash(total)}</span></h3><button className="dark full" disabled={!cart.length} onClick={checkout}>Proceed to Razorpay checkout</button><small>Test mode recommended for project demonstrations.</small></div></>}
            {panel === "account" && <div className="account">{user ? <><p>Signed in as {user.email}</p><button className="dark full" onClick={myOrders}>My orders</button><button onClick={() => { localStorage.clear(); setUser(null); setToken(""); setPanel("") }}>Log out</button></> : <><div className="tabs"><button onClick={() => setMode("login")}>Login</button><button onClick={() => setMode("register")}>Register</button></div><form onSubmit={account}>{mode === "register" && <label>Name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>}<label>Email<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Password<input required minLength="6" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label><button className="dark full">{mode === "login" ? "Login" : "Create account"}</button></form></>}</div>}
            {panel === "orders" && <div>{orders.map(o => <div className="orderrow" key={o._id}>Order {o._id.slice(-7)} · {cash(o.amount)} · {o.status}</div>)}{!orders.length && <p>No orders yet.</p>}</div>}
            {panel === "success" && <div className="success"><div>✓</div><h2>Thank you!</h2><p>Your payment was verified and your order is confirmed.</p><button className="dark full" onClick={() => setPanel("")}>Continue shopping</button></div>}</aside></div>}</>
}
