/* progress.js — file:// safe + full table + modal */
let PROGRESS_DATA = [];
function iconFor(status){
  if(status==='done') return '✓';
  if(status==='active') return '●';
  if(status==='locked') return '🔒';
  return '○';
}
async function fetchJSON(path, fb){
  try{ const r=await fetch(path); if(r.ok) return await r.json(); }catch(e){}
  if(fb && window[fb]) return window[fb];
  throw new Error('no data '+path);
}
function renderPreview(projects){
  const c = document.getElementById('progressPreview');
  if(!c) return;
  c.innerHTML = projects.slice(0,2).map(p=>{
    const pct=p.progress_percent||0;
    const steps=(p.stages||[]).map(s=>{
      const cls=s.status==='done'?'done':(s.status==='active'?'active':'');
      return `<span class="step ${cls}"><span class="dot">${iconFor(s.status)}</span> ${s.title}</span> <span style="color:#CBD5E1">→</span>`;
    }).join(' ');
    const init=(p.project_name||'?').charAt(0).toUpperCase();
    const logo = p.logo ? `<img src="${p.logo}" alt="" loading="lazy" onerror="this.style.display='none'"><span>${init}</span>` : `<span>${init}</span>`;
    return `<div class="progress-row">
      <div class="progress-logo">${logo}</div>
      <div class="progress-info">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="progress-name">${p.project_name}</div>
          <div class="percent">${pct}%</div>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="progress-steps">${steps}</div>
      </div>
    </div>`;
  }).join('') || `<div style="color:#6B7A90;font-size:12px;padding:8px">Chưa có tiến trình</div>`;
}
function renderFullTable(projects){
  const tbody = document.getElementById('progressFullBody');
  if(!tbody) return;
  tbody.innerHTML = projects.map(p=>{
    const pct=p.progress_percent||0;
    const timeline = (p.stages||[]).map((s,i)=>{
      const dotClass = s.status==='done'?'done':(s.status==='active'?'active':(s.status==='locked'?'locked':''));
      const arrow = i < p.stages.length-1 ? `<span class="p-arrow">→</span>` : '';
      return `<div class="p-step ${s.status}"><div class="p-dot ${dotClass}">${iconFor(s.status)}</div><div class="p-step-label" title="${s.title}">${s.title}</div></div>${arrow}`;
    }).join('');
    const stageBadgeClass = p.stages.find(s=>s.id===p.current_stage)?.status || 'active';
    const chain = p.chain||'other';
    const tge = p.tge_date ? `TGE ${p.tge_date.slice(0,10)}` : '';
    const init=(p.project_name||'?').charAt(0).toUpperCase();
    const logo = p.logo ? `<img src="${p.logo}" alt="" loading="lazy" onerror="this.style.display='none'"><span>${init}</span>` : `<span>${init}</span>`;
    return `<tr>
      <td class="p-col-project">
        <div class="p-project">
          <div class="p-logo">${logo}</div>
          <div>
            <div class="p-name">${p.project_name}</div>
            <div class="p-meta">${chain} · ${p.priority||'medium'} ${p.task_date? '· ⏰ '+p.task_date.slice(0,10):''} ${tge? '· '+tge:''}</div>
          </div>
        </div>
      </td>
      <td class="p-col-progress"><div class="p-bar-wrap"><div class="p-bar"><div class="p-fill" style="width:${pct}%"></div></div><span class="p-pct">${pct}%</span></div></td>
      <td class="p-col-timeline"><div class="p-timeline">${timeline}</div></td>
      <td class="p-col-stage"><span class="p-stage-badge ${stageBadgeClass}">${p.current_stage_title||p.current_stage}</span></td>
      <td class="p-col-action"><button class="btn-detail" onclick="openProgressModal('${p.project_id}')">Chi tiết</button></td>
    </tr>`;
  }).join('');
}
function statusPill(status){
  const map={done:'✅ done',active:'🔵 active',pending:'⚪ pending',locked:'🔒 locked'};
  return map[status]||status;
}
window.openProgressModal = function(pid){
  const p = PROGRESS_DATA.find(x=>x.project_id===pid);
  if(!p) return;
  document.getElementById('modalTitle').textContent = `${p.project_name} — ${p.progress_percent}% · ${p.current_stage_title}`;
  const milestones = (p.stages||[]).map(s=>{
    const dl = s.deadline ? `<div class="m-deadline">⏰ Deadline: ${s.deadline}</div>` : '';
    const note = s.note ? `<div class="m-note">${s.note}</div>` : '';
    return `<div class="milestone">
      <div class="p-dot ${s.status==='done'?'done':(s.status==='active'?'active':(s.status==='locked'?'locked':''))}" style="flex:none">${iconFor(s.status)}</div>
      <div class="m-desc"><div class="m-title">${s.title}</div>${note}${dl}</div>
      <span class="m-status ${s.status}" style="background:${s.status==='done'?'#DCFCE7':(s.status==='active'?'#E0F2FE':(s.status==='locked'?'#FFF1F2':'#F1F5F9'))};color:${s.status==='done'?'#166534':(s.status==='active'?'#0C4A6E':(s.status==='locked'?'#9F1239':'#475569'))}">${statusPill(s.status)}</span>
    </div>`;
  }).join('');
  const links = `<div style="display:flex;gap:8px;flex-wrap:wrap">
    ${p.web_link? `<a class="btn-accent" href="${p.web_link}" target="_blank">Mở Web →</a>`:''}
    ${p.x_link? `<a class="btn-outline" href="${p.x_link}" target="_blank">𝕏 Profile</a>`:''}
    <span style="font-size:11px;color:#6B7A90;align-self:center">Priority: ${p.priority} · Chain: ${p.chain} · Status: ${p.status}</span>
  </div>`;
  const history = (p.history||[]).map(h=> `<div style="font-size:11px;padding:4px 0;border-bottom:1px solid #F1F5F9;display:flex;justify-content:space-between"><span>${h.date} — ${h.action}</span><span style="color:${h.status==='done'?'var(--success)':'var(--accent)'}">${h.status}</span></div>`).join('');
  document.getElementById('modalBody').innerHTML = `
    ${links}
    <div>${milestones}</div>
    <div style="background:#F8FAFC;border:1px solid #EEF2F7;border-radius:8px;padding:10px">
      <div style="font-size:11px;font-weight:800;margin-bottom:6px">📋 Task liên quan</div>
      <div style="font-size:12px;color:#17233C">${window.getProjectTask? window.getProjectTask(p.project_id) : 'Xem tab ALL TASK PROJECT'} </div>
    </div>
    <div><div style="font-size:11px;font-weight:800;margin-bottom:6px">🕘 Lịch sử cập nhật</div><div style="border:1px solid var(--border);border-radius:8px;padding:8px;background:#fff">${history||'<div style="font-size:11px;color:#6B7A90">Chưa có lịch sử</div>'}</div></div>
    <div style="font-size:10px;color:#94A3B8">Updated: ${p.updated_at} · AI không tự đánh DONE — chỉ cập nhật new/active/pending/locked.</div>
  `;
  document.getElementById('progressModal').classList.add('open');
}
window.closeProgressModal = function(){ document.getElementById('progressModal').classList.remove('open'); }
document.getElementById('progressModal')?.addEventListener('click', (e)=>{ if(e.target.id==='progressModal') closeProgressModal(); });
window.getProjectTask = window.getProjectTask || function(){return '';};
async function loadProgress(){
  try{
    const data = await fetchJSON('./data/progress.json','DATA_PROGRESS');
    PROGRESS_DATA = data.projects||[];
    window.PROGRESS_DATA = PROGRESS_DATA;
    renderPreview(PROGRESS_DATA);
    renderFullTable(PROGRESS_DATA);
    try{
      const pj = await fetchJSON('./data/projects.json','DATA_PROJECTS');
      const map={}; (pj.projects||[]).forEach(x=> map[x.id]=x.note||x.name);
      window.getProjectTask = (pid)=> map[pid] || '';
    }catch{}
  }catch(e){
    console.error('loadProgress', e);
    const tb=document.getElementById('progressFullBody');
    if(tb) tb.innerHTML=`<tr><td colspan="5" style="color:#E85D5D;padding:12px">Lỗi tải tiến trình: ${e.message}</td></tr>`;
  }
}
document.addEventListener('DOMContentLoaded', loadProgress);
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeProgressModal(); });
