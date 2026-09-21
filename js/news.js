/* news.js - THÔNG BÁO > Important Events (Upcoming/History) - file:// safe - tiếng Việt */
function logoFallback(name){
  const init = (name||'?').trim().charAt(0).toUpperCase();
  return init;
}
async function fetchJSON(path, fallbackVar){
  try{
    const r = await fetch(path);
    if(r.ok) return await r.json();
  }catch(e){}
  if(fallbackVar && window[fallbackVar]) return window[fallbackVar];
  throw new Error('no data '+path);
}
function parseDate(str){
  if(!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}
function formatDateVN(dateStr){
  const d = parseDate(dateStr);
  if(!d) return dateStr;
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  // if has time
  if(dateStr.includes('T')){
    const hh = String(d.getHours()).padStart(2,'0');
    const mi = String(d.getMinutes()).padStart(2,'0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  }
  return `${dd}/${mm}/${yyyy}`;
}
function getImportantEvents(projects){
  // today = 2026-09-21 (headerDate) for classification
  const today = new Date('2026-09-21T00:00:00+07:00');
  today.setHours(0,0,0,0);
  const events=[];
  projects.forEach(p=>{
    const name=p.name;
    const logo=p.logo||'';
    const web=p.web_link||'';
    const x=p.x_post_link||'';
    // TGE
    if(p.tge_date){
      const d=parseDate(p.tge_date);
      if(d){
        const isUpcoming = d >= today;
        events.push({
          project:name, logo, web, x,
          date:p.tge_date, dateObj:d,
          type:'TGE',
          summary: isUpcoming ? `${name} sắp TGE ngày ${formatDateVN(p.tge_date)}` : `${name} đã TGE ngày ${formatDateVN(p.tge_date)}`,
          isUpcoming
        });
      }
    }
    // task_date - determine type by task content
    if(p.task_date){
      const d=parseDate(p.task_date);
      if(d){
        const isUpcoming = d >= today;
        let type='End';
        let summary='';
        const taskLower=(p.note||'').toLowerCase();
        if(name==='Amadeus'){
          type='End';
          summary = isUpcoming ? `${name} chuẩn bị kết thúc ngày ${formatDateVN(p.task_date)}` : `${name} đã kết thúc ngày ${formatDateVN(p.task_date)}`;
        } else if(name==='EarnList'){
          type='Registration';
          summary = isUpcoming ? `${name} chuẩn bị đóng đăng ký ngày ${formatDateVN(p.task_date)}` : `${name} đã đóng đăng ký ngày ${formatDateVN(p.task_date)}`;
        } else if(name==='XDAO'){
          // XDAO task_date is snapshot 20/09 - history
          // Also need to handle Arbitrum 25/09 as separate claim event
          type='Snapshot';
          summary = isUpcoming ? `${name} Snapshot dự kiến ngày ${formatDateVN(p.task_date)}` : `${name} đã Snapshot ngày ${formatDateVN(p.task_date)}`;
          events.push({project:name,logo,web,x,date:p.task_date,dateObj:d,type,summary,isUpcoming});
          // Add Arbitrum claim as upcoming (from task description)
          const arbDate='2026-09-25';
          const arbD=parseDate(arbDate);
          events.push({
            project:name, logo, web, x,
            date:arbDate, dateObj:arbD,
            type:'Claim',
            summary:`${name} sắp mở Claim (Arbitrum) ngày ${formatDateVN(arbDate)}`,
            isUpcoming:true
          });
          return; // already pushed, skip generic push
        } else if(name==='CZR Genesis Airdrop'){
          // task_date same as TGE, treat as End
          type='End';
          summary = isUpcoming ? `${name} chuẩn bị kết thúc nhiệm vụ Genesis ngày ${formatDateVN(p.task_date)}` : `${name} đã kết thúc nhiệm vụ Genesis ngày ${formatDateVN(p.task_date)}`;
        } else {
          summary = isUpcoming ? `${name} sắp đến hạn ngày ${formatDateVN(p.task_date)}` : `${name} đã diễn ra ngày ${formatDateVN(p.task_date)}`;
        }
        events.push({project:name,logo,web,x,date:p.task_date,dateObj:d,type,summary,isUpcoming});
      }
    }
  });
  // Filter only important types (already are) and sort
  // Upcoming ascending, History descending
  const upcoming = events.filter(e=>e.isUpcoming).sort((a,b)=>a.dateObj-b.dateObj);
  const history = events.filter(e=>!e.isUpcoming).sort((a,b)=>b.dateObj-a.dateObj);
  return {upcoming, history};
}
function renderEvents(list, containerId){
  const c=document.getElementById(containerId);
  if(!c) return;
  if(!list.length){
    c.innerHTML=`<div style="padding:20px;text-align:center;color:#6B7A90;font-size:14px;font-weight:600">Chưa có sự kiện</div>`;
    return;
  }
  c.innerHTML=list.map(ev=>{
    const logo = ev.logo ? `<img src="${ev.logo}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'"><span>${logoFallback(ev.project)}</span>` : `<span>${logoFallback(ev.project)}</span>`;
    const badgeClass = ev.isUpcoming ? 'upcoming' : 'history';
    const badgeText = ev.isUpcoming ? `🚨 ${ev.type}` : `🕘 ${ev.type}`;
    const dateText = formatDateVN(ev.date);
    return `<div class="imp-item">
      <div class="news-logo">${logo}</div>
      <div class="news-text">
        <div class="news-project">${ev.project}</div>
        <div class="news-summary">${ev.summary}</div>
        <div style="font-size:12px;color:#6B7A90;margin-top:4px;font-weight:600">📅 ${dateText} · ${ev.type}</div>
      </div>
      <div class="news-meta">
        <span class="imp-badge ${badgeClass}">${badgeText}</span>
        <button class="btn-accent" onclick="window.open('${ev.web||ev.x||'#'}','_blank')">XEM NGAY ↗</button>
      </div>
    </div>`;
  }).join('');
}
async function loadImportantEvents(){
  try{
    const pj = await fetchJSON('./data/projects.json','DATA_PROJECTS');
    const projects = pj.projects||[];
    const {upcoming, history} = getImportantEvents(projects);
    renderEvents(upcoming,'upcomingList');
    renderEvents(history,'historyList');
    // tab logic
    const upBtn=document.getElementById('impUpcomingBtn');
    const hiBtn=document.getElementById('impHistoryBtn');
    const upList=document.getElementById('upcomingList');
    const hiList=document.getElementById('historyList');
    const empty=document.getElementById('impEmpty');
    function show(tab){
      if(tab==='upcoming'){
        upBtn.classList.add('active'); hiBtn.classList.remove('active');
        upList.style.display=''; hiList.style.display='none';
        empty.style.display = upList.innerHTML.includes('Chưa có sự kiện') ? '' : 'none';
      } else {
        hiBtn.classList.add('active'); upBtn.classList.remove('active');
        hiList.style.display=''; upList.style.display='none';
        empty.style.display = hiList.innerHTML.includes('Chưa có sự kiện') ? '' : 'none';
      }
    }
    upBtn?.addEventListener('click',()=>show('upcoming'));
    hiBtn?.addEventListener('click',()=>show('history'));
    // default Upcoming
    show('upcoming');
    // also keep legacy newsList hidden but fill for compatibility
    try{
      const newsData=await fetchJSON('./data/news.json','DATA_NEWS');
      const nl=document.getElementById('newsList');
      if(nl && newsData.items) nl.innerHTML='';
    }catch{}
  }catch(e){
    console.error('loadImportantEvents',e);
    const c=document.getElementById('upcomingList');
    if(c) c.innerHTML=`<div style="padding:20px;color:#E85D5D">Lỗi tải sự kiện: ${e.message}</div>`;
  }
}
document.addEventListener('DOMContentLoaded', loadImportantEvents);
