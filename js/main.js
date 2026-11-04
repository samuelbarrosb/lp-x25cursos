(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");

  var CFG = window.X25_CONFIG || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* ---------------- Ano no rodapé ---------------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------------- Header ao rolar ---------------- */
  var header = $("[data-header]");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- Reveal on scroll ---------------- */
  var revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        setTimeout(function () { e.target.classList.add("done"); }, 1300);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in", "done"); });
  }

  /* ---------------- Chip de "camadas" no hero ---------------- */
  var layerEl = $("[data-layer]");
  var barEl = $(".hv-bar i");
  if (layerEl && barEl) {
    var layer = 1, total = 240;
    var render = function () {
      layerEl.textContent = String(layer).padStart(3, "0");
      barEl.style.width = (layer / total * 100).toFixed(1) + "%";
    };
    if (reduceMotion) { layer = 128; render(); }
    else {
      render();
      setInterval(function () { layer = layer >= total ? 1 : layer + 1; render(); }, 140);
    }
  }

  /* ---------------- Chaveiro: nome digitado ---------------- */
  var kcText = $("[data-kc-text]");
  if (kcText && !reduceMotion && "IntersectionObserver" in window) {
    var words = ["SEU NOME", "ANA", "LUCAS", "CRIE", "X25"];
    var wi = 0, started = false;
    var typeWord = function () {
      var word = words[wi], i = 0;
      kcText.classList.add("typing");
      kcText.textContent = "";
      var t = setInterval(function () {
        kcText.textContent = word.slice(0, ++i);
        if (i >= word.length) {
          clearInterval(t);
          setTimeout(function () { wi = (wi + 1) % words.length; typeWord(); }, 1800);
        }
      }, 110);
    };
    new IntersectionObserver(function (en, obs) {
      if (en[0].isIntersecting && !started) { started = true; obs.disconnect(); setTimeout(typeWord, 1200); }
    }).observe(kcText);
  }

  /* ---------------- CTAs que levam ao formulário ---------------- */
  var form = $("[data-lead-form]");
  var nameInput = $("#f-nome");
  $$("[data-go-form]").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      var target = $("#inscricao");
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      setTimeout(function () {
        nameInput.focus({ preventScroll: true });
        form.classList.remove("flash"); void form.offsetWidth; form.classList.add("flash");
      }, reduceMotion ? 0 : 650);
      if (history.replaceState) history.replaceState(null, "", "#inscricao");
    });
  });

  /* ---------------- Barra fixa mobile ---------------- */
  var bar = $("[data-mobile-bar]");
  if (bar && "IntersectionObserver" in window) {
    var hidingSections = [$("#topo"), $("#cta")];
    var visible = new Set();
    var barIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? visible.add(e.target) : visible.delete(e.target); });
      var show = visible.size === 0;
      bar.classList.toggle("is-visible", show);
      document.body.classList.toggle("bar-on", show && window.innerWidth <= 640);
    }, { threshold: 0.05 });
    hidingSections.forEach(function (s) { if (s) barIO.observe(s); });
  }

  /* ---------------- Formulário ---------------- */
  if (!form) return;

  var fields = {
    nome: $("#f-nome"),
    whatsapp: $("#f-whatsapp"),
    email: $("#f-email"),
  };
  var statusEl = $("[data-form-status]");
  var submitBtn = $("[data-submit]");
  var touched = {};

  // Máscara de telefone: (61) 99999-9999 / (61) 3244-2510
  function onlyDigits(v) { return (v || "").replace(/\D/g, ""); }
  function maskPhone(v) {
    var d = onlyDigits(v);
    if (d.length > 11 && d.indexOf("55") === 0) d = d.slice(2); // remove DDI colado
    d = d.slice(0, 11);
    if (d.length === 0) return "";
    if (d.length < 3) return "(" + d;
    var ddd = d.slice(0, 2), rest = d.slice(2);
    if (rest.length <= 4) return "(" + ddd + ") " + rest;
    if (d.length <= 10) return "(" + ddd + ") " + rest.slice(0, 4) + "-" + rest.slice(4);
    return "(" + ddd + ") " + rest.slice(0, 5) + "-" + rest.slice(5);
  }
  fields.whatsapp.addEventListener("input", function () {
    var el = fields.whatsapp;
    var atEnd = el.selectionStart === el.value.length;
    el.value = maskPhone(el.value);
    if (atEnd) el.setSelectionRange(el.value.length, el.value.length);
  });

  var validators = {
    nome: function (v) {
      v = v.trim().replace(/\s+/g, " ");
      if (!v) return "Informe seu nome completo.";
      if (v.length < 3) return "Nome muito curto.";
      if (v.split(" ").length < 2) return "Informe nome e sobrenome.";
      if (/[0-9@]/.test(v)) return "Use apenas letras no nome.";
      return "";
    },
    whatsapp: function (v) {
      var d = onlyDigits(v);
      if (!d) return "Informe seu WhatsApp com DDD.";
      if (d.length < 10 || d.length > 11) return "Número incompleto. Use DDD + número.";
      if (/^(\d)\1+$/.test(d)) return "Confira o número informado.";
      if (parseInt(d.slice(0, 2), 10) < 11) return "DDD inválido.";
      if (d.length === 11 && d.charAt(2) !== "9") return "Celular deve começar com 9 após o DDD.";
      return "";
    },
    email: function (v) {
      v = v.trim();
      if (!v) return "Informe seu e-mail.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "E-mail inválido. Ex.: nome@email.com";
      return "";
    },
  };

  function validateField(name, show) {
    var input = fields[name];
    var msg = validators[name](input.value);
    var wrap = input.closest(".field");
    var err = wrap.querySelector(".field-error");
    if (show) {
      wrap.classList.toggle("is-invalid", !!msg);
      wrap.classList.toggle("is-valid", !msg);
      err.textContent = msg;
      input.setAttribute("aria-invalid", msg ? "true" : "false");
    }
    return !msg;
  }

  Object.keys(fields).forEach(function (name) {
    var input = fields[name];
    input.addEventListener("blur", function () {
      if (input.value.trim()) touched[name] = true;
      if (touched[name]) validateField(name, true);
    });
    input.addEventListener("input", function () {
      if (touched[name]) validateField(name, true);
    });
  });

  function utmParams() {
    var out = {};
    try {
      var p = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"].forEach(function (k) {
        if (p.get(k)) out[k] = p.get(k);
      });
    } catch (e) { /* navegador antigo: ignora */ }
    return out;
  }

  function waUrl(data) {
    var msg = "Olá! Quero garantir minha vaga na Oficina de " + (CFG.oficina || "Impressão 3D para Iniciantes") + ".\n\n" +
      "Nome: " + data.nome + "\n" +
      "WhatsApp: " + data.whatsapp + "\n" +
      "E-mail: " + data.email;
    return "https://wa.me/" + (CFG.whatsappNumber || "556132442510") + "?text=" + encodeURIComponent(msg);
  }

  function showStatus(type, html) {
    var icon = type === "ok" ? "i-check" : type === "err" ? "i-alert" : "i-whatsapp";
    statusEl.className = "form-status is-visible " + type;
    statusEl.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#' + icon + '"/></svg><div>' + html + "</div>";
    statusEl.focus({ preventScroll: true });
    if (window.innerWidth < 960) statusEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  function setLoading(on) {
    form.classList.toggle("is-loading", on);
    submitBtn.disabled = on;
    submitBtn.setAttribute("aria-busy", on ? "true" : "false");
    submitBtn.querySelector(".btn-label").textContent = on ? "Enviando..." : "Quero garantir minha vaga";
  }

  function track(event, extra) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: event, oficina: CFG.oficina }, extra || {}));
      if (typeof window.fbq === "function" && event === "lead_inscricao") window.fbq("track", "Lead");
    } catch (e) { /* sem rastreamento configurado */ }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (form.classList.contains("is-loading")) return;

    // Valida tudo e foca no primeiro erro
    var firstInvalid = null;
    Object.keys(fields).forEach(function (name) {
      touched[name] = true;
      if (!validateField(name, true) && !firstInvalid) firstInvalid = fields[name];
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    // Honeypot: bots preenchem o campo oculto
    if ($("#f-site").value) return;

    var data = {
      nome: fields.nome.value.trim().replace(/\s+/g, " "),
      whatsapp: maskPhone(fields.whatsapp.value),
      whatsapp_digitos: "55" + onlyDigits(fields.whatsapp.value),
      email: fields.email.value.trim().toLowerCase(),
      oficina: CFG.oficina || "Impressão 3D para Iniciantes",
      pagina: window.location.href.split("#")[0],
      enviado_em: new Date().toISOString(),
    };
    Object.assign(data, utmParams());

    var endpoint = (CFG.formEndpoint || "").trim();

    // --- Sem endpoint configurado: inscrição segue pelo WhatsApp (envio real, feito pela pessoa) ---
    if (!endpoint) {
      var url = waUrl(data);
      var win = window.open(url, "_blank");
      if (win) { try { win.opener = null; } catch (e) { /* ok */ } }
      showStatus("step",
        "<strong>Falta só um passo, " + escapeHtml(data.nome.split(" ")[0]) + "!</strong>" +
        "Abrimos o WhatsApp da X25 com seus dados já preenchidos. É só tocar em <b>enviar</b> para concluir sua inscrição. " +
        '<a href="' + url + '" target="_blank" rel="noopener">' + (win ? "Abrir o WhatsApp novamente" : "Abrir o WhatsApp") + "</a>");
      track("lead_whatsapp", { canal: "whatsapp" });
      return;
    }

    // --- Com endpoint: envio real via fetch ---
    setLoading(true);
    statusEl.className = "form-status";

    var controller = "AbortController" in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, 15000);

    var isForm = CFG.formEncoding === "form";
    fetch(endpoint, {
      method: "POST",
      headers: isForm ? { "Accept": "application/json" } : { "Content-Type": "application/json", "Accept": "application/json" },
      body: isForm ? new URLSearchParams(data) : JSON.stringify(data),
      signal: controller ? controller.signal : undefined,
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        setLoading(false);
        form.reset();
        $$(".field", form).forEach(function (f) { f.classList.remove("is-valid", "is-invalid"); });
        touched = {};
        showStatus("ok",
          "<strong>Inscrição recebida, " + escapeHtml(data.nome.split(" ")[0]) + "!</strong>" +
          "A equipe da X25 vai falar com você pelo WhatsApp para confirmar sua vaga.");
        track("lead_inscricao", { canal: "formulario" });
      })
      .catch(function (err) {
        setLoading(false);
        var aborted = err && err.name === "AbortError";
        showStatus("err",
          "<strong>" + (aborted ? "A conexão demorou demais." : "Não conseguimos enviar sua inscrição agora.") + "</strong>" +
          'Seus dados continuam aqui. Tente de novo em instantes ou <a href="' + waUrl(data) + '" target="_blank" rel="noopener">conclua pelo WhatsApp</a>.');
        if (window.console) console.error("[X25] Falha no envio do formulário:", err);
      })
      .then(function () { clearTimeout(timer); });
  });

  /* ---------------- Lightbox da galeria ---------------- */
  var lb = $("[data-lightbox]");
  var items = $$("[data-gallery] .g-item");
  if (lb && items.length) {
    var lbImg = $("[data-lb-img]", lb), lbCap = $("[data-lb-cap]", lb);
    var idx = 0, lastFocus = null;
    var show = function (i) {
      idx = (i + items.length) % items.length;
      var it = items[idx];
      lbImg.src = it.getAttribute("data-full");
      lbImg.alt = it.querySelector("img").alt;
      lbCap.textContent = (idx + 1) + " / " + items.length + " · " + it.getAttribute("data-caption");
    };
    var open = function (i) {
      lastFocus = document.activeElement;
      show(i);
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      $("[data-lb-close]", lb).focus();
    };
    var close = function () {
      lb.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };
    items.forEach(function (it, i) { it.addEventListener("click", function () { open(i); }); });
    $("[data-lb-close]", lb).addEventListener("click", close);
    $("[data-lb-prev]", lb).addEventListener("click", function () { show(idx - 1); });
    $("[data-lb-next]", lb).addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(idx - 1);
      else if (e.key === "ArrowRight") show(idx + 1);
      else if (e.key === "Tab") {
        var f = $$("button", lb), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // swipe no mobile
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }
})();
