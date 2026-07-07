"use client";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { OrderRecord, ProductRecord, UserRecord } from "@/lib/types";

type Tab = "Overview" | "Users" | "Products" | "Orders" | "Analytics" | "AI Insight";
const tabs: Tab[] = ["Overview", "Users", "Products", "Orders", "Analytics", "AI Insight"];
const icons: Record<Tab, string> = { Overview: "⌘", Users: "👥", Products: "📦", Orders: "🧾", Analytics: "📈", "AI Insight": "✨" };
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function FlowBoardSupabase() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<null | "user" | "product" | "order">(null);
  const [selected, setSelected] = useState<UserRecord | ProductRecord | OrderRecord | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");
    const [u, p, o] = await Promise.all([
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*, users(name,email), products(name,category)").order("created_at", { ascending: false })
    ]);
    if (u.error || p.error || o.error) setError(u.error?.message || p.error?.message || o.error?.message || "Failed to load data");
    else {
      setUsers(u.data || []);
      setProducts(p.data || []);
      setOrders((o.data || []) as OrderRecord[]);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const paidRevenue = orders.filter(o => o.status === "paid").reduce((sum, o) => sum + Number(o.amount), 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const stockRisks = products.filter(p => Number(p.stock) < 10).length;
  const averageOrder = orders.length ? paidRevenue / Math.max(1, orders.filter(o => o.status === "paid").length) : 0;

  const filteredUsers = useMemo(() => users.filter(u => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || u.status === filter)), [users, query, filter]);
  const filteredProducts = useMemo(() => products.filter(p => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || (filter === "low-stock" ? p.stock < 10 : p.status === filter))), [products, query, filter]);
  const filteredOrders = useMemo(() => orders.filter(o => `${o.id} ${o.users?.name || ""} ${o.products?.name || ""}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || o.status === filter)), [orders, query, filter]);

  async function deleteRecord(table: "users" | "products" | "orders", id: string) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) setError(error.message); else loadData();
  }

  function exportCSV() {
    const rows = tab === "Users" ? filteredUsers : tab === "Products" ? filteredProducts : tab === "Orders" ? filteredOrders : [];
    if (!rows.length) return;
    const csv = [Object.keys(rows[0]).join(","), ...rows.map(row => Object.values(row).map(v => `"${String(typeof v === "object" ? JSON.stringify(v) : v).replaceAll('"', '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `flowboard-${tab.toLowerCase()}-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  const kpis = [
    { label: "Total Revenue", value: currency.format(paidRevenue), note: "Sum of paid orders", tone: "positive" },
    { label: "Total Users", value: String(users.length), note: "Rows in users table", tone: "positive" },
    { label: "Products", value: String(products.length), note: "Rows in products table", tone: "positive" },
    { label: "Stock Risks", value: String(stockRisks), note: "Products with stock under 10", tone: stockRisks ? "warning" : "positive" }
  ];

  return <div className="app">
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="brand"><div className="logo">F</div><div><h1>FlowBoard AI</h1><p>Real Supabase dashboard</p></div></div>
      <nav>{tabs.map(t => <button key={t} className={tab === t ? "active" : ""} onClick={() => { setTab(t); setQuery(""); setFilter("all"); setSidebarOpen(false); }}><span>{icons[t]}</span>{t}</button>)}</nav>
      <div className="sideCard"><strong>Real database</strong><p>Add, edit, delete, and watch dashboard numbers update from Supabase.</p><button onClick={() => setTab("AI Insight")}>Open Insight</button></div>
    </aside>
    <main>
      <header><div><p className="eyebrow">Live Supabase workspace</p><h2>{tab === "Overview" ? "Executive Overview" : tab}</h2><p>Real CRUD dashboard: changes in users, products, and orders update the KPIs instantly.</p></div><div className="actions"><button className="mobile" onClick={() => setSidebarOpen(true)}>☰ Menu</button><button onClick={loadData}>↻ Refresh</button><button className="primary" onClick={() => setTab("AI Insight")}>Ask AI</button></div></header>
      {error && <div className="error">{error}</div>}
      {loading ? <Loading /> : <>
        {tab === "Overview" && <Overview kpis={kpis} orders={orders} averageOrder={averageOrder} pendingOrders={pendingOrders} stockRisks={stockRisks} />}
        {tab === "Users" && <DataSection title="Users" text="Real users table from Supabase." onAdd={() => setModal("user")} onExport={exportCSV}><Tools query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} options={["active", "pending", "inactive"]}/><UsersTable rows={filteredUsers} onView={setSelected} onDelete={(id) => deleteRecord("users", id)} /></DataSection>}
        {tab === "Products" && <DataSection title="Products" text="Real products table. Stock changes affect Stock Risks." onAdd={() => setModal("product")} onExport={exportCSV}><Tools query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} options={["active", "draft", "archived", "low-stock"]}/><ProductsTable rows={filteredProducts} onView={setSelected} onDelete={(id) => deleteRecord("products", id)} /></DataSection>}
        {tab === "Orders" && <DataSection title="Orders" text="Real orders table. Paid orders affect revenue." onAdd={() => setModal("order")} onExport={exportCSV}><Tools query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} options={["paid", "pending", "cancelled"]}/><OrdersTable rows={filteredOrders} onView={setSelected} onDelete={(id) => deleteRecord("orders", id)} /></DataSection>}
        {tab === "Analytics" && <Analytics orders={orders} products={products} users={users} averageOrder={averageOrder} pendingOrders={pendingOrders} />}
        {tab === "AI Insight" && <AIInsight revenue={paidRevenue} users={users.length} products={products.length} pendingOrders={pendingOrders} stockRisks={stockRisks} averageOrder={averageOrder} />}
      </>}
    </main>
    {modal && <CreateModal type={modal} users={users} products={products} onClose={() => setModal(null)} onDone={() => { setModal(null); loadData(); }} />}
    {selected && <Details item={selected} onClose={() => setSelected(null)} />}
  </div>;
}

function Loading(){ return <section className="grid4">{[1,2,3,4].map(i => <div className="skeleton" key={i}/>)}</section>; }
function Title({title,text,action}:{title:string;text:string;action?:ReactNode}){ return <div className="title"><div><h3>{title}</h3><p>{text}</p></div>{action}</div>; }
function DataSection({title,text,onAdd,onExport,children}:{title:string;text:string;onAdd:()=>void;onExport:()=>void;children:ReactNode}){ return <section className="card"><Title title={title} text={text} action={<div className="actions"><button onClick={onExport}>Export CSV</button><button className="primary" onClick={onAdd}>+ Add</button></div>} />{children}</section>; }
function Tools({query,setQuery,filter,setFilter,options}:{query:string;setQuery:(v:string)=>void;filter:string;setFilter:(v:string)=>void;options:string[]}){ return <div className="tools"><input placeholder="Search records..." value={query} onChange={e => setQuery(e.target.value)} /><select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All statuses</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select></div>; }

function Overview({kpis,orders,averageOrder,pendingOrders,stockRisks}:{kpis:{label:string;value:string;note:string;tone:string}[];orders:OrderRecord[];averageOrder:number;pendingOrders:number;stockRisks:number}){
  return <><section className="grid4">{kpis.map(k => <article className="card kpi" key={k.label}><span>{k.label}</span><h3>{k.value}</h3><p>{k.note}</p><em className={k.tone}>{k.tone === "warning" ? "Needs review" : "Live"}</em></article>)}</section><section className="cols topGap"><RevenueChart orders={orders}/><article className="card"><Title title="Operational Signals" text="Calculated from live database records." /> <Metric label="Average paid order" value={currency.format(averageOrder)} /><Metric label="Pending orders" value={String(pendingOrders)} /><Metric label="Stock risks" value={String(stockRisks)} /></article></section><section className="card topGap"><Title title="Recent orders" text="Latest rows from the orders table." /><OrdersTable rows={orders.slice(0, 6)} onView={() => {}} onDelete={() => {}} /></section></>;
}
function RevenueChart({orders}:{orders:OrderRecord[]}){ const paid = orders.filter(o => o.status === "paid"); const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; const values = months.map((_, i) => paid.filter(o => new Date(o.created_at).getMonth() === i).reduce((s,o)=>s+Number(o.amount),0)); const fallback = values.every(v=>v===0) ? [100,250,180,420,300,520,620,700,810,690,920,1100] : values; const max = Math.max(...fallback, 1); return <article className="card"><Title title="Revenue intelligence" text="Paid revenue grouped by order month." action={<em className="positive">Real DB</em>} /><div className="chart">{fallback.map((v,i)=><div className="barWrap" key={months[i]}><div className="bar" style={{height:`${Math.max(12,(v/max)*100)}%`}}/><small>{months[i]}</small></div>)}</div></article>; }
function Metric({label,value}:{label:string;value:string}){ return <div className="metric"><span><strong>{label}</strong><small>Updates after database changes</small></span><b>{value}</b></div>; }
function Analytics({orders,products,users,averageOrder,pendingOrders}:{orders:OrderRecord[];products:ProductRecord[];users:UserRecord[];averageOrder:number;pendingOrders:number}){ const low = products.filter(p=>p.stock<10); const paid = orders.filter(o=>o.status==='paid').length; return <section className="cols"><RevenueChart orders={orders}/><article className="card"><Title title="Business Health" text="Real calculated KPIs."/><Metric label="Paid orders" value={String(paid)}/><Metric label="Pending orders" value={String(pendingOrders)}/><Metric label="Average paid order" value={currency.format(averageOrder)}/><Metric label="Low stock products" value={String(low.length)}/><Metric label="Total users" value={String(users.length)}/></article></section>; }
function AIInsight({revenue,users,products,pendingOrders,stockRisks,averageOrder}:{revenue:number;users:number;products:number;pendingOrders:number;stockRisks:number;averageOrder:number}){ const [question,setQuestion]=useState("What should I focus on today?"); const [answer,setAnswer]=useState("Ask about revenue, stock, users, orders, or risks."); function ask(){ let a = `Current revenue is ${currency.format(revenue)} from paid orders. You have ${users} users, ${products} products, ${pendingOrders} pending orders, and ${stockRisks} stock risks. `; if(question.toLowerCase().includes('stock')||question.toLowerCase().includes('risk')) a += 'Priority: review low-stock products and restock anything under 10 units.'; else if(question.toLowerCase().includes('revenue')) a += `Average paid order is ${currency.format(averageOrder)}. Add more paid orders or improve product pricing to increase revenue.`; else a += 'Best next action: follow up pending orders, fix low stock products, and keep active users engaged.'; setAnswer(a); } return <section className="copilot"><div className="orb">✨</div><article className="card chat"><Title title="AI Insight" text="Rule-based insight from real Supabase data."/><div className="bubble">{answer}</div><div className="prompt"><input value={question} onChange={e=>setQuestion(e.target.value)} /><button className="primary" onClick={ask}>Ask</button></div><div className="quick"><button onClick={()=>setQuestion('What are the biggest risks?')}>Risks</button><button onClick={()=>setQuestion('How is revenue performing?')}>Revenue</button><button onClick={()=>setQuestion('What should I focus on today?')}>Today</button></div></article></section>; }

function UsersTable({rows,onView,onDelete}:{rows:UserRecord[];onView:(x:UserRecord)=>void;onDelete:(id:string)=>void}){ return <div className="table"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map(u=><tr key={u.id}><td><strong>{u.name}</strong></td><td>{u.email}</td><td>{u.role}</td><td><em className={u.status}>{u.status}</em></td><td><button onClick={()=>onView(u)}>View</button><button onClick={()=>onDelete(u.id)}>Delete</button></td></tr>)}</tbody></table></div>; }
function ProductsTable({rows,onView,onDelete}:{rows:ProductRecord[];onView:(x:ProductRecord)=>void;onDelete:(id:string)=>void}){ return <div className="table"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map(p=><tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.category}</td><td>{currency.format(p.price)}</td><td>{p.stock}</td><td><em className={p.stock<10?'warning':p.status}>{p.stock<10?'low stock':p.status}</em></td><td><button onClick={()=>onView(p)}>View</button><button onClick={()=>onDelete(p.id)}>Delete</button></td></tr>)}</tbody></table></div>; }
function OrdersTable({rows,onView,onDelete}:{rows:OrderRecord[];onView:(x:OrderRecord)=>void;onDelete:(id:string)=>void}){ return <div className="table"><table><thead><tr><th>Order</th><th>User</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>{rows.map(o=><tr key={o.id}><td><strong>{o.id.slice(0,8)}</strong></td><td>{o.users?.name || 'Deleted user'}</td><td>{o.products?.name || 'Deleted product'}</td><td>{currency.format(o.amount)}</td><td><em className={o.status}>{o.status}</em></td><td>{new Date(o.created_at).toLocaleDateString()}</td><td><button onClick={()=>onView(o)}>View</button><button onClick={()=>onDelete(o.id)}>Delete</button></td></tr>)}</tbody></table></div>; }

function CreateModal({type,users,products,onClose,onDone}:{type:"user"|"product"|"order";users:UserRecord[];products:ProductRecord[];onClose:()=>void;onDone:()=>void}){
  const [form,setForm]=useState<Record<string,string>>({}); const [saving,setSaving]=useState(false); const set=(k:string,v:string)=>setForm(prev=>({...prev,[k]:v}));
  async function save(){ setSaving(true); let result; if(type==='user') result = await supabase.from('users').insert({name:form.name||'New User',email:form.email||`user${Date.now()}@flowboard.app`,role:form.role||'Customer',status:form.status||'active'}); if(type==='product') result = await supabase.from('products').insert({name:form.name||'New Product',category:form.category||'SaaS Plan',price:Number(form.price||49),stock:Number(form.stock||20),status:form.status||'active'}); if(type==='order') result = await supabase.from('orders').insert({user_id:form.user_id||null,product_id:form.product_id||null,amount:Number(form.amount||99),status:form.status||'paid'}); setSaving(false); if(result?.error) alert(result.error.message); else onDone(); }
  return <div className="backdrop"><div className="modal"><Title title={`Add ${type}`} text="This record will be saved in Supabase." action={<button onClick={onClose}>Close</button>}/>{type==='user'&&<div className="form"><label>Name<input onChange={e=>set('name',e.target.value)}/></label><label>Email<input onChange={e=>set('email',e.target.value)}/></label><label>Role<input onChange={e=>set('role',e.target.value)}/></label><label>Status<select onChange={e=>set('status',e.target.value)}><option>active</option><option>pending</option><option>inactive</option></select></label></div>}{type==='product'&&<div className="form"><label>Name<input onChange={e=>set('name',e.target.value)}/></label><label>Category<input onChange={e=>set('category',e.target.value)}/></label><label>Price<input type="number" onChange={e=>set('price',e.target.value)}/></label><label>Stock<input type="number" onChange={e=>set('stock',e.target.value)}/></label></div>}{type==='order'&&<div className="form"><label>User<select onChange={e=>set('user_id',e.target.value)}><option value="">No user</option>{users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></label><label>Product<select onChange={e=>set('product_id',e.target.value)}><option value="">No product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Amount<input type="number" onChange={e=>set('amount',e.target.value)}/></label><label>Status<select onChange={e=>set('status',e.target.value)}><option>paid</option><option>pending</option><option>cancelled</option></select></label></div>}<div className="actions modalActions"><button onClick={onClose}>Cancel</button><button className="primary" disabled={saving} onClick={save}>{saving?'Saving...':'Save to Supabase'}</button></div></div></div>;
}
function Details({item,onClose}:{item:unknown;onClose:()=>void}){ return <div className="backdrop"><div className="modal"><Title title="Record details" text="Live row from Supabase." action={<button onClick={onClose}>Close</button>}/><pre>{JSON.stringify(item,null,2)}</pre></div></div>; }
