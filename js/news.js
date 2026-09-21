/* news.js - render TIN TỨC + task notification - file:// safe */
function logoFallback(name){
  const init = (name||'?').trim().charAt(0).toUpperCase();
  return init;
}
function favicon(domain){
  if(!domain) return '';
  try{ return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`; }catch{ return ''; }
}
function domainFromUrl(url){
  try{ return new URL(url).hostname.replace('www.',''); }catch{ return url||''; }
}
async function fetchJSON(path, fallbackVar){
  // try fetch, fallback to window var for file://
  try{
    const r = await fetch(path);
    if(r.ok) return await r.json();
  }catch(e){}
  if(fallbackVar && window[fallbackVar]) return window[fallbackVar];
  throw new Error('no data '+path);
}
async function loadNews(){
  try{
    const data = await fetchJSON('./data/news.json','DATA_NEWS');
    const list = data.items || [];
    const container = document.getElementById('newsList');
    if(!container) return;
    container.innerHTML = list.map(n=>{
      const fb = n.logo || '';
      const logo = fb ? `<img src="${fb}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'"><span>${logoFallback(n.project_name)}</span>` : `<span>${logoFallback(n.project_name)}</span>`;
      return `<div class="news-item">
        <div class="news-logo">${logo}</div>
        <div class="news-text">
          <div class="news-project">${n.project_name}</div>
          <div class="news-summary">${n.summary_vi}</div>
        </div>
        <div class="news-meta">
          <div class="source">${n.source_name.includes('X')?'𝕏':'🌐'} Source: ${n.source_name}</div>
          <button class="btn-accent" onclick="window.open('${n.source_url}','_blank')">XEM NGAY ↗</button>
        </div>
      </div>`;
    }).join('') || `<div style="padding:20px;text-align:center;color:#6B7A90">Chưa có tin tức</div>`;

    try{
      const notifData = await fetchJSON('./data/notifications.json','DATA_NOTIFICATIONS');
      const items = notifData.items||[];
      let pick = items.find(x=>x.project_name==='Forecast') || items.find(x=>x.tasks && x.tasks.length>=2) || items[0];
      const box = document.getElementById('taskNotifBody');
      if(box && pick){
        const init = logoFallback(pick.project_name);
        const logoFb = pick.logo ? `<img src="${pick.logo}" alt="" loading="lazy" onerror="this.style.display='none'"><span>${init}</span>` : `<span>${init}</span>`;
        box.innerHTML = `
          <div class="task-notif-head">
            <div class="task-notif-logo">${logoFb}</div>
            <div>
              <div style="font-size:12px;font-weight:800">${pick.project_name}</div>
              <div style="font-size:11px;color:#0B9BB6">🔗 ${pick.website||'Website'}</div>
            </div>
          </div>
          <div style="height:10px"></div>
          <div class="task-box">
            <div class="task-list">
              <div class="task-title">✅ TASK CẦN LÀM</div>
              ${pick.tasks.map(t=>`<div class="task-item">${t}</div>`).join('')}
            </div>
            <button class="btn-accent" onclick="document.querySelector('[data-tab=all_tasks]').click()">XEM TASK ↗</button>
          </div>
          <div style="font-size:11px;color:#6B7A90;margin-top:8px">Cập nhật: ${pick.time||''}</div>
        `;
      }
    }catch(e){ console.error('notif',e); }

  }catch(e){
    console.error('loadNews failed', e);
    const c=document.getElementById('newsList');
    if(c) c.innerHTML=`<div style="padding:20px;color:#E85D5D">Lỗi tải tin tức: ${e.message}</div>`;
  }
}
document.addEventListener('DOMContentLoaded', loadNews);
