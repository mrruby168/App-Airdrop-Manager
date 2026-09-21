/* app.js — file:// safe */
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
async function loadNotifications(){
  try{
    const data = await fetchJSON('./data/notifications.json','DATA_NOTIFICATIONS');
    const items = data.items||[];
    const bell=document.getElementById('bellBadge');
    if(bell) bell.textContent = items.filter(x=>x.unread).length || items.length;
    const upd=document.getElementById('updatesCount');
    if(upd) upd.textContent = items.length;
    const imp=document.getElementById('importantCount');
    if(imp) imp.textContent = items.filter(x=>x.importance==='important'||x.priority==='important').length || items.filter(x=>x.importance!=='critical').length;
    const crit=document.getElementById('criticalCount');
    if(crit) crit.textContent = items.filter(x=>x.importance==='critical').length || 1;
    const container = document.getElementById('notificationsList');
    if(!container) return;
    function render(filter){
      const filtered = items.filter(n=>{
        if(filter==='unread') return n.unread;
        if(filter==='important') return n.importance==='important' || n.priority==='important' || n.importance==='critical';
        return true;
      });
      container.innerHTML = filtered.map(n=>{
        const init = (n.project_name||'?').charAt(0).toUpperCase();
        const logo = n.logo ? `<img src="${n.logo}" alt="" loading="lazy" onerror="this.style.display='none'"><span>${init}</span>` : `<span>${init}</span>`;
        const dot = n.unread ? `<span class="dot-read ${n.importance==='important'?'blue':''}"></span>` : `<span style="width:6px"></span>`;
        return `<div class="notif">
          <div class="notif-logo">${logo}</div>
          <div class="notif-body">
            <div class="notif-proj">${n.project_name}</div>
            <div class="notif-title">${n.title}</div>
            <div class="notif-time">${n.time||''}</div>
          </div>
          ${dot}
        </div>`;
      }).join('') || `<div style="text-align:center;color:#6B7A90;font-size:12px;padding:16px">Không có thông báo</div>`;
    }
    window.filterNotifications = render;
    render('all');
    document.getElementById('markAllBtn')?.addEventListener('click',()=>{
      items.forEach(x=>x.unread=false);
      render(document.querySelector('.side-tab.active')?.dataset.filter||'all');
      if(bell) bell.textContent = '0';
    });
  }catch(e){ console.error('loadNotifications', e); }
}
async function validateData(){
  const files = [['projects.json','DATA_PROJECTS'],['news.json','DATA_NEWS'],['progress.json','DATA_PROGRESS']];
  for(const [f,fb] of files){
    try{ await fetchJSON('./data/'+f, fb); }catch(e){ console.warn('validate', f, e.message); }
  }
}
document.addEventListener('DOMContentLoaded', ()=>{
  initHeader();
  loadNotifications();
  validateData();
});
