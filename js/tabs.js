/* tabs.js - 5 tabs switching */
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.panel');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      panels.forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('panel-' + target);
      if (panel) panel.classList.add('active');
      // scroll top main
      document.querySelector('.main')?.scrollTo?.(0,0);
      window.scrollTo(0,0);
    });
  });
  // sidebar filter
  const sideTabs = document.querySelectorAll('.side-tab');
  sideTabs.forEach(b=>{
    b.addEventListener('click',()=>{
      sideTabs.forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      window.filterNotifications?.(b.dataset.filter);
    });
  });
  // bell -> focus sidebar on mobile
  document.getElementById('bellBtn')?.addEventListener('click',()=>{
    document.querySelector('.sidebar')?.scrollIntoView({behavior:'smooth'});
  });
});
