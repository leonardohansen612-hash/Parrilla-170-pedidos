import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeApp } from 'firebase/app'
import { addDoc, collection, doc, getFirestore, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { ClipboardList, Flame, Smartphone, UserRound, ShoppingCart, Plus, Minus, Send, CheckCircle2, ChefHat, Clock3, UtensilsCrossed, X, Search, RefreshCcw } from 'lucide-react'
import './styles.css'

const PRODUCTS = [
  { id:'pulled', name:'Pulled Pork', price:34.99, category:'Pratos' },
  { id:'tabua', name:'Tábua Texana', price:199, category:'Pratos' },
  { id:'linguica', name:'Linguiça defumada', price:29.99, category:'Pratos' },
  { id:'brisket', name:'Brisket', price:59, category:'Pratos' },
  { id:'sobrecoxa', name:'Sobrecoxa Defumada', price:29.99, category:'Pratos' },
  { id:'parmegianna', name:'Parmegianna', price:49, category:'Pratos' },
  { id:'feijoada', name:'Feijoada', price:69, category:'Pratos' },
  { id:'burguer170', name:'Burguer 170', price:39, category:'Lanches' },
  { id:'texchicken', name:'Tex Chicken', price:49, category:'Lanches' },
  { id:'texdog', name:'Tex Dog', price:29.99, category:'Lanches' },
  { id:'coleslawpork', name:'Coleslaw Pork', price:49, category:'Lanches' },
  { id:'combo', name:'Feijão, arroz e farofa', price:14.99, category:'Adicionais' },
  { id:'mac', name:'Mac & Cheese • substituição', price:4, category:'Adicionais' },
  { id:'farofa', name:'Farofa', price:2, category:'Adicionais' },
  { id:'milho', name:'Milho salteado', price:3, category:'Adicionais' },
  { id:'picles', name:'Picles', price:3, category:'Adicionais' },
  { id:'chimi', name:'Chimichurri', price:2, category:'Adicionais' },
  { id:'american', name:'American Cheese', price:4, category:'Adicionais' },
  { id:'coleslawlanche', name:'Coleslaw Lanche', price:4, category:'Adicionais' },
  { id:'maionese', name:'Maionese Artesanal', price:3, category:'Adicionais' },
  { id:'bacon', name:'Bacon', price:5, category:'Adicionais' },
  { id:'extra', name:'Hambúrguer Extra', price:14, category:'Adicionais' },
]

const money = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const params = new URLSearchParams(location.search)
const initialMode = params.get('mode') || null
const initialTable = params.get('mesa') || ''

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}
const firebaseEnabled = Object.values(firebaseConfig).every(Boolean)
let db = null
if (firebaseEnabled) db = getFirestore(initializeApp(firebaseConfig))

const demoSeed = [
  { id:'demo1', number:101, table:'07', customer:'Mesa 07', source:'garcom', status:'novo', total:88, createdAt:Date.now()-120000, items:[{name:'Brisket',qty:1,price:59},{name:'Linguiça defumada',qty:1,price:29}], notes:'Brisket ao ponto.' },
  { id:'demo2', number:100, table:'03', customer:'Mesa 03', source:'cliente', status:'preparo', total:54, createdAt:Date.now()-420000, items:[{name:'Burguer 170',qty:1,price:39},{name:'Bacon',qty:1,price:5},{name:'Hambúrguer Extra',qty:1,price:10}], notes:'' },
]

function useOrders(){
  const [orders,setOrders] = useState(()=>{
    const saved = localStorage.getItem('p170_orders')
    return saved ? JSON.parse(saved) : demoSeed
  })
  useEffect(()=>{
    if (!firebaseEnabled) {
      localStorage.setItem('p170_orders', JSON.stringify(orders))
      return
    }
    const q = query(collection(db,'orders'),orderBy('createdAt','desc'))
    return onSnapshot(q, snap => setOrders(snap.docs.map(d=>({id:d.id,...d.data()}))))
  },[])
  const createOrder = async payload => {
    if(firebaseEnabled){
      await addDoc(collection(db,'orders'), {...payload, createdAt:serverTimestamp()})
    } else {
      const nextNumber = Math.max(100,...orders.map(o=>Number(o.number)||0))+1
      setOrders(cur=>[{...payload,id:crypto.randomUUID(),number:nextNumber,createdAt:Date.now()},...cur])
    }
  }
  const changeStatus = async (id,status) => {
    if(firebaseEnabled) await updateDoc(doc(db,'orders',id),{status})
    else setOrders(cur=>cur.map(o=>o.id===id?{...o,status}:o))
  }
  return {orders,createOrder,changeStatus}
}

function Header({mode,onHome}){
  const labels={admin:'Notebook / Caixa',garcom:'Garçom',cliente:'Cliente'}
  return <header className="topbar">
    <button className="brand" onClick={onHome}>
      <img src="/logo-parrilla170.jpeg" alt="Parrilla 170"/>
      <div><strong>Parrilla 170</strong><span>Pedidos • V1</span></div>
    </button>
    {mode && <div className="mode-pill">{labels[mode]}</div>}
  </header>
}

function Home({setMode}){
  return <div className="home-wrap">
    <div className="hero-card">
      <img className="hero-logo" src="/logo-parrilla170.jpeg" alt="Parrilla 170" />
      <h1>Sistema de Pedidos</h1>
      <p>Escolha como deseja acessar.</p>
      <div className="role-grid">
        <button onClick={()=>setMode('admin')} className="role-card"><ClipboardList/><strong>Notebook / Caixa</strong><span>Acompanhar pedidos e alterar status.</span></button>
        <button onClick={()=>setMode('garcom')} className="role-card"><Smartphone/><strong>Garçom</strong><span>Abrir mesa e lançar pedidos rapidamente.</span></button>
        <button onClick={()=>setMode('cliente')} className="role-card"><UserRound/><strong>Cliente</strong><span>Pedido direto pelo QR Code da mesa.</span></button>
      </div>
    </div>
    {!firebaseEnabled && <div className="demo-note"><Flame/> Modo demonstração local ativo. Ao configurar o Firebase, os dispositivos passam a sincronizar em tempo real.</div>}
  </div>
}

function Cart({cart,setCart,notes,setNotes,onSend,table,setTable,customer,setCustomer,mode}){
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0)
  const change=(id,d)=>setCart(cur=>cur.map(i=>i.id===id?{...i,qty:i.qty+d}:i).filter(i=>i.qty>0))
  return <aside className="cart-panel">
    <div className="cart-title"><ShoppingCart/><div><strong>Pedido</strong><span>{cart.reduce((s,i)=>s+i.qty,0)} itens</span></div></div>
    <div className="customer-fields">
      <label>Mesa / Comanda<input value={table} onChange={e=>setTable(e.target.value)} placeholder="Ex.: 12"/></label>
      {mode!=='cliente' && <label>Nome / identificação<input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Opcional"/></label>}
    </div>
    <div className="cart-items">
      {!cart.length && <div className="empty-cart"><UtensilsCrossed/><span>Adicione itens ao pedido</span></div>}
      {cart.map(i=><div className="cart-item" key={i.id}>
        <div className="cart-main"><strong>{i.name}</strong><span>{money(i.price*i.qty)}</span></div>
        <div className="qty"><button onClick={()=>change(i.id,-1)}><Minus/></button><b>{i.qty}</b><button onClick={()=>change(i.id,1)}><Plus/></button></div>
      </div>)}
    </div>
    <label className="notes">Observações<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ex.: sem cebola, carne ao ponto..."/></label>
    <div className="cart-footer"><div><span>Total</span><strong>{money(total)}</strong></div><button className="send-btn" disabled={!cart.length||!table.trim()} onClick={onSend}><Send/>Enviar pedido</button></div>
  </aside>
}

function Ordering({mode,createOrder}){
  const [cat,setCat]=useState('Pratos')
  const [cart,setCart]=useState([])
  const [table,setTable]=useState(initialTable)
  const [customer,setCustomer]=useState('')
  const [notes,setNotes]=useState('')
  const [sent,setSent]=useState(false)
  const cats=['Pratos','Lanches','Adicionais']
  const add=p=>setCart(cur=>{
    const found=cur.find(i=>i.id===p.id)
    return found?cur.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...cur,{...p,qty:1}]
  })
  const submit=async()=>{
    const total=cart.reduce((s,i)=>s+i.price*i.qty,0)
    await createOrder({table,customer:customer||`Mesa ${table}`,source:mode,status:'novo',total,items:cart.map(({id,name,price,qty})=>({id,name,price,qty})),notes})
    setSent(true); setCart([]); setNotes(''); if(mode!=='cliente') setTable('')
  }
  if(sent) return <div className="success-screen"><CheckCircle2/><h2>Pedido enviado!</h2><p>{mode==='cliente'?'Seu pedido já foi enviado para a Parrilla 170.':'Pedido registrado com sucesso.'}</p><button onClick={()=>setSent(false)}>Novo pedido</button></div>
  return <div className="ordering-layout">
    <main className="menu-area">
      <div className="menu-head"><div><h2>{mode==='cliente'?'Faça seu pedido':'Novo pedido'}</h2><p>Toque nos produtos para adicionar.</p></div></div>
      <div className="categories">{cats.map(c=><button className={cat===c?'active':''} onClick={()=>setCat(c)} key={c}>{c}</button>)}</div>
      <div className="product-grid">{PRODUCTS.filter(p=>p.category===cat).map(p=><button className="product-card" key={p.id} onClick={()=>add(p)}><div className="product-icon">{p.category==='Adicionais'?<Plus/>:<Flame/>}</div><strong>{p.name}</strong><span>{money(p.price)}</span><small>Adicionar +</small></button>)}</div>
    </main>
    <Cart {...{cart,setCart,notes,setNotes,table,setTable,customer,setCustomer,onSend:submit,mode}} />
  </div>
}

const STATUS = {
  novo:{label:'Novos',icon:Clock3},
  preparo:{label:'Em preparo',icon:ChefHat},
  pronto:{label:'Prontos',icon:CheckCircle2},
  entregue:{label:'Entregues',icon:UtensilsCrossed},
}
function stamp(v){
  if(!v) return '--:--'
  const d=v?.toDate?v.toDate():new Date(v)
  return d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
}
function Admin({orders,changeStatus,createOrder,setMode}){
  const [search,setSearch]=useState('')
  const [quick,setQuick]=useState(false)
  const filtered=useMemo(()=>orders.filter(o=>`${o.number} ${o.table} ${o.customer}`.toLowerCase().includes(search.toLowerCase())),[orders,search])
  const next={novo:'preparo',preparo:'pronto',pronto:'entregue'}
  return <div className="admin-wrap">
    <div className="admin-actions"><div className="search"><Search/><input placeholder="Buscar pedido, mesa ou cliente" value={search} onChange={e=>setSearch(e.target.value)}/></div><button className="primary" onClick={()=>setQuick(true)}><Plus/>Novo pedido</button></div>
    {!firebaseEnabled && <div className="demo-strip"><RefreshCcw/> Demonstração local • configure o Firebase para sincronizar notebook, garçom e cliente.</div>}
    <div className="kanban">{Object.entries(STATUS).map(([key,meta])=>{const Icon=meta.icon;const list=filtered.filter(o=>o.status===key);return <section className="column" key={key}><div className="column-head"><div><Icon/><strong>{meta.label}</strong></div><span>{list.length}</span></div><div className="cards">{list.map(o=><article className="order-card" key={o.id}><div className="order-top"><div><b>#{o.number||'—'}</b><span>Mesa {o.table}</span></div><time>{stamp(o.createdAt)}</time></div><div className="source">{o.source==='cliente'?'Pedido do cliente':'Lançado pela equipe'}</div><div className="order-items">{o.items?.map((i,idx)=><div key={idx}><span>{i.qty}× {i.name}</span><b>{money(i.qty*i.price)}</b></div>)}</div>{o.notes&&<div className="order-notes">“{o.notes}”</div>}<div className="order-total"><span>Total</span><strong>{money(Number(o.total)||0)}</strong></div>{key!=='entregue'&&<button className="advance" onClick={()=>changeStatus(o.id,next[key])}>{key==='novo'?'Iniciar preparo':key==='preparo'?'Marcar como pronto':'Entregar pedido'} →</button>}</article>)}{!list.length&&<div className="empty-column">Nenhum pedido</div>}</div></section>})}</div>
    {quick&&<div className="modal"><div className="modal-box"><button className="close" onClick={()=>setQuick(false)}><X/></button><Ordering mode="garcom" createOrder={async p=>{await createOrder(p);setQuick(false)}}/></div></div>}
  </div>
}

function App(){
  const [mode,setMode]=useState(initialMode)
  const {orders,createOrder,changeStatus}=useOrders()
  return <><Header mode={mode} onHome={()=>{history.pushState({},'',location.pathname);setMode(null)}}/>{!mode?<Home setMode={m=>{setMode(m);history.replaceState({},'',`?mode=${m}${m==='cliente'&&initialTable?`&mesa=${initialTable}`:''}`)}}/>:mode==='admin'?<Admin {...{orders,changeStatus,createOrder,setMode}}/>:<Ordering mode={mode} createOrder={createOrder}/>}</>
}

createRoot(document.getElementById('root')).render(<App/>)
