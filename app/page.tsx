"use client";
import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle } from 'lucide-react';

export default function POS() {
  const [cart, setCart] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);
  
  // รายการสินค้า (คุณสามารถเปลี่ยนชื่อและราคาตรงนี้ได้เลยครับ)
  const products = [
    { id: 1, name: "ກາເຟເຢັນ (Coffee)", price: 25000, icon: "☕" },
    { id: 2, name: "ຊານົມ (Milk Tea)", price: 30000, icon: "🧋" },
    { id: 3, name: "ນ້ຳດື່ມ (Water)", price: 5000, icon: "💧" },
    { id: 4, name: "ເຂົ້າຜັດ (Fried Rice)", price: 45000, icon: "🍛" },
  ];

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">SMART POS ລາວ 🇱🇦</h1>
        <span className="bg-blue-500 px-3 py-1 rounded-full text-sm">Online</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Product List */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 gap-4 content-start">
          {products.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-all flex flex-col items-center text-center"
            >
              <span className="text-4xl mb-2">{product.icon}</span>
              <span className="font-semibold text-gray-800">{product.name}</span>
              <span className="text-blue-600 font-bold mt-1">{product.price.toLocaleString()} ກີບ</span>
            </button>
          ))}
        </div>

        {/* Cart Side Summary */}
        <div className="w-96 bg-white border-l shadow-xl flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <ShoppingCart size={20} />
            <span className="font-bold">ລາຍການສັ່ງຊື້ ({cart.length})</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">ບໍ່ມີລາຍການໃນກະຕ່າ</div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">x{item.quantity}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{(item.price * item.quantity).toLocaleString()}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t space-y-4">
            <div className="flex justify-between text-2xl font-black text-gray-800">
              <span>ລວມທັງໝົດ:</span>
              <span className="text-blue-600">{total.toLocaleString()} ກີບ</span>
            </div>
            <button 
              onClick={() => {alert('ຊຳລະເງິນສຳເລັດ!'); setCart([]);}}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle size={24} /> ຊຳລະເງິນ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}