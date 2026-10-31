(() => {
  const LANGUAGE_KEY = "palvelutampere-language";
  let language = "fi";
  try { const saved = localStorage.getItem(LANGUAGE_KEY); if (saved === "fi" || saved === "en") language = saved; } catch (_) {}
  const toggle = document.getElementById("lang"), menu = document.getElementById("menu");
  function setLanguage(next, remember = true) {
    language = next; document.documentElement.lang = next;
    document.querySelectorAll("[data-fi][data-en]").forEach(el => {
      if (el.tagName === "OPTION") el.textContent = el.dataset[next]; else el.innerHTML = el.dataset[next];
    });
    if (toggle) toggle.innerHTML = next === "fi" ? "<span class='active'>FI</span> / <span>EN</span>" : "<span>FI</span> / <span class='active'>EN</span>";
    document.querySelectorAll("[data-list-fi][data-list-en]").forEach(list => {
      const values = (next === "fi" ? list.dataset.listFi : list.dataset.listEn).split("|");
      list.innerHTML = values.map(x => `<li>${x}</li>`).join("");
    });
    if (remember) { try { localStorage.setItem(LANGUAGE_KEY, next); } catch (_) {} }
  }
  setLanguage(language, false);
  menu?.addEventListener("click", () => document.getElementById("nav")?.classList.toggle("open"));
  document.querySelectorAll("#nav a").forEach(a => a.addEventListener("click", () => document.getElementById("nav")?.classList.remove("open")));
  document.querySelectorAll("[data-review-carousel]").forEach(carousel => {
    const track = carousel.querySelector(".review-track"), slides = Array.from(track?.querySelectorAll(".review-slide") || []), dots = carousel.querySelector(".carousel-dots");
    if (!track || !slides.length || !dots) return;
    let current = 0;
    slides.forEach((_, i) => { const dot = document.createElement("button"); dot.type = "button"; dot.className = "carousel-dot"; dot.setAttribute("aria-label", `Go to review ${i+1}`); dot.addEventListener("click", () => show(i)); dots.append(dot); });
    const buttons = Array.from(dots.children);
    function show(i) { current = (i + slides.length) % slides.length; track.style.transform = `translateX(-${current*100}%)`; buttons.forEach((b,j) => b.setAttribute("aria-current",String(j===current))); }
    carousel.querySelector("[data-carousel-prev]")?.addEventListener("click", () => show(current-1));
    carousel.querySelector("[data-carousel-next]")?.addEventListener("click", () => show(current+1));
    let startX = 0; track.addEventListener("touchstart", e => { startX=e.changedTouches[0].clientX; }, {passive:true});
    track.addEventListener("touchend", e => { const d=e.changedTouches[0].clientX-startX; if(Math.abs(d)>45) show(current+(d<0?1:-1)); }, {passive:true});
    show(0);
  });
  document.querySelectorAll(".background-video").forEach(video => { const p=video.play(); if(p?.catch) p.catch(()=>{}); });
  const bookingEmail = window.PT_BOOKING_EMAIL || ""; // Set to the booking inbox before publishing.
  const path = location.pathname.toLowerCase();
  const isHome = path === "/" || /\/index\.html$/.test(path);
  let isCleaning = /siivous|siivoo|ikkunanpesu/.test(path);
  const cleaningChoices = ["Kotisiivous", "Muuttosiivous", "Yritys- tai toimistosiivous", "Porrassiivous", "Perussiivous", "Ikkunanpesu"];
  const movingChoices = ["Kotimuutto", "Yritysmuutto", "Muuttoapu", "Huonekalukuljetus", "Muuttolaatikot"];
  let serviceChoices = isCleaning ? cleaningChoices : movingChoices;
  const currentTitle = document.querySelector("main h1")?.textContent.trim() || (isCleaning ? "Siivouspalvelu" : "Muuttopalvelu");
  const serviceDefault = isHome ? cleaningChoices[0] : (serviceChoices.find(x => currentTitle.toLowerCase().includes(x.toLowerCase().split("-")[0])) || serviceChoices[0]);
  let activeTrigger = null;
  let modal = document.getElementById("booking-modal");
  if (!modal) {
    modal = document.createElement("div"); modal.className = "booking-modal"; modal.id = "booking-modal";
    modal.innerHTML = `<a class="booking-backdrop" href="#yhteys" data-booking-close aria-label="Close booking"></a><section class="booking-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-title"><button class="booking-close" type="button" aria-label="Sulje" data-booking-close>×</button><div class="booking-progress"><span></span></div><div class="booking-content"></div></section>`;
    document.body.append(modal);
  }
  modal.setAttribute("aria-hidden", "true");
  const content = modal.querySelector(".booking-content"), progress = modal.querySelector(".booking-progress span");
  const state = {step: 0, service: serviceDefault, size: isCleaning ? 80 : 50, repeat: "once", date: "", details: "", name: "", phone: "", email: ""};
  const serviceLabel = s => language !== "en" ? s : ({"Kotisiivous":"Home cleaning","Muuttosiivous":"Move-out cleaning","Yritys- tai toimistosiivous":"Business or office cleaning","Porrassiivous":"Stairwell cleaning","Perussiivous":"Deep cleaning","Ikkunanpesu":"Window cleaning","Kotimuutto":"Home move","Yritysmuutto":"Business move","Muuttoapu":"Moving help","Huonekalukuljetus":"Furniture transport","Muuttolaatikot":"Moving boxes"}[s] || s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function render() {
    const en = language === "en", copy = en ? {
      title:"Let’s plan your service", note:"A few quick choices help us prepare a clear, suitable booking.", step:["Choose a service","Tell us about the job","Where can we reach you?"],
      next:"Continue", back:"Back", size:isCleaning?"Approximate home size":"Approximate moving distance", small:isCleaning?"m²":"km", frequency:"How often?", one:"One-time", recurring:"Recurring", date:"Preferred date (optional)", details:"Anything else we should know? (optional)", detailsHint:"For example, access, special requests or timing", name:"Your name", phone:"Phone number", email:"Email (optional)", submit:"Send booking request", trust:"No commitment yet. We’ll call you shortly to confirm the details and your booking.", success:"Booking request sent", successBody:"Thank you. We’ll contact you by phone soon to confirm your booking.", fail:"We couldn’t send the request just now. Please call us at +358 44 931 8824.", missing:"Email booking notifications are not configured yet. Please call +358 44 931 8824 to book.", close:"Close"
    } : {
      title:"Suunnitellaan palvelu", note:"Muutamalla valinnalla valmistelemme sinulle sopivan varauksen.", step:["Valitse palvelu","Kerro kohteesta","Mihin numeroon soitamme?"],
      next:"Jatka", back:"Takaisin", size:isCleaning?"Kodinkoko noin":"Muuton matka noin", small:isCleaning?"m²":"km", frequency:"Kuinka usein?", one:"Kertakäynti", recurring:"Säännöllisesti", date:"Toivottu päivä (vapaaehtoinen)", details:"Mitä muuta meidän olisi hyvä tietää? (vapaaehtoinen)", detailsHint:"Esimerkiksi kulku, erityistoiveet tai aikataulu", name:"Nimi", phone:"Puhelinnumero", email:"Sähköposti (vapaaehtoinen)", submit:"Lähetä varauspyyntö", trust:"Varaus ei sido vielä. Soitamme pian ja vahvistamme yksityiskohdat ja varauksen.", success:"Varauspyyntö lähetetty", successBody:"Kiitos! Otamme sinuun pian yhteyttä puhelimitse varauksen vahvistamiseksi.", fail:"Pyyntöä ei voitu lähettää juuri nyt. Soita meille: +358 44 931 8824.", missing:"Sähköposti-ilmoitusta ei ole vielä määritetty. Tee varaus soittamalla numeroon +358 44 931 8824.", close:"Sulje"
    };
    if (state.step > 2) {
      progress.style.width = "100%";
      content.innerHTML = `<div class="booking-success-mark">✓</div><p class="eyebrow">${esc(copy.success)}</p><h2 id="booking-title">${esc(copy.success)}</h2><p>${esc(copy.successBody)}</p><button class="button booking-primary" type="button" data-booking-close>${esc(copy.close)}</button>`;
      return;
    }
    progress.style.width = `${(state.step + 1) / 3 * 100}%`;
    const header = `<p class="eyebrow">${esc(copy.step[state.step])} · ${state.step+1}/3</p><h2 id="booking-title">${esc(copy.title)}</h2><p class="booking-note">${esc(copy.note)}</p>`;
    if (state.step === 0) {
      const categoryTabs = isHome ? `<div class="booking-pills booking-category"><button type="button" data-category="cleaning" class="${isCleaning?"selected":""}">${en?"Cleaning":"Siivous"}</button><button type="button" data-category="moving" class="${!isCleaning?"selected":""}">${en?"Moving":"Muutto"}</button></div>` : "";
      content.innerHTML = `${header}${categoryTabs}<div class="booking-options">${serviceChoices.map(s=>`<button type="button" class="booking-option ${state.service===s?"selected":""}" data-service-choice="${esc(s)}"><span>${esc(serviceLabel(s))}</span><b>${state.service===s?"✓":"＋"}</b></button>`).join("")}</div><div class="booking-reassurance">${en?"You’ll see the service details before sending your request.":"Näet palvelun tiedot ennen pyynnön lähettämistä."}</div><button class="button booking-primary" type="button" data-booking-next>${esc(copy.next)} →</button>`;
    } else if (state.step === 1) {
      content.innerHTML = `${header}<label class="booking-field"><span>${esc(copy.size)} <strong><output id="booking-size">${state.size}</output> ${esc(copy.small)}</strong></span><input type="range" min="${isCleaning?"25":"1"}" max="${isCleaning?"250":"100"}" step="${isCleaning?"5":"1"}" value="${state.size}" name="size"></label>${isCleaning?`<fieldset class="booking-field"><legend>${esc(copy.frequency)}</legend><div class="booking-pills"><button type="button" data-repeat="once" class="${state.repeat==="once"?"selected":""}">${esc(copy.one)}</button><button type="button" data-repeat="recurring" class="${state.repeat==="recurring"?"selected":""}">${esc(copy.recurring)}</button></div></fieldset>`:""}<label class="booking-field"><span>${esc(copy.date)}</span><input type="date" name="date" value="${esc(state.date)}" min="${new Date().toISOString().slice(0,10)}"></label><label class="booking-field"><span>${esc(copy.details)}</span><textarea name="details" rows="3" placeholder="${esc(copy.detailsHint)}">${esc(state.details)}</textarea></label><div class="booking-reassurance">${isCleaning?(en?"We’ll confirm the scope and visit length before the booking is accepted.":"Vahvistamme työn sisällön ja keston ennen varauksen hyväksymistä."):(en?"We’ll confirm the route, access and timing with you by phone.":"Vahvistamme reitin, kulun ja aikataulun puhelimitse.")}</div><div class="booking-actions"><button type="button" class="booking-back" data-booking-back>← ${esc(copy.back)}</button><button class="button booking-primary" type="button" data-booking-next>${esc(copy.next)} →</button></div>`;
      const slider=content.querySelector('[name="size"]'); slider.addEventListener("input",()=>{state.size=slider.value;content.querySelector("#booking-size").value=slider.value;});
      const date=content.querySelector('[name="date"]'); date.addEventListener("change",()=>state.date=date.value);
      const details=content.querySelector('[name="details"]'); details.addEventListener("input",()=>state.details=details.value);
    } else {
      content.innerHTML = `${header}<form class="booking-final-form" toolname="submit_booking_request" tooldescription="Send a cleaning or moving booking request for Tampere or Pirkanmaa. The customer will be called to confirm; this is not a confirmed appointment."><div class="booking-summary"><span>${esc(serviceLabel(state.service))}</span><b>${esc(String(state.size))} ${esc(copy.small)}${isCleaning?` · ${esc(state.repeat==="once"?copy.one:copy.recurring)}`:""}</b></div><input type="hidden" name="service" value="${esc(state.service)}" toolparamdescription="Selected service"><input type="hidden" name="job_size_or_distance" value="${esc(state.size)} ${esc(copy.small)}" toolparamdescription="Approximate home area or moving distance"><input type="hidden" name="frequency" value="${esc(state.repeat)}" toolparamdescription="Cleaning visit frequency"><input type="hidden" name="preferred_date" value="${esc(state.date)}"><input type="hidden" name="details" value="${esc(state.details)}"><label class="booking-field"><span>${esc(copy.name)}</span><input name="name" autocomplete="name" aria-label="${esc(copy.name)}" required value="${esc(state.name)}" toolparamdescription="Customer's full name"></label><label class="booking-field"><span>${esc(copy.phone)}</span><input name="phone" type="tel" autocomplete="tel" aria-label="${esc(copy.phone)}" required value="${esc(state.phone)}" toolparamdescription="Phone number for booking confirmation call"></label><label class="booking-field"><span>${esc(copy.email)}</span><input name="email" type="email" autocomplete="email" aria-label="${esc(copy.email)}" value="${esc(state.email)}" toolparamdescription="Optional email address"></label><div class="booking-reassurance">${esc(copy.trust)}</div><p class="booking-error" role="alert" hidden></p><div class="booking-actions"><button type="button" class="booking-back" data-booking-back>← ${esc(copy.back)}</button><button class="button booking-primary" type="submit" data-booking-submit>${esc(copy.submit)} →</button></div></form>`;
      content.querySelector(".booking-final-form").addEventListener("submit",e=>{e.preventDefault();const result=submitBooking();if(e.agentInvoked&&typeof e.respondWith==="function")e.respondWith(result);});
      content.querySelector('[name="name"]').addEventListener("input",e=>state.name=e.target.value);
      content.querySelector('[name="phone"]').addEventListener("input",e=>state.phone=e.target.value);
      content.querySelector('[name="email"]').addEventListener("input",e=>state.email=e.target.value);
    }
    content.querySelectorAll("[data-service-choice]").forEach(b=>b.addEventListener("click",()=>{state.service=b.dataset.serviceChoice;render();}));
    content.querySelectorAll("[data-category]").forEach(b=>b.addEventListener("click",()=>{isCleaning=b.dataset.category==="cleaning";serviceChoices=isCleaning?cleaningChoices:movingChoices;state.service=serviceChoices[0];state.size=isCleaning?80:50;render();}));
    content.querySelectorAll("[data-repeat]").forEach(b=>b.addEventListener("click",()=>{state.repeat=b.dataset.repeat;render();}));
    content.querySelector("[data-booking-next]")?.addEventListener("click",()=>{state.step++;render();});
    content.querySelector("[data-booking-back]")?.addEventListener("click",()=>{state.step--;render();});
  }
  function openBooking(trigger = document.querySelector(".floating-book")) { activeTrigger=trigger; state.step=0; modal.classList.add("is-open"); modal.setAttribute("aria-hidden","false"); document.body.classList.add("booking-open"); render(); modal.querySelector("[data-service-choice]")?.focus(); }
  function closeBooking() { modal.classList.remove("is-open"); modal.setAttribute("aria-hidden","true"); document.body.classList.remove("booking-open"); activeTrigger?.focus(); }
  async function submitBooking() {
    const error=content.querySelector(".booking-error");
    const finalForm=content.querySelector(".booking-final-form");
    if(finalForm){const fields=new FormData(finalForm);state.service=fields.get("service")||state.service;const sizeValue=String(fields.get("job_size_or_distance")||"").match(/[\d.]+/);if(sizeValue)state.size=Number(sizeValue[0]);state.repeat=fields.get("frequency")||state.repeat;state.date=fields.get("preferred_date")||state.date;state.details=fields.get("details")||state.details;state.name=fields.get("name")||state.name;state.phone=fields.get("phone")||state.phone;state.email=fields.get("email")||state.email;}
    if (!state.name.trim() || !state.phone.trim()) { error.hidden=false; error.textContent=language==="fi"?"Lisää nimi ja puhelinnumero jatkaaksesi.":"Add your name and phone number to continue."; return {ok:false,message:error.textContent}; }
    if (!bookingEmail) { error.hidden=false; error.textContent=language==="fi"?"Sähköposti-ilmoitusta ei ole vielä määritetty. Soita numeroon +358 44 931 8824.":"Email booking notifications are not configured yet. Call +358 44 931 8824."; return {ok:false,message:error.textContent}; }
    const payload={_subject:`Varauspyyntö: ${state.service}`,name:state.name,phone:state.phone,email:state.email,service:state.service,area_size_or_distance:`${state.size} ${isCleaning?"m²":"km"}`,frequency:state.repeat==="once"?"Kertakäynti":"Säännöllinen",preferred_date:state.date,details:state.details,page:location.href};
    const button=content.querySelector("[data-booking-submit]"); button.disabled=true; button.textContent=language==="fi"?"Lähetetään…":"Sending…";
    try { const response=await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(bookingEmail)}`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(payload)});if(!response.ok)throw new Error("send failed");await response.json();state.step=3;render();return {ok:true,message:language==="fi"?"Varauspyyntö lähetetty. Palveluntarjoaja soittaa asiakkaalle varauksen vahvistamiseksi.":"Request sent. The provider will call the customer to confirm."}; }
    catch(_){error.hidden=false;error.textContent=language==="fi"?"Lähetys epäonnistui. Soita meille +358 44 931 8824 tai yritä uudelleen.":"Sending failed. Call us at +358 44 931 8824 or try again.";button.disabled=false;button.textContent=language==="fi"?"Lähetä varauspyyntö →":"Send booking request →";return {ok:false,message:error.textContent};}
  }
  document.addEventListener("click",e=>{const trigger=e.target.closest(".floating-book,[data-open-booking]");if(!trigger)return;e.preventDefault();openBooking(trigger);});
  toggle?.addEventListener("click",()=>{setLanguage(language==="fi"?"en":"fi");if(modal.classList.contains("is-open"))render();document.querySelectorAll(".booking-inline").forEach(form=>{const p=form.querySelector("p"),button=form.querySelector("button"),small=form.querySelector("small");if(p)p.textContent=language==="fi"?"Valitse palvelu ja kerro tarpeestasi muutamalla helpolla valinnalla.":"Choose a service and tell us what you need with a few simple choices.";if(button)button.textContent=language==="fi"?"Aloita varauspyyntö →":"Start booking request →";if(small)small.textContent=language==="fi"?"Soitamme pian ja käymme yksityiskohdat kanssasi läpi.":"We’ll call soon and go through the details with you.";});});
  modal.querySelectorAll("[data-booking-close]").forEach(el=>el.addEventListener("click",closeBooking));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modal.classList.contains("is-open"))closeBooking();});
  document.querySelectorAll("form[data-service]").forEach(form=>{
    form.classList.add("booking-inline");
    form.innerHTML = `<div class="booking-inline-icon" aria-hidden="true">✦</div><p>${language==="fi"?"Valitse palvelu ja kerro tarpeestasi muutamalla helpolla valinnalla.":"Choose a service and tell us what you need with a few simple choices."}</p><button class="button" type="button" data-open-booking>${language==="fi"?"Aloita varauspyyntö →":"Start booking request →"}</button><small>${language==="fi"?"Soitamme pian ja käymme yksityiskohdat kanssasi läpi.":"We’ll call soon and go through the details with you."}</small>`;
  });
  if(location.hash==="#booking-modal")openBooking(document.querySelector(".floating-book"));
  document.querySelectorAll('a[href="#yhteys"]').forEach(link=>{ if(link.closest(".floating-cta"))return; });
})();
