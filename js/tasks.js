/* tasks.js - file:// safe */
function splitTasks(raw){
  if(Array.isArray(raw)) return raw;
  if(!raw) return [];
  let s = String(raw);
  let parts = s.split(/,\s*then\s*|\s*then\s+|\s*,\s*|\s*;\s*|\s+and\s+then\s+/i);
  let out=[];
  parts.forEach(p=>{
    p = p.trim().replace(/\.$/,'');
    if(!p) return;
    if(p.length>90 && p.includes(' and ')){
      p.split(' and ').forEach(q=>{ q=q.trim(); if(q) out.push(q); });
    } else out.push(p);
  });
  out = out.map(x=> x.charAt(0).toUpperCase()+x.slice(1)).filter(x=>x.length>2);
  return [...new Set(out)];
}
function cardHTML(p){
  const init = (p.name||'?').charAt(0).toUpperCase();
  const steps = splitTasks(p.note || p.task || '');
  const sHTML = steps.map(s=>`<div>👉 ${s}</div>`).join('');
  const tLabel = p.task_type || (p.type) || 'one_time';
  const typeClass = tLabel==='daily' ? 'b-daily':'b-onetime';
  const prioClass = 'b-'+(p.priority_level||p.priority||'medium');
  const logo = p.logo ? `<img src="${p.logo}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'"><span>${init}</span>` : `<span>${init}</span>`;
  return `<div class="project-card" data-type="${tLabel}" data-prio="${p.priority_level||p.priority||'medium'}" data-name="${p.name.toLowerCase()}">
    <div class="project-top">
      <div class="project-logo">${logo}</div>
      <div style="min-width:0;flex:1">
        <div class="project-name">🔴 ${p.name}</div>
        <a class="project-link" href="${p.web_link||p.link||'#'}" target="_blank">🔗 ${p.web_link||p.link||''}</a>
        <div class="badges">
          <span class="badge ${typeClass}">${tLabel==='daily'?'🔁 DAILY':'✅ ONE-TIME'}</span>
          <span class="badge ${prioClass}">${p.priority_level||p.priority||'medium'}</span>
          <span class="badge b-chain">${p.chain||'other'}</span>
        </div>
      </div>
    </div>
    <div class="task-steps"><div class="t">✅ TASK CẦN LÀM</div>${sHTML||'<div>👉 '+ (p.task||'') +'</div>'}</div>
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
      <a class="btn-accent" href="${p.web_link||'#'}" target="_blank">Mở Web →</a>
      ${p.x_post_link?`<a class="btn-outline" href="${p.x_post_link}" target="_blank">𝕏 Profile</a>`:`<span style="font-size:11px;color:#94A3B8;align-self:center">No X</span>`}
    </div>
  </div>`;
}
async function fetchJSON(path, fb){
  try{ const r=await fetch(path); if(r.ok) return await r.json(); }catch(e){}
  if(fb && window[fb]) return window[fb];
  throw new Error('no data '+path);
}
async function loadTasks(){
  try{
    const data = await fetchJSON('./data/projects.json','DATA_PROJECTS');
    const projects = data.projects||[];
    const el=document.getElementById('allTaskCount');
    if(el) el.textContent = projects.length;
    const grid = document.getElementById('allTasksGrid');
    if(grid) grid.innerHTML = projects.map(p=>cardHTML(p)).join('');

    const dailyData = await fetchJSON('./data/daily_tasks.json','DATA_DAILY_TASKS');
    const daily = dailyData.tasks||[];
    const dailyBox = document.getElementById('dailyTasksList');
    if(dailyBox){
      const projById={}; projects.forEach(pr=>projById[pr.id]=pr);
      dailyBox.innerHTML = `<div style="font-size:12px;font-weight:800;margin-bottom:8px">🔁 DAILY TASK — ${daily.length} tasks</div><div class="task-grid">`+
        daily.map(d=>{
          const proj = projById[d.project_id];
          return cardHTML({name:d.project_name, logo: proj?.logo, web_link:d.link, x_post_link:proj?.x_post_link||'', task:d.description, task_type:'daily', priority_level:d.priority, chain:d.chain||'other', note:d.description});
        }).join('') + `</div>`;
    }
    const newData = await fetchJSON('./data/new_tasks.json','DATA_NEW_TASKS');
    const newBox = document.getElementById('newTasksList');
    if(newBox){
      const nt = newData.tasks||[];
      newBox.innerHTML = `<div style="font-size:12px;font-weight:800;margin:10px 0 8px">🆕 NEW TASK — ${nt.length} phát hiện mới</div>`+
        (nt.length? `<div class="task-grid">${nt.map(t=>cardHTML({name:t.project_name||t.project_id, web_link:t.link||'', task:t.title||t.description, task_type:'one_time', priority_level:'medium', chain:'other', note:t.title})).join('')}</div>` : `<div style="color:#6B7A90;font-size:12px;padding:10px;border:1px dashed var(--border);border-radius:8px;text-align:center">Chưa phát hiện task mới (baseline = current). NEW = CURRENT - BASELINE.</div>`);
    }
    const fType = document.getElementById('filterType');
    const fPrio = document.getElementById('filterPrio');
    const search = document.getElementById('searchProject');
    function applyFilter(){
      const type = fType.value, prio=fPrio.value, q=(search.value||'').toLowerCase().trim();
      document.querySelectorAll('#allTasksGrid .project-card').forEach(c=>{
        const okType = type==='all' || c.dataset.type===type;
        const okPrio = prio==='all' || c.dataset.prio===prio;
        const okSearch = !q || c.dataset.name.includes(q);
        c.style.display = (okType && okPrio && okSearch) ? '' : 'none';
      });
    }
    fType?.addEventListener('change', applyFilter);
    fPrio?.addEventListener('change', applyFilter);
    search?.addEventListener('input', applyFilter);
  }catch(e){ console.error('loadTasks', e); const g=document.getElementById('allTasksGrid'); if(g) g.innerHTML=`<div style="color:#E85D5D;padding:12px">Lỗi tải tasks: ${e.message}</div>`; }
}
document.addEventListener('DOMContentLoaded', loadTasks);
