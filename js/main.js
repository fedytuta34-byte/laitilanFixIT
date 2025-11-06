document.addEventListener("DOMContentLoaded", () => {
  // ---------- i18n ----------
  const I18N = {
    fi: {
      nav_services:"Palvelut", nav_contact:"Yhteys", nav_privacy:"Tietosuoja",
      hero_title:"Luotettava IT-palvelu Laitilassa",
      hero_sub:"Nopea ja paikallinen ratkaisu tietokoneille, puhelimille ja verkkosivuille.",
      hero_btn:"Tutustu palveluihin", hero_contact:"Ota yhteyttä",

      services_title:"Palvelut",
      s1_title:"Laitteistokorjaukset",
      s1_desc:"Tietokoneiden ja kannettavien vianmääritys, huolto ja päivitykset.",
      s2_title:"Pelikoneet & räätälöidyt PC:t",
      s2_desc:"Suunnittelu ja kasaus – asiakkaan tarpeiden mukaan.",
      s3_title:"Puhelin & tabletti -huolto",
      s3_desc:"Näyttöjen vaihto, akun vaihto, porttien korjaus.",
      s4_title:"Web/App-suunnittelu",
      s4_desc:"Modernit verkkosivut ja sovellukset – FI/EN-tuki.",
      s5_title:"Tekninen konsultointi",
      s5_desc:"Tietoturva, verkot ja laitteistohankinnat.",

      contact_title:"Ota yhteyttä", contact_phone_label:"Puhelin:",
      pickup_note:"Palvelu toimii noutona asiakkaalta – ei walk-in huoltoa.",
      form_name:"Nimi", form_email:"Sähköposti",
      form_message:"Kuvaus / ongelma", form_date:"Toivottu noutopäivä",
      form_send:"Lähetä",
      form_gdpr_hint:'Painamalla "Lähetä" hyväksyt tietojenkäsittelyn ehtomme (GDPR).',
      form_required:"Täytä kaikki pakolliset kentät.",
      form_success:"Kiitos! Viestisi on lähetetty.",
      form_error:"Virhe lähetyksessä. Yritä uudelleen.",
      form_emailjs_missing:"Sähköpostipalvelu ei latautunut. Päivitä sivu ja yritä uudelleen."
    },
    en: {
      nav_services:"Services", nav_contact:"Contact", nav_privacy:"Privacy",
      hero_title:"Reliable IT Service in Laitila",
      hero_sub:"Fast and local solutions for PCs, phones, and websites.",
      hero_btn:"View Services", hero_contact:"Contact Us",

      services_title:"Services",
      s1_title:"Hardware Repair",
      s1_desc:"Diagnostics, service and upgrades for desktops and laptops.",
      s2_title:"Gaming PC Builds",
      s2_desc:"Design and assembly tailored to your needs.",
      s3_title:"Phone & Tablet Repair",
      s3_desc:"Screen replacements, batteries, and port repairs.",
      s4_title:"Web/App Design",
      s4_desc:"Modern websites & apps — FI/EN support.",
      s5_title:"Tech Consulting",
      s5_desc:"Security, networking and hardware planning.",

      contact_title:"Contact Us", contact_phone_label:"Phone:",
      pickup_note:"Pickup-only service – no walk-ins or shipping.",
      form_name:"Name", form_email:"Email",
      form_message:"Description / issue", form_date:"Preferred pickup date",
      form_send:"Send",
      form_gdpr_hint:'By pressing "Send" you accept our data processing terms (GDPR).',
      form_required:"Please fill all required fields.",
      form_success:"Thank you! Your message has been sent.",
      form_error:"Error sending. Please try again.",
      form_emailjs_missing:"Mail service didn’t load. Refresh and try again."
    }
  };

  // apply language
  function setLang(lang){
    localStorage.setItem("lang", lang);
    const dict = I18N[lang] || I18N.fi;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const k = el.dataset.i18n;
      if (dict[k]) el.innerHTML = dict[k];
    });
  }
  setLang(localStorage.getItem("lang") || "fi");
  const btnFi = document.getElementById("lang-fi");
  const btnEn = document.getElementById("lang-en");
  if (btnFi) btnFi.addEventListener("click", ()=>setLang("fi"));
  if (btnEn) btnEn.addEventListener("click", ()=>setLang("en"));

  // footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- toast ----------
  const toast = document.getElementById("toast");
  function showToast(msg, type="ok"){
    if (!toast) return;
    toast.textContent = msg;
    toast.className = ""; // reset
    toast.classList.add(type==="error"?"error":"ok","show");
    setTimeout(()=> toast.classList.remove("show"), 3500);
  }

  // ---------- EmailJS ----------
  const EMAIL = {
    PUBLIC_KEY:"XLJAW9JDTs83dArJ2",
    SERVICE_ID:"service_iht820n",
    INBOX_TPL:"template_qfn5rgr",
    AUTOREPLY_TPL:"template_p6g412k"
  };
  const form = document.getElementById("contactForm");
  if (form) {
    const emailjsLoaded = typeof window.emailjs !== "undefined";
    if (emailjsLoaded) { try { emailjs.init(EMAIL.PUBLIC_KEY); } catch(_){} }

    form.addEventListener("submit", async (e)=>{
      e.preventDefault();
      const lang = localStorage.getItem("lang") || "fi";
      const t = I18N[lang];

      // collect + validate
      const data = Object.fromEntries(new FormData(form).entries());
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email||"");
      if (!data.name || !validEmail || !data.message) {
        showToast(t.form_required, "error");
        return;
      }
      if (!emailjsLoaded) {
        showToast(t.form_emailjs_missing, "error");
        return;
      }

      // build payloads for your EmailJS templates
      const inboxPayload = {
        from_name: data.name,
        reply_to: data.email,
        message: data.message,
        pickup: data.pickup || "",
        lang
      };
      const replyPayload = {
        to_name: data.name,
        to_email: data.email,
        reply_to: data.email,
        pickup: data.pickup || "",
        lang,
        reply_text: buildAutoReplyText(lang, inboxPayload)
      };

      // UI: sending state
      const btn = form.querySelector('button[type="submit"]');
      const prev = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = (lang==="fi"?"Lähetetään…":"Sending…"); }

      try{
        await emailjs.send(EMAIL.SERVICE_ID, EMAIL.INBOX_TPL, inboxPayload);
        await emailjs.send(EMAIL.SERVICE_ID, EMAIL.AUTOREPLY_TPL, replyPayload);
        form.reset();
        showToast(t.form_success, "ok");
      }catch(err){
        console.error(err);
        showToast(t.form_error, "error");
      }finally{
        if (btn){ btn.disabled = false; btn.textContent = prev || (lang==="fi"?"Lähetä":"Send"); }
      }
    });
  }

  function buildAutoReplyText(lang, d){
    if (lang==="en"){
      return `Hi ${d.from_name || ""},

Thanks for contacting Laitilan FixIT! We’ve received your request and will get back to you ASAP.
If you asked for pickup, we’ll confirm the date: ${d.pickup || "-"}

Quick contact via WhatsApp: +358 40 362 3662
Best,
Laitilan FixIT — local tech service in Laitila`;
    }
    return `Hei ${d.from_name || ""},

Kiitos yhteydenotosta Laitilan FixIT:lle! Olemme vastaanottaneet viestisi ja palaamme asiaan pian.
Jos pyysit noutoa, varmistamme päivän: ${d.pickup || "-"}

Nopea yhteys WhatsAppissa: +358 40 362 3662
Terveisin,
Laitilan FixIT — paikallinen IT-huolto Laitilassa`;
  }
});
