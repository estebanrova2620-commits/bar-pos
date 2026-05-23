// src/useFirebase.js
import { useState, useEffect, useCallback } from "react";
import {
  doc, collection, onSnapshot, setDoc, updateDoc,
  deleteDoc, writeBatch, getDocs, increment
} from "firebase/firestore";
import { db } from "./firebase";

const INIT_CATS = ["Cervezas","Aguardiente","Bebidas","Micheladas","Snacks","Cubetazos"];
const TABLE_IDS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11"];
const TABLE_LABELS = {T1:"1",T2:"2",T3:"3",T4:"4",T5:"5",T6:"6",T7:"7",T8:"8",T9:"9",T10:"10",T11:"11"};

const emptyTable = (id) => ({
  id, label:TABLE_LABELS[id], status:"free",
  rounds:[], discount:0, payments:[], openedAt:null, openedBy:null, sessions:[]
});

export { TABLE_IDS, emptyTable };

// descuentaStock: descuenta del inventario leyendo directo de Firebase
// items: [{name, qty}] donde qty es cantidad a descontar (positivo)
export async function descuentaStock(items) {
  if (!items || items.length === 0) return;
  const mapa = {};
  for (const {name, qty} of items) {
    if (name && qty > 0) mapa[name] = (mapa[name] || 0) + qty;
  }
  if (Object.keys(mapa).length === 0) return;
  const snap = await getDocs(collection(db, "inventory"));
  const batch = writeBatch(db);
  let cambios = 0;
  for (const [name, qty] of Object.entries(mapa)) {
    const found = snap.docs.find(d => d.data().name === name);
    if (found) {
      batch.update(found.ref, { stock: increment(-qty) });
      cambios++;
    }
  }
  if (cambios > 0) await batch.commit();
}

export function useFirebaseData() {
  const [tables,      setTables]       = useState({});
  const [inventory,   setInventory]    = useState([]);
  const [expenses,    setExpenses]     = useState([]);
  const [dailyLog,    setDailyLog]     = useState([]);
  const [auditLog,    setAuditLog]     = useState([]);
  const [users,       setUsers]        = useState([]);
  const [dayOp,       setDayOpState]   = useState(null);
  const [monthlyExp,  setMonthlyExp]   = useState([]);
  const [cubetazos,   setCubetazosState] = useState({});
  const [promociones, setPromociones]  = useState([]);
  const [credits,     setCredits]      = useState([]);
  const [categories,  setCategories]   = useState(INIT_CATS);
  const [ready,       setReady]        = useState(false);
  const [session,     setSession]      = useState(()=>{
    try{ return localStorage.getItem("bar_session")||null; }catch{ return null; }
  });

  useEffect(()=>{
    const unsubs = [];
    // 4 colecciones criticas que deben cargar antes de mostrar la app
    let flags = {config:false, inventory:false, users:false, expenses:false};
    const mark = (k) => {
      flags[k] = true;
      if(Object.values(flags).every(Boolean)) setReady(true);
    };

    // ── Config global ─────────────────────────────────────────
    unsubs.push(onSnapshot(doc(db,"config","global"), snap=>{
      if(snap.exists()){
        const d = snap.data();
        setDayOpState(d.dayOp ?? null);
        if(d.cubetazos !== undefined) setCubetazosState(d.cubetazos);
        if(d.categories !== undefined) setCategories(d.categories);
      }
      mark("config");
    }));

   // ── Mesas ─────────────────────────────────────────────────
unsubs.push(onSnapshot(collection(db,"tables"), snap=>{
  const all = {};
  snap.docs.forEach(d=>{ all[d.id] = d.data(); });
  TABLE_IDS.forEach(id=>{
    if(!all[id]) all[id] = emptyTable(id);
  });
  setTables(all);
}));

    // ── Inventario — NUNCA inicializa, solo lee ───────────────
    // SIN lógica de inicialización — los datos siempre vienen de Firebase
    unsubs.push(onSnapshot(collection(db,"inventory"), snap=>{
      setInventory(snap.docs.map(d => d.data()));
      mark("inventory");
    }));

    // ── Usuarios — NUNCA inicializa, solo lee ─────────────────
    unsubs.push(onSnapshot(collection(db,"users"), snap=>{
      setUsers(snap.docs.map(d => d.data()));
      mark("users");
    }));

    // ── Gastos ────────────────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"expenses"), snap=>{
      setExpenses(snap.docs.map(d=>d.data()));
      mark("expenses");
    }));

    // ── Créditos ──────────────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"credits"), snap=>{
      setCredits(snap.docs.map(d=>d.data()).sort((a,b)=>(b.date||"").localeCompare(a.date||"")));
    }));

    // ── Log diario ────────────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"dailyLog"), snap=>{
      setDailyLog(snap.docs.map(d=>d.data()).sort((a,b)=>(a.date||"").localeCompare(b.date||"")));
    }));

    // ── Gastos mensuales ──────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"monthlyExp"), snap=>{
      setMonthlyExp(snap.docs.map(d=>d.data()));
    }));

    // ── Auditoría ─────────────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"auditLog"), snap=>{
      setAuditLog(snap.docs.map(d=>d.data()).sort((a,b)=>(b.at||"").localeCompare(a.at||"")));
    }));

    // ── Promociones ───────────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"promociones"), snap=>{
      setPromociones(snap.docs.map(d=>d.data()));
    }));

    return () => unsubs.forEach(u=>u());
  },[]);

  const login = useCallback((username,password)=>{
    const u=users.find(u=>u.username===username&&u.password===password&&u.active);
    if(!u) return false;
    setSession(u.id);
    try{ localStorage.setItem("bar_session",u.id); }catch{}
    return true;
  },[users]);

  const logout = useCallback(()=>{
    setSession(null);
    try{ localStorage.removeItem("bar_session"); }catch{}
  },[]);

  const currentUser = session ? users.find(u=>u.id===session) : null;

  const setCubetazos = useCallback((updater)=>{
    setCubetazosState(prev=>{
      const next = typeof updater==="function" ? updater(prev) : updater;
      setDoc(doc(db,"config","global"),{cubetazos:next},{merge:true});
      return next;
    });
  },[]);

  const setDayOp = useCallback((value)=>{
    const next = typeof value==="function" ? value(null) : value;
    setDoc(doc(db,"config","global"),{dayOp:next},{merge:true});
  },[]);

  const saveCategories = useCallback((cats)=>{
    setCategories(cats);
    setDoc(doc(db,"config","global"),{categories:cats},{merge:true});
  },[]);

  const saveTable = useCallback(async(id,data)=>{
    await setDoc(doc(db,"tables",id),data);
  },[]);

  const openTable = useCallback(async(id,userName,nowTime)=>{
    await setDoc(doc(db,"tables",id),{
      ...emptyTable(id), status:"open", openedAt:nowTime, openedBy:userName
    });
  },[]);

  const saveInventoryItem = useCallback(async(item)=>{
    await setDoc(doc(db,"inventory",item.id),item);
  },[]);

  const deleteInventoryItem = useCallback(async(id)=>{
    await deleteDoc(doc(db,"inventory",id));
  },[]);

  const adjustInv = useCallback(async(name, delta)=>{
    const snap = await getDocs(collection(db,"inventory"));
    const found = snap.docs.find(d=>d.data().name===name);
    if(found) await updateDoc(found.ref, {stock: increment(delta)});
  },[]);

  const savePromocion = useCallback(async(promo)=>{
    await setDoc(doc(db,"promociones",promo.id),promo);
  },[]);

  const deletePromocion = useCallback(async(id)=>{
    await deleteDoc(doc(db,"promociones",id));
  },[]);

  const togglePromocion = useCallback(async(id, activo)=>{
    await updateDoc(doc(db,"promociones",id),{activo});
  },[]);

  const saveUser = useCallback(async(user)=>{
    await setDoc(doc(db,"users",user.id),user);
  },[]);

  const deleteUserFB = useCallback(async(id)=>{
    await deleteDoc(doc(db,"users",id));
  },[]);

  const addExpense = useCallback(async(expense)=>{
    await setDoc(doc(db,"expenses",expense.id),expense);
  },[]);

  const deleteExpense = useCallback(async(id)=>{
    await deleteDoc(doc(db,"expenses",id));
  },[]);

  const clearExpenses = useCallback(async()=>{
    const snap = await getDocs(collection(db,"expenses"));
    if(snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach(d=>batch.delete(d.ref));
    await batch.commit();
  },[]);

  const addMonthlyExp = useCallback(async(exp)=>{
    await setDoc(doc(db,"monthlyExp",exp.id),exp);
  },[]);

  const deleteMonthlyExp = useCallback(async(id)=>{
    await deleteDoc(doc(db,"monthlyExp",id));
  },[]);

  const addCredit = useCallback(async(credit)=>{
    await setDoc(doc(db,"credits",credit.id),credit);
  },[]);

  const payCredit = useCallback(async(id,method,paidBy,paidDate)=>{
    await updateDoc(doc(db,"credits",id),{
      status:"paid", payMethod:method, paidBy, paidDate
    });
  },[]);

  const deleteCredit = useCallback(async(id)=>{
    await deleteDoc(doc(db,"credits",id));
  },[]);

  const addAudit = useCallback(async(entry)=>{
    await setDoc(doc(db,"auditLog",entry.id),entry);
  },[]);

  const saveDailyLog = useCallback(async(entry)=>{
    await setDoc(doc(db,"dailyLog",entry.date),entry);
  },[]);

  const clearDailyLog = useCallback(async()=>{
    const snap = await getDocs(collection(db,"dailyLog"));
    if(snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach(d=>batch.delete(d.ref));
    await batch.commit();
  },[]);

  return {
    tables, inventory, expenses, dailyLog, auditLog,
    users, dayOp, monthlyExp, cubetazos, promociones, credits, categories,
    loading: !ready,
    session, currentUser,
    login, logout,
    setCubetazos, setDayOp, saveCategories,
    saveTable, openTable,
    adjustInv, saveInventoryItem, deleteInventoryItem,
    savePromocion, deletePromocion, togglePromocion,
    saveUser, deleteUserFB,
    addExpense, deleteExpense, clearExpenses,
    addMonthlyExp, deleteMonthlyExp,
    addCredit, payCredit, deleteCredit,
    addAudit, saveDailyLog, clearDailyLog,
  };
}
