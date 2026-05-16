// src/useFirebase.js
import { useState, useEffect, useCallback } from "react";
import {
  doc, collection, onSnapshot, setDoc, updateDoc,
  deleteDoc, writeBatch, getDocs
} from "firebase/firestore";
import { db } from "./firebase";

const INIT_INV = [
  {id:"i1", name:"Águila",                         cat:"Cervezas",    stock:24,min:6, unit:"und.",cost:2500, price:4000},
  {id:"i2", name:"Águila Light",                   cat:"Cervezas",    stock:24,min:6, unit:"und.",cost:2500, price:4000},
  {id:"i3", name:"Poker",                          cat:"Cervezas",    stock:24,min:6, unit:"und.",cost:2400, price:4000},
  {id:"i4", name:"Costeña",                        cat:"Cervezas",    stock:24,min:6, unit:"und.",cost:2400, price:4000},
  {id:"i5", name:"Heineken",                       cat:"Cervezas",    stock:12,min:4, unit:"und.",cost:2800, price:4000},
  {id:"i6", name:"Coronita",                       cat:"Cervezas",    stock:12,min:4, unit:"und.",cost:2900, price:4500},
  {id:"i7", name:"Club Colombia Roja",             cat:"Cervezas",    stock:12,min:4, unit:"und.",cost:3000, price:4500},
  {id:"i8", name:"Club Colombia Dorada",           cat:"Cervezas",    stock:12,min:4, unit:"und.",cost:3000, price:4500},
  {id:"i9", name:"Redds",                          cat:"Cervezas",    stock:12,min:4, unit:"und.",cost:3200, price:5000},
  {id:"i10",name:"3 Cordilleras",                  cat:"Cervezas",    stock:12,min:4, unit:"und.",cost:3500, price:5000},
  {id:"i11",name:"Aguardiente Amarillo Botella",   cat:"Aguardiente", stock:4, min:1, unit:"bot.",cost:52000,price:85000},
  {id:"i12",name:"Antioqueño Tapa Azul Botella",   cat:"Aguardiente", stock:4, min:1, unit:"bot.",cost:52000,price:85000},
  {id:"i13",name:"Antioqueño Tapa Verde Botella",  cat:"Aguardiente", stock:4, min:1, unit:"bot.",cost:52000,price:85000},
  {id:"i14",name:"Aguardiente Amarillo ½ Botella", cat:"Aguardiente", stock:6, min:2, unit:"und.",cost:28000,price:45000},
  {id:"i15",name:"Antioqueño Tapa Azul ½ Botella", cat:"Aguardiente", stock:6, min:2, unit:"und.",cost:28000,price:45000},
  {id:"i16",name:"Antioqueño Tapa Verde ½ Botella",cat:"Aguardiente", stock:6, min:2, unit:"und.",cost:28000,price:45000},
  {id:"i17",name:"Soda Bretaña",                   cat:"Bebidas",     stock:24,min:6, unit:"und.",cost:1800, price:4000},
  {id:"i18",name:"Coca Cola",                      cat:"Bebidas",     stock:24,min:6, unit:"und.",cost:1800, price:4000},
  {id:"i19",name:"Gatorade",                       cat:"Bebidas",     stock:12,min:4, unit:"und.",cost:3000, price:5000},
  {id:"i20",name:"Ginger Ale",                     cat:"Bebidas",     stock:12,min:4, unit:"und.",cost:1800, price:4000},
  {id:"i21",name:"Agua",                           cat:"Bebidas",     stock:24,min:6, unit:"und.",cost:800,  price:3000},
  {id:"i22",name:"Michelada de Cerveza",           cat:"Micheladas",  stock:99,min:0, unit:"und.",cost:3200, price:6000},
  {id:"i23",name:"Michelada de Soda",              cat:"Micheladas",  stock:99,min:0, unit:"und.",cost:2500, price:5000},
  {id:"i28",name:"Michelada Ginger Ale",           cat:"Micheladas",  stock:99,min:0, unit:"und.",cost:2500, price:5000},
  {id:"i24",name:"Detoditos",                      cat:"Snacks",      stock:20,min:5, unit:"und.",cost:2000, price:4000},
  {id:"i25",name:"NatuChips",                      cat:"Snacks",      stock:20,min:5, unit:"und.",cost:2000, price:4000},
  {id:"i26",name:"Papas",                          cat:"Snacks",      stock:20,min:5, unit:"und.",cost:2000, price:4000},
  {id:"i27",name:"Bombom",                         cat:"Snacks",      stock:30,min:10,unit:"und.",cost:500,  price:1000},
];

const INIT_USERS = [
  {id:"u1",username:"admin",   password:"admin123",role:"admin",  name:"Administrador",active:true},
  {id:"u2",username:"mesero1", password:"bar2024", role:"mesero", name:"Mesero 1",     active:true},
];

const INIT_CATS = ["Cervezas","Aguardiente","Bebidas","Micheladas","Snacks","Cubetazos"];
const TABLE_IDS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11"];
const TABLE_LABELS = {T1:"1",T2:"2",T3:"3",T4:"4",T5:"5",T6:"6",T7:"7",T8:"8",T9:"9",T10:"10",T11:"11"};

const emptyTable = (id) => ({
  id, label:TABLE_LABELS[id], status:"free",
  rounds:[], discount:0, payments:[], openedAt:null, openedBy:null, sessions:[]
});

export { TABLE_IDS, emptyTable };

export function useFirebaseData() {
  const [tables,     setTables]     = useState({});
  const [inventory,  setInventory]  = useState([]);
  const [expenses,   setExpenses]   = useState([]);
  const [dailyLog,   setDailyLog]   = useState([]);
  const [auditLog,   setAuditLog]   = useState([]);
  const [users,      setUsers]      = useState([]);
  const [dayOp,      setDayOp]      = useState(null);
  const [monthlyExp, setMonthlyExp] = useState([]);
  const [cubetazos,  setCubetazosState] = useState({aguardiente:false,cerveza:false});
  const [credits,    setCredits]    = useState([]);
  const [categories, setCategories] = useState(INIT_CATS);
  // loading: cuenta cuántas colecciones han respondido (necesitamos 8)
  const [loadedCount, setLoadedCount] = useState(0);
  const [session,    setSession]    = useState(()=>{
    try{ return localStorage.getItem("bar_session")||null; }catch{ return null; }
  });

  const loading = loadedCount < 8;

  const markLoaded = useCallback(()=>{
    setLoadedCount(prev => prev < 8 ? prev+1 : prev);
  },[]);

  useEffect(()=>{
    const unsubs=[];
    let initialized = {inv:false, users:false};

    // ── Config global (dayOp, cubetazos, categories) ──────────
    unsubs.push(onSnapshot(doc(db,"config","global"), snap=>{
      if(snap.exists()){
        const d=snap.data();
        // Siempre actualizar dayOp en tiempo real
        setDayOp(d.dayOp !== undefined ? d.dayOp : null);
        if(d.cubetazos!==undefined) setCubetazosState(d.cubetazos);
        if(d.categories!==undefined) setCategories(d.categories);
      } else {
        setDayOp(null);
      }
      markLoaded();
    }));

    // ── Mesas (tiempo real) ───────────────────────────────────
    TABLE_IDS.forEach(id=>{
      unsubs.push(onSnapshot(doc(db,"tables",id), snap=>{
        const data = snap.exists() ? snap.data() : emptyTable(id);
        setTables(prev=>({...prev,[id]:data}));
      }));
    });
    markLoaded(); // contamos mesas como un grupo

    // ── Inventario ────────────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"inventory"), snap=>{
      if(snap.empty && !initialized.inv){
        initialized.inv = true;
        const batch=writeBatch(db);
        INIT_INV.forEach(item=>batch.set(doc(db,"inventory",item.id),item));
        batch.commit();
      } else if(!snap.empty) {
        initialized.inv = true;
        setInventory(snap.docs.map(d=>d.data()));
      }
      markLoaded();
    }));

    // ── Usuarios ──────────────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"users"), snap=>{
      if(snap.empty && !initialized.users){
        initialized.users = true;
        const batch=writeBatch(db);
        INIT_USERS.forEach(u=>batch.set(doc(db,"users",u.id),u));
        batch.commit();
      } else if(!snap.empty) {
        initialized.users = true;
        setUsers(snap.docs.map(d=>d.data()));
      }
      markLoaded();
    }));

    // ── Gastos ────────────────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"expenses"), snap=>{
      setExpenses(snap.docs.map(d=>d.data()));
      markLoaded();
    }));

    // ── Gastos mensuales ──────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"monthlyExp"), snap=>{
      setMonthlyExp(snap.docs.map(d=>d.data()));
      markLoaded();
    }));

    // ── Créditos ──────────────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"credits"), snap=>{
      setCredits(snap.docs.map(d=>d.data()).sort((a,b)=>(b.date||"").localeCompare(a.date||"")));
      markLoaded();
    }));

    // ── Log diario ────────────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"dailyLog"), snap=>{
      setDailyLog(snap.docs.map(d=>d.data()).sort((a,b)=>(a.date||"").localeCompare(b.date||"")));
      markLoaded();
    }));

    // ── Auditoría ─────────────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"auditLog"), snap=>{
      setAuditLog(snap.docs.map(d=>d.data()).sort((a,b)=>(b.at||"").localeCompare(a.at||"")));
    }));

    return ()=>unsubs.forEach(u=>u());
  },[]);

  // ── Auth ──────────────────────────────────────────────────────
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

  // ── Config global ─────────────────────────────────────────────
  const setCubetazos = useCallback((updater)=>{
    setCubetazosState(prev=>{
      const next=typeof updater==="function"?updater(prev):updater;
      setDoc(doc(db,"config","global"),{cubetazos:next},{merge:true});
      return next;
    });
  },[]);

  const setDayOpFB = useCallback((value)=>{
    const next=typeof value==="function"?value(dayOp):value;
    setDoc(doc(db,"config","global"),{dayOp:next},{merge:true});
  },[dayOp]);

  const saveCategories = useCallback((cats)=>{
    setCategories(cats);
    setDoc(doc(db,"config","global"),{categories:cats},{merge:true});
  },[]);

  // ── Mesas ─────────────────────────────────────────────────────
  const saveTable = useCallback(async(id,data)=>{
    await setDoc(doc(db,"tables",id),data);
  },[]);

  const openTable = useCallback(async(id,userName,nowTime)=>{
    await setDoc(doc(db,"tables",id),{
      ...emptyTable(id), status:"open",
      openedAt:nowTime, openedBy:userName
    });
  },[]);

  // ── Inventario ────────────────────────────────────────────────
  const adjustInv = useCallback(async(name,delta)=>{
    const snap=await getDocs(collection(db,"inventory"));
    const item=snap.docs.find(d=>d.data().name===name);
    if(item){
      const cur=item.data().stock||0;
      await updateDoc(doc(db,"inventory",item.id),{stock:Math.max(0,cur+delta)});
    }
  },[]);

  const saveInventoryItem = useCallback(async(item)=>{
    await setDoc(doc(db,"inventory",item.id),item);
  },[]);

  const deleteInventoryItem = useCallback(async(id)=>{
    await deleteDoc(doc(db,"inventory",id));
  },[]);

  // ── Usuarios ──────────────────────────────────────────────────
  const saveUser = useCallback(async(user)=>{
    await setDoc(doc(db,"users",user.id),user);
  },[]);

  const deleteUserFB = useCallback(async(id)=>{
    await deleteDoc(doc(db,"users",id));
  },[]);

  // ── Gastos ────────────────────────────────────────────────────
  const addExpense = useCallback(async(expense)=>{
    await setDoc(doc(db,"expenses",expense.id),expense);
  },[]);

  const deleteExpense = useCallback(async(id)=>{
    await deleteDoc(doc(db,"expenses",id));
  },[]);

  const clearExpenses = useCallback(async()=>{
    const snap=await getDocs(collection(db,"expenses"));
    if(snap.empty) return;
    const batch=writeBatch(db);
    snap.docs.forEach(d=>batch.delete(d.ref));
    await batch.commit();
  },[]);

  // ── Gastos mensuales ──────────────────────────────────────────
  const addMonthlyExp = useCallback(async(exp)=>{
    await setDoc(doc(db,"monthlyExp",exp.id),exp);
  },[]);

  const deleteMonthlyExp = useCallback(async(id)=>{
    await deleteDoc(doc(db,"monthlyExp",id));
  },[]);

  // ── Créditos ──────────────────────────────────────────────────
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

  // ── Auditoría ─────────────────────────────────────────────────
  const addAudit = useCallback(async(entry)=>{
    await setDoc(doc(db,"auditLog",entry.id),entry);
  },[]);

  // ── Log diario ────────────────────────────────────────────────
  const saveDailyLog = useCallback(async(entry)=>{
    await setDoc(doc(db,"dailyLog",entry.date),entry);
  },[]);

  const clearDailyLog = useCallback(async()=>{
    const snap=await getDocs(collection(db,"dailyLog"));
    if(snap.empty) return;
    const batch=writeBatch(db);
    snap.docs.forEach(d=>batch.delete(d.ref));
    await batch.commit();
  },[]);

  return {
    tables, inventory, expenses, dailyLog, auditLog,
    users, dayOp, monthlyExp, cubetazos, credits, categories, loading,
    session, currentUser,
    login, logout,
    setCubetazos, setDayOp:setDayOpFB, saveCategories,
    saveTable, openTable,
    adjustInv, saveInventoryItem, deleteInventoryItem,
    saveUser, deleteUserFB,
    addExpense, deleteExpense, clearExpenses,
    addMonthlyExp, deleteMonthlyExp,
    addCredit, payCredit, deleteCredit,
    addAudit, saveDailyLog, clearDailyLog,
  };
}
