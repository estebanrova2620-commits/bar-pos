import { useState, useEffect, useCallback } from "react";
import { useFirebaseData } from "./useFirebase";

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════
const fmt = (n) => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n||0);
const genId = () => Math.random().toString(36).slice(2,9);
const now = () => new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"});
const today = () => {
  const d = new Date();
  // Usar hora local (Colombia UTC-5), no UTC
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};
const DIAS  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];


// ── Datos iniciales para tablas ────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// DATOS INICIALES
// ═══════════════════════════════════════════════════════════════
const MENU = [
  {id:"m1", name:"Águila",                         cat:"Cervezas",    price:4000,  emoji:"🍺"},
  {id:"m2", name:"Águila Light",                   cat:"Cervezas",    price:4000,  emoji:"🍺"},
  {id:"m3", name:"Poker",                          cat:"Cervezas",    price:4000,  emoji:"🍺"},
  {id:"m4", name:"Costeña",                        cat:"Cervezas",    price:4000,  emoji:"🍺"},
  {id:"m5", name:"Heineken",                       cat:"Cervezas",    price:4000,  emoji:"🍺"},
  {id:"m6", name:"Coronita",                       cat:"Cervezas",    price:4500,  emoji:"🍺"},
  {id:"m7", name:"Club Colombia Roja",             cat:"Cervezas",    price:4500,  emoji:"🍺"},
  {id:"m8", name:"Club Colombia Dorada",           cat:"Cervezas",    price:4500,  emoji:"🍺"},
  {id:"m9", name:"Redds",                          cat:"Cervezas",    price:5000,  emoji:"🍺"},
  {id:"m10",name:"3 Cordilleras",                  cat:"Cervezas",    price:5000,  emoji:"🍺"},
  {id:"m11",name:"Aguardiente Amarillo Botella",   cat:"Aguardiente", price:85000, emoji:"🥃", includesAgua:true},
  {id:"m12",name:"Antioqueño Tapa Azul Botella",   cat:"Aguardiente", price:85000, emoji:"🥃", includesAgua:true},
  {id:"m13",name:"Antioqueño Tapa Verde Botella",  cat:"Aguardiente", price:85000, emoji:"🥃", includesAgua:true},
  {id:"m14",name:"Aguardiente Amarillo ½ Botella", cat:"Aguardiente", price:45000, emoji:"🥃", includesAgua:true},
  {id:"m15",name:"Antioqueño Tapa Azul ½ Botella", cat:"Aguardiente", price:45000, emoji:"🥃", includesAgua:true},
  {id:"m16",name:"Antioqueño Tapa Verde ½ Botella",cat:"Aguardiente", price:45000, emoji:"🥃", includesAgua:true},
  {id:"m17",name:"Soda Bretaña",                   cat:"Bebidas",     price:4000,  emoji:"🥤"},
  {id:"m18",name:"Coca Cola",                      cat:"Bebidas",     price:4000,  emoji:"🥤"},
  {id:"m19",name:"Gatorade",                       cat:"Bebidas",     price:5000,  emoji:"🥤"},
  {id:"m20",name:"Ginger Ale",                     cat:"Bebidas",     price:4000,  emoji:"🥤"},
  {id:"m21",name:"Agua",                           cat:"Bebidas",     price:3000,  emoji:"💧"},
  // Micheladas — requieren selección de base
  {id:"m22",name:"Michelada de Cerveza",           cat:"Micheladas",  price:6000,  emoji:"🍺", requiresCerveza:true},
  {id:"m23",name:"Michelada de Soda",              cat:"Micheladas",  price:5000,  emoji:"🍹", descuentaInv:"Soda Bretaña"},
  {id:"m28",name:"Michelada Ginger Ale",           cat:"Micheladas",  price:5000,  emoji:"🍹", descuentaInv:"Ginger Ale"},
  {id:"m24",name:"Detoditos",                      cat:"Snacks",      price:4000,  emoji:"🍟"},
  {id:"m25",name:"NatuChips",                      cat:"Snacks",      price:4000,  emoji:"🍟"},
  {id:"m26",name:"Papas",                          cat:"Snacks",      price:4000,  emoji:"🍟"},
  {id:"m27",name:"Bombom",                         cat:"Snacks",      price:1000,  emoji:"🍬"},
  // Cubetazos — solo visibles cuando el admin los habilita
  {id:"cub1",name:"Cubetazo Aguardiente",          cat:"Cubetazos",   price:95000, emoji:"🪣", esCubetazo:"aguardiente"},
  {id:"cub2",name:"Cubetazo Cerveza",              cat:"Cubetazos",   price:20000, emoji:"🪣", esCubetazo:"cerveza"},
];

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
  {id:"i22",name:"Michelada de Cerveza",           cat:"Micheladas",  stock:50,min:10,unit:"und.",cost:3200, price:6000},
  {id:"i23",name:"Michelada de Soda",              cat:"Micheladas",  stock:50,min:10,unit:"und.",cost:2500, price:5000},
  {id:"i24",name:"Detoditos",                      cat:"Snacks",      stock:20,min:5, unit:"und.",cost:2000, price:4000},
  {id:"i25",name:"NatuChips",                      cat:"Snacks",      stock:20,min:5, unit:"und.",cost:2000, price:4000},
  {id:"i26",name:"Papas",                          cat:"Snacks",      stock:20,min:5, unit:"und.",cost:2000, price:4000},
  {id:"i27",name:"Bombom",                         cat:"Snacks",      stock:30,min:10,unit:"und.",cost:500,  price:1000},
];

const INIT_USERS = [
  {id:"u1",username:"admin",password:"admin123",role:"admin",  name:"Administrador",active:true},
  {id:"u2",username:"mesero1",password:"bar2024", role:"mesero",name:"Mesero 1",     active:true},
];

// ═══════════════════════════════════════════════════════════════
// PLANO — basado en imagen proporcionada por Esteban
// viewBox 0 0 130 100
// ═══════════════════════════════════════════════════════════════
const LAYOUT = [
  // Fila superior
  {id:"T9", label:"9",  x:4,  y:6,  w:16, h:13, zone:"interior"},  // esquina sup izq
  // Barra arriba centro-derecha (solo visual, no mesa)
  // Fila media
  {id:"T7", label:"7",  x:4,  y:28, w:16, h:13, zone:"interior"},
  {id:"T8", label:"8",  x:26, y:28, w:16, h:13, zone:"interior"},
  {id:"T4", label:"4",  x:48, y:28, w:16, h:13, zone:"interior"},
  {id:"T3", label:"3",  x:70, y:28, w:16, h:13, zone:"interior"},
  {id:"T2", label:"2",  x:96, y:28, w:16, h:13, zone:"exterior"}, // derecha separada
  // Fila inferior
  {id:"T5", label:"5",  x:4,  y:50, w:16, h:13, zone:"interior"},
  {id:"T6", label:"6",  x:26, y:50, w:16, h:13, zone:"interior"},
  {id:"T10",label:"10", x:48, y:50, w:16, h:13, zone:"interior"},
  {id:"T1", label:"1",  x:70, y:50, w:16, h:13, zone:"interior"},
  // Mesa 11 — esquina inferior izquierda
  {id:"T11",label:"11", x:4,  y:72, w:16, h:13, zone:"interior"},
];

const initTables = () => {
  const t={};
  LAYOUT.forEach(l=>{t[l.id]={id:l.id,label:l.label,status:"free",rounds:[],discount:0,payments:[],openedAt:null,openedBy:null,sessions:[]};});
  return t;
};

// ═══════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════
const inp = {background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"#e8e0d0",padding:"8px 11px",fontSize:13,outline:"none",boxSizing:"border-box",width:"100%"};
const qBtn = {background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",color:"#e8e0d0",borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"};
const btnS = (c="amber")=>{
  const m={amber:{bg:"#f5c842",bd:"transparent",cl:"#0a0a0f"},red:{bg:"rgba(248,113,113,0.14)",bd:"rgba(248,113,113,0.35)",cl:"#f87171"},blue:{bg:"rgba(96,165,250,0.14)",bd:"rgba(96,165,250,0.35)",cl:"#60a5fa"},purple:{bg:"rgba(167,139,250,0.14)",bd:"rgba(167,139,250,0.35)",cl:"#a78bfa"},green:{bg:"rgba(52,211,153,0.14)",bd:"rgba(52,211,153,0.35)",cl:"#34d399"},ghost:{bg:"rgba(255,255,255,0.06)",bd:"rgba(255,255,255,0.14)",cl:"#888"},dark:{bg:"rgba(255,255,255,0.04)",bd:"rgba(255,255,255,0.08)",cl:"#666"}};
  const s=m[c]||m.amber;
  return {background:s.bg,border:`1px solid ${s.bd}`,color:s.cl,borderRadius:9,padding:"7px 14px",cursor:"pointer",fontSize:13,fontWeight:600};
};
const card=(x={})=>({background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"11px 13px",marginBottom:8,...x});

// ═══════════════════════════════════════════════════════════════
// EXCEL EXPORT (sin dependencias externas — genera CSV descargable
// y un HTML con tablas para abrir en Excel)
// ═══════════════════════════════════════════════════════════════
function exportToExcel(data, filename) {
  // Genera un archivo HTML que Excel abre nativamente con tablas y colores
  const esc = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const rows = data.map(row =>
    "<tr>" + row.map((cell,i) =>
      `<td style="border:1px solid #ddd;padding:6px 10px;${i===0?"font-weight:bold;background:#f5f5f5;":""}">${esc(cell)}</td>`
    ).join("") + "</tr>"
  ).join("");

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><style>
  body{font-family:Calibri,Arial;font-size:11pt;}
  table{border-collapse:collapse;width:100%;}
  th{background:#1a1a2e;color:white;padding:8px 12px;border:1px solid #333;font-weight:bold;}
  td{border:1px solid #ddd;padding:6px 10px;}
  .total{background:#fff3cd;font-weight:bold;}
  h2{color:#1a1a2e;margin-top:20px;}
</style></head><body>
<h2>📊 ${esc(filename)}</h2>
<p>Generado: ${new Date().toLocaleString("es-CO")}</p>
<table><tbody>${rows}</tbody></table>
</body></html>`;

  const blob = new Blob([html],{type:"application/vnd.ms-excel;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=`${filename}.xls`; a.click();
  URL.revokeObjectURL(url);
}

function buildNightReport(report, dateStr, username) {
  // Cruzar productos vendidos con inventario para obtener costos
  const invMap = {};
  (report.inventory||[]).forEach(i=>{ invMap[i.name]=i; });

  const rows = [
    ["REPORTE DE CIERRE — "+dateStr,"","","","","",""],
    ["Usuario", username, "Fecha", dateStr,"","",""],
    ["","","","","","",""],
    ["RESUMEN FINANCIERO","","","","","",""],
    ["Ventas brutas",     fmt(report.gross),    "","","","",""],
    ["Efectivo recibido", fmt(report.cash),     "","","","",""],
    ["Transferencias",    fmt(report.transfer), "","","","",""],
    ["Total gastos",      fmt(report.totalExp), "","","","",""],
    ["BASE DE CAJA",      fmt(report.baseCash||0),"","","","",""],
    ["RESULTADO NETO",    fmt(report.net),       "","","","",""],
    ["","","","","","",""],
    ["VENTAS POR PRODUCTO","UNIDADES","PRECIO VENTA","VALOR BRUTO","COSTO UNIT.","COSTO TOTAL","GANANCIA NETA"],
    ...(report.byProd||[]).map(p=>{
      const inv = invMap[p.name];
      const costoUnit = inv?.cost || 0;
      const costoTotal = costoUnit * p.units;
      const ganancia = p.total - costoTotal;
      const margen = p.total>0 ? Math.round((ganancia/p.total)*100) : 0;
      return [
        p.name,
        p.units,
        fmt(inv?.price || (p.total/p.units)),
        fmt(p.total),
        fmt(costoUnit),
        fmt(costoTotal),
        fmt(ganancia)+" ("+margen+"%)"
      ];
    }),
    ["","","","","","",""],
    ["GASTOS DEL DÍA","CATEGORÍA","MONTO","","","",""],
    ...(report.expensesList||[]).map(e=>[e.desc, e.cat, fmt(e.amount),"","","",""]),
    ["","","","","","",""],
    ["INVENTARIO AL CIERRE","STOCK","MÍNIMO","COSTO UNIT.","PRECIO VENTA","VALOR EN COSTO",""],
    ...(report.inventory||[]).map(i=>[
      i.name, i.stock+" "+i.unit, i.min,
      fmt(i.cost), fmt(i.price||0),
      fmt((i.cost||0)*i.stock), ""
    ])
  ];
  return rows;
}

function buildMonthlyReport(dailyLog, inventory, monthlyExp) {
  const totalGross   = dailyLog.reduce((s,d)=>s+d.gross,0);
  const totalExpDay  = dailyLog.reduce((s,d)=>s+(d.expenses||0),0);
  const totalExpMon  = (monthlyExp||[]).reduce((s,e)=>s+(e.amount||0),0);
  const totalExp     = totalExpDay + totalExpMon;

  // Ventas por producto acumuladas
  const pm={};
  dailyLog.forEach(d=>Object.entries(d.byProd||{}).forEach(([name,v])=>{
    if(!pm[name]) pm[name]={units:0,total:0};
    pm[name].units+=v.units; pm[name].total+=v.total;
  }));

  // Mapa de inventario para costos
  const invMap={};
  inventory.forEach(i=>{invMap[i.name]=i;});

  const rows = [
    ["REPORTE MENSUAL","","","","","",""],
    ["Generado", new Date().toLocaleString("es-CO"),"","","","",""],
    ["","","","","","",""],
    ["RESUMEN DEL MES","","","","","",""],
    ["Total vendido",        fmt(totalGross),        "","","","",""],
    ["Gastos operación/día", fmt(totalExpDay),       "","","","",""],
    ["Gastos fijos del mes", fmt(totalExpMon),       "","","","",""],
    ["Total gastos",         fmt(totalExp),          "","","","",""],
    ["RESULTADO NETO",       fmt(totalGross-totalExp),"","","","",""],
    ["Noches registradas",   dailyLog.length,        "","","","",""],
    ["","","","","","",""],
    ["DETALLE POR NOCHE","DÍA","VENTAS","EFECTIVO","TRANSFERENCIA","GASTOS","NETO"],
    ...dailyLog.map(d=>[d.date, d.dow, fmt(d.gross), fmt(d.cash), fmt(d.transfer), fmt(d.expenses||0), fmt(d.gross-(d.expenses||0))]),
    ["","","","","","",""],
    ["GASTOS FIJOS DEL MES","CATEGORÍA","MONTO","","","",""],
    ...(monthlyExp||[]).map(e=>[e.desc, e.cat, fmt(e.amount),"","","",""]),
    ["","","","","","",""],
    ["RANKING DE PRODUCTOS","UNIDADES","VALOR BRUTO","COSTO UNIT.","COSTO TOTAL","GANANCIA NETA","MARGEN %"],
    ...Object.entries(pm).sort((a,b)=>b[1].total-a[1].total).map(([name,v])=>{
      const inv = invMap[name];
      const costoUnit  = inv?.cost || 0;
      const costoTotal = costoUnit * v.units;
      const ganancia   = v.total - costoTotal;
      const margen     = v.total>0 ? Math.round((ganancia/v.total)*100) : 0;
      return [name, v.units, fmt(v.total), fmt(costoUnit), fmt(costoTotal), fmt(ganancia), margen+"%"];
    }),
    ["","","","","","",""],
    ["INVENTARIO AL CIERRE","STOCK","MÍNIMO","COSTO UNIT.","PRECIO VENTA","VALOR EN COSTO","MARGEN %"],
    ...inventory.map(i=>{
      const mg = i.price&&i.cost ? Math.round(((i.price-i.cost)/i.price)*100) : 0;
      return [i.name, i.stock+" "+i.unit, i.min, fmt(i.cost), fmt(i.price||0), fmt((i.cost||0)*i.stock), mg+"%"];
    })
  ];
  return rows;
}

// ═══════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function BarApp() {
  const fb = useFirebaseData();
  const {
    tables, inventory, expenses, dailyLog, auditLog,
    users, dayOp, monthlyExp, cubetazos, credits, categories, loading,
    currentUser: user,
    login, logout,
    setCubetazos, setDayOp: setDayOpFB, saveCategories,
    saveTable, openTable: openTableFB,
    adjustInv: adjustInvFB, saveInventoryItem, deleteInventoryItem,
    saveUser, deleteUserFB,
    addExpense, deleteExpense, clearExpenses,
    addMonthlyExp, deleteMonthlyExp,
    addCredit, payCredit, deleteCredit,
    addAudit, saveDailyLog, clearDailyLog,
  } = fb;

  // ── UI state ──────────────────────────────────────────────
  const [view,     setView]     = useState("floor");
  const [activeId, setActiveId] = useState(null);
  const [nightRpt, setNightRpt] = useState(null);

  const isAdmin = user?.role==="admin";

  // ── Auditoría ─────────────────────────────────────────────
  const audit = useCallback((action,detail="")=>{
    const entry={id:genId(),at:`${today()} ${now()}`,user:user?.name||"?",action,detail};
    addAudit(entry);
  },[user,addAudit]);

  // ── Calc mesa (desde rondas) ──────────────────────────────
  const calc = (t) => {
    const items = (t.rounds||[]).flatMap(r=>r.items);
    const sub  = items.reduce((s,i)=>s+i.price*i.qty,0);
    const disc = Math.round(sub*(t.discount/100));
    const total = sub-disc;
    const paidIt = items.filter(i=>i.paid).reduce((s,i)=>s+i.price*i.qty,0);
    const paidPy = (t.payments||[]).reduce((s,p)=>s+p.amount,0);
    const paid = paidIt+paidPy;
    return {sub,disc,total,paid,pending:Math.max(0,total-paid)};
  };

  // ── Acciones de mesa ──────────────────────────────────────
  const adjustInv = useCallback((name,delta)=>{ adjustInvFB(name,delta); },[adjustInvFB]);

  const openTable = (id) => {
    openTableFB(id,user?.name||"?",now());
    audit("Abrir mesa",`Mesa ${tables[id]?.label}`);
  };

  // Agregar ítem a la ronda actual (última ronda abierta) o crear nueva
  // extraInv: array de nombres adicionales a descontar del inventario
  const addItemToRound = (tid, mi, extraInv=[]) => {
    // Descontar inventario principal
    adjustInv(mi.name,-1);
    // Descontar ítems extra (agua con aguardiente, cerveza con michelada, etc.)
    extraInv.forEach(name=>adjustInv(name,-1));

    const t=tables[tid];
    const rounds=[...(t.rounds||[])];
    let lastRound=rounds.length>0&&!rounds[rounds.length-1].closed?rounds[rounds.length-1]:null;
    if(!lastRound){lastRound={id:genId(),num:(rounds.length+1),time:now(),items:[],closed:false};rounds.push(lastRound);}
    const rIdx=rounds.length-1;
    const esEspecial=mi.requiresCerveza||mi.esCubetazo||extraInv.length>0;
    const ex=esEspecial?null:rounds[rIdx].items.find(i=>i.menuId===mi.id&&!i.paid);
    const displayName=mi.name+(extraInv.length>0?` (+ ${extraInv.join(", ")})`:"");
    rounds[rIdx]={...rounds[rIdx],items:ex?rounds[rIdx].items.map(i=>i.id===ex.id?{...i,qty:i.qty+1}:i):[...rounds[rIdx].items,{id:genId(),menuId:mi.id,name:displayName,price:mi.price,qty:1,paid:false,payMethod:null,addedBy:user?.name}]};
    saveTable(tid,{...t,rounds});
  };

  const addItem = (tid,mi) => addItemToRound(tid,mi,[]);

  const closeRound=(tid)=>{
    const t=tables[tid];
    const rounds=(t.rounds||[]).map((r,i)=>i===t.rounds.length-1?{...r,closed:true}:r);
    saveTable(tid,{...t,rounds});
  };

  const updQty=(tid,ridx,iid,d)=>{
    const t=tables[tid];const rounds=[...(t.rounds||[])];
    const item=rounds[ridx]?.items.find(i=>i.id===iid);
    if(!item||item.paid)return;
    if(d<0)adjustInv(item.name,1);
    const nq=item.qty+d;
    rounds[ridx]={...rounds[ridx],items:nq<=0?rounds[ridx].items.filter(i=>i.id!==iid):rounds[ridx].items.map(i=>i.id===iid?{...i,qty:nq}:i)};
    saveTable(tid,{...t,rounds});
  };

  const markPaid=(tid,ridx,iid,method)=>{
    const t=tables[tid];const rounds=[...(t.rounds||[])];
    rounds[ridx]={...rounds[ridx],items:rounds[ridx].items.map(i=>i.id===iid?{...i,paid:true,payMethod:method,paidBy:user?.name}:i)};
    saveTable(tid,{...t,rounds});
  };

  const addPayment=(tid,amount,method,note)=>{
    const t=tables[tid];
    const payments=[...(t.payments||[]),{id:genId(),amount:Number(amount),method,note,at:now(),by:user?.name}];
    saveTable(tid,{...t,payments});
  };

  const setDiscount=(tid,pct)=>{
    const t=tables[tid];
    saveTable(tid,{...t,discount:Math.min(100,Math.max(0,Number(pct)))});
    audit("Descuento",`Mesa ${t?.label} — ${pct}%`);
  };

  const closeTable=(tid)=>{
    const t=tables[tid];
    const allItems=(t.rounds||[]).flatMap(r=>r.items||[]);
    const totalVenta=allItems.reduce((s,i)=>s+i.price*i.qty,0);
    const totalEfectivo=allItems.filter(i=>i.paid&&i.payMethod==="efectivo").reduce((s,i)=>s+i.price*i.qty,0)
      +(t.payments||[]).filter(p=>p.method==="efectivo").reduce((s,p)=>s+p.amount,0);
    const totalTransferencia=allItems.filter(i=>i.paid&&i.payMethod==="transferencia").reduce((s,i)=>s+i.price*i.qty,0)
      +(t.payments||[]).filter(p=>p.method==="transferencia").reduce((s,p)=>s+p.amount,0);
    const sess={
      rounds:t.rounds,
      payments:t.payments,
      discount:t.discount,
      openedAt:t.openedAt,
      openedBy:t.openedBy,
      closedAt:now(),
      closedBy:user?.name,
      totalVenta,totalEfectivo,totalTransferencia,
    };
    // Guardar detalle en auditoría
    const auditDetail={
      mesa:t.label,
      openedAt:t.openedAt,openedBy:t.openedBy,
      closedAt:now(),closedBy:user?.name,
      totalVenta,totalEfectivo,totalTransferencia,
      rounds:t.rounds,payments:t.payments,
    };
    const auditEntry={
      id:genId(),
      at:`${today()} ${now()}`,
      user:user?.name||"?",
      action:"Cerrar mesa",
      detail:`Mesa ${t.label} — ${fmt(totalVenta)}`,
      tableDetail:auditDetail,
    };
    addAudit(auditEntry);
    // Preservar sesiones anteriores de la mesa
    saveTable(tid,{
      id:tid,label:t.label,status:"free",
      rounds:[],discount:0,payments:[],
      openedAt:null,openedBy:null,
      sessions:[...(t.sessions||[]),sess],
    });
    setActiveId(null);setView("floor");
  };

  // ── Crédito desde mesa ────────────────────────────────────
  const addCreditFromTable = (tid, clientName, items, total) => {
    const credit = {
      id: genId(),
      clientName,
      tableLabel: tables[tid]?.label,
      date: today(),
      time: now(),
      items,
      total,
      status: "pending",
      createdBy: user?.name,
      payMethod: null,
      paidBy: null,
      paidDate: null,
    };
    addCredit(credit);
    audit("Crédito registrado", `${clientName} — ${fmt(total)}`);
  };

  // ── Operación del día ─────────────────────────────────────
  const TABLE_IDS_=["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11"];
  const TABLE_LABELS_={T1:"1",T2:"2",T3:"3",T4:"4",T5:"5",T6:"6",T7:"7",T8:"8",T9:"9",T10:"10",T11:"11"};
  const emptyTable_=(id)=>({id,label:TABLE_LABELS_[id],status:"free",rounds:[],discount:0,payments:[],openedAt:null,openedBy:null,sessions:[]});

  const startDay=async(baseCash)=>{
    const d=new Date();
    const label=`${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} ${d.getFullYear()}`;
    setDayOpFB({date:today(),label,openedAt:now(),openedBy:user?.name,baseCash:Number(baseCash),status:"open"});
    TABLE_IDS_.forEach(id=>saveTable(id,emptyTable_(id)));
    await clearExpenses();
    audit("Iniciar día",label);
  };

  const closeDay=async()=>{
    let cash=0,transfer=0,allItems=[];
    Object.values(tables).forEach(t=>{
      // Sesiones ya cerradas — usar totales pre-calculados si existen
      (t.sessions||[]).forEach(s=>{
        if(s.totalEfectivo!==undefined){
          // Usar totales pre-calculados del cierre de mesa
          cash+=s.totalEfectivo||0;
          transfer+=s.totalTransferencia||0;
          // Recopilar items para byProd
          (s.rounds||[]).forEach(r=>(r.items||[]).forEach(i=>allItems.push(i)));
        } else {
          // Fallback: calcular desde items
          (s.rounds||[]).forEach(r=>(r.items||[]).forEach(i=>{
            allItems.push(i);
            if(i.paid){if(i.payMethod==="efectivo")cash+=i.price*i.qty;else if(i.payMethod==="transferencia")transfer+=i.price*i.qty;}
          }));
          (s.payments||[]).forEach(p=>{if(p.method==="efectivo")cash+=p.amount;else transfer+=p.amount;});
        }
      });
      // Mesa aún abierta al cerrar el día
      if(t.status==="open"){
        const items=(t.rounds||[]).flatMap(r=>r.items||[]);
        items.forEach(i=>{
          allItems.push(i);
          if(i.paid){if(i.payMethod==="efectivo")cash+=i.price*i.qty;else if(i.payMethod==="transferencia")transfer+=i.price*i.qty;}
        });
        (t.payments||[]).forEach(p=>{if(p.method==="efectivo")cash+=p.amount;else transfer+=p.amount;});
      }
    });
    const byP={};
    allItems.forEach(i=>{if(!byP[i.name])byP[i.name]={name:i.name,units:0,total:0};byP[i.name].units+=i.qty;byP[i.name].total+=i.price*i.qty;});
    const gross=cash+transfer;
    // Créditos pagados hoy
    const paidCreditsToday = credits.filter(c=>c.status==="paid"&&c.paidDate===today());
    const creditsCash = paidCreditsToday.filter(c=>c.payMethod==="efectivo").reduce((s,c)=>s+c.total,0);
    const creditsTransfer = paidCreditsToday.filter(c=>c.payMethod==="transferencia").reduce((s,c)=>s+c.total,0);
    const creditsTotal = creditsCash + creditsTransfer;
    // Créditos pendientes del día
    const pendingCredits = credits.filter(c=>c.status==="pending"&&c.date===today());
    const totalExp=expenses.reduce((s,e)=>s+(e.amount||0),0);
    const dateStr=dayOp?.date||today(),dow=DIAS[new Date().getDay()];
    const entry={date:dateStr,dow,label:dayOp?.label,gross,cash,transfer,baseCash:dayOp?.baseCash||0,expenses:totalExp,expensesList:[...expenses],net:gross+creditsTotal-totalExp,byProd:byP,inventory:[...inventory],openedBy:dayOp?.openedBy,closedBy:user?.name,openedAt:dayOp?.openedAt,closedAt:now(),creditsTotal,creditsCash,creditsTransfer,paidCreditsToday,pendingCredits};
    const byPArr=Object.values(byP).sort((a,b)=>b.total-a.total);
    await saveDailyLog(entry);
    // Limpiar gastos del día al cerrar — quedan guardados en el historial
    await clearExpenses();
    setDayOpFB({...dayOp,status:"closed",closedAt:now(),closedBy:user?.name});
    audit("Cerrar día",`${dateStr} — Total: ${fmt(gross)}`);
    setNightRpt({...entry,byProd:byPArr});
    setView("nightreport");
  };
  const nav = (v)=>{setView(v);setActiveId(null);};

  // ── Guard: no logueado ────────────────────────────────────
  if(loading) return (
    <div style={{fontFamily:"system-ui",background:"#09090f",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{fontSize:48}}>🍹</div>
      <p style={{color:"#f5c842",fontSize:18,fontWeight:700,letterSpacing:2}}>BAR POS</p>
      <p style={{color:"#555",fontSize:13}}>Conectando con la nube...</p>
    </div>
  );
  if (!user) return <LoginScreen onLogin={login}/>;

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#09090f",minHeight:"100vh",color:"#e8e0d0"}}>
      {/* Topbar */}
      <div style={{background:"#0e0c18",borderBottom:"1px solid rgba(245,200,66,0.12)",padding:"0 14px",display:"flex",alignItems:"center",justifyContent:"space-between",height:54,position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>🍹</span>
          <span style={{fontWeight:800,fontSize:15,color:"#f5c842",letterSpacing:2}}>BAR POS</span>
          {dayOp?.status==="open" && (
            <span style={{fontSize:10,color:"#34d399",background:"rgba(52,211,153,0.12)",border:"1px solid rgba(52,211,153,0.3)",borderRadius:6,padding:"2px 7px"}}>
              ● {dayOp.label}
            </span>
          )}
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          <NavBtn k="floor"   icon="🗺"  l="Mesas"     view={view} onClick={()=>nav("floor")}/>
          <NavBtn k="expenses" icon="💸" l="Gastos"    view={view} onClick={()=>nav("expenses")}/>
          <NavBtn k="credits"  icon="📒" l="Créditos"  view={view} onClick={()=>nav("credits")} color="blue"/>
          {isAdmin && <NavBtn k="inventory" icon="📦" l="Stock"     view={view} onClick={()=>nav("inventory")}/>}
          {isAdmin && <NavBtn k="monthly"   icon="📊" l="Mes"       view={view} onClick={()=>nav("monthly")} color="purple"/>}
          {isAdmin && <NavBtn k="users"     icon="👥" l="Usuarios"  view={view} onClick={()=>nav("users")} color="blue"/>}
          {isAdmin && <NavBtn k="audit"     icon="📋" l="Auditoría" view={view} onClick={()=>nav("audit")} color="dark"/>}
          {dayOp?.status==="open"
            ? <button onClick={closeDay} style={{...btnS("red"),padding:"5px 10px",fontSize:12}}>🔒 Cerrar día</button>
            : <button onClick={()=>nav("startday")} style={{...btnS("green"),padding:"5px 10px",fontSize:12}}>▶ Iniciar día</button>
          }
          <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:4}}>
            <span style={{fontSize:11,color:"#555"}}>{user.name}</span>
            <span style={{fontSize:10,color:isAdmin?"#f5c842":"#60a5fa",background:isAdmin?"rgba(245,200,66,0.1)":"rgba(96,165,250,0.1)",border:`1px solid ${isAdmin?"rgba(245,200,66,0.25)":"rgba(96,165,250,0.25)"}`,borderRadius:5,padding:"2px 6px"}}>{isAdmin?"admin":"mesero"}</span>
            <button onClick={logout} style={{...btnS("ghost"),padding:"4px 8px",fontSize:11}}>Salir</button>
          </div>
        </div>
      </div>

      <div style={{padding:14,maxWidth:700,margin:"0 auto"}}>
        {view==="startday"   && <StartDayView onStart={(base)=>{startDay(base);nav("floor");}} onBack={()=>nav("floor")} dayOp={dayOp}/>}
        {view==="floor"      && <FloorView tables={tables} layout={LAYOUT} calc={calc} dayOp={dayOp} onSelect={id=>{setActiveId(id);setView("table");}} onOpenAndSelect={id=>{openTable(id);setActiveId(id);setView("table");}}/>}
        {view==="table" && activeId && <TableView
          table={tables[activeId]} tableId={activeId}
          menu={inventory}
          calc={calc(tables[activeId])}
          inventory={inventory}
          cubetazos={cubetazos}
          onAdd={(mi,extraInv)=>addItemToRound(activeId,mi,extraInv||[])}
          onCloseRound={()=>closeRound(activeId)}
          onQty={(ridx,iid,d)=>updQty(activeId,ridx,iid,d)}
          onMarkPaid={(ridx,iid,m)=>markPaid(activeId,ridx,iid,m)}
          onAddPayment={(a,m,n)=>addPayment(activeId,a,m,n)}
          onAddCredit={(clientName,items,total)=>addCreditFromTable(activeId,clientName,items,total)}
          onDiscount={p=>setDiscount(activeId,p)}
          onClose={()=>closeTable(activeId)}
          onBack={()=>{setView("floor");setActiveId(null);}}
        />}
        {view==="expenses"               && <ExpensesView  expenses={expenses} addExpense={addExpense} deleteExpense={deleteExpense} monthlyExp={monthlyExp} addMonthlyExp={addMonthlyExp} deleteMonthlyExp={deleteMonthlyExp} audit={audit} isAdmin={isAdmin}/>}
        {view==="inventory"  && isAdmin  && <InventoryView inventory={inventory} saveInventoryItem={saveInventoryItem} deleteInventoryItem={deleteInventoryItem} categories={categories} saveCategories={saveCategories} cubetazos={cubetazos} setCubetazos={setCubetazos} audit={audit}/>}
        {view==="monthly"    && isAdmin  && <MonthlyView   dailyLog={dailyLog} inventory={inventory} monthlyExp={monthlyExp} credits={credits} onBack={()=>nav("floor")} onCloseMonth={async()=>{await clearDailyLog();}}/>}
        {view==="users"      && isAdmin  && <UsersView     users={users}         saveUser={saveUser} deleteUserFB={deleteUserFB} audit={audit} currentUser={user}/>}
        {view==="audit"      && isAdmin  && <AuditView     auditLog={auditLog}/>}
        {view==="credits"                  && <CreditsView credits={credits} payCredit={payCredit} deleteCredit={deleteCredit} audit={audit} today={today()} userName={user?.name} dailyLog={dailyLog} saveDailyLog={saveDailyLog} dayOp={dayOp} setDayOpFB={setDayOpFB}/>}
        {view==="nightreport"&& nightRpt && <NightReportView report={nightRpt} onBack={()=>nav("floor")} username={user?.name} isAdmin={isAdmin} credits={credits} onExport={()=>exportToExcel(buildNightReport(nightRpt,today(),user?.name),`Cierre_${today()}`)}/>}
      </div>
    </div>
  );
}

// ── Nav button helper ─────────────────────────────────────────
function NavBtn({k,icon,l,view,onClick,color="amber"}){
  const active=view===k;
  const colors={amber:"rgba(245,200,66",purple:"rgba(167,139,250",blue:"rgba(96,165,250",dark:"rgba(255,255,255"};
  const c=colors[color]||colors.amber;
  return <button onClick={onClick} style={{background:active?`${c},0.15)`:"transparent",border:`1px solid ${active?`${c},0.4)`:"transparent"}`,color:active?`${c},1)`:"#666",borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",fontWeight:active?700:400}}>{icon} {l}</button>;
}

// ═══════════════════════════════════════════════════════════════
// START DAY VIEW
// ═══════════════════════════════════════════════════════════════
function StartDayView({onStart,onBack,dayOp}){
  const [base,setBase]=useState("");
  const d=new Date();
  const DIAS=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  const MESES=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const label=`${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} ${d.getFullYear()}`;
  const fmt2=(n)=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n||0);

  if(dayOp?.status==="open"){
    return (
      <div style={{textAlign:"center",paddingTop:40}}>
        <div style={{fontSize:48,marginBottom:12}}>✅</div>
        <h2 style={{color:"#34d399",marginBottom:8}}>Día ya iniciado</h2>
        <p style={{color:"#888",fontSize:13,marginBottom:6}}>{dayOp.label}</p>
        <p style={{color:"#666",fontSize:12,marginBottom:20}}>Base: {fmt2(dayOp.baseCash)} · Abierto por: {dayOp.openedBy}</p>
        <button onClick={onBack} style={{...btnS("ghost"),padding:"10px 24px"}}>← Volver al plano</button>
      </div>
    );
  }

  return (
    <div style={{maxWidth:420,margin:"0 auto",paddingTop:20}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:52,marginBottom:10}}>☀️</div>
        <h2 style={{color:"#f5c842",fontSize:22,fontWeight:800,marginBottom:6}}>Iniciar operación del día</h2>
        <p style={{color:"#888",fontSize:14}}>{label}</p>
      </div>
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:24}}>
        <p style={{fontSize:12,color:"#666",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Base de caja inicial</p>
        <p style={{fontSize:11,color:"#555",marginBottom:12}}>¿Cuánto efectivo hay en caja para iniciar?</p>
        <input
          type="number" placeholder="Ej: 50000"
          value={base} onChange={e=>setBase(e.target.value)}
          style={{...inp,marginBottom:16,fontSize:18,padding:"12px 14px",textAlign:"center"}}
        />
        {base && <p style={{textAlign:"center",color:"#34d399",fontSize:14,marginBottom:14}}>Base: {fmt2(base)}</p>}
        <button onClick={()=>{if(base!=="")onStart(base);}} style={{...btnS("green"),width:"100%",padding:"13px 0",fontSize:15,marginBottom:10}}>
          ▶ Iniciar día
        </button>
        <button onClick={onBack} style={{...btnS("ghost"),width:"100%",padding:"10px 0"}}>Cancelar</button>
      </div>
      <p style={{textAlign:"center",color:"#444",fontSize:11,marginTop:14}}>
        Puedes navegar libremente sin iniciar el día, pero las ventas solo se registran con el día activo.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════
function LoginScreen({onLogin}){
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState("");
  const handle=()=>{if(!onLogin(u,p))setErr("Usuario o contraseña incorrectos");};
  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#09090f",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:320,padding:32,background:"#0e0c18",border:"1px solid rgba(245,200,66,0.2)",borderRadius:20}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:48,marginBottom:8}}>🍹</div>
          <h1 style={{fontSize:22,fontWeight:800,color:"#f5c842",letterSpacing:3,margin:0}}>BAR POS</h1>
          <p style={{color:"#555",fontSize:12,marginTop:4}}>Ingresa tus credenciales</p>
        </div>
        <input placeholder="Usuario" value={u} onChange={e=>{setU(e.target.value);setErr("");}} style={{...inp,marginBottom:10}} onKeyDown={e=>e.key==="Enter"&&handle()}/>
        <input placeholder="Contraseña" type="password" value={p} onChange={e=>{setP(e.target.value);setErr("");}} style={{...inp,marginBottom:10}} onKeyDown={e=>e.key==="Enter"&&handle()}/>
        {err && <p style={{color:"#f87171",fontSize:12,marginBottom:8,textAlign:"center"}}>{err}</p>}
        <button onClick={handle} style={{...btnS("amber"),width:"100%",padding:"11px 0",fontSize:14}}>Entrar</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FLOOR VIEW
// ═══════════════════════════════════════════════════════════════
function FloorView({tables,layout,calc,dayOp,onSelect,onOpenAndSelect}){
  const [confirm,setConfirm]=useState(null);
  const openCount=Object.values(tables).filter(t=>t.status==="open").length;
  const totalPending=Object.values(tables).filter(t=>t.status==="open").reduce((s,t)=>s+calc(t).pending,0);
  const sc={free:{fill:"rgba(255,255,255,0.03)",stroke:"rgba(255,255,255,0.14)",text:"#444"},open:{fill:"rgba(245,200,66,0.1)",stroke:"rgba(245,200,66,0.55)",text:"#f5c842"},paid:{fill:"rgba(52,211,153,0.08)",stroke:"rgba(52,211,153,0.4)",text:"#34d399"}};
  return (
    <div>
      {/* Alerta si no hay día iniciado */}
      {!dayOp?.status==="open" && (
        <div style={{padding:"10px 14px",background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.25)",borderRadius:10,marginBottom:12,fontSize:12,color:"#f87171"}}>
          ⚠ No hay operación del día iniciada. Las ventas no se registrarán en el reporte.
        </div>
      )}
      <div style={{display:"flex",gap:10,marginBottom:14}}>
        {[{l:"Mesas abiertas",v:openCount,c:"#f5c842"},{l:"Por cobrar",v:fmt(totalPending),c:"#f87171"}].map(s=>(
          <div key={s.l} style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"10px 14px"}}>
            <div style={{fontSize:11,color:"#555",marginBottom:3}}>{s.l}</div>
            <div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:10,marginBottom:10}}>
        <p style={{fontSize:10,color:"#444",textAlign:"center",letterSpacing:1,marginBottom:8,textTransform:"uppercase"}}>Plano del bar — toca una mesa</p>
        <svg viewBox="0 0 120 95" style={{width:"100%",maxHeight:380}}>
          {/* Pared exterior */}
          <rect x="1" y="1" width="118" height="90" rx="2" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6"/>
          {/* Barra — arriba centro */}
          <rect x="28" y="4" width="52" height="12" rx="2" fill="rgba(245,200,66,0.08)" stroke="rgba(245,200,66,0.35)" strokeWidth="0.6"/>
          <text x="54" y="10.5" fontSize="3.5" fill="rgba(245,200,66,0.6)" textAnchor="middle" dominantBaseline="middle" fontWeight="600">B A R R A</text>

          {/* Mesas */}
          {layout.map(tl=>{
            const t=tables[tl.id],s=sc[t.status],c=t.status==="open"?calc(t):null;
            const rounds=(t.rounds||[]).length;
            return (
              <g key={tl.id} onClick={()=>t.status==="free"?setConfirm(tl.id):onSelect(tl.id)} style={{cursor:"pointer"}}>
                <rect x={tl.x} y={tl.y} width={tl.w} height={tl.h} rx="2" fill={s.fill} stroke={s.stroke} strokeWidth="0.8"/>
                <text x={tl.x+tl.w/2} y={tl.y+tl.h/2-2} fontSize="5" fontWeight="700" fill={s.text} textAnchor="middle" dominantBaseline="middle">
                  {tl.label}
                </text>
                {t.status==="open"&&c&&c.pending>0&&(
                  <text x={tl.x+tl.w/2} y={tl.y+tl.h-2.5} fontSize="2.3" fill="#f87171" textAnchor="middle">
                    {fmt(c.pending).replace("COP","").trim()}
                  </text>
                )}
                {t.status==="open"&&rounds>0&&(
                  <text x={tl.x+tl.w-1} y={tl.y+2} fontSize="2" fill="rgba(245,200,66,0.7)" textAnchor="end">R{rounds}</text>
                )}
                {t.status==="free"&&(
                  <text x={tl.x+tl.w/2} y={tl.y+tl.h-2} fontSize="2.2" fill="#333" textAnchor="middle">libre</text>
                )}
                {t.zone==="exterior"&&(
                  <text x={tl.x+tl.w/2} y={tl.y-1.5} fontSize="2" fill="#444" textAnchor="middle">ext.</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{display:"flex",gap:12,justifyContent:"center",fontSize:10,color:"#555",flexWrap:"wrap"}}>
        {[{c:"rgba(255,255,255,0.14)",l:"Libre"},{c:"rgba(245,200,66,0.55)",l:"Ocupada"},{c:"rgba(52,211,153,0.4)",l:"Pagada"}].map(l=>(
          <div key={l.l} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:3,border:`2px solid ${l.c}`}}/>{l.l}</div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:9,color:"#f5c842"}}>R2</span><span>= rondas</span></div>
      </div>
      {confirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
          <div style={{background:"#12101c",border:"1px solid rgba(245,200,66,0.3)",borderRadius:16,padding:22,maxWidth:280,width:"100%"}}>
            <p style={{textAlign:"center",color:"#f5c842",fontWeight:700,fontSize:16,marginBottom:6}}>Mesa {tables[confirm]?.label}</p>
            <p style={{textAlign:"center",color:"#777",fontSize:13,marginBottom:18}}>¿Abrir para nuevos clientes?</p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setConfirm(null)} style={{...btnS("ghost"),flex:1,padding:"8px 0"}}>Cancelar</button>
              <button onClick={()=>{onOpenAndSelect(confirm);setConfirm(null);}} style={{...btnS("amber"),flex:1,padding:"8px 0"}}>Abrir mesa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// MODAL ÍTEMS ESPECIALES
// ═══════════════════════════════════════════════════════════════
function EspecialModal({item,inventory,CERVEZAS,AGU_BOT,onConfirm,onClose}){
  const [cervSel,setCervSel]=useState("");
  const [aguSel,setAguSel]=useState("");
  // Cubetazo cerveza: hasta 2 tipos, 6 total
  const [cubCerv,setCubCerv]=useState([{tipo:"",qty:0},{tipo:"",qty:0}]);
  // Cubetazo aguardiente: cerveza hasta 3 tipos
  const [cubAguCerv,setCubAguCerv]=useState([{tipo:"",qty:0},{tipo:"",qty:0},{tipo:"",qty:0}]);

  const invMap={};
  (inventory||[]).forEach(i=>{invMap[i.name]=i;});

  const totalCubCerv=cubCerv.reduce((s,c)=>s+c.qty,0);
  const totalCubAguCerv=cubAguCerv.reduce((s,c)=>s+c.qty,0);

  const confirm=()=>{
    // Michelada de cerveza
    if(item.requiresCerveza){
      if(!cervSel) return;
      const cerv=CERVEZAS.find(c=>c.name===cervSel);
      if(!cerv) return;
      const mi={...item,name:`${item.name} (${cervSel})`};
      onConfirm(mi,[cervSel]);
    }
    // Michelada de soda / ginger ale (descuenta la base automáticamente)
    else if(item.descuentaInv){
      onConfirm(item,[item.descuentaInv]);
    }
    // Aguardiente (incluye agua)
    else if(item.includesAgua){
      onConfirm(item,["Agua"]);
    }
    // Cubetazo cerveza
    else if(item.esCubetazo==="cerveza"){
      if(totalCubCerv!==6) return;
      const extra=[];
      cubCerv.forEach(c=>{if(c.tipo&&c.qty>0){for(let i=0;i<c.qty;i++)extra.push(c.tipo);}});
      const mi={...item,name:`Cubetazo Cerveza (${cubCerv.filter(c=>c.tipo&&c.qty>0).map(c=>c.qty+"x"+c.tipo).join(", ")})`};
      onConfirm(mi,extra);
    }
    // Cubetazo aguardiente
    else if(item.esCubetazo==="aguardiente"){
      if(!aguSel||totalCubAguCerv!==6) return;
      const extra=["Agua"]; // botella incluye agua
      cubAguCerv.forEach(c=>{if(c.tipo&&c.qty>0){for(let i=0;i<c.qty;i++)extra.push(c.tipo);}});
      const mi={...item,name:`Cubetazo Aguardiente (${aguSel.replace(" Botella","")} + ${cubAguCerv.filter(c=>c.tipo&&c.qty>0).map(c=>c.qty+"x"+c.tipo).join(", ")})`};
      onConfirm({...mi,menuId:aguSel},[aguSel,...extra]);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
      <div style={{background:"#12101c",border:"1px solid rgba(245,200,66,0.3)",borderRadius:18,padding:22,width:"100%",maxWidth:360,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{margin:0,color:"#f5c842",fontSize:16}}>{item.emoji} {item.name}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#666",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        <p style={{fontSize:13,color:"#f5c842",fontWeight:700,marginBottom:4}}>{fmt(item.price)}</p>

        {/* Michelada de cerveza */}
        {item.requiresCerveza&&(
          <div>
            <p style={{fontSize:12,color:"#888",marginBottom:8}}>¿Con qué cerveza?</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {CERVEZAS.map(c=>(
                <button key={c.id} onClick={()=>setCervSel(c.name)} style={{padding:"8px 6px",borderRadius:9,border:`1px solid ${cervSel===c.name?"#f5c842":"rgba(255,255,255,0.1)"}`,background:cervSel===c.name?"rgba(245,200,66,0.15)":"rgba(255,255,255,0.03)",color:cervSel===c.name?"#f5c842":"#888",cursor:"pointer",fontSize:11,fontWeight:cervSel===c.name?700:400}}>
                  🍺 {c.name}<br/><span style={{fontSize:10,color:"#555"}}>{fmt(c.price)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Aguardiente incluye agua */}
        {item.includesAgua&&(
          <div style={{padding:"10px 12px",background:"rgba(96,165,250,0.08)",border:"1px solid rgba(96,165,250,0.2)",borderRadius:9}}>
            <p style={{fontSize:12,color:"#60a5fa",margin:0}}>💧 Incluye 1 Agua automáticamente</p>
          </div>
        )}

        {/* Cubetazo aguardiente */}
        {item.esCubetazo==="aguardiente"&&(
          <div>
            <p style={{fontSize:12,color:"#888",marginBottom:8}}>1️⃣ Elige el aguardiente (botella):</p>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
              {AGU_BOT.map(a=>(
                <button key={a.id} onClick={()=>setAguSel(a.name)} style={{padding:"8px 12px",borderRadius:9,border:`1px solid ${aguSel===a.name?"#f5c842":"rgba(255,255,255,0.1)"}`,background:aguSel===a.name?"rgba(245,200,66,0.15)":"rgba(255,255,255,0.03)",color:aguSel===a.name?"#f5c842":"#888",cursor:"pointer",fontSize:12,textAlign:"left",fontWeight:aguSel===a.name?700:400}}>
                  🥃 {a.name}
                </button>
              ))}
            </div>
            <p style={{fontSize:12,color:"#888",marginBottom:8}}>2️⃣ Elige las 6 cervezas (máx 3 tipos): <strong style={{color:totalCubAguCerv===6?"#34d399":"#f87171"}}>{totalCubAguCerv}/6</strong></p>
            {cubAguCerv.map((c,idx)=>(
              <div key={idx} style={{display:"flex",gap:6,alignItems:"center",marginBottom:7}}>
                <select value={c.tipo} onChange={e=>setCubAguCerv(prev=>{const n=[...prev];n[idx]={...n[idx],tipo:e.target.value};return n;})} style={{...inp,flex:2,fontSize:11,background:"#1a1826"}}>
                  <option value="">-- Tipo {idx+1} --</option>
                  {CERVEZAS.map(cv=><option key={cv.id} value={cv.name}>{cv.name}</option>)}
                </select>
                <input type="number" min="0" max={6-totalCubAguCerv+c.qty} value={c.qty||""} placeholder="Cant"
                  onChange={e=>{const v=Math.max(0,+e.target.value);setCubAguCerv(prev=>{const n=[...prev];n[idx]={...n[idx],qty:v};return n;});}}
                  style={{...inp,width:50,textAlign:"center",fontSize:11}}/>
              </div>
            ))}
          </div>
        )}

        {/* Cubetazo cerveza */}
        {item.esCubetazo==="cerveza"&&(
          <div>
            <p style={{fontSize:12,color:"#888",marginBottom:8}}>Elige las 6 cervezas (máx 2 tipos): <strong style={{color:totalCubCerv===6?"#34d399":"#f87171"}}>{totalCubCerv}/6</strong></p>
            {cubCerv.map((c,idx)=>(
              <div key={idx} style={{display:"flex",gap:6,alignItems:"center",marginBottom:7}}>
                <select value={c.tipo} onChange={e=>setCubCerv(prev=>{const n=[...prev];n[idx]={...n[idx],tipo:e.target.value};return n;})} style={{...inp,flex:2,fontSize:11,background:"#1a1826"}}>
                  <option value="">-- Tipo {idx+1} --</option>
                  {CERVEZAS.map(cv=><option key={cv.id} value={cv.name}>{cv.name}</option>)}
                </select>
                <input type="number" min="0" max={6-totalCubCerv+c.qty} value={c.qty||""} placeholder="Cant"
                  onChange={e=>{const v=Math.max(0,+e.target.value);setCubCerv(prev=>{const n=[...prev];n[idx]={...n[idx],qty:v};return n;});}}
                  style={{...inp,width:50,textAlign:"center",fontSize:11}}/>
              </div>
            ))}
          </div>
        )}

        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={onClose} style={{...btnS("ghost"),flex:1,padding:"10px 0"}}>Cancelar</button>
          <button onClick={confirm} style={{...btnS("amber"),flex:1,padding:"10px 0"}}>
            ✓ Agregar {fmt(item.price)}
          </button>
        </div>
      </div>
    </div>
  );
}

// TABLE VIEW — con sistema de rondas
// ═══════════════════════════════════════════════════════════════
function TableView({table,menu,calc,inventory,cubetazos,onAdd,onCloseRound,onQty,onMarkPaid,onAddPayment,onAddCredit,onDiscount,onClose,onBack}){
  const [tab,setTab]=useState("order");
  const [menuCat,setMenuCat]=useState("Todos");
  const [payItem,setPayItem]=useState(null);
  const [payMethod,setPayMethod]=useState("efectivo");
  const [partAmt,setPartAmt]=useState(""); const [partNote,setPartNote]=useState("");
  const [discInput,setDiscInput]=useState(table.discount);
  const [confirmClose,setConfirmClose]=useState(false);
  const [modalItem,setModalItem]=useState(null);
  const [showCreditModal,setShowCreditModal]=useState(false);
  const [creditName,setCreditName]=useState("");

  const CERVEZAS = menu.filter(m=>m.cat==="Cervezas");
  const AGU_BOT  = menu.filter(m=>m.cat==="Aguardiente"&&!m.name.includes("½"));

  // menu viene del inventario — filtrar cubetazos según activación
  const visibleMenu = menu.filter(m=>{
    if(!m.price || m.stock<=0) return false; // ocultar sin stock o sin precio
    if(m.cat==="Cubetazos") return (m.esCubetazo==="aguardiente"&&cubetazos?.aguardiente)||(m.esCubetazo==="cerveza"&&cubetazos?.cerveza);
    return true;
  });
  const cats=["Todos",...new Set(visibleMenu.map(m=>m.cat))];
  const filtMenu=menuCat==="Todos"?visibleMenu:visibleMenu.filter(m=>m.cat===menuCat);
  const rounds=table.rounds||[];
  const allPendingItems=rounds.flatMap((r,ridx)=>r.items.filter(i=>!i.paid).map(i=>({...i,ridx})));

  const getEmoji=(cat)=>{
    if(!cat) return "🍺";
    const c=cat.toLowerCase();
    if(c.includes("cerveza")) return "🍺";
    if(c.includes("aguardiente")) return "🥃";
    if(c.includes("michelada")) return "🍹";
    if(c.includes("bebida")) return "🥤";
    if(c.includes("snack")) return "🍟";
    if(c.includes("cubetazo")) return "🪣";
    return "🍽";
  };

  const handleMenuClick=(m)=>{
    if(m.requiresCerveza||m.esCubetazo||m.descuentaInv||m.includesAgua) setModalItem(m);
    else onAdd(m,[]);
  };

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#666",fontSize:22,cursor:"pointer"}}>←</button>
        <div style={{flex:1}}>
          <h2 style={{margin:0,fontSize:18,color:"#f5c842"}}>Mesa {table.label}</h2>
          <p style={{margin:0,fontSize:10,color:"#555"}}>Abierta: {table.openedAt} · {table.openedBy} · {rounds.length} ronda{rounds.length!==1?"s":""}</p>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,color:"#666"}}>Pendiente</div>
          <div style={{fontSize:16,fontWeight:800,color:"#f87171"}}>{fmt(calc.pending)}</div>
        </div>
      </div>

      {/* Totales */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12}}>
        {[{l:"Subtotal",v:fmt(calc.sub),c:"#e8e0d0"},{l:`Desc ${table.discount}%`,v:`-${fmt(calc.disc)}`,c:"#a78bfa"},{l:"Total",v:fmt(calc.total),c:"#f5c842"}].map(s=>(
          <div key={s.l} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,padding:"7px 9px"}}>
            <div style={{fontSize:9,color:"#555"}}>{s.l}</div><div style={{fontSize:12,fontWeight:600,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:12}}>
        {[{k:"order",l:"📋 Pedido"},{k:"pay",l:"💳 Cobrar"},{k:"history",l:"🕐 Hist."}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,padding:"8px 0",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:tab===t.k?"#f5c842":"rgba(255,255,255,0.05)",color:tab===t.k?"#0a0a0f":"#777"}}>{t.l}</button>
        ))}
      </div>

      {/* ── TAB PEDIDO ── */}
      {tab==="order"&&(
        <div>
          {/* Rondas existentes */}
          {rounds.map((round,ridx)=>(
            <div key={round.id} style={{marginBottom:12,borderRadius:12,overflow:"hidden",border:`1px solid ${round.closed?"rgba(255,255,255,0.07)":"rgba(245,200,66,0.3)"}`}}>
              {/* Header ronda */}
              <div style={{padding:"7px 12px",background:round.closed?"rgba(255,255,255,0.03)":"rgba(245,200,66,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,fontWeight:700,color:round.closed?"#555":"#f5c842"}}>
                  🕐 Ronda {round.num} — {round.time}
                  {round.closed&&<span style={{color:"#444",fontWeight:400,marginLeft:6}}>· cerrada</span>}
                  <span style={{color:"#888",fontWeight:400,marginLeft:6,fontSize:10}}>
                    ({round.items.reduce((s,i)=>s+i.qty,0)} und.)
                  </span>
                </span>
                <span style={{fontSize:12,fontWeight:600,color:"#e8e0d0"}}>
                  {fmt(round.items.reduce((s,i)=>s+i.price*i.qty,0))}
                </span>
              </div>
              {/* Ítems de la ronda */}
              <div style={{padding:"8px 12px"}}>
                {round.items.map(item=>(
                  <div key={item.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <div style={{flex:1}}>
                      <span style={{fontSize:12,color:item.paid?"#34d399":"#e8e0d0",fontWeight:500}}>{item.paid?"✓ ":""}{item.name}</span>
                      <span style={{fontSize:10,color:"#555",marginLeft:6}}>{fmt(item.price)} c/u · <strong style={{color:"#f5c842"}}>×{item.qty}</strong>{item.paid?` · ${item.payMethod}`:""}</span>
                    </div>
                    {!item.paid&&!round.closed?(
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <button onClick={()=>onQty(ridx,item.id,-1)} style={{...qBtn,width:24,height:24,fontSize:13}}>−</button>
                        <span style={{fontSize:13,color:"#f5c842",fontWeight:700,minWidth:16,textAlign:"center"}}>{item.qty}</span>
                        <button onClick={()=>onQty(ridx,item.id,1)}  style={{...qBtn,width:24,height:24,fontSize:13}}>+</button>
                        <span style={{fontSize:12,fontWeight:600,color:"#e8e0d0",minWidth:60,textAlign:"right"}}>{fmt(item.price*item.qty)}</span>
                      </div>
                    ):(
                      <span style={{fontSize:12,fontWeight:600,color:item.paid?"#34d399":"#888",minWidth:60,textAlign:"right"}}>{fmt(item.price*item.qty)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Botón nueva ronda */}
          {rounds.length>0 && !rounds[rounds.length-1].closed && (
            <button onClick={onCloseRound} style={{...btnS("ghost"),width:"100%",padding:"8px 0",marginBottom:12,fontSize:12}}>
              ✂ Cerrar ronda actual e iniciar nueva
            </button>
          )}

          {/* Descuento */}
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 11px",background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:9,marginBottom:12}}>
            <span style={{fontSize:11,color:"#a78bfa",flex:1}}>🏷 Descuento</span>
            <input type="number" min="0" max="100" value={discInput} onChange={e=>setDiscInput(e.target.value)} style={{...inp,width:48,textAlign:"center",padding:"3px 5px"}}/>
            <span style={{color:"#a78bfa",fontSize:12}}>%</span>
            <button onClick={()=>onDiscount(discInput)} style={{...btnS("purple"),padding:"4px 10px",fontSize:11}}>Aplicar</button>
          </div>

          {/* Menú */}
          <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:7}}>
            {rounds.length===0?"Agrega la primera ronda:":"Agregar a la ronda actual:"}
          </p>
          <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:5,marginBottom:8}}>
            {cats.map(c=><button key={c} onClick={()=>setMenuCat(c)} style={{whiteSpace:"nowrap",padding:"4px 10px",borderRadius:18,border:"none",cursor:"pointer",fontSize:10,background:menuCat===c?"#f5c842":"rgba(255,255,255,0.06)",color:menuCat===c?"#0a0a0f":"#777",fontWeight:menuCat===c?700:400}}>{c}</button>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {filtMenu.map(m=>(
              <button key={m.id} onClick={()=>handleMenuClick(m)}
                style={{background:m.esCubetazo?"rgba(245,200,66,0.06)":"rgba(255,255,255,0.03)",border:`1px solid ${m.esCubetazo?"rgba(245,200,66,0.3)":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"9px 11px",cursor:"pointer",textAlign:"left"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(245,200,66,0.4)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=m.esCubetazo?"rgba(245,200,66,0.3)":"rgba(255,255,255,0.08)"}>
                <div style={{fontSize:15,marginBottom:2}}>{m.emoji||getEmoji(m.cat)}</div>
                <div style={{fontSize:11,color:"#e8e0d0",fontWeight:500}}>{m.name}</div>
                <div style={{fontSize:10,color:"#666",marginTop:1}}>Stock: {m.stock||"∞"} {m.unit||""}</div>
                <div style={{fontSize:12,color:"#f5c842",marginTop:1}}>{fmt(m.price)}</div>
                {(m.requiresCerveza||m.esCubetazo||m.descuentaInv||m.includesAgua)&&(
                  <div style={{fontSize:9,color:"#888",marginTop:2}}>
                    {m.requiresCerveza&&"→ Elige cerveza"}
                    {m.descuentaInv&&`Incluye ${m.descuentaInv}`}
                    {m.includesAgua&&"+ Agua incluida"}
                    {m.esCubetazo==="aguardiente"&&"→ 1 bot. + 6 cervezas"}
                    {m.esCubetazo==="cerveza"&&"→ 6 cervezas (2 tipos)"}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL ÍTEMS ESPECIALES ── */}
      {modalItem&&<EspecialModal item={modalItem} inventory={inventory} CERVEZAS={CERVEZAS} AGU_BOT={AGU_BOT} onConfirm={(mi,extra)=>{onAdd(mi,extra);setModalItem(null);}} onClose={()=>setModalItem(null)}/>}

      {/* ── TAB COBRAR ── */}
      {tab==="pay"&&(
        <div>
          <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Pagar por ítem</p>
          {allPendingItems.length===0&&<p style={{color:"#444",fontSize:12,textAlign:"center",padding:14}}>Sin ítems pendientes</p>}
          {allPendingItems.map(item=>(
            <div key={item.id} style={{...card(),border:`1px solid ${payItem?.iid===item.id?"rgba(245,200,66,0.4)":"rgba(255,255,255,0.08)"}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:12,color:"#e8e0d0",fontWeight:500}}>{item.name} ×{item.qty}</div>
                  <div style={{fontSize:10,color:"#666"}}>Ronda {item.ridx+1} · {fmt(item.price*item.qty)}</div>
                </div>
                <button onClick={()=>setPayItem(payItem?.iid===item.id?null:{ridx:item.ridx,iid:item.id})} style={{...btnS("amber"),padding:"4px 10px",fontSize:11}}>
                  {payItem?.iid===item.id?"✕":"Pagar"}
                </button>
              </div>
              {payItem?.iid===item.id&&(
                <div style={{display:"flex",gap:6,marginTop:8}}>
                  {["efectivo","transferencia"].map(m=>(
                    <button key={m} onClick={()=>{onMarkPaid(item.ridx,item.id,m);setPayItem(null);}} style={{flex:1,padding:"7px 0",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:m==="efectivo"?"rgba(52,211,153,0.14)":"rgba(96,165,250,0.14)",color:m==="efectivo"?"#34d399":"#60a5fa"}}>{m==="efectivo"?"💵 Efectivo":"📲 Transferencia"}</button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Pago parcial */}
          <div style={{padding:"11px 12px",background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.2)",borderRadius:11,marginTop:10}}>
            <p style={{fontSize:11,color:"#60a5fa",fontWeight:600,marginBottom:8}}>💳 Pago parcial por monto</p>
            <input type="number" placeholder="Monto" value={partAmt} onChange={e=>setPartAmt(e.target.value)} style={{...inp,marginBottom:6}}/>
            <input type="text" placeholder="Nota (ej: paga Juan)" value={partNote} onChange={e=>setPartNote(e.target.value)} style={{...inp,marginBottom:6}}/>
            <div style={{display:"flex",gap:6,marginBottom:6}}>
              {["efectivo","transferencia"].map(m=>(
                <button key={m} onClick={()=>setPayMethod(m)} style={{flex:1,padding:"6px 0",borderRadius:7,cursor:"pointer",fontSize:11,border:`1px solid ${payMethod===m?(m==="efectivo"?"#34d399":"#60a5fa"):"rgba(255,255,255,0.1)"}`,background:payMethod===m?(m==="efectivo"?"rgba(52,211,153,0.13)":"rgba(96,165,250,0.13)"):"transparent",color:payMethod===m?(m==="efectivo"?"#34d399":"#60a5fa"):"#666"}}>{m==="efectivo"?"💵 Efectivo":"📲 Transferencia"}</button>
              ))}
            </div>
            <button onClick={()=>{if(partAmt){onAddPayment(partAmt,payMethod,partNote);setPartAmt("");setPartNote("");}}} style={{...btnS("blue"),width:"100%",padding:"8px 0"}}>Registrar {partAmt?fmt(partAmt):"pago"}</button>
          </div>

          {(table.payments||[]).length>0&&(
            <div style={{marginTop:10}}>
              <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Pagos registrados</p>
              {table.payments.map(p=>(
                <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 10px",background:"rgba(52,211,153,0.05)",border:"1px solid rgba(52,211,153,0.14)",borderRadius:7,marginBottom:5}}>
                  <div><span style={{fontSize:11,color:"#34d399"}}>{p.method==="efectivo"?"💵":"📲"} {p.method}</span>{p.note&&<span style={{fontSize:10,color:"#555",marginLeft:5}}>· {p.note}</span>}{p.by&&<span style={{fontSize:9,color:"#444",marginLeft:4}}>({p.by})</span>}</div>
                  <span style={{fontSize:12,fontWeight:600,color:"#34d399"}}>{fmt(p.amount)}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{marginTop:10,padding:"10px 12px",background:"rgba(245,200,66,0.05)",border:"1px solid rgba(245,200,66,0.18)",borderRadius:11}}>
            {[{l:"Total",v:fmt(calc.total),c:"#f5c842"},{l:"Cobrado",v:fmt(calc.paid),c:"#34d399"}].map(s=>(
              <div key={s.l} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:11,color:"#888"}}>{s.l}</span><span style={{fontSize:12,fontWeight:600,color:s.c}}>{s.v}</span></div>
            ))}
            <div style={{height:1,background:"rgba(255,255,255,0.07)",margin:"6px 0"}}/>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#f87171",fontWeight:700}}>Pendiente</span><span style={{fontSize:15,color:"#f87171",fontWeight:800}}>{fmt(calc.pending)}</span></div>
          </div>

          {/* Opción de crédito */}
          <button onClick={()=>setShowCreditModal(true)} style={{...btnS("purple"),width:"100%",padding:"10px 0",marginTop:10,fontSize:13}}>
            📒 Registrar como crédito
          </button>

          {showCreditModal&&(
            <div style={{marginTop:10,padding:14,background:"rgba(167,139,250,0.07)",border:"1px solid rgba(167,139,250,0.28)",borderRadius:12}}>
              <p style={{fontSize:13,color:"#a78bfa",fontWeight:700,marginBottom:8}}>📒 Crédito — ¿A nombre de quién?</p>
              <input placeholder="Nombre del cliente (ej: Esteban)" value={creditName} onChange={e=>setCreditName(e.target.value)} style={{...inp,marginBottom:8}}/>
              <p style={{fontSize:10,color:"#666",marginBottom:10}}>Total: {fmt(calc.total)} · Fecha: {new Date().toLocaleDateString("es-CO")}</p>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{setShowCreditModal(false);setCreditName("");}} style={{...btnS("ghost"),flex:1,padding:"8px 0"}}>Cancelar</button>
                <button onClick={()=>{
                  if(!creditName.trim())return;
                  const items=(table.rounds||[]).flatMap(r=>r.items);
                  onAddCredit(creditName.trim(),items,calc.total);
                  setShowCreditModal(false);setCreditName("");
                  onClose();
                }} style={{...btnS("purple"),flex:1,padding:"8px 0"}}>Confirmar crédito</button>
              </div>
            </div>
          )}

          {!confirmClose?(
            <button onClick={()=>setConfirmClose(true)} style={{...btnS("red"),width:"100%",padding:"11px 0",marginTop:8,fontSize:13}}>🔒 Cerrar cuenta · Mesa {table.label}</button>
          ):(
            <div style={{marginTop:10,padding:12,background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.28)",borderRadius:11}}>
              <p style={{fontSize:12,color:"#f87171",textAlign:"center",marginBottom:10}}>¿Confirmar cierre? La mesa quedará libre.</p>
              <div style={{display:"flex",gap:6}}><button onClick={()=>setConfirmClose(false)} style={{...btnS("ghost"),flex:1,padding:"8px 0"}}>Cancelar</button><button onClick={onClose} style={{...btnS("red"),flex:1,padding:"8px 0"}}>Confirmar</button></div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB HISTORIAL ── */}
      {tab==="history"&&(
        <div>
          <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Sesiones anteriores</p>
          {(table.sessions||[]).length===0&&<p style={{color:"#444",fontSize:12,textAlign:"center",padding:20}}>Sin historial aún</p>}
          {(table.sessions||[]).map((s,idx)=>{
            const allIt=(s.rounds||[]).flatMap(r=>r.items);
            const tot=allIt.reduce((a,i)=>a+i.price*i.qty,0);
            const disc=Math.round(tot*(s.discount/100));
            return (
              <div key={idx} style={{...card()}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:10,color:"#666"}}>{s.openedAt}→{s.closedAt} · {s.closedBy}</span>
                  <span style={{fontSize:12,fontWeight:600,color:"#f5c842"}}>{fmt(tot-disc)}</span>
                </div>
                {(s.rounds||[]).map((r,ri)=>(
                  <div key={ri} style={{marginBottom:5}}>
                    <div style={{fontSize:10,color:"#666",marginBottom:2}}>Ronda {r.num} — {r.time}</div>
                    {r.items.map((it,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#555",paddingLeft:8}}>
                        <span>{it.name} ×{it.qty}{it.paid?" ✓":""}</span><span>{fmt(it.price*it.qty)}</span>
                      </div>
                    ))}
                  </div>
                ))}
                {s.discount>0&&<div style={{fontSize:10,color:"#a78bfa",marginTop:3}}>Desc {s.discount}%: -{fmt(disc)}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// CREDITS VIEW — Cuentas por cobrar
// ═══════════════════════════════════════════════════════════════
function CreditsView({credits,payCredit,deleteCredit,audit,today,userName,dailyLog,saveDailyLog,dayOp,setDayOpFB}){
  const [paying,setPaying]=useState(null); // id del crédito que se está pagando
  const [payMethod,setPayMethod]=useState("efectivo");
  const [filter,setFilter]=useState("pending"); // pending | paid | all

  const pending=credits.filter(c=>c.status==="pending");
  const paid=credits.filter(c=>c.status==="paid");
  const shown=filter==="pending"?pending:filter==="paid"?paid:credits;

  const handlePay=async(credit)=>{
    await payCredit(credit.id,payMethod,userName,today);
    audit("Crédito cobrado",`${credit.clientName} — ${fmt(credit.total)} — ${payMethod}`);
    setPaying(null);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h2 style={{margin:0,fontSize:18,color:"#60a5fa"}}>📒 Cuentas por cobrar</h2>
      </div>

      {/* Resumen */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        <div style={{padding:"10px 12px",background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:11}}>
          <div style={{fontSize:10,color:"#f87171",marginBottom:3}}>⏳ PENDIENTES</div>
          <div style={{fontSize:18,fontWeight:700,color:"#f87171"}}>{pending.length}</div>
          <div style={{fontSize:12,color:"#f87171"}}>{fmt(pending.reduce((s,c)=>s+c.total,0))}</div>
        </div>
        <div style={{padding:"10px 12px",background:"rgba(52,211,153,0.07)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:11}}>
          <div style={{fontSize:10,color:"#34d399",marginBottom:3}}>✅ COBRADAS</div>
          <div style={{fontSize:18,fontWeight:700,color:"#34d399"}}>{paid.length}</div>
          <div style={{fontSize:12,color:"#34d399"}}>{fmt(paid.reduce((s,c)=>s+c.total,0))}</div>
        </div>
      </div>

      {/* Filtro */}
      <div style={{display:"flex",gap:5,marginBottom:12}}>
        {[{k:"pending",l:"⏳ Pendientes"},{k:"paid",l:"✅ Cobradas"},{k:"all",l:"Todas"}].map(f=>(
          <button key={f.k} onClick={()=>setFilter(f.k)} style={{flex:1,padding:"7px 0",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:filter===f.k?"#60a5fa":"rgba(255,255,255,0.05)",color:filter===f.k?"#0a0a0f":"#777"}}>{f.l}</button>
        ))}
      </div>

      {shown.length===0&&<p style={{color:"#444",fontSize:13,textAlign:"center",padding:24}}>No hay cuentas {filter==="pending"?"pendientes":filter==="paid"?"cobradas":""}</p>}

      {shown.map(credit=>(
        <div key={credit.id} style={{marginBottom:12,padding:"12px 14px",background:credit.status==="pending"?"rgba(248,113,113,0.05)":"rgba(52,211,153,0.05)",border:`1px solid ${credit.status==="pending"?"rgba(248,113,113,0.25)":"rgba(52,211,153,0.2)"}`,borderRadius:13}}>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div>
              <div style={{fontSize:15,color:"#e8e0d0",fontWeight:700}}>👤 {credit.clientName}</div>
              <div style={{fontSize:11,color:"#666"}}>Mesa {credit.tableLabel} · {credit.date} {credit.time} · {credit.createdBy}</div>
              {credit.status==="paid"&&(
                <div style={{fontSize:11,color:"#34d399",marginTop:2}}>✅ Cobrado el {credit.paidDate} · {credit.payMethod} · {credit.paidBy}</div>
              )}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:17,fontWeight:800,color:credit.status==="pending"?"#f87171":"#34d399"}}>{fmt(credit.total)}</div>
              <div style={{fontSize:10,color:"#555",marginTop:2}}>{credit.status==="pending"?"PENDIENTE":"COBRADO"}</div>
            </div>
          </div>

          {/* Detalle consumo */}
          <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:8,marginBottom:8}}>
            {(credit.items||[]).map((it,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#888",marginBottom:3}}>
                <span>{it.name} ×{it.qty}</span>
                <span>{fmt(it.price*it.qty)}</span>
              </div>
            ))}
          </div>

          {/* Botones */}
          {credit.status==="pending"&&(
            <div>
              {paying===credit.id?(
                <div>
                  <p style={{fontSize:12,color:"#a78bfa",marginBottom:8}}>¿Cómo va a pagar?</p>
                  <div style={{display:"flex",gap:6,marginBottom:8}}>
                    {["efectivo","transferencia"].map(m=>(
                      <button key={m} onClick={()=>setPayMethod(m)} style={{flex:1,padding:"8px 0",borderRadius:9,border:`1px solid ${payMethod===m?(m==="efectivo"?"#34d399":"#60a5fa"):"rgba(255,255,255,0.1)"}`,background:payMethod===m?(m==="efectivo"?"rgba(52,211,153,0.13)":"rgba(96,165,250,0.13)"):"transparent",color:payMethod===m?(m==="efectivo"?"#34d399":"#60a5fa"):"#666",cursor:"pointer",fontSize:12,fontWeight:600}}>
                        {m==="efectivo"?"💵 Efectivo":"📲 Transferencia"}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setPaying(null)} style={{...btnS("ghost"),flex:1,padding:"8px 0"}}>Cancelar</button>
                    <button onClick={()=>handlePay(credit)} style={{...btnS("green"),flex:1,padding:"8px 0"}}>✅ Confirmar pago {fmt(credit.total)}</button>
                  </div>
                </div>
              ):(
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{deleteCredit(credit.id);audit("Crédito eliminado",credit.clientName);}} style={{...btnS("red"),padding:"7px 12px",fontSize:11}}>🗑</button>
                  <button onClick={()=>setPaying(credit.id)} style={{...btnS("green"),flex:1,padding:"8px 0",fontSize:13}}>💰 Registrar pago</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INVENTORY VIEW
// ═══════════════════════════════════════════════════════════════
function InventoryView({inventory,saveInventoryItem,deleteInventoryItem,categories,saveCategories,cubetazos,setCubetazos,audit}){
  const [show,setShow]=useState(false);
  const [editId,setEditId]=useState(null);
  const [form,setForm]=useState({name:"",cat:categories?.[0]||"",stock:"",min:"",unit:"und.",cost:"",price:""});
  const [newCat,setNewCat]=useState("");
  const [showNewCat,setShowNewCat]=useState(false);
  const [addQtys,setAddQtys]=useState({});
  const [filterCat,setFilterCat]=useState("Todos");
  const f=(k,v)=>setForm(p=>({...p,[k]:v}));
  const margin=item=>(!item.cost||!item.price||item.price<=0)?null:Math.round(((item.price-item.cost)/item.price)*100);
  const mc=pct=>pct===null?"#555":pct>=40?"#34d399":pct>=20?"#f5c842":"#f87171";
  const save=()=>{
    if(!form.name) return;
    const item={...form,stock:+form.stock,min:+form.min,cost:+form.cost,price:+form.price};
    if(editId){saveInventoryItem({...inventory.find(x=>x.id===editId),...item});audit("Editar inventario",`${form.name}`);setEditId(null);}
    else{saveInventoryItem({...item,id:genId()});audit("Agregar inventario",`${form.name}`);}
    setForm({name:"",cat:"",stock:"",min:"",unit:"und.",cost:"",price:""});setShow(false);
  };
  const startEdit=item=>{setForm({name:item.name,cat:item.cat,stock:item.stock,min:item.min,unit:item.unit,cost:item.cost,price:item.price||""});setEditId(item.id);setShow(true);};
  const addStock=id=>{const qty=parseInt(addQtys[id]||0);if(!qty||qty<=0)return;const item=inventory.find(i=>i.id===id);const foundItem=inventory.find(i=>i.id===id);if(foundItem)saveInventoryItem({...foundItem,stock:foundItem.stock+qty});audit("Carga de stock",`${item?.name} +${qty}`);setAddQtys(q=>({...q,[id]:""}));};
  const cats=["Todos",...(categories||["Cervezas","Aguardiente","Bebidas","Micheladas","Snacks"]),...new Set(inventory.filter(i=>!(categories||[]).includes(i.cat)).map(i=>i.cat))].filter((v,i,a)=>a.indexOf(v)===i);
  const filtered=filterCat==="Todos"?inventory:inventory.filter(i=>i.cat===filterCat);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <h2 style={{margin:0,fontSize:18,color:"#f5c842"}}>📦 Inventario</h2>
        <button onClick={()=>{setShow(!show);setEditId(null);setForm({name:"",cat:"",stock:"",min:"",unit:"und.",cost:"",price:""});}} style={btnS("amber")}>+ Agregar</button>
      </div>

      {/* Panel de promociones */}
      <div style={{padding:12,background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:12,marginBottom:12}}>
        <p style={{fontSize:11,color:"#a78bfa",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>🪣 Promociones / Cubetazos</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {key:"aguardiente", label:"Cubetazo Aguardiente", price:"$95.000", desc:"1 botella aguardiente + 6 cervezas"},
            {key:"cerveza",     label:"Cubetazo Cerveza",     price:"$20.000", desc:"6 cervezas de hasta 2 tipos"},
          ].map(promo=>(
            <div key={promo.key} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"rgba(255,255,255,0.03)",borderRadius:9}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:"#e8e0d0",fontWeight:600}}>🪣 {promo.label} <span style={{color:"#f5c842"}}>{promo.price}</span></div>
                <div style={{fontSize:10,color:"#555"}}>{promo.desc}</div>
              </div>
              <button onClick={()=>{
                setCubetazos(c=>({...c,[promo.key]:!c[promo.key]}));
                audit("Toggle cubetazo",`${promo.label} → ${!cubetazos[promo.key]?"activo":"inactivo"}`);
              }} style={{
                background:cubetazos[promo.key]?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.06)",
                border:`1px solid ${cubetazos[promo.key]?"rgba(52,211,153,0.4)":"rgba(255,255,255,0.15)"}`,
                color:cubetazos[promo.key]?"#34d399":"#555",
                borderRadius:20,padding:"5px 14px",cursor:"pointer",fontSize:12,fontWeight:600,whiteSpace:"nowrap",
              }}>
                {cubetazos[promo.key]?"✅ Activo":"⭕ Inactivo"}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        <div style={{padding:"9px 12px",background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.18)",borderRadius:10}}><div style={{fontSize:10,color:"#f87171"}}>⚠ STOCK BAJO</div><div style={{fontSize:18,fontWeight:700,color:"#f87171"}}>{inventory.filter(i=>i.stock<=i.min).length} productos</div></div>
        <div style={{padding:"9px 12px",background:"rgba(245,200,66,0.06)",border:"1px solid rgba(245,200,66,0.18)",borderRadius:10}}><div style={{fontSize:10,color:"#f5c842"}}>💰 VALOR INVENTARIO</div><div style={{fontSize:14,fontWeight:700,color:"#f5c842"}}>{fmt(inventory.reduce((s,i)=>s+(i.cost||0)*i.stock,0))}</div></div>
      </div>
      {show&&(
        <div style={{padding:14,background:"rgba(245,200,66,0.05)",border:"1px solid rgba(245,200,66,0.22)",borderRadius:13,marginBottom:13}}>
          <p style={{fontSize:12,color:"#f5c842",fontWeight:600,marginBottom:10}}>{editId?"✏️ Editar":"➕ Nuevo"}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {[["name","Nombre","text"],["stock","Stock","number"],["min","Stock mínimo","number"],["cost","Costo (COP)","number"],["price","Precio venta","number"]].map(([k,l,t])=>(
              <input key={k} type={t} placeholder={l} value={form[k]} onChange={e=>f(k,e.target.value)} style={inp}/>
            ))}
            {/* Selector de categoría */}
            <div style={{gridColumn:"span 2"}}>
              <select value={form.cat} onChange={e=>f("cat",e.target.value)} style={{...inp,background:"#1a1826",marginBottom:showNewCat?6:0}}>
                {(categories||[]).map(c=><option key={c} value={c}>{c}</option>)}
                <option value="__new__">+ Crear nueva categoría...</option>
              </select>
              {form.cat==="__new__"&&(
                <div style={{display:"flex",gap:6,marginTop:6}}>
                  <input placeholder="Nombre de la nueva categoría" value={newCat} onChange={e=>setNewCat(e.target.value)} style={{...inp,flex:1}}/>
                  <button onClick={()=>{if(newCat.trim()){saveCategories([...(categories||[]),newCat.trim()]);f("cat",newCat.trim());setNewCat("");}}} style={{...btnS("amber"),padding:"7px 12px",whiteSpace:"nowrap"}}>Crear</button>
                </div>
              )}
            </div>
            <select value={form.unit} onChange={e=>f("unit",e.target.value)} style={{...inp,background:"#1a1826",gridColumn:"span 2"}}>
              {["und.","bot.","kg.","lt.","caja"].map(u=><option key={u}>{u}</option>)}
            </select>
          </div>
          {form.cost>0&&form.price>0&&(
            <div style={{marginTop:8,padding:"7px 10px",background:"rgba(52,211,153,0.08)",borderRadius:8,fontSize:12}}>
              Margen: <strong style={{color:mc(Math.round(((form.price-form.cost)/form.price)*100))}}>{Math.round(((form.price-form.cost)/form.price)*100)}%</strong>
              <span style={{color:"#555",marginLeft:8}}>· Ganancia: {fmt(form.price-form.cost)}</span>
            </div>
          )}
          <div style={{display:"flex",gap:7,marginTop:10}}>
            <button onClick={()=>{setShow(false);setEditId(null);}} style={{...btnS("ghost"),flex:1,padding:"9px 0"}}>Cancelar</button>
            <button onClick={save} style={{...btnS("amber"),flex:1,padding:"9px 0"}}>{editId?"Guardar":"Agregar"}</button>
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:6,marginBottom:10}}>
        {cats.map(c=><button key={c} onClick={()=>setFilterCat(c)} style={{whiteSpace:"nowrap",padding:"5px 11px",borderRadius:20,border:"none",cursor:"pointer",fontSize:11,background:filterCat===c?"#f5c842":"rgba(255,255,255,0.06)",color:filterCat===c?"#0a0a0f":"#777",fontWeight:filterCat===c?700:400}}>{c}</button>)}
      </div>
      {filtered.map(item=>{
        const mg=margin(item),low=item.stock<=item.min;
        return (
          <div key={item.id} style={{marginBottom:10,padding:"11px 13px",background:low?"rgba(248,113,113,0.05)":"rgba(255,255,255,0.03)",border:`1px solid ${low?"rgba(248,113,113,0.25)":"rgba(255,255,255,0.08)"}`,borderRadius:12}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
              <div style={{flex:1}}><div style={{fontSize:13,color:"#e8e0d0",fontWeight:600}}>{item.name}</div><div style={{fontSize:11,color:"#555"}}>{item.cat}</div></div>
              <div style={{textAlign:"center",minWidth:52}}><div style={{fontSize:18,fontWeight:800,color:low?"#f87171":"#34d399",lineHeight:1}}>{item.stock}</div><div style={{fontSize:9,color:"#444"}}>{item.unit} · mín {item.min}</div></div>
              <button onClick={()=>startEdit(item)} style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,color:"#666",cursor:"pointer",padding:"3px 8px",fontSize:12}}>✏️</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:9}}>
              {[{l:"COSTO",v:fmt(item.cost||0),c:"#e8e0d0"},{l:"PRECIO VENTA",v:fmt(item.price||0),c:"#f5c842"},{l:"MARGEN",v:mg!==null?`${mg}%`:"—",c:mc(mg)}].map(s=>(
                <div key={s.l} style={{padding:"6px 8px",background:"rgba(255,255,255,0.03)",borderRadius:8}}>
                  <div style={{fontSize:9,color:"#555",marginBottom:1}}>{s.l}</div>
                  <div style={{fontSize:12,fontWeight:700,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              <input type="number" min="1" placeholder="Cant. a cargar" value={addQtys[item.id]||""} onChange={e=>setAddQtys(q=>({...q,[item.id]:e.target.value}))} style={{...inp,flex:1,padding:"6px 10px",fontSize:12}}/>
              <button onClick={()=>addStock(item.id)} style={{...btnS("green"),padding:"6px 14px",fontSize:12}}>+ Cargar</button>
              <button onClick={()=>{saveInventoryItem({...item,stock:Math.max(0,item.stock-1)});audit("Ajuste inventario",`${item.name} -1`);}} style={qBtn}>−</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXPENSES VIEW
// ═══════════════════════════════════════════════════════════════
// EXPENSES VIEW — Gastos del día + Gastos generales del mes
// ═══════════════════════════════════════════════════════════════
function ExpensesView({expenses,addExpense,deleteExpense,monthlyExp,addMonthlyExp,deleteMonthlyExp,audit,isAdmin}){
  const [tab,setTab]=useState("day");
  const [showDay,setShowDay]=useState(false);
  const [showMon,setShowMon]=useState(false);
  const [formDay,setFormDay]=useState({desc:"",cat:"Insumos",amount:"",date:today()});
  const [formMon,setFormMon]=useState({desc:"",cat:"Arriendo",amount:""});
  const totalDay=expenses.reduce((s,e)=>s+(e.amount||0),0);
  const totalMon=(monthlyExp||[]).reduce((s,e)=>s+(e.amount||0),0);

  return (
    <div>
      <h2 style={{margin:"0 0 12px",fontSize:18,color:"#f5c842"}}>💸 Gastos</h2>

      {/* Tabs */}
      <div style={{display:"flex",gap:5,marginBottom:14}}>
        <button onClick={()=>setTab("day")} style={{flex:1,padding:"8px 0",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:tab==="day"?"#f5c842":"rgba(255,255,255,0.05)",color:tab==="day"?"#0a0a0f":"#777"}}>
          📅 Gastos del día
        </button>
        <button onClick={()=>setTab("month")} style={{flex:1,padding:"8px 0",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:tab==="month"?"#a78bfa":"rgba(255,255,255,0.05)",color:tab==="month"?"#0a0a0f":"#777"}}>
          🏢 Gastos generales
        </button>
      </div>

      {/* ── GASTOS DEL DÍA ── */}
      {tab==="day"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div>
              <p style={{margin:0,fontSize:13,color:"#888"}}>Insumos, compras y operación del día</p>
              <p style={{margin:0,fontSize:11,color:"#555"}}>Se incluyen en el cierre del día</p>
            </div>
            <button onClick={()=>setShowDay(!showDay)} style={btnS("amber")}>+ Agregar</button>
          </div>
          <div style={{padding:"8px 12px",background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.18)",borderRadius:10,marginBottom:12,fontSize:13}}>
            Total hoy: <strong style={{color:"#f87171"}}>{fmt(totalDay)}</strong>
          </div>
          {showDay&&(
            <div style={{padding:13,background:"rgba(248,113,113,0.05)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:12,marginBottom:12}}>
              {[["desc","Descripción","text"],["amount","Monto","number"],["date","Fecha","date"]].map(([k,l,t])=>(
                <input key={k} type={t} placeholder={l} value={formDay[k]} onChange={e=>setFormDay(f=>({...f,[k]:e.target.value}))} style={{...inp,marginBottom:7}}/>
              ))}
              <select value={formDay.cat} onChange={e=>setFormDay(f=>({...f,cat:e.target.value}))} style={{...inp,marginBottom:7,background:"#1a1826"}}>
                {["Insumos","Personal","Mantenimiento","Otros"].map(c=><option key={c}>{c}</option>)}
              </select>
              <button onClick={()=>{if(formDay.desc&&formDay.amount){addExpense({...formDay,id:genId(),amount:+formDay.amount});audit("Gasto día",`${formDay.desc} ${fmt(+formDay.amount)}`);setFormDay({desc:"",cat:"Insumos",amount:"",date:today()});setShowDay(false);}}} style={{...btnS("red"),width:"100%",padding:"9px 0"}}>Registrar gasto del día</button>
            </div>
          )}
          {expenses.length===0&&<p style={{color:"#444",fontSize:13,textAlign:"center",padding:20}}>Sin gastos registrados hoy</p>}
          {expenses.map(e=>(
            <div key={e.id} style={{...card(),display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:13,color:"#e8e0d0"}}>{e.desc}</div><div style={{fontSize:11,color:"#555"}}>{e.cat} · {e.date}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{fontSize:14,fontWeight:600,color:"#f87171"}}>{fmt(e.amount)}</span>
                <button onClick={()=>{deleteExpense(e.id);audit("Gasto eliminado",e.desc);}} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:16}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── GASTOS GENERALES DEL MES ── */}
      {tab==="month"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div>
              <p style={{margin:0,fontSize:13,color:"#888"}}>Arriendo, servicios, nómina mensual</p>
              <p style={{margin:0,fontSize:11,color:"#555"}}>Se descuentan en el balance mensual, no del día</p>
            </div>
            <button onClick={()=>setShowMon(!showMon)} style={btnS("purple")}>+ Agregar</button>
          </div>
          <div style={{padding:"8px 12px",background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:10,marginBottom:12,fontSize:13}}>
            Total gastos fijos del mes: <strong style={{color:"#a78bfa"}}>{fmt(totalMon)}</strong>
          </div>
          {showMon&&(
            <div style={{padding:13,background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:12,marginBottom:12}}>
              <input placeholder="Descripción (ej: Arriendo local)" value={formMon.desc} onChange={e=>setFormMon(f=>({...f,desc:e.target.value}))} style={{...inp,marginBottom:7}}/>
              <input type="number" placeholder="Monto" value={formMon.amount} onChange={e=>setFormMon(f=>({...f,amount:e.target.value}))} style={{...inp,marginBottom:7}}/>
              <select value={formMon.cat} onChange={e=>setFormMon(f=>({...f,cat:e.target.value}))} style={{...inp,marginBottom:7,background:"#1a1826"}}>
                {["Arriendo","Servicios públicos","Nómina","Seguridad social","Impuestos","Otros"].map(c=><option key={c}>{c}</option>)}
              </select>
              <button onClick={()=>{if(formMon.desc&&formMon.amount){addMonthlyExp({...formMon,id:genId(),amount:+formMon.amount});audit("Gasto mensual",`${formMon.desc} ${fmt(+formMon.amount)}`);setFormMon({desc:"",cat:"Arriendo",amount:""});setShowMon(false);}}} style={{...btnS("purple"),width:"100%",padding:"9px 0"}}>Registrar gasto fijo</button>
            </div>
          )}
          {(monthlyExp||[]).length===0&&<p style={{color:"#444",fontSize:13,textAlign:"center",padding:20}}>Sin gastos fijos registrados este mes</p>}
          {(monthlyExp||[]).map(e=>(
            <div key={e.id} style={{...card(),display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid rgba(167,139,250,0.15)"}}>
              <div><div style={{fontSize:13,color:"#e8e0d0"}}>{e.desc}</div><div style={{fontSize:11,color:"#555"}}>{e.cat}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{fontSize:14,fontWeight:600,color:"#a78bfa"}}>{fmt(e.amount)}</span>
                <button onClick={()=>{deleteMonthlyExp(e.id);audit("Gasto fijo eliminado",e.desc);}} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:16}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// USERS VIEW (solo admin)
// ═══════════════════════════════════════════════════════════════
function UsersView({users,saveUser,deleteUserFB,audit,currentUser}){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({name:"",username:"",password:"",role:"mesero"});
  const [editId,setEditId]=useState(null);
  const [confirmDel,setConfirmDel]=useState(null);

  const save=()=>{
    if(!form.name||!form.username||!form.password) return;
    if(editId){saveUser({...users.find(x=>x.id===editId),...form});audit("Editar usuario",form.username);}
    else{saveUser({...form,id:genId(),active:true});audit("Crear usuario",`${form.username} (${form.role})`);}
    setForm({name:"",username:"",password:"",role:"mesero"});setShow(false);setEditId(null);
  };

  const toggle=(id)=>{
    const u=users.find(x=>x.id===id);
    if(u.id===currentUser.id) return;
    saveUser({...u,active:!u.active});
    audit("Toggle usuario",`${u.username} → ${u.active?"inactivo":"activo"}`);
  };

  const deleteUser=(id)=>{
    const u=users.find(x=>x.id===id);
    if(!u||u.id===currentUser.id) return;
    deleteUserFB(id);
    audit("Eliminar usuario",u.username);
    setConfirmDel(null);
  };

  const meseroCount=users.filter(u=>u.role==="mesero"&&u.active).length;
  const adminCount=users.filter(u=>u.role==="admin"&&u.active).length;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <h2 style={{margin:0,fontSize:18,color:"#60a5fa"}}>👥 Usuarios</h2>
          <p style={{margin:0,fontSize:11,color:"#555"}}>{adminCount} admin · {meseroCount} meseros activos</p>
        </div>
        <button onClick={()=>{setShow(!show);setEditId(null);setForm({name:"",username:"",password:"",role:"mesero"});}} style={btnS("blue")}>+ Crear</button>
      </div>

      {show&&(
        <div style={{padding:14,background:"rgba(96,165,250,0.05)",border:"1px solid rgba(96,165,250,0.22)",borderRadius:13,marginBottom:13}}>
          <p style={{fontSize:12,color:"#60a5fa",fontWeight:600,marginBottom:10}}>{editId?"Editar usuario":"Nuevo usuario"}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            <input placeholder="Nombre completo" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={inp}/>
            <input placeholder="Usuario (login)" value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))} style={inp}/>
            <input placeholder="Contraseña" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} style={inp}/>
            <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={{...inp,background:"#1a1826"}}>
              <option value="mesero">Mesero</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div style={{marginTop:8,padding:"8px 10px",background:form.role==="admin"?"rgba(245,200,66,0.08)":"rgba(52,211,153,0.08)",borderRadius:8,fontSize:11,color:form.role==="admin"?"#f5c842":"#34d399"}}>
            {form.role==="admin"
              ?"⚡ Admin: mesas, inventario, gastos, reportes mensuales, usuarios, auditoría y cierre de noche"
              :"🪑 Mesero: mesas (abrir, pedir, cobrar) + registro de gastos del día + cierre de noche"}
          </div>
          <div style={{display:"flex",gap:7,marginTop:10}}>
            <button onClick={()=>{setShow(false);setEditId(null);}} style={{...btnS("ghost"),flex:1,padding:"9px 0"}}>Cancelar</button>
            <button onClick={save} style={{...btnS("blue"),flex:1,padding:"9px 0"}}>{editId?"Guardar cambios":"Crear usuario"}</button>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      <p style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Administradores</p>
      {users.filter(u=>u.role==="admin").map(u=>(
        <div key={u.id} style={{...card(),opacity:u.active?1:0.55,border:"1px solid rgba(245,200,66,0.2)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(245,200,66,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>👑</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:"#e8e0d0",fontWeight:600}}>{u.name} {u.id===currentUser.id&&<span style={{fontSize:10,color:"#f5c842"}}>(tú)</span>}</div>
              <div style={{fontSize:11,color:"#555"}}>@{u.username} · <span style={{color:"#f5c842"}}>administrador</span> · {u.active?"activo":"inactivo"}</div>
            </div>
            <div style={{display:"flex",gap:5}}>
              <button onClick={()=>{setForm({name:u.name,username:u.username,password:u.password,role:u.role});setEditId(u.id);setShow(true);}} style={{...btnS("ghost"),padding:"5px 9px",fontSize:12}}>✏️</button>
              {u.id!==currentUser.id&&<button onClick={()=>toggle(u.id)} style={{...btnS(u.active?"red":"green"),padding:"5px 9px",fontSize:12}}>{u.active?"Desact.":"Activar"}</button>}
            </div>
          </div>
        </div>
      ))}

      <p style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:14}}>Meseros</p>
      {users.filter(u=>u.role==="mesero").length===0&&(
        <p style={{color:"#444",fontSize:13,textAlign:"center",padding:16}}>Sin meseros creados</p>
      )}
      {users.filter(u=>u.role==="mesero").map(u=>(
        <div key={u.id} style={{...card(),opacity:u.active?1:0.55,border:"1px solid rgba(96,165,250,0.15)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(96,165,250,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🪑</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:"#e8e0d0",fontWeight:600}}>{u.name}</div>
              <div style={{fontSize:11,color:"#555"}}>@{u.username} · <span style={{color:"#60a5fa"}}>mesero</span> · {u.active?"activo":"inactivo"}</div>
            </div>
            <div style={{display:"flex",gap:5}}>
              <button onClick={()=>{setForm({name:u.name,username:u.username,password:u.password,role:u.role});setEditId(u.id);setShow(true);}} style={{...btnS("ghost"),padding:"5px 9px",fontSize:12}}>✏️</button>
              <button onClick={()=>toggle(u.id)} style={{...btnS(u.active?"red":"green"),padding:"5px 9px",fontSize:12}}>{u.active?"Desact.":"Activar"}</button>
              <button onClick={()=>setConfirmDel(u.id)} style={{...btnS("red"),padding:"5px 9px",fontSize:12}}>🗑</button>
            </div>
          </div>
        </div>
      ))}

      {/* Modal confirmación de eliminación */}
      {confirmDel&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}>
          <div style={{background:"#12101c",border:"1px solid rgba(248,113,113,0.35)",borderRadius:16,padding:24,maxWidth:300,width:"100%"}}>
            <p style={{textAlign:"center",fontSize:32,marginBottom:8}}>🗑</p>
            <p style={{textAlign:"center",color:"#f87171",fontWeight:700,fontSize:16,marginBottom:6}}>¿Eliminar usuario?</p>
            <p style={{textAlign:"center",color:"#888",fontSize:13,marginBottom:20}}>
              <strong style={{color:"#e8e0d0"}}>{users.find(u=>u.id===confirmDel)?.name}</strong><br/>
              Esta acción no se puede deshacer.
            </p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setConfirmDel(null)} style={{...btnS("ghost"),flex:1,padding:"9px 0"}}>Cancelar</button>
              <button onClick={()=>deleteUser(confirmDel)} style={{...btnS("red"),flex:1,padding:"9px 0"}}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AUDIT VIEW
// ═══════════════════════════════════════════════════════════════
function AuditView({auditLog}){
  const [filter,setFilter]=useState("");
  const [selected,setSelected]=useState(null); // entrada seleccionada para ver detalle
  const filtered=auditLog.filter(e=>!filter||
    (e.user||"").toLowerCase().includes(filter.toLowerCase())||
    (e.action||"").toLowerCase().includes(filter.toLowerCase())||
    (e.detail||"").toLowerCase().includes(filter.toLowerCase())
  );

  // Modal de detalle de cierre de mesa
  if(selected?.tableDetail){
    const td=selected.tableDetail;
    const allItems=(td.rounds||[]).flatMap(r=>r.items||[]);
    return (
      <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"#666",fontSize:22,cursor:"pointer"}}>←</button>
          <div style={{flex:1}}>
            <h2 style={{margin:0,fontSize:18,color:"#f5c842"}}>Mesa {td.mesa} — Detalle</h2>
            <p style={{margin:0,fontSize:11,color:"#555"}}>{td.openedAt} → {td.closedAt} · {td.closedBy}</p>
          </div>
        </div>
        {/* Resumen financiero */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:14}}>
          {[{l:"Total venta",v:fmt(td.totalVenta),c:"#f5c842"},{l:"Efectivo",v:fmt(td.totalEfectivo||0),c:"#34d399"},{l:"Transferencia",v:fmt(td.totalTransferencia||0),c:"#60a5fa"}].map(s=>(
            <div key={s.l} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:"#555"}}>{s.l}</div>
              <div style={{fontSize:13,fontWeight:700,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>
        {/* Rondas y productos */}
        {(td.rounds||[]).map((r,ri)=>(
          <div key={ri} style={{marginBottom:10,borderRadius:11,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{padding:"7px 12px",background:"rgba(255,255,255,0.03)",display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:11,fontWeight:700,color:"#888"}}>🕐 Ronda {r.num} — {r.time} ({(r.items||[]).reduce((s,i)=>s+i.qty,0)} und.)</span>
              <span style={{fontSize:11,fontWeight:600,color:"#e8e0d0"}}>{fmt((r.items||[]).reduce((s,i)=>s+i.price*i.qty,0))}</span>
            </div>
            <div style={{padding:"7px 12px"}}>
              {(r.items||[]).map((it,ii)=>(
                <div key={ii} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <div>
                    <span style={{fontSize:12,color:it.paid?"#34d399":"#f87171"}}>{it.paid?"✓":"⏳"} {it.name} ×{it.qty}</span>
                    {it.paid&&<span style={{fontSize:10,color:"#555",marginLeft:6}}>· {it.payMethod}</span>}
                  </div>
                  <span style={{fontSize:12,fontWeight:600,color:it.paid?"#34d399":"#888"}}>{fmt(it.price*it.qty)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {/* Pagos parciales */}
        {(td.payments||[]).length>0&&(
          <div style={{padding:12,background:"rgba(52,211,153,0.05)",border:"1px solid rgba(52,211,153,0.15)",borderRadius:11,marginBottom:10}}>
            <p style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Pagos parciales</p>
            {td.payments.map((p,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:12,color:"#34d399"}}>{p.method==="efectivo"?"💵":"📲"} {p.method}{p.note?` · ${p.note}`:""}</span>
                <span style={{fontSize:12,fontWeight:600,color:"#34d399"}}>{fmt(p.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{margin:"0 0 12px",fontSize:18,color:"#888"}}>📋 Auditoría</h2>
      <input placeholder="Buscar por usuario, acción o detalle..." value={filter} onChange={e=>setFilter(e.target.value)} style={{...inp,marginBottom:12}}/>
      <p style={{fontSize:11,color:"#555",marginBottom:10}}>{filtered.length} registros</p>
      {filtered.length===0&&<p style={{color:"#444",fontSize:13,textAlign:"center",padding:24}}>Sin registros aún</p>}
      {filtered.map(e=>{
        const isMesa=e.action==="Cerrar mesa"&&e.tableDetail;
        return (
          <div key={e.id}
            onClick={isMesa?()=>setSelected(e):undefined}
            style={{display:"flex",gap:10,padding:"9px 12px",background:isMesa?"rgba(245,200,66,0.04)":"rgba(255,255,255,0.02)",border:`1px solid ${isMesa?"rgba(245,200,66,0.2)":"rgba(255,255,255,0.06)"}`,borderRadius:10,marginBottom:7,cursor:isMesa?"pointer":"default",transition:"all 0.15s"}}
            onMouseEnter={isMesa?e2=>{e2.currentTarget.style.borderColor="rgba(245,200,66,0.4)";}:undefined}
            onMouseLeave={isMesa?e2=>{e2.currentTarget.style.borderColor="rgba(245,200,66,0.2)";}:undefined}
          >
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:"#e8e0d0"}}>
                <span style={{color:isMesa?"#f5c842":"#888",fontWeight:600}}>{e.action}</span>
                {e.detail?` — ${e.detail}`:""}
              </div>
              <div style={{fontSize:10,color:"#555"}}>{e.at} · {e.user}</div>
            </div>
            {isMesa&&<span style={{fontSize:11,color:"#f5c842",alignSelf:"center"}}>Ver detalle →</span>}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NIGHT REPORT VIEW
// ═══════════════════════════════════════════════════════════════
function NightReportView({report,onBack,username,isAdmin,credits,onExport}){
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#666",fontSize:22,cursor:"pointer"}}>←</button>
        <div style={{flex:1}}><h2 style={{margin:0,fontSize:20,color:"#f5c842"}}>🌙 Cierre de Noche</h2><p style={{margin:0,fontSize:11,color:"#555"}}>{today()} · {username}</p></div>
        {isAdmin && <button onClick={onExport} style={{...btnS("green"),padding:"8px 14px",fontSize:12}}>📥 Excel</button>}
      </div>

      {/* Resultado neto — destacado arriba para todos */}
      <div style={{padding:16,background:report.net>=0?"rgba(52,211,153,0.08)":"rgba(248,113,113,0.08)",border:`1px solid ${report.net>=0?"rgba(52,211,153,0.35)":"rgba(248,113,113,0.35)"}`,borderRadius:14,marginBottom:14,textAlign:"center"}}>
        <p style={{fontSize:11,color:"#666",textTransform:"uppercase",letterSpacing:1,margin:"0 0 6px"}}>Resultado neto de la noche</p>
        <div style={{fontSize:32,fontWeight:800,color:report.net>=0?"#34d399":"#f87171"}}>{fmt(report.net)}</div>
        <p style={{fontSize:11,color:"#666",margin:"6px 0 0"}}>Ventas {fmt(report.gross)} − Gastos {fmt(report.expenses||0)}</p>
      </div>

      {/* Desglose financiero */}
      <div style={{padding:15,background:"rgba(245,200,66,0.05)",border:"1px solid rgba(245,200,66,0.22)",borderRadius:14,marginBottom:14}}>
        <p style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:11}}>Desglose de ingresos</p>
        {[
          {l:"💰 Ventas brutas",    v:fmt(report.gross),    c:"#f5c842"},
          {l:"💵 Efectivo recibido",v:fmt(report.cash),     c:"#34d399"},
          {l:"📲 Transferencias",   v:fmt(report.transfer), c:"#60a5fa"},
        ].map(s=>(
          <div key={s.l} style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:13,color:"#888"}}>{s.l}</span><span style={{fontSize:14,fontWeight:600,color:s.c}}>{s.v}</span></div>
        ))}
      </div>

      {/* Gastos — visible para todos */}
      <div style={{padding:14,background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.22)",borderRadius:14,marginBottom:14}}>
        <p style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>💸 Gastos del día</p>
        {(report.expensesList||[]).length===0&&<p style={{color:"#555",fontSize:12,textAlign:"center"}}>Sin gastos registrados</p>}
        {(report.expensesList||[]).map((e,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:12,color:"#888"}}>{e.desc} <span style={{color:"#555",fontSize:10}}>· {e.cat}</span></span>
            <span style={{fontSize:12,fontWeight:600,color:"#f87171"}}>{fmt(e.amount)}</span>
          </div>
        ))}
        <div style={{height:1,background:"rgba(248,113,113,0.2)",margin:"8px 0"}}/>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:"#f87171",fontWeight:700}}>Total gastos</span>
          <span style={{fontSize:14,color:"#f87171",fontWeight:800}}>{fmt(report.expenses||0)}</span>
        </div>
      </div>

      {/* Créditos del día */}
      <div style={{padding:14,background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.2)",borderRadius:14,marginBottom:14}}>
        <p style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>📒 Créditos del día</p>
        {(report.pendingCredits||[]).length===0&&(report.paidCreditsToday||[]).length===0&&(
          <p style={{color:"#555",fontSize:12,textAlign:"center"}}>Sin créditos este día</p>
        )}
        {(report.pendingCredits||[]).map((c,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:12,color:"#f87171"}}>⏳ {c.clientName}</span>
            <span style={{fontSize:12,fontWeight:600,color:"#f87171"}}>{fmt(c.total)}</span>
          </div>
        ))}
        {(report.paidCreditsToday||[]).map((c,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:12,color:"#34d399"}}>✅ {c.clientName} · {c.payMethod}</span>
            <span style={{fontSize:12,fontWeight:600,color:"#34d399"}}>{fmt(c.total)}</span>
          </div>
        ))}
        {(report.creditsTotal||0)>0&&(
          <div style={{borderTop:"1px solid rgba(96,165,250,0.2)",marginTop:6,paddingTop:6,display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:12,color:"#60a5fa",fontWeight:700}}>Cobrado hoy en créditos</span>
            <span style={{fontSize:13,color:"#60a5fa",fontWeight:800}}>{fmt(report.creditsTotal)}</span>
          </div>
        )}
      </div>

      {/* Ventas por producto — solo admin */}
      {isAdmin && (
        <div style={{padding:13,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,marginBottom:12}}>
          <p style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Ventas por producto</p>
          {report.byProd.length===0&&<p style={{color:"#444",fontSize:12,textAlign:"center"}}>Sin ventas registradas</p>}
          {report.byProd.map(p=>(
            <div key={p.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <div><div style={{fontSize:13,color:"#e8e0d0"}}>{p.name}</div><div style={{fontSize:11,color:"#666"}}>{p.units} unidades</div></div>
              <span style={{fontSize:13,fontWeight:600,color:"#f5c842"}}>{fmt(p.total)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Inventario final — solo admin */}
      {isAdmin && (
        <div style={{padding:13,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14}}>
          <p style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Inventario al cierre</p>
          {report.inventory.map(i=>(
            <div key={i.id} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,color:i.stock<=i.min?"#f87171":"#888"}}>{i.stock<=i.min?"⚠ ":""}{i.name}</span>
              <span style={{fontSize:12,fontWeight:600,color:i.stock<=i.min?"#f87171":"#34d399"}}>{i.stock} {i.unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MONTHLY VIEW
// ═══════════════════════════════════════════════════════════════
function MonthlyView({dailyLog,inventory,monthlyExp,credits,onBack,onCloseMonth}){
  const [section,setSection]=useState("resumen");
  const [confirmReset,setConfirmReset]=useState(false);
  const [selectedDay,setSelectedDay]=useState(null); // reporte de día seleccionado
  const totalGross=dailyLog.reduce((s,d)=>s+d.gross,0);
  const totalCreditsCollected=dailyLog.reduce((s,d)=>s+(d.creditsTotal||0),0);
  const pendingCreditsTotal=(credits||[]).filter(c=>c.status==="pending").reduce((s,c)=>s+c.total,0);
  const totalCash=dailyLog.reduce((s,d)=>s+d.cash,0);
  const totalTransfer=dailyLog.reduce((s,d)=>s+d.transfer,0);
  const totalExpDay=dailyLog.reduce((s,d)=>s+(d.expenses||0),0);
  const totalExpMonth=(monthlyExp||[]).reduce((s,e)=>s+(e.amount||0),0);
  const totalExp=totalExpDay+totalExpMonth;
  const totalNet=totalGross-totalExp;
  const avgNight=dailyLog.length?Math.round(totalGross/dailyLog.length):0;
  const pm={};
  dailyLog.forEach(d=>Object.entries(d.byProd||{}).forEach(([name,v])=>{if(!pm[name])pm[name]={name,units:0,total:0};pm[name].units+=v.units;pm[name].total+=v.total;}));
  const prodList=Object.values(pm).sort((a,b)=>b.total-a.total);
  const dowMap={};
  DIAS.forEach(d=>{dowMap[d]={dow:d,count:0,gross:0};});
  dailyLog.forEach(d=>{if(dowMap[d.dow]){dowMap[d.dow].count++;dowMap[d.dow].gross+=d.gross;}});
  const dowList=DIAS.map(d=>({dow:d,count:dowMap[d].count,gross:dowMap[d].gross,avg:dowMap[d].count?Math.round(dowMap[d].gross/dowMap[d].count):0}));
  const maxDow=Math.max(...dowList.map(d=>d.gross),1);
  const sorted=[...dailyLog].sort((a,b)=>b.gross-a.gross);
  const best3=sorted.slice(0,3),worst3=sorted.slice(-3).reverse();
  const bc=(v,max)=>{const p=v/max;return p>=0.75?"#f5c842":p>=0.4?"#60a5fa":"#f87171";};
  const now2=new Date();
  const mesLabel=`${MESES[now2.getMonth()]} ${now2.getFullYear()}`;
  const doExport=()=>exportToExcel(buildMonthlyReport(dailyLog,inventory,monthlyExp),`Reporte_Mensual_${mesLabel}`);

  // ── Vista de reporte de un día específico ──────────────────
  if(selectedDay){
    const d=selectedDay;
    const byPArr=Object.values(d.byProd||{}).sort((a,b)=>b.total-a.total);
    const invMap={};(inventory||[]).forEach(i=>{invMap[i.name]=i;});
    return (
      <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <button onClick={()=>setSelectedDay(null)} style={{background:"none",border:"none",color:"#666",fontSize:22,cursor:"pointer"}}>←</button>
          <div style={{flex:1}}>
            <h2 style={{margin:0,fontSize:18,color:"#f5c842"}}>🌙 {d.label||d.date}</h2>
            <p style={{margin:0,fontSize:11,color:"#555"}}>{d.openedAt||""} → {d.closedAt||""} · {d.closedBy||""}</p>
          </div>
          <button onClick={()=>exportToExcel(buildNightReport({...d,byProd:byPArr,totalExp:d.expenses||0,net:d.net||0},d.date,d.closedBy||""),`Cierre_${d.date}`)} style={{...btnS("green"),padding:"7px 12px",fontSize:12}}>📥 Excel</button>
        </div>
        {/* Resultado neto */}
        <div style={{padding:16,background:(d.net||0)>=0?"rgba(52,211,153,0.08)":"rgba(248,113,113,0.08)",border:`1px solid ${(d.net||0)>=0?"rgba(52,211,153,0.35)":"rgba(248,113,113,0.35)"}`,borderRadius:14,marginBottom:14,textAlign:"center"}}>
          <p style={{fontSize:11,color:"#666",textTransform:"uppercase",letterSpacing:1,margin:"0 0 6px"}}>Resultado neto</p>
          <div style={{fontSize:32,fontWeight:800,color:(d.net||0)>=0?"#34d399":"#f87171"}}>{fmt(d.net||0)}</div>
          <p style={{fontSize:11,color:"#666",margin:"6px 0 0"}}>Ventas {fmt(d.gross||0)} − Gastos {fmt(d.expenses||0)}</p>
        </div>
        {/* Desglose */}
        <div style={{padding:13,background:"rgba(245,200,66,0.05)",border:"1px solid rgba(245,200,66,0.2)",borderRadius:13,marginBottom:12}}>
          <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Desglose de ingresos</p>
          {[{l:"💰 Ventas brutas",v:fmt(d.gross||0),c:"#f5c842"},{l:"💵 Efectivo",v:fmt(d.cash||0),c:"#34d399"},{l:"📲 Transferencias",v:fmt(d.transfer||0),c:"#60a5fa"},{l:"🏦 Base de caja",v:fmt(d.baseCash||0),c:"#888"}].map(s=>(
            <div key={s.l} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:"#888"}}>{s.l}</span><span style={{fontSize:13,fontWeight:600,color:s.c}}>{s.v}</span></div>
          ))}
        </div>
        {/* Gastos */}
        <div style={{padding:13,background:"rgba(248,113,113,0.06)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:13,marginBottom:12}}>
          <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>💸 Gastos del día</p>
          {(d.expensesList||[]).length===0&&<p style={{color:"#555",fontSize:12,textAlign:"center"}}>Sin gastos</p>}
          {(d.expensesList||[]).map((e,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontSize:12,color:"#888"}}>{e.desc} · {e.cat}</span>
              <span style={{fontSize:12,color:"#f87171",fontWeight:600}}>{fmt(e.amount)}</span>
            </div>
          ))}
          <div style={{height:1,background:"rgba(248,113,113,0.2)",margin:"7px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#f87171",fontWeight:700}}>Total</span><span style={{fontSize:13,color:"#f87171",fontWeight:800}}>{fmt(d.expenses||0)}</span></div>
        </div>
        {/* Ventas por producto */}
        <div style={{padding:13,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:13,marginBottom:12}}>
          <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Ventas por producto</p>
          {byPArr.length===0&&<p style={{color:"#444",fontSize:12,textAlign:"center"}}>Sin ventas registradas</p>}
          {byPArr.map(p=>{
            const inv=invMap[p.name];
            const costo=(inv?.cost||0)*p.units;
            const ganancia=p.total-costo;
            return (
              <div key={p.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div><div style={{fontSize:12,color:"#e8e0d0"}}>{p.name}</div><div style={{fontSize:10,color:"#555"}}>{p.units} und. · Ganancia: <span style={{color:"#34d399"}}>{fmt(ganancia)}</span></div></div>
                <span style={{fontSize:12,fontWeight:600,color:"#f5c842"}}>{fmt(p.total)}</span>
              </div>
            );
          })}
        </div>
        {/* Inventario al cierre */}
        {(d.inventory||[]).length>0&&(
          <div style={{padding:13,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:13}}>
            <p style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Inventario al cierre</p>
            {(d.inventory||[]).map(i=>(
              <div key={i.id||i.name} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:12,color:i.stock<=i.min?"#f87171":"#888"}}>{i.stock<=i.min?"⚠ ":""}{i.name}</span>
                <span style={{fontSize:12,fontWeight:600,color:i.stock<=i.min?"#f87171":"#34d399"}}>{i.stock} {i.unit}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  const totalCash=dailyLog.reduce((s,d)=>s+d.cash,0);
  const totalTransfer=dailyLog.reduce((s,d)=>s+d.transfer,0);
  const totalExpDay=dailyLog.reduce((s,d)=>s+(d.expenses||0),0);
  const totalExpMonth=(monthlyExp||[]).reduce((s,e)=>s+(e.amount||0),0);
  const totalExp=totalExpDay+totalExpMonth;
  const totalNet=totalGross-totalExp;
  const avgNight=dailyLog.length?Math.round(totalGross/dailyLog.length):0;
  const pm={};
  dailyLog.forEach(d=>Object.entries(d.byProd||{}).forEach(([name,v])=>{if(!pm[name])pm[name]={name,units:0,total:0};pm[name].units+=v.units;pm[name].total+=v.total;}));
  const prodList=Object.values(pm).sort((a,b)=>b.total-a.total);
  const dowMap={};
  DIAS.forEach(d=>{dowMap[d]={dow:d,count:0,gross:0};});
  dailyLog.forEach(d=>{if(dowMap[d.dow]){dowMap[d.dow].count++;dowMap[d.dow].gross+=d.gross;}});
  const dowList=DIAS.map(d=>({dow:d,count:dowMap[d].count,gross:dowMap[d].gross,avg:dowMap[d].count?Math.round(dowMap[d].gross/dowMap[d].count):0}));
  const maxDow=Math.max(...dowList.map(d=>d.gross),1);
  const sorted=[...dailyLog].sort((a,b)=>b.gross-a.gross);
  const best3=sorted.slice(0,3),worst3=sorted.slice(-3).reverse();
  const bc=(v,max)=>{const p=v/max;return p>=0.75?"#f5c842":p>=0.4?"#60a5fa":"#f87171";};
  const now2=new Date();
  const mesLabel=`${MESES[now2.getMonth()]} ${now2.getFullYear()}`;
  const doExport=()=>exportToExcel(buildMonthlyReport(dailyLog,inventory,monthlyExp),`Reporte_Mensual_${mesLabel}`);

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#666",fontSize:22,cursor:"pointer"}}>←</button>
        <div style={{flex:1}}><h2 style={{margin:0,fontSize:19,color:"#a78bfa"}}>📊 Cierre Mensual</h2><p style={{margin:0,fontSize:11,color:"#555"}}>{mesLabel} · {dailyLog.length} noches</p></div>
        <button onClick={doExport} style={{...btnS("green"),padding:"7px 12px",fontSize:12}}>📥 Excel</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5,marginBottom:14}}>
        {[{k:"resumen",l:"💰 Resumen"},{k:"dias",l:"📅 Días"},{k:"productos",l:"🍺 Productos"},{k:"marketing",l:"📣 Marketing"}].map(t=>(
          <button key={t.k} onClick={()=>setSection(t.k)} style={{padding:"7px 0",borderRadius:9,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:section===t.k?"#a78bfa":"rgba(255,255,255,0.05)",color:section===t.k?"#0a0a0f":"#666"}}>{t.l}</button>
        ))}
      </div>

      {section==="resumen"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            {[{l:"Total vendido",v:fmt(totalGross),c:"#f5c842",icon:"💰"},{l:"Promedio/noche",v:fmt(avgNight),c:"#a78bfa",icon:"📈"},{l:"Efectivo",v:fmt(totalCash),c:"#34d399",icon:"💵"},{l:"Transferencias",v:fmt(totalTransfer),c:"#60a5fa",icon:"📲"},{l:"Gastos del día",v:fmt(totalExpDay),c:"#f87171",icon:"💸"},{l:"Gastos fijos mes",v:fmt(totalExpMonth),c:"#f87171",icon:"🏢"},{l:"Total gastos",v:fmt(totalExp),c:"#f87171",icon:"📊"},{l:"Resultado neto",v:fmt(totalNet),c:totalNet>=0?"#34d399":"#f87171",icon:"🏆"}].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"11px 13px"}}>
                <div style={{fontSize:11,color:"#555",marginBottom:3}}>{s.icon} {s.l}</div>
                <div style={{fontSize:15,fontWeight:700,color:s.c}}>{s.v}</div>
              </div>
            ))}
          </div>
          {/* Gastos fijos detalle */}
          {(monthlyExp||[]).length>0&&(
            <div style={{padding:12,background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:12,marginBottom:12}}>
              <p style={{fontSize:11,color:"#a78bfa",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>🏢 Gastos fijos del mes</p>
              {(monthlyExp||[]).map(e=>(
                <div key={e.id} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:"#888"}}>{e.desc} <span style={{color:"#555",fontSize:10}}>· {e.cat}</span></span>
                  <span style={{fontSize:12,fontWeight:600,color:"#a78bfa"}}>{fmt(e.amount)}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:14,marginBottom:12}}>
            <p style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Ventas por noche</p>
            {dailyLog.length===0&&<p style={{color:"#444",fontSize:12,textAlign:"center",padding:12}}>Sin noches registradas</p>}
            {(()=>{const maxG=Math.max(...dailyLog.map(d=>d.gross),1);return [...dailyLog].sort((a,b)=>b.date.localeCompare(a.date)).map(d=>(
              <div key={d.date} onClick={()=>setSelectedDay(d)} style={{marginBottom:8,cursor:"pointer",padding:"8px 10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.05)",transition:"all 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(245,200,66,0.3)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.05)"}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,color:"#888"}}>{d.dow} {d.date.slice(5)}{d.closedBy?` · ${d.closedBy}`:""}</span>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,fontWeight:600,color:"#f5c842"}}>{fmt(d.gross)}</span>
                    <span style={{fontSize:10,color:"#555"}}>Ver →</span>
                  </div>
                </div>
                <div style={{background:"rgba(255,255,255,0.05)",borderRadius:4,height:6,overflow:"hidden"}}>
                  <div style={{width:`${(d.gross/maxG)*100}%`,height:"100%",borderRadius:4,background:bc(d.gross,maxG)}}/>
                </div>
              </div>
            ));})()}
          </div>
          {!confirmReset?(
            <button onClick={()=>setConfirmReset(true)} style={{...btnS("red"),width:"100%",padding:"11px 0",fontSize:13}}>🗓 Cerrar mes y reiniciar contador</button>
          ):(
            <div style={{padding:14,background:"rgba(248,113,113,0.07)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:12}}>
              <p style={{color:"#f87171",fontSize:13,textAlign:"center",marginBottom:12}}>¿Confirmar cierre de {mesLabel}?</p>
              <div style={{display:"flex",gap:8}}><button onClick={()=>setConfirmReset(false)} style={{...btnS("ghost"),flex:1,padding:"9px 0"}}>Cancelar</button><button onClick={()=>{onCloseMonth();setConfirmReset(false);}} style={{...btnS("red"),flex:1,padding:"9px 0"}}>Confirmar</button></div>
            </div>
          )}
        </div>
      )}

      {section==="dias"&&(
        <div>
          <p style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Rendimiento por día de la semana</p>
          {dowList.map(d=>{const pct=d.gross/maxDow;return(
            <div key={d.dow} style={{marginBottom:12,padding:"11px 13px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div><span style={{fontSize:14,fontWeight:700,color:bc(d.gross,maxDow)}}>{d.dow}</span><span style={{fontSize:11,color:"#555",marginLeft:8}}>{d.count} noches</span></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:600,color:"#e8e0d0"}}>{fmt(d.gross)}</div><div style={{fontSize:10,color:"#555"}}>prom. {fmt(d.avg)}/noche</div></div>
              </div>
              <div style={{background:"rgba(255,255,255,0.05)",borderRadius:4,height:6,overflow:"hidden"}}><div style={{width:`${pct*100}%`,height:"100%",borderRadius:4,background:bc(d.gross,maxDow)}}/></div>
            </div>
          );})}
          {dailyLog.length>0&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
              {[{title:"🔥 Mejores noches",items:best3,c:"#34d399"},{title:"❄️ Noches suaves",items:worst3,c:"#f87171"}].map(g=>(
                <div key={g.title} style={{padding:12,background:`${g.c}0f`,border:`1px solid ${g.c}30`,borderRadius:12}}>
                  <p style={{fontSize:11,color:g.c,marginBottom:8,fontWeight:600}}>{g.title}</p>
                  {g.items.map((d,i)=><div key={d.date} style={{fontSize:12,marginBottom:5}}><span style={{color:g.c,fontWeight:700}}>#{i+1}</span><span style={{color:"#888",marginLeft:5}}>{d.dow} {d.date.slice(5)}</span><div style={{color:"#f5c842",fontSize:11}}>{fmt(d.gross)}</div></div>)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section==="productos"&&(
        <div>
          <p style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Ranking de productos del mes</p>
          {prodList.length===0&&<p style={{color:"#444",fontSize:13,textAlign:"center",padding:20}}>Sin datos</p>}
          {prodList.map((p,i)=>{const maxT=prodList[0]?.total||1;return(
            <div key={p.name} style={{marginBottom:9,padding:"10px 12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:11}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,fontWeight:800,color:i===0?"#f5c842":i===1?"#aaa":i===2?"#cd7f32":"#555",minWidth:18}}>#{i+1}</span>
                  <div><div style={{fontSize:13,color:"#e8e0d0",fontWeight:500}}>{p.name}</div><div style={{fontSize:11,color:"#666"}}>{p.units} unidades</div></div>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:"#f5c842"}}>{fmt(p.total)}</span>
              </div>
              <div style={{background:"rgba(255,255,255,0.05)",borderRadius:4,height:5,overflow:"hidden"}}><div style={{width:`${(p.total/maxT)*100}%`,height:"100%",borderRadius:4,background:"#f5c842"}}/></div>
            </div>
          );})}
        </div>
      )}

      {section==="marketing"&&(()=>{
        const flojos=dowList.filter(d=>d.count>0&&d.avg<avgNight*0.6);
        const fuertes=dowList.filter(d=>d.avg>=avgNight*0.85);
        return (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {flojos.length>0&&(
              <div style={{padding:14,background:"rgba(96,165,250,0.07)",border:"1px solid rgba(96,165,250,0.25)",borderRadius:13}}>
                <p style={{fontSize:13,fontWeight:700,color:"#60a5fa",marginBottom:8}}>📣 Días para impulsar con promo</p>
                <p style={{fontSize:12,color:"#888",marginBottom:10}}>Estos días venden bajo el promedio ({fmt(avgNight)}/noche):</p>
                {flojos.map(d=><div key={d.dow} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:13,color:"#60a5fa",fontWeight:600}}>{d.dow}</span><span style={{fontSize:12,color:"#888"}}>prom. {fmt(d.avg)}</span></div>)}
                <div style={{marginTop:10,padding:"9px 11px",background:"rgba(96,165,250,0.1)",borderRadius:9}}>
                  <p style={{fontSize:11,color:"#60a5fa",fontWeight:600,marginBottom:4}}>💡 Ideas:</p>
                  <p style={{fontSize:11,color:"#888",margin:"2px 0"}}>• Happy hour en {flojos.map(d=>d.dow).join(" y ")} de 6–9pm</p>
                  <p style={{fontSize:11,color:"#888",margin:"2px 0"}}>• Karaoke o DJ set esos días</p>
                  <p style={{fontSize:11,color:"#888",margin:"2px 0"}}>• 2×1 en cervezas nacionales</p>
                </div>
              </div>
            )}
            {fuertes.length>0&&(
              <div style={{padding:14,background:"rgba(245,200,66,0.07)",border:"1px solid rgba(245,200,66,0.25)",borderRadius:13}}>
                <p style={{fontSize:13,fontWeight:700,color:"#f5c842",marginBottom:8}}>🔥 Días estrella</p>
                <p style={{fontSize:12,color:"#888",marginBottom:6}}>{fuertes.map(d=>d.dow).join(", ")} son los días más fuertes:</p>
                <p style={{fontSize:11,color:"#888",margin:"2px 0"}}>• Asegura inventario extra desde el día anterior</p>
                <p style={{fontSize:11,color:"#888",margin:"2px 0"}}>• Refuerza personal en barra</p>
                <p style={{fontSize:11,color:"#888",margin:"2px 0"}}>• Ofrece combos premium (botella + mezcladores)</p>
              </div>
            )}
            {prodList.slice(0,3).length>0&&(
              <div style={{padding:14,background:"rgba(52,211,153,0.07)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:13}}>
                <p style={{fontSize:13,fontWeight:700,color:"#34d399",marginBottom:8}}>🏆 Productos estrella</p>
                {prodList.slice(0,3).map((p,i)=><div key={p.name} style={{fontSize:12,color:"#34d399",marginBottom:4}}>{i+1}. <strong>{p.name}</strong> — {p.units} und · {fmt(p.total)}</div>)}
              </div>
            )}
            {prodList.slice(-3).length>0&&(
              <div style={{padding:14,background:"rgba(167,139,250,0.07)",border:"1px solid rgba(167,139,250,0.25)",borderRadius:13}}>
                <p style={{fontSize:13,fontWeight:700,color:"#a78bfa",marginBottom:8}}>📦 Bajo movimiento</p>
                <p style={{fontSize:12,color:"#888",marginBottom:6}}>Considera reducir stock o hacer promos:</p>
                {prodList.slice(-3).map(p=><div key={p.name} style={{fontSize:12,color:"#a78bfa",marginBottom:4}}>• <strong>{p.name}</strong> — {p.units} und · {fmt(p.total)}</div>)}
              </div>
            )}
            {dailyLog.length===0&&<div style={{textAlign:"center",padding:30,color:"#444",fontSize:13}}>Cierra al menos una noche para ver sugerencias</div>}
          </div>
        );
      })()}
    </div>
  );
}
