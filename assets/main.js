/* ===================================================================
   PAY-TEAM — shared interactions
   =================================================================== */

/* ---- CONFIG: update these to route leads ---- */
const PT = {
  whatsapp: "https://wa.me/00000000000?text=Hi%20Pay-Team%2C%20I%27d%20like%20to%20discuss%20a%20high-risk%20payment%20solution.",
  telegram: "https://t.me/payteam",
  email: "solutions@pay-team.com",
  phone: "+00 0000 000000"
};

/* ---- Mobile nav ---- */
document.addEventListener('click', (e) => {
  const t = e.target.closest('.nav-toggle');
  if (t) {
    document.querySelector('.nav-links')?.classList.toggle('open');
  }
});

/* ---- Multi-step lead form ---- */
(function initLeadForm(){
  const form = document.getElementById('leadForm');
  if(!form) return;

  const steps = [...form.querySelectorAll('.lf-step')];
  const bar = form.querySelector('.progress i');
  const success = form.querySelector('.lf-success');
  let cur = 0;
  const data = {};

  function render(){
    steps.forEach((s,i)=>s.classList.toggle('active', i===cur));
    if(bar) bar.style.width = ((cur+1)/steps.length*100)+'%';
  }

  form.addEventListener('click', (e)=>{
    // option select
    const opt = e.target.closest('.opt');
    if(opt){
      const group = opt.closest('.opts');
      group.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));
      opt.classList.add('sel');
      data[group.dataset.key] = opt.dataset.val;
      // auto-advance on choice steps
      setTimeout(()=>{ if(cur < steps.length-1){ cur++; render(); } }, 220);
      return;
    }
    // next
    if(e.target.closest('.lf-next')){
      if(cur < steps.length-1){ cur++; render(); }
      return;
    }
    // back
    if(e.target.closest('.lf-back')){
      if(cur>0){ cur--; render(); }
      return;
    }
  });

  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    for(const [k,v] of fd.entries()) data[k]=v;
    // Compose a pre-filled WhatsApp handoff so the lead reaches you instantly
    const msg = encodeURIComponent(
      `New Pay-Team enquiry%0A`+
      `Vertical: ${data.vertical||'-'}%0A`+
      `Monthly volume: ${data.volume||'-'}%0A`+
      `Need: ${data.need||'-'}%0A`+
      `Name: ${data.name||'-'}%0A`+
      `Company: ${data.company||'-'}%0A`+
      `Email: ${data.email||'-'}`
    );
    // Show success state
    steps.forEach(s=>s.classList.remove('active'));
    form.querySelector('.progress')?.style.setProperty('display','none');
    if(success){
      success.classList.add('show');
      const wa = success.querySelector('.js-wa-handoff');
      if(wa) wa.href = PT.whatsapp.split('?')[0] + '?text=' + msg;
    }
  });

  render();
})();

/* ---- Wire up contact links from config ---- */
document.querySelectorAll('[data-wa]').forEach(a=>a.href=PT.whatsapp);
document.querySelectorAll('[data-tg]').forEach(a=>a.href=PT.telegram);
document.querySelectorAll('[data-mail]').forEach(a=>a.href='mailto:'+PT.email);
document.querySelectorAll('[data-tel]').forEach(a=>a.href='tel:'+PT.phone.replace(/\s/g,''));
document.querySelectorAll('.js-email-txt').forEach(el=>el.textContent=PT.email);

/* ---- Back to top visibility ---- */
const topBtn = document.querySelector('.d-top');
if(topBtn){
  window.addEventListener('scroll',()=>{
    topBtn.style.opacity = window.scrollY>600 ? '1' : '0';
    topBtn.style.pointerEvents = window.scrollY>600 ? 'auto' : 'none';
  });
  topBtn.style.transition='opacity .3s';topBtn.style.opacity='0';topBtn.style.pointerEvents='none';
  topBtn.addEventListener('click',(e)=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})});
}

/* ---- Reveal on scroll ---- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{ if(en.isIntersecting){ en.target.style.opacity='1'; en.target.style.transform='none'; io.unobserve(en.target);} });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>{
  el.style.opacity='0';el.style.transform='translateY(24px)';el.style.transition='.6s cubic-bezier(.2,.7,.2,1)';
  io.observe(el);
});
