// src/useFirebase.js
import { useState, useEffect, useCallback } from "react";
import {
  doc, collection, onSnapshot, setDoc, updateDoc,
  deleteDoc, writeBatch, getDocs, increment
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
  {id:"i22",name:"Michelada de Cerveza",           cat:"Micheladas",  stock:99,min:0, unit:"und.",cost:0, price:6000},
  {id:"i23",name:"Michelada de Soda",              cat:"Micheladas",  stock:99,min:0, unit:"und.",cost:0, price:5000},
  {id:"i28",name:"Michelada Ginger Ale",           cat:"Micheladas",  stock:99,min:0, unit:"und.",cost:0, price:5000},
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
  const [tables,        setTables]        = useState({});
  const [inventory,     setInventory]     = useState([]);
  const [expenses,      setExpenses]      = useState([]);
  const [dailyLog,      setDailyLog]      = useState([]);
  const [auditLog,      setAuditLog]      = useState([]);
  const [users,         setUsers]         = useState([]);
  const [dayOp,         setDayOpState]    = useState(null);
  const [monthlyExp,    setMonthlyExp]    = useState([]);
  const [cubetazos,     setCubetazosState]= useState({});
  const [promociones,   setPromociones]   = useState([]);
  const [credits,       setCredits]       = useState([]);
  const [categories,    setCategories]    = useState(INIT_CATS);
  const [loadedCount,   setLoadedCount]   = useState(0);
  const [inventoryMap,  setInventoryMap]  = useState({});
  const [session,       setSession]       = useState(()=>{
    try{ return localStorage.getItem("bar_session")||null; }catch{ return null; }
  });

  // Reducimos el threshold a 6 para no bloquear si alguna colección tarda
  const loading = loadedCount < 6;
  const markLoaded = useCallback(()=>{
    setLoadedCount(prev => prev+1);
  },[]);

  useEffect(()=>{ 
    const unsubs=[];
    // Flags para evitar doble inicialización en la misma sesión
    let invInitialized = false;
    let usersInitialized = false;

    // ── Config global ─────────────────────────────────────────
    unsubs.push(onSnapshot(doc(db,"config","global"), snap=>{
      if(snap.exists()){
        const d=snap.data();
        setDayOpState(d.dayOp !== undefined ? d.dayOp : null);
        if(d.cubetazos!==undefined) setCubetazosState(d.cubetazos);
        if(d.categories!==undefined) setCategories(d.categories);
      } else {
        setDayOpState(null);
        setDoc(doc(db,"config","global"),{
          categories: INIT_CATS, cubetazos: {}, dayOp: null
        },{merge:true});
      }
      markLoaded();
    }));

    // ── Mesas ─────────────────────────────────────────────────
    TABLE_IDS.forEach(id=>{
      unsubs.push(onSnapshot(doc(db,"tables",id), snap=>{
        const data = snap.exists() ? snap.data() : emptyTable(id);
        setTables(prev=>({...prev,[id]:data}));
      }));
    });
    markLoaded();

    // ── Inventario ────────────────────────────────────────────
    // SOLO inicializa si la colección está vacía Y es la primera vez en esta sesión
    // Nunca sobreescribe datos existentes
    unsubs.push(onSnapshot(collection(db,"inventory"), snap=>{
      if(!snap.empty){
        // HAY datos — simplemente cargarlos, NUNCA tocarlos
        invInitialized = true;
        const items = snap.docs.map(d=>d.data());
        setInventory(items);
        const map = {};
        snap.docs.forEach(d=>{ map[d.data().name] = d.id; });
        setInventoryMap(map);
        markLoaded();
      } else if(!invInitialized){
        // Colección vacía Y primera vez — inicializar datos base
        invInitialized = true;
        const batch=writeBatch(db);
        INIT_INV.forEach(item=>batch.set(doc(db,"inventory",item.id),item));
        batch.commit().catch(console.error);
        // markLoaded se llamará cuando el snapshot regrese con datos
        markLoaded();
      }
      // Si invInitialized=true y snap.empty, no hacer nada (evita loop)
    }));

    // ── Usuarios ──────────────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"users"), snap=>{
      if(!snap.empty){
        usersInitialized = true;
        setUsers(snap.docs.map(d=>d.data()));
        markLoaded();
      } else if(!usersInitialized){
        usersInitialized = true;
        const batch=writeBatch(db);
        INIT_USERS.forEach(u=>batch.set(doc(db,"users",u.id),u));
        batch.commit().catch(console.error);
        markLoaded();
      }
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

    // ── Promociones ───────────────────────────────────────────
    unsubs.push(onSnapshot(collection(db,"promociones"), snap=>{
      setPromociones(snap.docs.map(d=>d.data()));
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

  const setDayOp = useCallback((value)=>{
    const next=typeof value==="function"?value(null):value;
    setDoc(doc(db,"config","global"),{dayOp:next},{merge:true});
  },[]);

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

  // ── Inventario ATÓMICO ────────────────────────────────────────
  const adjustInv = useCallback(async(name, delta)=>{
    const itemId = inventoryMap[name];
    if(itemId){
      await updateDoc(doc(db,"inventory",itemId),{ stock: increment(delta) });
      return;
    }
    const snap = await getDocs(collection(db,"inventory"));
    const found = snap.docs.find(d=>d.data().name===name);
    if(found) await updateDoc(doc(db,"inventory",found.id),{ stock: increment(delta) });
  },[inventoryMap]);

  const adjustInvBatch = useCallback(async(items)=>{
    if(!items || items.length===0) return;
    const batch = writeBatch(db);
    const missing = [];
    for(const {name, delta} of items){
      const itemId = inventoryMap[name];
      if(itemId){
        batch.update(doc(db,"inventory",itemId),{ stock: increment(delta) });
      } else {
        missing.push({name, delta});
      }
    }
    if(missing.length > 0){
      const snap = await getDocs(collection(db,"inventory"));
      for(const {name, delta} of missing){
        const found = snap.docs.find(d=>d.data().name===name);
        if(found) batch.update(doc(db,"inventory",found.id),{ stock: increment(delta) });
      }
    }
    await batch.commit();
  },[inventoryMap]);

  const saveInventoryItem = useCallback(async(item)=>{
    await setDoc(doc(db,"inventory",item.id),item);
  },[]);

  const deleteInventoryItem = useCallback(async(id)=>{
    await deleteDoc(doc(db,"inventory",id));
  },[]);

  // ── Promociones ───────────────────────────────────────────────
  const savePromocion = useCallback(async(promo)=>{
    await setDoc(doc(db,"promociones",promo.id),promo);
  },[]);

  const deletePromocion = useCallback(async(id)=>{
    await deleteDoc(doc(db,"promociones",id));
  },[]);

  const togglePromocion = useCallback(async(id, activo)=>{
    await updateDoc(doc(db,"promociones",id),{activo});
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
    tables, inventory, inventoryMap, expenses, dailyLog, auditLog,
    users, dayOp, monthlyExp, cubetazos, promociones, credits, categories, loading,
    session, currentUser,
    login, logout,
    setCubetazos, setDayOp, saveCategories,
    saveTable, openTable,
    adjustInv, adjustInvBatch, saveInventoryItem, deleteInventoryItem,
    savePromocion, deletePromocion, togglePromocion,
    saveUser, deleteUserFB,
    addExpense, deleteExpense, clearExpenses,
    addMonthlyExp, deleteMonthlyExp,
    addCredit, payCredit, deleteCredit,
    addAudit, saveDailyLog, clearDailyLog,
  };
}
