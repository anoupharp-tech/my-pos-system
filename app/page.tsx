"use client";
import React, { useState, useEffect } from 'react';

// --- Types ---
interface Product { id: number; name: string; price: number; category: string; stock: number; icon: string; }
interface CartItem extends Product { quantity: number; }
interface SaleRecord { id: string; items: CartItem[]; total: number; time: string; date: string; }

export default function SmartPOS() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [lang, setLang] = useState<'la' | 'th' | 'en'>('la');
  const [view, setView] = useState<'pos' | 'admin' | 'report'>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: '☕ ກາແຟດຳ', price: 25000, category: 'Drink', stock: 20, icon: '☕' },
    { id: 2, name: '🍵 ຊາຂຽວມັດຊະ', price: 30000, category: 'Drink', stock: 15, icon: '🍵' }
  ]);
  const [restockAmount, setRestockAmount] = useState<{[key: number]: string}>({});

  useEffect(() => {
    const savedProducts = localStorage.getItem('pos_products');
    const savedSales = localStorage.getItem('pos_sales');
    const savedLang = localStorage.getItem('pos_lang');
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedLang) setLang(savedLang as any);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('pos_products', JSON.stringify(products));
      localStorage.setItem('pos_sales', JSON.stringify(sales));
      localStorage.setItem('pos_lang', lang);
    }
  }, [products, sales, lang, isLoaded]);

  // --- Functions ---
  const handlePrint = (sale: SaleRecord) => {
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (printWindow) {
      const receiptHTML = `
        <html>
          <body style="font-family: 'Courier New', monospace; width: 280px; padding: 10px; font-size: 12px;">
            <div style="text-align: center;"><h2>MY SHOP</h2><p>ID: ${sale.id}</p><p>${sale.date} ${sale.time}</p><hr/></div>
            <table style="width: 100%;">${sale.items.map(i => `<tr><td>${i.name} x${i.quantity}</td><td style="text-align:right">${(i.price*i.quantity).toLocaleString()}</td></tr>`).join('')}</table>
            <hr/><div style="text-align: right; font-size: 16px; font-weight: bold;">TOTAL: ${sale.total.toLocaleString()}</div>
            <div style="text-align: center; margin-top: 20px;"><p>Thank You!</p></div>
            <script>window.print(); setTimeout(()=>window.close(), 500);</script>
          </body>
        </html>
      `;
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
    }
  };

  const handleCheckout = () => {
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newSale = { id: Math.random().toString(36).substr(2, 6).toUpperCase(), items: [...cart], total: totalAmount, time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString() };
    setSales([newSale, ...sales]);
    setProducts(products.map(p => {
      const item = cart.find(i => i.id === p.id);
      return item ? { ...p, stock: p.stock - item.quantity } : p;
    }));
    setCart([]);
    handlePrint(newSale);
  };

  const getBestSellers = () => {
    const counts: {[key: string]: number} = {};
    sales.forEach(s => s.items.forEach(i => counts[i.name] = (counts[i.name] || 0) + i.quantity));
    return Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 5);
  };

  const translations = {
    la: { pos: "ໜ້າຂາຍ", admin: "ຈັດການ", report: "ລາຍງານ", total_v: "ຍອດຂາຍລວມ", best: "ສິນຄ້າຂາຍດີ", clear: "ລຶບຂໍ້ມູນທັງໝົດ" },
    th: { pos: "หน้าขาย", admin: "จัดการ", report: "รายงาน", total_v: "ยอดขายรวม", best: "สินค้าขายดี", clear: "ล้างข้อมูลทั้งหมด" },
    en: { pos: "POS", admin: "Manage", report: "Report", total_v: "Total Sales", best: "Best Sellers", clear: "Reset All Data" }
  };
  const t = translations[lang];

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      <nav className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-20">
        <div className="flex gap-4 items-center">
          <h1 className="text-xl font-black text-blue-600">SMART POS</h1>
          <div className="flex bg-slate-100 rounded-lg p-1">
            {['pos', 'admin', 'report'].map((v) => (
              <button key={v} onClick={() => setView(v as any)} className={`px-4 py-1.5 rounded-md text-sm font-bold capitalize ${view === v ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>{t[v as keyof typeof t] || v}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {['la', 'th', 'en'].map(l => (
            <button key={l} onClick={() => setLang(l as any)} className={`px-3 py-1 rounded border font-bold text-xs ${lang === l ? 'bg-black text-white' : 'bg-white text-black'}`}>{l.toUpperCase()}</button>
          ))}
        </div>
      </nav>

      {view === 'pos' && (
        <div className="flex flex-col md:flex-row h-[calc(100vh-65px)]">
          <div className="md:w-2/3 p-6 grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto content-start">
            {products.map(p => (
              <button key={p.id} onClick={() => {
                if(p.stock <= 0) return;
                const exist = cart.find(c => c.id === p.id);
                if(exist) setCart(cart.map(c => c.id === p.id ? {...c, quantity: c.quantity + 1} : c));
                else setCart([...cart, {...p, quantity: 1}]);
              }} className={`bg-white p-6 rounded-3xl border-2 transition-all text-left shadow-sm ${p.stock <= 0 ? 'opacity-40 grayscale' : 'hover:border-blue-500 hover:shadow-md'}`}>
                <div className="text-4xl mb-2">{p.icon}</div>
                <div className="font-bold text-lg text-black">{p.name}</div>
                <div className="text-blue-600 font-black text-xl">{p.price.toLocaleString()}</div>
                <div className={`text-xs mt-2 font-bold ${p.stock < 5 ? 'text-red-500' : 'text-slate-400'}`}>Stock: {p.stock}</div>
              </button>
            ))}
          </div>
          <div className="md:w-1/3 bg-white border-l p-6 flex flex-col shadow-2xl">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 text-black">ตะกร้าสินค้า</h2>
            <div className="flex-grow space-y-3 overflow-y-auto text-black">
              {cart.map(item => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
                  <div><div className="font-bold">{item.name}</div><div className="text-blue-600 font-bold">x{item.quantity}</div></div>
                  <div className="font-bold text-lg">{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-6 border-t-2 border-dashed text-black">
              <div className="flex justify-between text-3xl font-black mb-6"><span>Total</span><span className="text-blue-600">{cart.reduce((s,i)=>s+(i.price*i.quantity),0).toLocaleString()}</span></div>
              <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all">ชำระเงินและพิมพ์ใบเสร็จ</button>
            </div>
          </div>
        </div>
      )}

      {view === 'admin' && (
        <div className="p-8 max-w-4xl mx-auto text-black">
          <div className="bg-white p-8 rounded-3xl shadow-sm border mb-8">
            <h3 className="font-black mb-6 text-blue-600 uppercase text-xl">จัดการสต็อกสินค้า</h3>
            <div className="space-y-4">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 border rounded-2xl bg-slate-50">
                  <div className="flex items-center gap-4"><span className="text-3xl">{p.icon}</span><span className="font-bold text-lg">{p.name}</span></div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xl">{p.stock}</span>
                    <input type="number" value={restockAmount[p.id] || ''} onChange={e=>setRestockAmount({...restockAmount, [p.id]: e.target.value})} className="w-24 border rounded-xl p-2 bg-white text-center" placeholder="จำนวน" />
                    <button onClick={()=>{
                      const amt = parseInt(restockAmount[p.id]);
                      if(amt > 0) { setProducts(products.map(prod=>prod.id===p.id?{...prod, stock:prod.stock+amt}:prod)); setRestockAmount({...restockAmount, [p.id]:''}); }
                    }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">เติม</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'report' && (
        <div className="p-8 max-w-5xl mx-auto text-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-lg">
              <h3 className="text-lg opacity-80 mb-2">{t.total_v}</h3>
              <div className="text-5xl font-black">{sales.reduce((s,r)=>s+r.total, 0).toLocaleString()}</div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border">
              <h3 className="text-lg text-slate-400 mb-4">{t.best}</h3>
              <div className="space-y-3">
                {getBestSellers().map(([name, qty]) => (
                  <div key={name} className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-slate-700">{name}</span>
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-bold">x {qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => { if(confirm(t.clear + "?")) { setSales([]); localStorage.removeItem('pos_sales'); } }} className="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-bold border-2 border-dashed border-red-200 hover:bg-red-500 hover:text-white transition-all">{t.clear}</button>
        </div>
      )}
    </div>
  );
}