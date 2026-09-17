'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

const KEY = 'wl_cart_v1';

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const toast = useCallback((m) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(''), 1900);
  }, []);

  // ilk yüklemede localStorage'dan oku
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { /* yoksay */ }
    setReady(true);
  }, []);
  // değişince kaydet
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const keyOf = (id, opts) => id + '|' + opts.map((o) => o.value).join('~');

  const add = useCallback((product, qty, opts) => {
    const k = keyOf(product.id, opts);
    setItems((cur) => {
      const ex = cur.find((i) => i.key === k);
      if (ex) return cur.map((i) => (i.key === k ? { ...i, qty: i.qty + qty } : i));
      return [...cur, {
        key: k, id: product.id, name: product.name, sku: product.sku || '',
        image: product.image || '', options: opts, qty,
      }];
    });
  }, []);

  const setQty = useCallback((key, qty) => {
    setItems((cur) => cur.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)));
  }, []);
  const remove = useCallback((key) => setItems((cur) => cur.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartCtx.Provider value={{ items, count, add, setQty, remove, clear, open, setOpen, toast }}>
      {children}
      <div className={'toast' + (toastMsg ? ' show' : '')}>{toastMsg}</div>
    </CartCtx.Provider>
  );
}
