/* news.js - THÔNG BÁO trái: tin mới quét trong ngày (chỉ sự kiện quan trọng TGE/Snapshot...) - file:// safe */
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
  const d=new Date(str);
  return isNaN(d.getTime())?null:d;
}
function isToday(dateStr){
  const d=parseDate(dateStr);
  if(!d) return false;
  const today=new Date('2026-09-21T00:00:00+07:00');
  return d.getFullYear()===today.getFullYear() && d.getMonth()===today.getMonth() && d.getDate()===today.getDate();
}
function isImportantNews(item){
  // Chỉ giữ sự kiện quan trọng liên quan TGE, Snapshot, Registration, Claim, End, Mint, Eligibility, Allocation
  const txt=((item.summary_vi||'')+' '+(item.level||'')).toLowerCase();
  const keywords=['tge','snapshot','registration','đăng ký','claim','end','kết thúc','mint','eligibility','đủ điều kiện','allocation','genesis','important','season'];
  // level info is less important, but keep if contains keyword
  if(item.level==='info' && !keywords.some(k=>txt.includes(k))) return false;
  // keep important/normal + keyword or all important levels
  if(item.level==='important') return true;
  if(keywords.some(k=>txt.includes(k))) return true;
  // fallback: keep if project has important
  return txt.includes('genesis') || txt.includes('season') || txt.includes('daily')===false; // daily is not important per rule? but keep genesis
}
async function loadNews(){
  try{
    const data=await fetchJSON('./data/news.json','DATA_NEWS');
    const list=data.items||[];
    // Lọc: chỉ tin mới quét trong ngày (created_at today) + chỉ sự kiện quan trọng
    const todayImportant=list.filter(n=> isToday(n.created_at||n.published_at) && isImportantNews(n));
    // Fallback nếu lọc ra rỗng thì hiện tất cả tin hôm nay
    const toShow = todayImportant.length ? todayImportant : list.filter(n=>isToday(n.created_at||n.published_at));
    const container=document.getElementById('todayImportantList')||document.getElementById('newsList');
    if(!container) return;
    if(!toShow.length){
      container.innerHTML=`<div style="padding:20px;text-align:center;color:#6B7A90;font-size:14px;font-weight:600">Chưa có tin quan trọng mới trong ngày</div>`;
      return;
    }
    container.innerHTML=toShow.map(n=>{
      const fb=n.logo||'';
      const logo=fb?`<img src="${fb}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'"><span>${logoFallback(n.project_name)}</span>`:`<span>${logoFallback(n.project_name)}</span>`;
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
    }).join('');
    // keep legacy hidden containers for compatibility
    const legacy=document.getElementById('newsList');
    if(legacy && legacy.id!=='todayImportantList') legacy.style.display='none';
  }catch(e){
    console.error('loadNews',e);
    const c=document.getElementById('todayImportantList');
    if(c) c.innerHTML=`<div style="padding:20px;color:#E85D5D">Lỗi tải tin: ${e.message}</div>`;
  }
}
document.addEventListener('DOMContentLoaded', loadNews);
