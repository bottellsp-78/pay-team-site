/* ===================================================================
   PAY-TEAM — shared interactions
   =================================================================== */

/* ---- CONFIG: update these to route leads ---- */
const PT = {
  // Contact channels. Set a value to switch that channel on site-wide.
  // Anything left null is automatically removed from the page — no dead links.
  whatsapp: null,                       // e.g. "https://wa.me/447700900000"
  telegram: "https://t.me/ggggdubi",                       // e.g. "https://t.me/payteam"  <-- set once the @handle is claimed
  email: "solutions@pay-team.com",
  phone: null                           // e.g. "+44 20 0000 0000"
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
    const body = [
      'New Pay-Team enquiry','',
      'Industry: ' + (data.vertical||'-'),
      'Monthly volume: ' + (data.volume||'-'),
      'Needs: ' + (data.need||'-'),
      'Name: ' + (data.name||'-'),
      'Company: ' + (data.company||'-'),
      'Email: ' + (data.email||'-')
    ].join('\n');

    // Show success state
    steps.forEach(s=>s.classList.remove('active'));
    form.querySelector('.progress')?.style.setProperty('display','none');
    if(success){
      success.classList.add('show');
      const hand = success.querySelector('.js-handoff');
      if(hand){
        if(PT.telegram){ hand.href = PT.telegram; }
        else { hand.href = 'mailto:' + PT.email + '?subject=' + encodeURIComponent('New Pay-Team enquiry') + '&body=' + encodeURIComponent(body); }
      }
    }
  });

  render();
})();

/* ---- Wire up contact links from config ---- */
(function wireContacts(){
  function apply(sel, value, build){
    document.querySelectorAll(sel).forEach(function(el){
      if(!value){ el.remove(); return; }        // channel switched off -> drop the element entirely
      el.href = build(value);
    });
  }
  apply('[data-wa]',   PT.whatsapp, function(v){ return v; });
  apply('[data-tg]',   PT.telegram, function(v){ return v; });
  apply('[data-mail]', PT.email,    function(v){ return 'mailto:' + v; });
  apply('[data-tel]',  PT.phone,    function(v){ return 'tel:' + v.replace(/\s/g,''); });
  document.querySelectorAll('.js-email-txt').forEach(function(el){ if(PT.email) el.textContent = PT.email; });
  // hide the floating dock if every channel in it was removed
  var dock = document.querySelector('.dock');
  if(dock && !dock.querySelector('a')) dock.style.display = 'none';
  // hide footer social row if empty
  var soc = document.querySelector('.foot-social');
  if(soc && !soc.querySelector('a')) soc.style.display = 'none';
})();

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
(function(){var els=document.querySelectorAll('.reveal');var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;var show=function(el){el.style.opacity='1';el.style.transform='none';};if(reduce||!('IntersectionObserver' in window)){els.forEach(show);return;}els.forEach(function(el){if(el.getBoundingClientRect().top<window.innerHeight*0.95){show(el);return;}el.style.opacity='0';el.style.transform='translateY(24px)';el.style.transition='.6s cubic-bezier(.2,.7,.2,1)';io.observe(el);});setTimeout(function(){els.forEach(function(el){if(el.style.opacity==='0'&&el.getBoundingClientRect().top<window.innerHeight)show(el);});},3000);})();


/* ===================================================================
   PT_ANALYTICS — GA4 with UK/EU-compliant consent gating.
   GA4 is NOT loaded until the visitor accepts. Declining loads nothing.
   Set MEASUREMENT_ID below to switch analytics on.
   =================================================================== */
(function PT_ANALYTICS(){
  var MEASUREMENT_ID = "G-CHKX20NRHR";
  var KEY = "pt_consent";
  if (!MEASUREMENT_ID || MEASUREMENT_ID.indexOf("G-") !== 0) return;  // not configured yet

  function loadGA(){
    if (window.__ptGaLoaded) return; window.__ptGaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
      analytics_storage: 'granted'
    });
    gtag('config', MEASUREMENT_ID, { anonymize_ip: true });
  }

  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch(e){}
  if (stored === 'granted') { loadGA(); return; }
  if (stored === 'denied') { return; }

  function save(v){ try { localStorage.setItem(KEY, v); } catch(e){} }

  document.addEventListener('DOMContentLoaded', function(){
    var bar = document.createElement('div');
    bar.className = 'ck';
    bar.setAttribute('role','dialog');
    bar.setAttribute('aria-label','Cookie preferences');
    bar.innerHTML =
      '<p>We use analytics cookies to see which pages are useful. Nothing is shared with advertisers. ' +
      '<a href="contact.html">Privacy</a>.</p>' +
      '<div class="ck-btns">' +
        '<button type="button" class="ck-no">Decline</button>' +
        '<button type="button" class="ck-yes">Accept</button>' +
      '</div>';
    document.body.appendChild(bar);
    requestAnimationFrame(function(){ bar.classList.add('in'); });

    bar.querySelector('.ck-yes').addEventListener('click', function(){
      save('granted'); loadGA(); bar.classList.remove('in');
      setTimeout(function(){ bar.remove(); }, 300);
    });
    bar.querySelector('.ck-no').addEventListener('click', function(){
      save('denied'); bar.classList.remove('in');
      setTimeout(function(){ bar.remove(); }, 300);
    });
  });
})();
