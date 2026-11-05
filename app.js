/* Tax Invoice — single-page GST invoice maker. No server needed. */
const STATES=[["01","Jammu & Kashmir","JK"],["02","Himachal Pradesh","HP"],["03","Punjab","PB"],["04","Chandigarh","CH"],["05","Uttarakhand","UK"],["06","Haryana","HR"],["07","Delhi","DL"],["08","Rajasthan","RJ"],["09","Uttar Pradesh","UP"],["10","Bihar","BR"],["11","Sikkim","SK"],["12","Arunachal Pradesh","AR"],["13","Nagaland","NL"],["14","Manipur","MN"],["15","Mizoram","MZ"],["16","Tripura","TR"],["17","Meghalaya","ML"],["18","Assam","AS"],["19","West Bengal","WB"],["20","Jharkhand","JH"],["21","Odisha","OD"],["22","Chhattisgarh","CG"],["23","Madhya Pradesh","MP"],["24","Gujarat","GJ"],["26","Dadra & Nagar Haveli and Daman & Diu","DN"],["27","Maharashtra","MH"],["29","Karnataka","KA"],["30","Goa","GA"],["31","Lakshadweep","LD"],["32","Kerala","KL"],["33","Tamil Nadu","TN"],["34","Puducherry","PY"],["35","Andaman & Nicobar Islands","AN"],["36","Telangana","TS"],["37","Andhra Pradesh","AP"],["38","Ladakh","LA"]];
const GST=["0","5","12","18","28"],UOM=["No","Pc","Nos","Set","Pkt","Box","Mtr","Kg","Roll","Pair"];
const K_CO="ti-company",K_INV="ti-draft",K_LAST="ti-last";

const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const num=v=>{const n=parseFloat(String(v??"").replace(/,/g,""));return isFinite(n)?n:0};
const r2=n=>Math.round((n+Number.EPSILON)*100)/100;
const f2=n=>num(n).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
const clone=o=>JSON.parse(JSON.stringify(o));
const st=c=>STATES.find(s=>s[0]===c)||["","",""];
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const dmy=s=>{if(!s)return"";const[y,m,d]=s.split("-");return `${d}/${m}/${y}`};
const fyOf=s=>{const[y,m]=(s||today()).split("-").map(Number);const a=m>=4?y:y-1;return String(a%100).padStart(2,"0")+"-"+String((a+1)%100).padStart(2,"0")};
const getP=(o,p)=>p.split(".").reduce((a,k)=>a==null?a:a[k],o);
const setP=(o,p,v)=>{const k=p.split(".");let x=o;for(let i=0;i<k.length-1;i++)x=x[k[i]];x[k[k.length-1]]=v};
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const keep=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
function words(n){const a=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],b=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
 const two=n=>n<20?a[n]:b[Math.floor(n/10)]+(n%10?" "+a[n%10]:"");const three=n=>{const h=Math.floor(n/100),r=n%100;return(h?a[h]+" Hundred"+(r?" ":""):"")+(r?two(r):"")};
 const c=n=>{if(!n)return"Zero";let s="";const cr=Math.floor(n/1e7);n%=1e7;const l=Math.floor(n/1e5);n%=1e5;const t=Math.floor(n/1000);n%=1000;if(cr)s+=c(cr)+" Crore ";if(l)s+=two(l)+" Lakh ";if(t)s+=two(t)+" Thousand ";if(n)s+=three(n);return s.trim()};
 return c(Math.round(n))+" Only"}
const IC={
 home:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>',
 ph:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
 at:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>',
 web:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
 info:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>',
 user:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>'};

/* ---------- state ---------- */
const CO={...(window.COMPANY||{}),...load(K_CO,{})};
const blankItem=()=>({desc:"",part:"",hsn:"",qty:"1",unit:"No",rate:"",gst:"18"});
function nextNo(date){const fy=fyOf(date),last=load(K_LAST,{});const n=(last.fy===fy?last.n:0)+1;return `${(CO.prefix||"INV").trim()}/${fy}/${String(n).padStart(4,"0")}`}
function markUsed(no,date){const m=String(no).match(/(\d+)\s*$/);if(!m)return;const fy=fyOf(date),last=load(K_LAST,{});if(last.fy!==fy||+m[1]>last.n)keep(K_LAST,{fy,n:+m[1]})}
function newInv(){const d=today();return{no:nextNo(d),date:d,poNo:"",poDate:"",vendorCode:CO.vendorCode||"",tax:"auto",
 buyer:{name:"",address:"",gstin:"",state:"29",phone:""},shipSame:true,ship:{name:"",address:"",state:"29",phone:""},contact:"",
 items:[blankItem()],freight:"",freightGst:"18"}}
let INV=load(K_INV,null)||newInv();
let TAB="edit";

/* ---------- maths ---------- */
const posOf=i=>i.shipSame?i.buyer.state:(i.ship.state||i.buyer.state);
function calc(inv){
 const pos=posOf(inv),intra=inv.tax==="cgst"?true:inv.tax==="igst"?false:pos===(CO.state||"08");
 const lines=inv.items.filter(it=>it.desc||num(it.rate)).map(it=>{const q=num(it.qty),r=num(it.rate),tx=r2(q*r),g=num(it.gst),tax=r2(tx*g/100);return{it,q,r,tx,g,tax,amt:r2(tx+tax)}});
 const fr=num(inv.freight),fg=num(inv.freightGst),ftax=r2(fr*fg/100);
 const taxable=r2(lines.reduce((s,l)=>s+l.tx,0)+fr),tax=r2(lines.reduce((s,l)=>s+l.tax,0)+ftax),gross=r2(taxable+tax),total=Math.round(gross);
 return{pos,intra,lines,fr,fg,ftax,taxable,tax,gross,total,round:r2(total-gross),qty:lines.reduce((s,l)=>s+l.q,0)};
}

/* ---------- invoice paper ---------- */
function paperHTML(inv,p){
 const c=calc(inv),E=esc,ph=t=>`<span class="i-ph">${t}</span>`,logo=p.logo||window.LOGO||"";
 const ln=(ic,t,cls="")=>t?`<div class="h-ln ${cls}">${ic?IC[ic]:""}<span class="t">${t}</span></div>`:"";
 const addr=[p.address,[p.city,st(p.state)[1]&&`${st(p.state)[1]} (${st(p.state)[2]} - ${p.state})`].filter(Boolean).join(", ")+(p.pincode?`, PIN ${p.pincode}`:"")].filter(Boolean).join(",\n");
 const party=(x,extra)=>`<div class="h-name">${x.name?E(x.name):ph("Customer name")}</div>${ln("home",E(x.address))}${ln("ph",x.phone&&"+91 "+E(x.phone))}${extra}`;
 const ship=inv.shipSame?inv.buyer:{...inv.buyer,...Object.fromEntries(Object.entries(inv.ship).filter(([k,v])=>v))};
 const meta=[inv.poNo&&`<b>PO No</b> ${E(inv.poNo)}`,inv.poDate&&`<b>PO Date</b> ${dmy(inv.poDate)}`,inv.vendorCode&&`<b>Vendor Code</b> ${E(inv.vendorCode)}`].filter(Boolean).join(" &nbsp;·&nbsp; ");
 const cols=c.intra?["CGST","SGST"]:["IGST"];
 const half=t=>[r2(t/2),r2(t-r2(t/2))];
 const taxCells=(t,g,showRate)=>c.intra?half(t).map(v=>`<td>${f2(v)}${showRate?`<span class="sm">${(g/2).toFixed(2)}%</span>`:""}</td>`).join(""):`<td>${f2(t)}${showRate?`<span class="sm">${g.toFixed(2)}%</span>`:""}</td>`;
 const rows=c.lines.map((l,i)=>`<tr><td class="c">${i+1}</td><td class="p">${E(l.it.desc)}${l.it.part?`<span class="sm">MPN: ${E(l.it.part)}</span>`:""}</td><td class="c">${E(l.it.hsn)}</td><td class="c"><b>${num(l.it.qty).toFixed(2)}</b><span class="sm">${E(l.it.unit)}</span></td><td>${f2(l.r)}</td>${taxCells(l.tax,l.g,1)}<td>${f2(l.amt)}</td></tr>`).join("")
  ||`<tr><td colspan="${6+cols.length}" class="c" style="padding:18px">${ph("Add products")}</td></tr>`;
 const shipRow=c.fr?`<tr class="sh"><td></td><td colspan="2" style="text-align:right">Shipping &amp; Packaging</td><td class="c">@${c.fg}%</td><td>${f2(c.fr)}</td>${taxCells(c.ftax,c.fg,0)}<td>${f2(c.fr+c.ftax)}</td></tr>`:"";
 return `<div class="paper" style="--b:${p.color||"#1d6fb8"}">
 <div class="h-top"><div class="h-r"><div class="h-copy">Original</div><div class="h-t">TAX INVOICE ${E(inv.no)}</div><div class="h-d"><b>Date</b> ${dmy(inv.date)}</div>${meta?`<div class="h-d" style="font-size:11.5px">${meta}</div>`:""}</div>
  <div class="h-brand">${logo?`<img src="${logo}">`:""}${p.name?`<div class="h-bn">${E(p.name)}</div>`:""}</div></div>
 <div class="h-rule"></div>
 <div class="h-cols">
  <div><div class="h-cn">${E(p.name||"Your Business")}</div>${ln("home",addr?E(addr):ph("Address"))}${ln("ph",p.phone&&"+91 "+E(p.phone))}${ln("at",E(p.email))}${ln("web",E(p.website))}
   ${p.bank||p.accNo?ln("info",[p.bank&&E(p.bank)+(p.branch?", "+E(p.branch):""),p.accNo&&"Ac No: "+E(p.accNo),p.ifsc&&"IFSC: "+E(p.ifsc)].filter(Boolean).join("\n")):""}
   ${ln("",[p.gstin&&"GSTIN: "+E(p.gstin),p.llpin&&"LLPIN: "+E(p.llpin)].filter(Boolean).join("\n"),"sp")}</div>
  <div><div class="h-lbl">Bill to:</div>${party(inv.buyer,ln("info",`Place of Supply: ${st(c.pos)[2]} (${c.pos})${inv.buyer.gstin?"\nGSTIN: "+E(inv.buyer.gstin.toUpperCase()):""}`))}</div>
  <div><div class="h-lbl">Ship to:</div>${party(ship,ln("user",E(inv.contact)))}</div>
 </div>
 <table class="h-tab"><thead><tr><th class="c" style="width:32px">No</th><th class="l">Product/Service</th><th class="c" style="width:78px">HSN/SAC</th><th class="c" style="width:52px">Qty<br>UOM</th><th style="width:84px">Unit Price</th>${cols.map(t=>`<th style="width:${c.intra?70:86}px">${t}</th>`).join("")}<th style="width:92px">Amount</th></tr></thead>
 <tbody>${rows}${shipRow}<tr class="tt"><td></td><td colspan="2" style="text-align:center">TOTAL</td><td class="c">${c.qty.toFixed(2)}</td><td>${f2(c.taxable)}</td>${taxCells(c.tax,0,0)}<td>${f2(c.gross)}</td></tr></tbody></table>
 <div class="h-sum"><div class="h-words">Total: ₹ ${E(words(c.total))}</div>
  <div class="h-kv"><b>Total before tax</b><span>₹ ${f2(c.taxable)}</span><b>Total tax amount</b><span>${f2(c.tax)}</span><b>Rounded off</b><span>${c.round<0?"(-) ":c.round>0?"(+) ":""}${f2(Math.abs(c.round))}</span><b class="big">Total amount</b><span class="big">₹ ${c.total.toLocaleString("en-IN")}</span></div></div>
 <div class="h-sign"><div class="s"><div>For ${E(p.name||"")}</div>${p.sign?`<img src="${p.sign}">`:`<div style="height:46px"></div>`}<div class="lb">AUTHORIZED SIGNATORY</div></div></div>
 <div class="h-note"><b>Note:</b><br>Declaration: We declare that this invoice shows the actual price of the goods described &amp; that all particulars are true &amp; correct.</div>
 </div>`;
}

/* ---------- form ---------- */
function F(r,label,path,o={}){const root=r==="c"?CO:INV,v=getP(root,path)??"",cls=o.full?"full":"";
 if(o.opts)return `<label class="fld ${cls}"><span>${label}</span><select data-r="${r}" data-f="${path}">${o.opts.map(([a,t])=>`<option value="${esc(a)}"${String(v)===String(a)?" selected":""}>${esc(t)}</option>`).join("")}</select></label>`;
 if(o.area)return `<label class="fld ${cls}"><span>${label}</span><textarea data-r="${r}" data-f="${path}" rows="${o.area}">${esc(v)}</textarea></label>`;
 return `<label class="fld ${cls}"><span>${label}</span><input data-r="${r}" data-f="${path}" type="${o.type||"text"}" ${o.num?'inputmode="decimal"':""} value="${esc(v)}" placeholder="${esc(o.ph||"")}"></label>`}
const stOpts=()=>STATES.map(s=>[s[0],`${s[0]} · ${s[1]}`]);
const lineAmt=it=>num(it.qty)*num(it.rate)*(1+num(it.gst)/100);
function formHTML(){const i=INV;
 return `
 <details class="card"><summary>Company details</summary><div class="grid g2">
  ${F("c","Company name","name",{full:1})}${F("c","Address","address",{area:2,full:1})}${F("c","City","city")}${F("c","PIN code","pincode")}${F("c","State","state",{opts:stOpts()})}${F("c","Phone","phone")}${F("c","Email","email")}${F("c","Website","website")}${F("c","GSTIN","gstin")}${F("c","LLPIN","llpin")}
  ${F("c","Bank","bank")}${F("c","Branch","branch")}${F("c","Account no.","accNo")}${F("c","IFSC","ifsc")}${F("c","Invoice prefix","prefix")}${F("c","Vendor code","vendorCode")}
  <label class="fld"><span>Logo</span><input type="file" accept="image/*" data-up="logo"></label><label class="fld"><span>Signature / stamp</span><input type="file" accept="image/*" data-up="sign"></label>
  <label class="fld"><span>Colour</span><input type="color" data-r="c" data-f="color" value="${esc(CO.color||"#1d6fb8")}" style="height:38px;padding:3px"></label>
  <div class="fld" style="justify-content:flex-end"><button class="btn sm" data-a="clrimg">Remove logo &amp; signature</button></div></div></details>
 <div class="card"><h3>Invoice</h3><div class="grid g3">${F("i","Invoice no.","no")}${F("i","Date","date",{type:"date"})}${F("i","Vendor code","vendorCode")}${F("i","PO no.","poNo")}${F("i","PO date","poDate",{type:"date"})}</div>
  <div class="fld" style="margin-top:12px"><span>Tax type</span><div class="seg">${[["auto","Auto"],["igst","IGST only"],["cgst","CGST + SGST"]].map(([k,l])=>`<button class="${i.tax===k?"on":""}" data-a="tax" data-v="${k}">${l}</button>`).join("")}</div></div>
  <div class="hint" id="taxhint">${taxHint()}</div></div>
 <div class="card"><h3>Bill to</h3><div class="grid g2">${F("i","Name","buyer.name",{full:1})}${F("i","Address","buyer.address",{area:3,full:1})}${F("i","GSTIN","buyer.gstin")}${F("i","State","buyer.state",{opts:stOpts()})}${F("i","Phone","buyer.phone")}${F("i","Contact person","contact")}</div>
  <label class="check"><input type="checkbox" data-r="i" data-f="shipSame" ${i.shipSame?"checked":""}>Ship to same address</label>
  ${i.shipSame?"":`<div class="grid g2" style="margin-top:10px">${F("i","Ship-to name","ship.name",{full:1})}${F("i","Ship-to address","ship.address",{area:3,full:1})}${F("i","Ship-to state","ship.state",{opts:stOpts()})}${F("i","Ship-to phone","ship.phone")}</div>`}</div>
 <div class="card"><h3>Products <button class="btn sm" data-a="add">+ Add product</button></h3>
  ${i.items.map((it,k)=>`<div class="item"><div class="ih"><span>PRODUCT ${k+1}</span><span style="display:flex;gap:8px;align-items:center"><span data-amt="${k}">₹ ${f2(lineAmt(it))}</span>${i.items.length>1?`<button class="btn sm del" data-a="rm" data-k="${k}">✕</button>`:""}</span></div>
   <div class="grid ig1" style="margin-bottom:8px">${F("i","Product / service","items."+k+".desc")}${F("i","Part no. (optional)","items."+k+".part")}</div>
   <div class="grid ig2">${F("i","HSN","items."+k+".hsn",{num:1})}${F("i","Qty","items."+k+".qty",{num:1})}${F("i","UOM","items."+k+".unit",{opts:UOM.map(u=>[u,u])})}${F("i","Unit price ₹","items."+k+".rate",{num:1})}${F("i","GST","items."+k+".gst",{opts:GST.map(g=>[g,g+"%"])})}</div></div>`).join("")}
  <div class="grid g2" style="margin-top:6px">${F("i","Shipping & packaging (₹)","freight",{num:1,ph:"0"})}${F("i","GST on shipping","freightGst",{opts:GST.map(g=>[g,g+"%"])})}</div></div>
 <div class="card"><div class="tot"><span>Total</span><span id="tot">₹ ${calc(i).total.toLocaleString("en-IN")}</span></div></div>`}
function taxHint(){const c=calc(INV),a=st(CO.state)[1],b=st(c.pos)[1];
 if(INV.tax==="auto")return c.intra?`Auto: ${a} → ${b} is the same state, so CGST + SGST.`:`Auto: ${a} → ${b} is a different state, so IGST.`;
 return INV.tax==="igst"?"IGST only — one IGST column on the invoice.":"CGST + SGST — split into two columns on the invoice."}

/* ---------- render ---------- */
let raf=0;
function preview(){keep(K_INV,INV);cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{$("#pv").innerHTML=paperHTML(INV,CO);fit()})}
function fit(){const w=$("#pv"),p=w.firstElementChild;if(!p||!w.clientWidth)return;const s=Math.min(1,w.clientWidth/794);p.style.transform=`scale(${s})`;w.style.height=Math.ceil(p.offsetHeight*s)+"px"}
function render(){document.documentElement.style.setProperty("--brand",CO.color||"#1d6fb8");$("#form").innerHTML=formHTML();preview()}
addEventListener("resize",fit);
function toast(m){let t=$(".toast");if(!t){t=document.createElement("div");t.className="toast";document.body.appendChild(t)}t.textContent=m;clearTimeout(t._t);t._t=setTimeout(()=>t.remove(),2600)}
function refreshNumbers(){const c=calc(INV);$("#tot").textContent="₹ "+c.total.toLocaleString("en-IN");$("#taxhint").textContent=taxHint();INV.items.forEach((it,k)=>{const a=document.querySelector(`[data-amt="${k}"]`);if(a)a.textContent="₹ "+f2(lineAmt(it))})}

function onField(e){const el=e.target,f=el.dataset.f;if(!f)return;
 const sel=el.tagName==="SELECT"||el.type==="checkbox";if(e.type==="input"&&sel)return;if(e.type==="change"&&!sel)return;
 if(el.dataset.r==="c"){setP(CO,f,el.value);keep(K_CO,CO);if(f==="color")document.documentElement.style.setProperty("--brand",el.value);refreshNumbers();preview();return}
 setP(INV,f,el.type==="checkbox"?el.checked:el.value);
 if(f==="buyer.gstin"){const sc=el.value.trim().slice(0,2);if(st(sc)[0]){INV.buyer.state=sc;const s=document.querySelector('[data-f="buyer.state"]');if(s)s.value=sc}}
 if(f==="shipSame"){render();return}
 refreshNumbers();preview();
}
addEventListener("input",onField);addEventListener("change",onField);
addEventListener("change",e=>{const up=e.target.dataset.up;if(!up||!e.target.files[0])return;const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,480/im.width,160/im.height),cv=document.createElement("canvas");cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);CO[up]=cv.toDataURL("image/png");keep(K_CO,CO);preview();toast((up==="logo"?"Logo":"Signature")+" added")};im.src=fr.result};fr.readAsDataURL(e.target.files[0])});

/* ---------- actions ---------- */
const IN_CLAUDE=!!(window.claude&&window.claude.use);
async function saveBlob(blob,name){
 if(IN_CLAUDE){const dl=await claude.use("downloads").catch(()=>null);if(dl){try{await dl.save({filename:name,data:blob});toast("PDF saved")}catch(e){if(!(e&&e.code==="declined"))toast("Couldn't save the file")}return}}
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
}
async function downloadPDF(){
 if(!window.jspdf||!window.html2canvas)return toast("PDF library missing — keep the lib folder next to index.html");
 toast("Making PDF…");
 const host=document.createElement("div");host.style.cssText="position:fixed;left:-12000px;top:0;width:794px";host.innerHTML=paperHTML(INV,CO);document.body.appendChild(host);
 try{if(document.fonts)await document.fonts.ready;await Promise.all([...host.querySelectorAll("img")].map(im=>im.complete?0:new Promise(r=>im.onload=im.onerror=r)));
  const cv=await html2canvas(host.firstElementChild,{scale:2,backgroundColor:"#fff",logging:false,useCORS:true});
  const doc=new window.jspdf.jsPDF({unit:"mm",format:"a4",compress:true}),pageH=Math.floor(cv.width*297/210);
  for(let y=0,first=true;y<cv.height;y+=pageH,first=false){const h=Math.min(pageH,cv.height-y);if(!first&&h<60)break;const pc=document.createElement("canvas");pc.width=cv.width;pc.height=pageH;const x=pc.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,pc.width,pc.height);x.drawImage(cv,0,y,cv.width,h,0,0,cv.width,h);if(!first)doc.addPage();doc.addImage(pc.toDataURL("image/jpeg",.93),"JPEG",0,0,210,297)}
  await saveBlob(doc.output("blob"),(INV.no||"invoice").replace(/[\/\\\s]+/g,"-")+".pdf");markUsed(INV.no,INV.date);
 }catch(e){console.error(e);toast("Couldn't make the PDF — try Print → Save as PDF")}finally{host.remove()}
}
addEventListener("click",e=>{const t=e.target.closest("[data-a]");if(!t)return;const a=t.dataset.a;
 if(a==="pdf")downloadPDF();
 if(a==="print"){$("#print").innerHTML=paperHTML(INV,CO);markUsed(INV.no,INV.date);setTimeout(()=>print(),50)}
 if(a==="new"){if(Date.now()-(window._nt||0)<3000){window._nt=0;markUsed(INV.no,INV.date);INV=newInv();render();toast("New invoice started")}else{window._nt=Date.now();toast("Tap New invoice again to clear this one")}}
 if(a==="tax"){INV.tax=t.dataset.v;document.querySelectorAll("[data-a=tax]").forEach(b=>b.classList.toggle("on",b===t));refreshNumbers();preview()}
 if(a==="add"){INV.items.push(blankItem());render()}
 if(a==="rm"){INV.items.splice(+t.dataset.k,1);render()}
 if(a==="clrimg"){CO.logo="";CO.sign="";keep(K_CO,CO);preview()}
 if(a==="tab"){TAB=t.dataset.v;$("#wrap").className="wrap t-"+TAB;document.querySelectorAll("[data-a=tab]").forEach(b=>b.classList.toggle("on",b===t));fit()}
});
if(IN_CLAUDE){const pb=document.querySelector("[data-a=print]");if(pb)pb.remove()}
render();
if(document.fonts)document.fonts.ready.then(fit);
