/* app.js — file:// safe + sidebar Important Events */
function initHeader(){
  const d = new Date();
  const fmt = d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase();
  const el = document.getElementById('headerDate');
  if(el) el.textContent = fmt;
}
async function fetchJSON(path, fb){
  try{ const r=await fetch(path); if(r.ok) return await r.json(); }catch(e){}
  if(fb && window[fb]) return window[fb];
  throw new Error('no data '+path);
}
function parseDate(str){
  if(!str) return null;
  const d=new Date(str);
  return isNaN(d.getTime())?null:d;
}
function formatDateVN(dateStr){
  const d=parseDate(dateStr);
  if(!d) return dateStr;
  const dd=String(d.getDate()).padStart(2,'0');
  const mm=String(d.getMonth()+1).padStart(2,'0');
  const yyyy=d.getFullYear();
  if(dateStr.includes('T')){
    const hh=String(d.getHours()).padStart(2,'0');
    const mi=String(d.getMinutes()).padStart(2,'0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  }
  return `${dd}/${mm}/${yyyy}`;
}
function logoFallback(name){
  return (name||'?').trim().charAt(0).toUpperCase();
}
function getTodayGMT7(){ const s=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Ho_Chi_Minh'}); return new Date(s+'T00:00:00+07:00'); }
function getImportantEvents(projects){
  const today=getTodayGMT7();
  const events=[];
  projects.forEach(p=>{
    const name=p.name, logo=p.logo||'', web=p.web_link||'', x=p.x_post_link||'';
    if(p.tge_date){
      const d=parseDate(p.tge_date);
      if(d){
        const isUpcoming=d>=today;
        events.push({project:name,logo,web,x,date:p.tge_date,dateObj:d,type:'TGE',summary:isUpcoming?`${name} sắp TGE ngày ${formatDateVN(p.tge_date)}`:`${name} đã TGE ngày ${formatDateVN(p.tge_date)}`,isUpcoming});
      }
    }
    if(p.task_date){
      const d=parseDate(p.task_date);
      if(d){
        const isUpcoming=d>=today;
        let type='End', summary='';
        if(name==='Amadeus'){
          type='End'; summary=isUpcoming?`${name} chuẩn bị kết thúc ngày ${formatDateVN(p.task_date)}`:`${name} đã kết thúc ngày ${formatDateVN(p.task_date)}`;
        } else if(name==='EarnList'){
          type='Registration'; summary=isUpcoming?`${name} chuẩn bị đóng đăng ký ngày ${formatDateVN(p.task_date)}`:`${name} đã đóng đăng ký ngày ${formatDateVN(p.task_date)}`;
        } else if(name==='XDAO'){
          type='Snapshot'; summary=isUpcoming?`${name} Snapshot dự kiến ngày ${formatDateVN(p.task_date)}`:`${name} đã Snapshot ngày ${formatDateVN(p.task_date)}`;
          events.push({project:name,logo,web,x,date:p.task_date,dateObj:d,type,summary,isUpcoming});
          const arbDate='2026-09-25'; const arbD=parseDate(arbDate);
          events.push({project:name,logo,web,x,date:arbDate,dateObj:arbD,type:'Claim',summary:`${name} sắp mở Claim (Arbitrum) ngày ${formatDateVN(arbDate)}`,isUpcoming:true});
          return;
        } else if(name==='CZR Genesis Airdrop'){
          type='End'; summary=isUpcoming?`${name} chuẩn bị kết thúc nhiệm vụ Genesis ngày ${formatDateVN(p.task_date)}`:`${name} đã kết thúc nhiệm vụ Genesis ngày ${formatDateVN(p.task_date)}`;
        } else {
          summary=isUpcoming?`${name} sắp đến hạn ngày ${formatDateVN(p.task_date)}`:`${name} đã diễn ra ngày ${formatDateVN(p.task_date)}`;
        }
        events.push({project:name,logo,web,x,date:p.task_date,dateObj:d,type,summary,isUpcoming});
      }
    }
  });
  const upcoming=events.filter(e=>e.isUpcoming).sort((a,b)=>a.dateObj-b.dateObj);
  const history=events.filter(e=>!e.isUpcoming).sort((a,b)=>b.dateObj-a.dateObj);
  return {upcoming,history};
}
async function loadSidebarImportant(){
  try{
    const pj=await fetchJSON('./data/projects.json','DATA_PROJECTS');
    const projects=pj.projects||[];
    const {upcoming,history}=getImportantEvents(projects);
    // bell counts from upcoming/history
    const bell=document.getElementById('bellBadge');
    if(bell) bell.textContent = upcoming.length + history.length;
    const imp=document.getElementById('importantCount');
    if(imp) imp.textContent = upcoming.length;
    const crit=document.getElementById('criticalCount');
    if(crit) crit.textContent = upcoming.filter(e=>e.type==='TGE'||e.type==='Snapshot').length || 1;
    const upd=document.getElementById('updatesCount');
    if(upd) upd.textContent = upcoming.length + history.length;

    const container=document.getElementById('sidebarImportantList');
    if(!container) return;
    function render(list){
      if(!list.length) return `<div style="text-align:center;color:#6B7A90;font-size:13px;padding:16px;font-weight:600">Chưa có sự kiện</div>`;
      return list.map(ev=>{
        const logo=ev.logo?`<img src="${ev.logo}" alt="" loading="lazy" onerror="this.style.display='none'"><span>${logoFallback(ev.project)}</span>`:`<span>${logoFallback(ev.project)}</span>`;
        const badgeClass=ev.isUpcoming?'upcoming':'history';
        return `<div class="notif" style="align-items:center">
          <div class="notif-logo">${logo}</div>
          <div class="notif-body">
            <div class="notif-proj">${ev.project} <span class="imp-badge ${badgeClass}" style="font-size:10px;margin-left:6px">${ev.type}</span></div>
            <div class="notif-title" style="white-space:normal;line-height:1.4">${ev.summary}</div>
            <div class="notif-time">📅 ${formatDateVN(ev.date)}</div>
          </div>
        </div>`;
      }).join('');
    }
    // store for tab switch
    window._impUpcoming = upcoming;
    window._impHistory = history;
    function show(filter){
      if(filter==='upcoming'){
        container.innerHTML=render(upcoming);
      } else {
        container.innerHTML=render(history);
      }
    }
    show('upcoming');
    // tab listeners
    const tabs=document.querySelectorAll('.side-tab');
    tabs.forEach(btn=>{
      // ensure data-filter values are upcoming/history
      btn.addEventListener('click',()=>{
        tabs.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        show(btn.dataset.filter);
      });
    });
    // also keep legacy notificationsList hidden but not used
  }catch(e){ console.error('sidebar Important',e); }
}
async function validateData(){
  const files = [['projects.json','DATA_PROJECTS'],['news.json','DATA_NEWS'],['progress.json','DATA_PROGRESS']];
  for(const [f,fb] of files){
    try{ await fetchJSON('./data/'+f, fb); }catch(e){ console.warn('validate', f, e.message); }
  }
}
document.addEventListener('DOMContentLoaded', ()=>{
  initHeader();
  loadSidebarImportant();
  validateData();
});
