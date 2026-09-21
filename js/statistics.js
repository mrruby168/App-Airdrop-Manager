/* statistics.js — file:// safe */
async function fetchJSON(path, fb){
  try{ const r=await fetch(path); if(r.ok) return await r.json(); }catch(e){}
  if(fb && window[fb]) return window[fb];
  throw new Error('no data '+path);
}
async function loadStats(){
  try{
    const data = await fetchJSON('./data/statistics.json','DATA_STATISTICS');
    const summary = data.summary||{};
    const items = data.items||[];
    function renderSummary(containerId){
      const c = document.getElementById(containerId);
      if(!c) return;
      const boxes = [
        {lbl:'PROJECT', val: summary.total_projects ?? items.length, cls:'project'},
        {lbl:'COST', val: '$'+ (summary.total_cost ?? 0), cls:'cost'},
        {lbl:'REWARD', val: '$'+ (summary.total_reward ?? 0).toLocaleString(), cls:'reward'},
        {lbl:'REVENUE', val: '$'+ (summary.total_revenue ?? 0).toLocaleString(), cls:'revenue'},
        {lbl:'P/L', val: (summary.total_profit>=0?'+$':'-$')+ Math.abs(summary.total_profit||0).toLocaleString(), cls:'pl'},
        {lbl:'ROI', val: (summary.total_roi!=null? summary.total_roi+'%':'—'), cls:'roi'},
      ];
      c.innerHTML = boxes.map(b=> `<div class="stat-box ${b.cls}"><div class="num">${b.val}</div><div class="lbl">${b.lbl}</div></div>`).join('');
    }
    renderSummary('statsSummary');
    renderSummary('statsSummaryFull');
    function renderTable(sel){
      const tbody = document.querySelector(sel);
      if(!tbody) return;
      tbody.innerHTML = items.map(r=>{
        const pl = r.profit>=0 ? `+$${r.profit}` : `-$${Math.abs(r.profit)}`;
        const roi = r.roi==null ? '—' : r.roi+'%';
        return `<tr><td>${r.project_name}</td><td>$${r.cost}</td><td>$${r.reward}</td><td>$${r.revenue}</td><td class="pl">${pl}</td><td class="roi">${roi}</td>${sel.includes('Full')?`<td style="font-size:10px;color:#6B7A90">${r.status}</td>`:''}</tr>`;
      }).join('') || `<tr><td colspan="7" style="text-align:center;color:#6B7A90">Chưa có dữ liệu thống kê</td></tr>`;
    }
    renderTable('#statsTable tbody');
    renderTable('#statsTableFull tbody');
  }catch(e){
    console.error('loadStats', e);
    document.querySelectorAll('.stats-summary').forEach(c=> c.innerHTML=`<div style="color:#E85D5D;font-size:12px">Lỗi: ${e.message}</div>`);
  }
}
document.addEventListener('DOMContentLoaded', loadStats);
