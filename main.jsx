import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeApp } from 'firebase/app'
import { addDoc, collection, doc, getFirestore, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { ClipboardList, Flame, Smartphone, UserRound, ShoppingCart, Plus, Minus, Send, CheckCircle2, ChefHat, Clock3, UtensilsCrossed, X, Search, RefreshCcw, Printer, Settings, ReceiptText, PlugZap } from 'lucide-react'
import './styles.css'

const PRODUCTS = [
  { id:'pulled', name:'Pulled Pork', price:34.99, category:'Pratos', sector:'cozinha' },
  { id:'tabua', name:'Tábua Texana', price:199, category:'Pratos', sector:'cozinha' },
  { id:'linguica', name:'Linguiça defumada', price:29.99, category:'Pratos', sector:'cozinha' },
  { id:'brisket', name:'Brisket', price:59, category:'Pratos', sector:'cozinha' },
  { id:'sobrecoxa', name:'Sobrecoxa Defumada', price:29.99, category:'Pratos', sector:'cozinha' },
  { id:'parmegianna', name:'Parmegianna', price:49, category:'Pratos', sector:'cozinha' },
  { id:'feijoada', name:'Feijoada', price:69, category:'Pratos', sector:'cozinha' },
  { id:'burguer170', name:'Burguer 170', price:39, category:'Lanches', sector:'cozinha' },
  { id:'texchicken', name:'Tex Chicken', price:49, category:'Lanches', sector:'cozinha' },
  { id:'texdog', name:'Tex Dog', price:29.99, category:'Lanches', sector:'cozinha' },
  { id:'coleslawpork', name:'Coleslaw Pork', price:49, category:'Lanches', sector:'cozinha' },
  { id:'combo', name:'Feijão, arroz e farofa', price:14.99, category:'Adicionais', sector:'cozinha' },
  { id:'mac', name:'Mac & Cheese • substituição', price:4, category:'Adicionais', sector:'cozinha' },
  { id:'farofa', name:'Farofa', price:2, category:'Adicionais', sector:'cozinha' },
  { id:'milho', name:'Milho salteado', price:3, category:'Adicionais', sector:'cozinha' },
  { id:'picles', name:'Picles', price:3, category:'Adicionais', sector:'cozinha' },
  { id:'chimi', name:'Chimichurri', price:2, category:'Adicionais', sector:'cozinha' },
  { id:'american', name:'American Cheese', price:4, category:'Adicionais', sector:'cozinha' },
  { id:'coleslawlanche', name:'Coleslaw Lanche', price:4, category:'Adicionais', sector:'cozinha' },
  { id:'maionese', name:'Maionese Artesanal', price:3, category:'Adicionais', sector:'cozinha' },
  { id:'bacon', name:'Bacon', price:5, category:'Adicionais', sector:'cozinha' },
  { id:'extra', name:'Hambúrguer Extra', price:14, category:'Adicionais', sector:'cozinha' },
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
      const nextNumber = Math.max(100,...orders.map(o=>Number(o.number)||0))+1
      await addDoc(collection(db,'orders'), {...payload, number:nextNumber, createdAt:serverTimestamp()})
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
      <div><strong>Parrilla 170</strong><span>Pedidos • V1.5 AUTO PRINT</span></div>
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
    await createOrder({table,customer:customer||`Mesa ${table}`,source:mode,status:'novo',total,items:cart.map(({id,name,price,qty,sector})=>({id,name,price,qty,sector:sector||'cozinha'})),notes})
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

const DEFAULT_PRINT_SETTINGS = {
  cozinha:'', bar:'', caixa:'',
  autoCozinha:true, autoBar:true, autoCaixa:false,
}

function getPrintSettings(){
  try { return {...DEFAULT_PRINT_SETTINGS, ...(JSON.parse(localStorage.getItem('p170_print_settings')||'{}'))} }
  catch { return DEFAULT_PRINT_SETTINGS }
}
function savePrintSettings(v){ localStorage.setItem('p170_print_settings', JSON.stringify(v)) }

let qzSecurityState={configured:false,signed:false,error:''}
let qzSecurityPromise=null

async function setupQzSecurity(){
  if(qzSecurityPromise) return qzSecurityPromise
  qzSecurityPromise=(async()=>{
    const qz=window.qz
    if(!qz) throw new Error('Biblioteca do QZ Tray não carregou.')
    try{
      const certRes=await fetch('/api/qz-certificate',{cache:'no-store'})
      if(!certRes.ok) throw new Error('Certificado QZ ainda não configurado no Vercel')
      const certificate=await certRes.text()
      if(!certificate.includes('BEGIN CERTIFICATE')) throw new Error('Certificado QZ inválido')

      qz.security.setCertificatePromise((resolve)=>resolve(certificate))
      qz.security.setSignatureAlgorithm('SHA512')
      qz.security.setSignaturePromise(toSign=>function(resolve,reject){
        fetch('/api/qz-sign',{
          method:'POST',
          cache:'no-store',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({request:toSign})
        }).then(async r=>{
          const txt=await r.text()
          if(r.ok) resolve(txt)
          else reject(txt||'Falha ao assinar requisição QZ')
        }).catch(reject)
      })
      qzSecurityState={configured:true,signed:true,error:''}
    }catch(e){
      // Mantém compatibilidade com o modo anônimo até as variáveis QZ serem configuradas.
      qzSecurityState={configured:true,signed:false,error:e.message||String(e)}
    }
    return qzSecurityState
  })()
  return qzSecurityPromise
}

async function ensureQz(){
  const qz=window.qz
  if(!qz) throw new Error('Biblioteca do QZ Tray não carregou. Verifique a internet e recarregue a página.')
  await setupQzSecurity()
  if(qz.websocket.isActive()) return true
  await qz.websocket.connect()
  return true
}

function receiptHtml(title, order, items, extra=''){
  const rows=(items||[]).map(i=>`<tr><td>${i.qty}x ${i.name}</td><td style="text-align:right">${money((Number(i.price)||0)*(Number(i.qty)||0))}</td></tr>`).join('')
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;width:270px;margin:0;padding:8px;color:#000;font-size:13px">
    <div style="text-align:center;font-weight:700;font-size:18px">PARRILLA 170</div>
    <div style="text-align:center;font-weight:700;margin:4px 0 10px">${title}</div>
    <div><b>Pedido:</b> #${order.number||'—'} &nbsp; <b>Mesa:</b> ${order.table||'-'}</div>
    <div><b>Cliente:</b> ${order.customer||'-'}</div>
    <div><b>Hora:</b> ${stamp(order.createdAt)}</div>
    <hr/>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    ${order.notes?`<hr/><div><b>OBS:</b> ${order.notes}</div>`:''}
    ${extra}
    <hr/><div style="text-align:center;font-size:11px">Parrilla 170</div>
  </body></html>`
}

async function qzPrintHtml(printerName, html){
  if(!printerName) throw new Error('Selecione uma impressora para este setor.')
  await ensureQz()
  const qz=window.qz
  const config=qz.configs.create(printerName, {copies:1, margins:0})
  return qz.print(config,[{type:'pixel',format:'html',flavor:'plain',data:html}])
}

function browserPrint(html){
  const w=window.open('','_blank','width=420,height=700')
  if(!w) return
  w.document.write(html); w.document.close(); w.focus(); setTimeout(()=>w.print(),250)
}

function orderCreatedMs(order){
  if(order?.createdAt?.toMillis) return order.createdAt.toMillis()
  if(order?.createdAt?.toDate) return order.createdAt.toDate().getTime()
  const n=Number(order?.createdAt)
  if(Number.isFinite(n)) return n
  const d=new Date(order?.createdAt)
  return isNaN(d)?0:d.getTime()
}

function getAutoPrintLedger(){
  try{return JSON.parse(localStorage.getItem('p170_autoprint_ledger')||'{}')||{}}
  catch{return {}}
}
function saveAutoPrintLedger(v){
  const keys=Object.keys(v)
  if(keys.length>500){ keys.slice(0,keys.length-500).forEach(k=>delete v[k]) }
  localStorage.setItem('p170_autoprint_ledger',JSON.stringify(v))
}

async function printOrderBySettings(order,{manual=false}={}){
  const st=getPrintSettings()
  const kitchen=(order.items||[]).filter(i=>(i.sector||'cozinha')==='cozinha')
  const bar=(order.items||[]).filter(i=>i.sector==='bar')
  const jobs=[]
  if(kitchen.length && (manual||st.autoCozinha) && st.cozinha) jobs.push({sector:'cozinha',run:()=>qzPrintHtml(st.cozinha,receiptHtml('COZINHA',order,kitchen))})
  if(bar.length && (manual||st.autoBar) && st.bar) jobs.push({sector:'bar',run:()=>qzPrintHtml(st.bar,receiptHtml('BAR',order,bar))})
  if((manual||st.autoCaixa) && st.caixa) jobs.push({sector:'caixa',run:()=>qzPrintHtml(st.caixa,receiptHtml('CAIXA',order,order.items||[],`<hr/><div style="font-size:17px"><b>TOTAL: ${money(Number(order.total)||0)}</b></div>`))})
  if(!jobs.length && manual){ browserPrint(receiptHtml('PEDIDO',order,order.items||[],`<hr/><div style="font-size:17px"><b>TOTAL: ${money(Number(order.total)||0)}</b></div>`)); return [] }
  const done=[]
  for(const job of jobs){ await job.run(); done.push(job.sector) }
  return done
}

function AutoPrintDaemon({orders}){
  const [tick,setTick]=useState(0)
  const running=useRef(new Set())
  useEffect(()=>{
    if(!localStorage.getItem('p170_autoprint_since')) localStorage.setItem('p170_autoprint_since',String(Date.now()))
    // Pré-conecta o QZ no computador fixo; após confiar/lembrar, fica silencioso.
    const st=getPrintSettings()
    if((st.autoCozinha&&st.cozinha)||(st.autoBar&&st.bar)||(st.autoCaixa&&st.caixa)) ensureQz().catch(()=>{})
    const id=setInterval(()=>setTick(x=>x+1),10000)
    return ()=>clearInterval(id)
  },[])
  useEffect(()=>{
    const since=Number(localStorage.getItem('p170_autoprint_since')||Date.now())
    const ledger=getAutoPrintLedger()
    const st=getPrintSettings()
    const candidates=(orders||[]).filter(o=>o.id && orderCreatedMs(o)>=since-3000 && o.status==='novo')
    candidates.forEach(async order=>{
      if(running.current.has(order.id)) return
      const kitchen=(order.items||[]).some(i=>(i.sector||'cozinha')==='cozinha')
      const bar=(order.items||[]).some(i=>i.sector==='bar')
      const already=ledger[order.id]||{}
      const needKitchen=kitchen&&st.autoCozinha&&st.cozinha&&!already.cozinha
      const needBar=bar&&st.autoBar&&st.bar&&!already.bar
      const needCaixa=st.autoCaixa&&st.caixa&&!already.caixa
      if(!needKitchen&&!needBar&&!needCaixa) return
      running.current.add(order.id)
      try{
        await ensureQz()
        const current=getAutoPrintLedger(); const state=current[order.id]||{}
        if(needKitchen){ await qzPrintHtml(st.cozinha,receiptHtml('COZINHA',order,(order.items||[]).filter(i=>(i.sector||'cozinha')==='cozinha'))); state.cozinha=true; current[order.id]=state; saveAutoPrintLedger(current) }
        if(needBar){ await qzPrintHtml(st.bar,receiptHtml('BAR',order,(order.items||[]).filter(i=>i.sector==='bar'))); state.bar=true; current[order.id]=state; saveAutoPrintLedger(current) }
        if(needCaixa){ await qzPrintHtml(st.caixa,receiptHtml('CAIXA',order,order.items||[],`<hr/><div style="font-size:17px"><b>TOTAL: ${money(Number(order.total)||0)}</b></div>`)); state.caixa=true; current[order.id]=state; saveAutoPrintLedger(current) }
      }catch(e){ console.warn('AutoPrint Parrilla 170:',e) }
      finally{running.current.delete(order.id)}
    })
  },[orders,tick])
  return null
}

function PrintSettingsModal({onClose,onSaved}){
  const [settings,setSettings]=useState(getPrintSettings())
  const [printers,setPrinters]=useState([])
  const [status,setStatus]=useState('Verificando QZ Tray...')
  const load=async()=>{
    try{
      await ensureQz(); const list=await window.qz.printers.find(); setPrinters(Array.isArray(list)?list:[list].filter(Boolean));
      setStatus(qzSecurityState.signed?'QZ Tray conectado • assinatura confiável ativa':'QZ Tray conectado • modo não assinado (configure o certificado no Vercel)')
    }catch(e){ setStatus('QZ Tray não conectado. Abra o QZ Tray e clique em Atualizar.') }
  }
  useEffect(()=>{load()},[])
  const set=(k,v)=>setSettings(cur=>({...cur,[k]:v}))
  const test=async sector=>{
    try{
      await qzPrintHtml(settings[sector], receiptHtml(`TESTE • ${sector.toUpperCase()}`,{number:'TESTE',table:'-',customer:'Configuração',createdAt:Date.now(),notes:''},[{qty:1,name:'Impressão de teste',price:0}]))
      alert(`Teste enviado para ${sector}.`)
    }catch(e){ alert(`Não foi possível imprimir: ${e.message||e}`) }
  }
  const save=()=>{savePrintSettings(settings); if((settings.autoCozinha||settings.autoBar||settings.autoCaixa)&&!localStorage.getItem('p170_autoprint_since')) localStorage.setItem('p170_autoprint_since',String(Date.now())); onSaved?.(settings);onClose()}
  return <div className="modal settings-modal"><div className="settings-box">
    <div className="settings-head"><div><h2><Printer/> Impressoras</h2><p>Configure uma impressora para cada setor neste computador.</p></div><button className="close-inline" onClick={onClose}><X/></button></div>
    <div className="qz-status"><PlugZap/><span>{status}</span><button onClick={load}>Atualizar</button></div>
    {['cozinha','bar','caixa'].map(sector=><div className="printer-row" key={sector}>
      <div><strong>{sector[0].toUpperCase()+sector.slice(1)}</strong><span>{sector==='cozinha'?'Pedidos de alimentos':sector==='bar'?'Itens cadastrados para o bar':'Via completa / fechamento'}</span></div>
      <select value={settings[sector]} onChange={e=>set(sector,e.target.value)}><option value="">Selecione...</option>{printers.map(p=><option key={p} value={p}>{p}</option>)}</select>
      <button className="test-btn" onClick={()=>test(sector)}><Printer/> Testar</button>
    </div>)}
    <div className="auto-box"><strong>Impressão automática ao entrar pedido</strong>
      <label><input type="checkbox" checked={settings.autoCozinha} onChange={e=>set('autoCozinha',e.target.checked)}/> Cozinha</label>
      <label><input type="checkbox" checked={settings.autoBar} onChange={e=>set('autoBar',e.target.checked)}/> Bar</label>
      <label><input type="checkbox" checked={settings.autoCaixa} onChange={e=>set('autoCaixa',e.target.checked)}/> Caixa</label>
    </div>
    <div className="settings-footer"><button onClick={onClose}>Cancelar</button><button className="primary" onClick={save}>Salvar configuração</button></div>
  </div></div>
}

function ClosingModal({orders,onClose}){
  const today=new Date(); const y=today.getFullYear(),m=today.getMonth(),d=today.getDate()
  const todayOrders=orders.filter(o=>{ const dt=o.createdAt?.toDate?o.createdAt.toDate():new Date(o.createdAt); return !isNaN(dt)&&dt.getFullYear()===y&&dt.getMonth()===m&&dt.getDate()===d })
  const total=todayOrders.reduce((s,o)=>s+(Number(o.total)||0),0)
  const qty=todayOrders.reduce((s,o)=>s+(o.items||[]).reduce((a,i)=>a+(Number(i.qty)||0),0),0)
  const products={}; todayOrders.forEach(o=>(o.items||[]).forEach(i=>{const k=i.name; products[k]=(products[k]||0)+(Number(i.qty)||0)}))
  const html=`<!doctype html><html><body style="font-family:Arial,sans-serif;width:270px;margin:0;padding:8px;color:#000;font-size:12px"><div style="text-align:center;font-size:18px;font-weight:700">PARRILLA 170</div><div style="text-align:center;font-weight:700">FECHAMENTO DO DIA</div><div style="text-align:center">${today.toLocaleDateString('pt-BR')}</div><hr/><div><b>Pedidos:</b> ${todayOrders.length}</div><div><b>Itens vendidos:</b> ${qty}</div><div style="font-size:18px;margin-top:5px"><b>Total: ${money(total)}</b></div><hr/><b>ITENS VENDIDOS</b>${Object.entries(products).sort((a,b)=>b[1]-a[1]).map(([n,q])=>`<div style="display:flex;justify-content:space-between"><span>${n}</span><b>${q}</b></div>`).join('')||'<div>Nenhum item.</div>'}<hr/><div>Status: ${todayOrders.filter(o=>o.status==='entregue').length} entregues • ${todayOrders.filter(o=>o.status!=='entregue').length} em aberto</div><div style="text-align:center;margin-top:10px">Emitido ${new Date().toLocaleString('pt-BR')}</div></body></html>`
  const print=async()=>{const st=getPrintSettings();try{await qzPrintHtml(st.caixa,html)}catch(e){browserPrint(html)}}
  return <div className="modal settings-modal"><div className="settings-box closing-box"><div className="settings-head"><div><h2><ReceiptText/> Fechamento do dia</h2><p>{today.toLocaleDateString('pt-BR')}</p></div><button className="close-inline" onClick={onClose}><X/></button></div>
    <div className="closing-stats"><div><span>Pedidos</span><b>{todayOrders.length}</b></div><div><span>Itens</span><b>{qty}</b></div><div><span>Faturamento</span><b>{money(total)}</b></div></div>
    <div className="closing-products">{Object.entries(products).sort((a,b)=>b[1]-a[1]).map(([n,q])=><div key={n}><span>{n}</span><b>{q}</b></div>)}{!Object.keys(products).length&&<p>Nenhum pedido registrado hoje.</p>}</div>
    <div className="settings-footer"><button onClick={onClose}>Fechar</button><button className="primary" onClick={print}><Printer/> Imprimir no caixa</button></div>
  </div></div>
}

function Admin({orders,changeStatus,createOrder,setMode}){
  const [search,setSearch]=useState('')
  const [quick,setQuick]=useState(false)
  const [showPrint,setShowPrint]=useState(false)
  const [showClosing,setShowClosing]=useState(false)
  const [printSettings,setPrintSettings]=useState(getPrintSettings())
  const filtered=useMemo(()=>orders.filter(o=>`${o.number} ${o.table} ${o.customer}`.toLowerCase().includes(search.toLowerCase())),[orders,search])
  const next={novo:'preparo',preparo:'pronto',pronto:'entregue'}

  const printOrder=async(order, manual=false)=>{
    try{await printOrderBySettings(order,{manual})}
    catch(e){if(manual) alert(`Falha na impressão pelo QZ Tray: ${e.message||e}`)}
  }


  return <div className="admin-wrap">
    <div className="version-banner">V1.5 • AUTO PRINT + QZ ASSINADO</div><div className="admin-actions"><div className="search"><Search/><input placeholder="Buscar pedido, mesa ou cliente" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="admin-buttons"><button className="secondary" onClick={()=>setShowPrint(true)}><Settings/>Impressoras</button><button className="secondary" onClick={()=>setShowClosing(true)}><ReceiptText/>Fechamento</button><button className="primary" onClick={()=>setQuick(true)}><Plus/>Novo pedido</button></div></div>
    {!firebaseEnabled && <div className="demo-strip"><RefreshCcw/> Demonstração local • configure o Firebase para sincronizar notebook, garçom e cliente.</div>}
    <div className="kanban">{Object.entries(STATUS).map(([key,meta])=>{const Icon=meta.icon;const list=filtered.filter(o=>o.status===key);return <section className="column" key={key}><div className="column-head"><div><Icon/><strong>{meta.label}</strong></div><span>{list.length}</span></div><div className="cards">{list.map(o=><article className="order-card" key={o.id}><div className="order-top"><div><b>#{o.number||'—'}</b><span>Mesa {o.table}</span></div><time>{stamp(o.createdAt)}</time></div><div className="source">{o.source==='cliente'?'Pedido do cliente':'Lançado pela equipe'}</div><div className="order-items">{o.items?.map((i,idx)=><div key={idx}><span>{i.qty}× {i.name}</span><b>{money(i.qty*i.price)}</b></div>)}</div>{o.notes&&<div className="order-notes">“{o.notes}”</div>}<div className="order-total"><span>Total</span><strong>{money(Number(o.total)||0)}</strong></div><div className="order-actions"><button className="print-order" title="Imprimir pedido" onClick={()=>printOrder(o,true)}><Printer/></button>{key!=='entregue'&&<button className="advance" onClick={()=>changeStatus(o.id,next[key])}>{key==='novo'?'Iniciar preparo':key==='preparo'?'Marcar como pronto':'Entregar pedido'} →</button>}</div></article>)}{!list.length&&<div className="empty-column">Nenhum pedido</div>}</div></section>})}</div>
    {quick&&<div className="modal"><div className="modal-box"><button className="close" onClick={()=>setQuick(false)}><X/></button><Ordering mode="garcom" createOrder={async p=>{await createOrder(p);setQuick(false)}}/></div></div>}
    {showPrint&&<PrintSettingsModal onClose={()=>setShowPrint(false)} onSaved={setPrintSettings}/>} 
    {showClosing&&<ClosingModal orders={orders} onClose={()=>setShowClosing(false)}/>} 
  </div>
}

function App(){
  const [mode,setMode]=useState(initialMode)
  const {orders,createOrder,changeStatus}=useOrders()
  return <><AutoPrintDaemon orders={orders}/><Header mode={mode} onHome={()=>{history.pushState({},'',location.pathname);setMode(null)}}/>{!mode?<Home setMode={m=>{setMode(m);history.replaceState({},'',`?mode=${m}${m==='cliente'&&initialTable?`&mesa=${initialTable}`:''}`)}}/>:mode==='admin'?<Admin {...{orders,changeStatus,createOrder,setMode}}/>:<Ordering mode={mode} createOrder={createOrder}/>}</>
}

createRoot(document.getElementById('root')).render(<App/>)
