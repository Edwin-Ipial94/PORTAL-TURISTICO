    const cardsEl = document.getElementById("cards");
    const routeGrid = document.getElementById("routeGrid");
    const emptyEl = document.getElementById("empty");
    const q = document.getElementById("q");
    const sParroquia = document.getElementById("sParroquia");
    const sCategoria = document.getElementById("sCategoria");
    const sJerarquia = document.getElementById("sJerarquia");
    const kpiTotalBtn = document.getElementById("kpiTotalBtn");
    const kpiCultBtn = document.getElementById("kpiCultBtn");
    const kpiNatBtn = document.getElementById("kpiNatBtn");
    const routeParroquia = document.getElementById("routeParroquia");
    const routeSearch = document.getElementById("routeSearch");

    const miniModal = document.getElementById("miniModal");
    const miniModalTitle = document.getElementById("miniModalTitle");
    const miniModalBody = document.getElementById("miniModalBody");
    const miniModalClose = document.getElementById("miniModalClose");

    const viewer = document.getElementById("viewer");
    const viewerTitle = document.getElementById("viewerTitle");
    const pdfFrame = document.getElementById("pdfFrame");
    const openNew = document.getElementById("openNew");
    const downloadPdf = document.getElementById("downloadPdf");
    const closeViewer = document.getElementById("closeViewer");
    const routeModal = document.getElementById("routeModal");
    const routeModalTitle = document.getElementById("routeModalTitle");
    const routeModalBody = document.getElementById("routeModalBody");
    const routeModalClose = document.getElementById("routeModalClose");
    const detailsModal = document.getElementById("detailsModal");
    const detailsModalTitle = document.getElementById("detailsModalTitle");
    const detailsModalBody = document.getElementById("detailsModalBody");
    const detailsModalClose = document.getElementById("detailsModalClose");
    const serviceModal = document.getElementById("serviceModal");
    const serviceModalTitle = document.getElementById("serviceModalTitle");
    const serviceModalBody = document.getElementById("serviceModalBody");
    const serviceModalClose = document.getElementById("serviceModalClose");
    const serviceItemModal = document.getElementById("serviceItemModal");
    const serviceItemTitle = document.getElementById("serviceItemTitle");
    const serviceItemBody = document.getElementById("serviceItemBody");
    const serviceItemClose = document.getElementById("serviceItemClose");

    const topStrip = document.getElementById("topStrip");
    const brandTxt = document.getElementById("brandTxt");
    const heroTitle = document.getElementById("heroTitle");
    const portalInfo = document.getElementById("portalInfo");
    const servicesTitle = document.getElementById("servicesTitle");
    const placesTitle = document.getElementById("placesTitle");
    const placesLead = document.getElementById("placesLead");
    const routesTitle = document.getElementById("routesTitle");
    const servicesHeroTitle = document.getElementById("servicesHeroTitle");
    const servicesQuickNote = document.getElementById("servicesQuickNote");
    const routeHeroKicker = document.getElementById("routeHeroKicker");
    const routeHeroTitle = document.getElementById("routeHeroTitle");
    const routeCount = document.getElementById("routeCount");
    const routeParCount = document.getElementById("routeParCount");
    const menuInicio = document.getElementById("menuInicio");
    const menuServicios = document.getElementById("menuServicios");
    const menuLugares = document.getElementById("menuLugares");
    const menuRutas = document.getElementById("menuRutas");
    const menuAdmin = document.getElementById("menuAdmin");
    const adminNavLink = document.getElementById("adminNavLink");
    const heroBadges = document.getElementById("heroBadges");
    const services = document.getElementById("services");
    const heroTrack = document.getElementById("heroTrack");
    const carPrev = document.getElementById("carPrev");
    const carNext = document.getElementById("carNext");
    const carDots = document.getElementById("carDots");
    const heroCurrentTitle = document.getElementById("heroCurrentTitle");
    const heroCurrentDesc = document.getElementById("heroCurrentDesc");
    const serviceStatsModal = document.getElementById("serviceStatsModal");
    const serviceStatsTitle = document.getElementById("serviceStatsTitle");
    const serviceStatsBody = document.getElementById("serviceStatsBody");
    const serviceStatsClose = document.getElementById("serviceStatsClose");
    let serviceVisitsBtnLabel = "Ver visitas";
    let currentServiceToneClass = "service-tone-default";
    const serviceToneTargets = [serviceModal, serviceStatsModal, serviceItemModal].filter(Boolean);
    const serviceToneClasses = ["service-tone-default", "service-tone-emer", "service-tone-hotel", "service-tone-food", "service-tone-trans"];

    function applyServiceTone(cls) {
      currentServiceToneClass = cls || "service-tone-default";
      serviceToneTargets.forEach((node) => {
        serviceToneClasses.forEach((tone) => node.classList.remove(tone));
        node.classList.add(currentServiceToneClass);
      });
    }

    let DATA = { site: {}, hero_slides: [], places: [] };
    let heroIndex = 0;
    let heroTimer = null;
    const cardAutoTimers = new Map();
    const cardManualPauseUntil = new Map();
    let HERO_INFO = [];
    const VISIT_STORAGE_KEY = "portal_tulcan_visit_counts";
    let visitCounts = loadVisitCounts();
    const SERVICE_VISIT_STORAGE_KEY = "portal_tulcan_service_visit_counts";
    let serviceVisitCounts = loadServiceVisitCounts();

    const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (m) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
    const nl2br = (v) => esc(v || "").replace(/\r?\n/g, "<br>");
    const pathUrl = (p) => encodeURI(p || "");

    function loadVisitCounts() {
      try {
        const raw = localStorage.getItem(VISIT_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch {
        return {};
      }
    }

    function saveVisitCounts() {
      try {
        localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(visitCounts));
      } catch {}
    }

    function loadServiceVisitCounts() {
      try {
        const raw = localStorage.getItem(SERVICE_VISIT_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch {
        return {};
      }
    }

    function saveServiceVisitCounts() {
      try {
        localStorage.setItem(SERVICE_VISIT_STORAGE_KEY, JSON.stringify(serviceVisitCounts));
      } catch {}
    }

    function getVisitCount(id) {
      return Number(visitCounts[String(id)] || 0);
    }

    function bumpVisitCount(id) {
      const key = String(id);
      visitCounts[key] = getVisitCount(key) + 1;
      saveVisitCounts();
      return visitCounts[key];
    }

    function getServiceVisitCount(name) {
      return Number(serviceVisitCounts[normalize(name)] || 0);
    }

    function bumpServiceVisitCount(name) {
      const key = normalize(name);
      if (!key) return 0;
      serviceVisitCounts[key] = getServiceVisitCount(key) + 1;
      saveServiceVisitCounts();
      return serviceVisitCounts[key];
    }

    function popularityLabel(position) {
      if (position === 1) return "Top 1";
      if (position === 2) return "Top 2";
      if (position === 3) return "Top 3";
      return `#${position}`;
    }

    function normalizePayload(payload) {
      const safe = payload && typeof payload === "object" ? payload : {};
      return {
        site: safe.site && typeof safe.site === "object" ? safe.site : {},
        hero_slides: Array.isArray(safe.hero_slides) ? safe.hero_slides : [],
        places: Array.isArray(safe.places) ? safe.places : [],
      };
    }

    async function loadData() {
      try {
        const res = await fetch("/api/content", { cache: "no-store" });
        if (!res.ok) throw new Error("No se pudo cargar el contenido.");
        DATA = normalizePayload(await res.json());
      } catch {
        DATA = { site: {}, hero_slides: [], places: [] };
      }
      renderSite();
      initFilters();
      applyFilters();
      initHeroCarousel();
      updateAdminVisibility();
    }

    async function updateAdminVisibility() {
      if (!adminNavLink) return;
      adminNavLink.style.display = "none";
      try {
        const res = await fetch("/api/admin-session", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.authorized) {
          adminNavLink.style.display = "";
        }
      } catch {}
    }

    function renderSite() {
      const site = DATA.site || {};
      const normalize = (v) => {
        const raw = String(v || "").replace(/\\/g, "/").trim();
        try { return decodeURIComponent(raw).toLowerCase(); }
        catch { return raw.toLowerCase(); }
      };
      const places = DATA.places || [];
      function findPlaceByImage(imgPath) {
        const target = normalize(imgPath);
        if (!target) return null;
        return places.find((p) => (p.images || []).some((im) => normalize(im) === target)) || null;
      }
      document.title = site.page_title || "Turismo Tulcán";
      brandTxt.textContent = site.brand || "Turismo Tulcán";
      heroTitle.textContent = site.hero_title || "Portal turístico";
      const info = site.portal_info || "";
      portalInfo.textContent = info;
      portalInfo.style.display = info ? "block" : "none";
      servicesTitle.textContent = site.services_title || "Servicios turísticos en línea";
      if (servicesHeroTitle) servicesHeroTitle.textContent = site.services_hero_title || "Consulta servicios con una lectura más limpia, moderna y directa";
      if (servicesQuickNote) servicesQuickNote.textContent = site.services_quick_note || "Selecciona una tarjeta inferior para abrir detalles y opciones disponibles.";
      placesTitle.textContent = site.places_title || "Atractivos turísticos destacados";
      placesLead.textContent = site.places_lead || "Filtra por parroquia, categoría y jerarquía para una búsqueda precisa.";
      routesTitle.textContent = site.routes_title || "Rutas sugeridas de acceso";
      if (routeHeroKicker) routeHeroKicker.innerHTML = `<i class="bi bi-map-fill"></i>${esc(site.route_hero_kicker || "Guía de acceso")}`;
      if (routeHeroTitle) routeHeroTitle.textContent = site.route_hero_title || "Explora rutas con una lectura clara y profesional";
      if (menuInicio) menuInicio.textContent = site.menu_inicio || "Inicio";
      if (menuServicios) menuServicios.textContent = site.menu_servicios || "Servicios";
      if (menuLugares) menuLugares.textContent = site.menu_lugares || "Atractivos";
      if (menuRutas) menuRutas.textContent = site.menu_rutas || "Rutas";
      if (menuAdmin) menuAdmin.textContent = site.menu_admin || "Admin";
      const servicesModalTitleText = site.services_modal_title || "Consulta el detalle de cada servicio";
      const servicesModalButtonText = site.services_modal_button || "Ver visitas";
      serviceVisitsBtnLabel = servicesModalButtonText;

      topStrip.innerHTML = (site.top_strip || []).map(t => `<span class="item"><i class="bi bi-circle-fill"></i>${esc(t)}</span>`).join("");
      heroBadges.innerHTML = (site.badges || []).map(b => `<span class="badge">${esc(b)}</span>`).join("");
      const servicesData = (site.services || []).filter((svc) => {
        const title = String(svc?.title || "").toLowerCase();
        return !(svc?.mode === "mapa" || title.includes("mapa"));
      });
      const serviceActionMeta = (svc) => {
        const title = String(svc.title || "").toLowerCase();
        if (title.includes("emergen")) {
          return { label: "Ver números", icon: "bi-telephone-fill", cls: "emer" };
        }
        if (title.includes("transporte")) {
          return { label: "Ver rutas", icon: "bi-sign-turn-right-fill", cls: "trans" };
        }
        if (title.includes("aloj")) {
          return { label: "Ver alojamientos", icon: "bi-building-fill-check", cls: "hotel" };
        }
        if (title.includes("gastr")) {
          return { label: "Ver opciones", icon: "bi-cup-hot-fill", cls: "food" };
        }
        return { label: "Ver detalle", icon: "bi-file-earmark-text-fill", cls: "" };
      };
      const openServiceDetails = (svc) => {
        if (!svc) return;
        const serviceName = svc.title || "Servicio";
        serviceModalTitle.textContent = serviceName;
        const serviceTitleKey = String(svc.title || "").toLowerCase();
        const isFoodService = serviceTitleKey.includes("gastr");
        const isImagePath = (value) => /\.(avif|webp|png|jpe?g|gif|bmp|svg)$/i.test(String(value || "")) || String(value || "").startsWith("uploads/");
        const parseItem = (text) => {
          const raw = String(text || "");
          const parts = raw.split("|").map((s) => s.trim());
          if (parts.length >= 3) {
            const extra = parts.slice(2).join(" | ");
            return { title: parts[0], detail: parts[1], phone: isFoodService || isImagePath(extra) ? "" : extra, image: isFoodService || isImagePath(extra) ? extra : "" };
          }
          if (parts.length === 2) {
            const second = parts[1];
            return { title: parts[0], detail: isImagePath(second) ? "" : second, phone: "", image: isImagePath(second) ? second : "" };
          }
          const dash = raw.split(" - ");
          if (dash.length >= 3) {
            const extra = dash.slice(2).join(" - ");
            return { title: dash[0], detail: dash[1], phone: isFoodService || isImagePath(extra) ? "" : extra, image: isFoodService || isImagePath(extra) ? extra : "" };
          }
          if (dash.length === 2) {
            const second = dash[1];
            return { title: dash[0], detail: isImagePath(second) ? "" : second, phone: "", image: isImagePath(second) ? second : "" };
          }
          return { title: raw, detail: "", phone: "", image: "" };
        };
        const itemsParsed = (svc.items || []).map(parseItem).filter((it) => it.title);
        const iconForItem = (title) => {
          const t = (title || "").toLowerCase();
          if (t.includes("polic")) return "bi-shield-lock-fill";
          if (t.includes("bomber")) return "bi-fire";
          if (t.includes("cruz") || t.includes("salud") || t.includes("hospital") || t.includes("emergen")) return "bi-hospital-fill";
          if (t.includes("taxi")) return "bi-taxi-front-fill";
          if (t.includes("bus") || t.includes("terminal")) return "bi-bus-front-fill";
          if (t.includes("hotel") || t.includes("hostal") || t.includes("hoster")) return "bi-building-fill-check";
          if (t.includes("restaurante") || t.includes("comedor") || t.includes("gastr") || t.includes("cafe")) return "bi-egg-fried";
          return "bi-info-circle-fill";
        };
        const classForItem = (title) => {
          const t = (title || "").toLowerCase();
          if (t.includes("polic") || t.includes("bomber") || t.includes("cruz") || t.includes("emergen")) return "emer";
          if (t.includes("hotel") || t.includes("hostal") || t.includes("hoster")) return "hotel";
          if (t.includes("restaurante") || t.includes("gastr") || t.includes("cafe") || t.includes("comedor")) return "food";
          return "";
        };
        const mainText = svc.details || svc.text || "Consulta la información principal del servicio desde una ficha clara y elegante.";
        const serviceTone = (() => {
          const title = String(svc.title || "").toLowerCase();
          if (title.includes("emergen")) return { cls: "service-tone-emer", label: "Emergencias" };
          if (title.includes("transporte")) return { cls: "service-tone-trans", label: "Transporte" };
          if (title.includes("aloj")) return { cls: "service-tone-hotel", label: "Alojamiento" };
          if (title.includes("gastr")) return { cls: "service-tone-food", label: "Gastronomía" };
          return { cls: "service-tone-default", label: "Servicios" };
        })();
        applyServiceTone(serviceTone.cls);
        const modalHeroTitle = svc.modal_title || servicesModalTitleText || svc.title || "Servicio";
        serviceModalBody.innerHTML = `
          <div class="service-detail-shell ${serviceTone.cls}">
            <div class="service-modal-hero">
              <div class="service-modal-copy">
                <h4>${esc(modalHeroTitle)}</h4>
                <p>${esc(mainText)}</p>
                <div class="service-detail-summary">
                  <span class="service-summary-chip"><i class="bi bi-lightning-charge-fill"></i>${esc(serviceTone.label)}</span>
                  ${svc.hours ? `<span class="service-summary-chip"><i class="bi bi-clock-fill"></i>${esc(String(svc.hours).slice(0, 22))}</span>` : ""}
                </div>
              </div>
            </div>
            <div class="service-detail-grid">
              ${svc.address ? `<div class="service-detail-card is-half"><b>Ubicación</b><p>${esc(svc.address)}</p></div>` : ""}
              ${svc.phone ? `<div class="service-detail-card is-half"><b>Contacto</b><p>${esc(svc.phone)}</p></div>` : ""}
              ${svc.hours ? `<div class="service-detail-card is-third"><b>Horario</b><p>${esc(svc.hours)}</p></div>` : ""}
              ${svc.web ? `<div class="service-detail-card is-third"><b>Web/Redes</b><p>${esc(svc.web)}</p></div>` : ""}
            </div>
            ${itemsParsed.length ? `
              <div class="service-detail-card">
                <b>${isFoodService ? "Platos típicos" : "Lista de servicios"}</b>
                <ul class="service-list ${isFoodService ? "food-gallery" : ""}">
                  ${itemsParsed.map((it, idx) => `
                    <li data-svc-item="${idx}" class="${classForItem(it.title)}">
                      ${isFoodService ? `
                        <div class="food-card-media">
                          ${it.image ? `<img src="${pathUrl(it.image)}" alt="${esc(it.title)}">` : `<div class="food-card-placeholder"><i class="bi bi-image-fill"></i></div>`}
                        </div>` : ""}
                      <div class="service-list-main">
                        <i class="bi ${iconForItem(it.title)}"></i>
                        <div class="service-list-copy">
                          <span class="service-list-title">${esc(it.title)}</span>
                          <div class="service-list-meta">
                            ${it.detail ? `<span class="service-list-chip"><i class="bi bi-chat-left-text-fill"></i>${esc(it.detail)}</span>` : ""}
                            ${it.phone ? `<span class="service-list-chip is-phone"><i class="bi bi-telephone-fill"></i>${esc(it.phone)}</span>` : ""}
                          </div>
                        </div>
                      </div>
                      <span class="service-item-badge">${isFoodService ? "Ver plato" : (it.phone ? "Ver contacto" : (it.detail ? "Ver detalle" : "Más info"))}</span>
                    </li>`).join("")}
                </ul>
              </div>` : ""}
          </div>
        `;
        serviceModal.classList.add("open");
        serviceModal.setAttribute("aria-hidden", "false");
        serviceModalBody.querySelectorAll("[data-svc-item]").forEach((btn) => {
          const idx = Number(btn.getAttribute("data-svc-item"));
          const info = itemsParsed[idx];
          if (!info) return;
          btn.addEventListener("click", () => {
            serviceItemTitle.textContent = info.title || "Detalle";
            serviceItemBody.innerHTML = `
              <div class="service-detail-card">
                <b>Información</b>
                <p>${esc(info.detail || "Sin detalle adicional.")}</p>
              </div>
              ${info.image ? `<div class="service-detail-card"><b>Imagen</b><img class="service-item-photo" src="${pathUrl(info.image)}" alt="${esc(info.title)}"></div>` : ""}
              ${info.phone ? `<div class="service-detail-card"><b>Teléfono</b><p>${esc(info.phone)}</p></div>` : ""}
            `;
            serviceItemModal.classList.add("open");
            serviceItemModal.setAttribute("aria-hidden", "false");
          });
        });
      };
      services.innerHTML = servicesData.map((s, i) => {
        const actionMeta = serviceActionMeta(s);
        const action = `<button class="service-action ${esc(actionMeta.cls)}" type="button" data-svc-open="${i}"><i class="bi ${esc(actionMeta.icon)}"></i>${esc(actionMeta.label)}</button>`;
        return `
        <article class="service" data-svc="${i}">
          <div class="service-head">
            <span class="service-icon"><i class="bi ${esc(s.icon || "bi-grid")}"></i></span>
            <span class="service-title">${esc(s.title || "Servicio")}</span>
          </div>
          <div class="service-body">
            <span class="service-text">${esc(s.text || "")}</span>
            ${action}
          </div>
        </article>`; 
      }).join("");
      services.querySelectorAll("[data-svc-open]").forEach((el) => {
        const idx = Number(el.getAttribute("data-svc-open"));
        const svc = servicesData[idx];
        if (!svc) return;
        el.addEventListener("click", (e) => {
          e.preventDefault();
          openServiceDetails(svc);
        });
      });

      const slides = DATA.hero_slides || [];
      HERO_INFO = slides.map((s, i) => {
        const linkedByIndex = Number.isInteger(Number(s.place_index)) && places[Number(s.place_index)]
          ? places[Number(s.place_index)]
          : null;
        const linkedByName = s.place_name
          ? places.find((p) => normalize(p.nombre) === normalize(s.place_name))
          : null;
        const place = linkedByIndex || linkedByName || findPlaceByImage(s.image) || places[i] || null;
        const placeName = (s.place_name || s.title || (place && place.nombre) || site.hero_title || "Portal turístico de Tulcán");
        const placeDesc = (s.caption || (place && (place.resena || place.recomendaciones || place.ruta)) || "Descubre atractivos, rutas y cultura local del cantón Tulcán.");
        return { title: placeName, desc: placeDesc };
      });
      heroTrack.innerHTML = slides.map((s, i) => `
        <figure class="hero-slide ${i === 0 ? "active" : ""}">
          <img src="${pathUrl(s.image)}" alt="slide">
        </figure>
      `).join("");
      updateHeroInfo();
    }

    function updateHeroInfo() {
      const current = HERO_INFO[heroIndex] || {};
      heroCurrentTitle.textContent = current.title || "Atractivo destacado";
      heroCurrentDesc.textContent = current.desc || "Descripción del lugar turístico seleccionado.";
    }

    function metric(id, value) { document.getElementById(id).textContent = value; }

    function fillSelect(el, values, label) {
      el.innerHTML = `<option value="">${label}</option>`;
      values.forEach(v => {
        const op = document.createElement("option");
        op.value = v;
        op.textContent = v;
        el.appendChild(op);
      });
    }

    function initFilters() {
      const places = DATA.places || [];
      metric("mTotal", places.length);
      metric("mCult", places.filter(x => x.categoria === "MANIFESTACIONES CULTURALES").length);
      metric("mNat", places.filter(x => x.categoria === "ATRACTIVOS NATURALES").length);
      if (routeCount) routeCount.textContent = String(places.length);
      if (routeParCount) routeParCount.textContent = String(new Set(places.map(x => x.parroquia).filter(Boolean)).size);
      fillSelect(sParroquia, [...new Set(places.map(x => x.parroquia).filter(Boolean))].sort(), "Todas las parroquias");
      fillSelect(sCategoria, [...new Set(places.map(x => x.categoria).filter(Boolean))].sort(), "Todas las categorías");
      fillSelect(sJerarquia, [...new Set(places.map(x => x.jerarquia).filter(Boolean))].sort(), "Todas las jerarquías");
      if (routeParroquia) {
        fillSelect(routeParroquia, [...new Set(places.map(x => x.parroquia).filter(Boolean))].sort(), "Todas las parroquias");
      }
    }

    function mapLink(item) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((item.nombre || "") + ", Tulcan, Carchi")}`; }
    function routeLink(item) { return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((item.nombre || "") + ", Tulcan, Carchi")}`; }

    function cardImages(item) {
      const imgs = item.images && item.images.length ? item.images : (DATA.hero_slides[0] ? [DATA.hero_slides[0].image] : []);
      if (!imgs.length) {
        return `<div class="card-carousel"></div>`;
      }
      return `
        <div class="card-carousel" data-card="${esc(item.num_atr)}">
          ${imgs.map((src, i) => `<div class="card-slide ${i===0?"active":""}"><img src="${pathUrl(src)}" alt="foto"></div>`).join("")}
          ${imgs.length > 1 ? `<div class="card-car-ctl"><button class="mini-btn" data-card-prev="${esc(item.num_atr)}"><i class="bi bi-chevron-left"></i></button><button class="mini-btn" data-card-next="${esc(item.num_atr)}"><i class="bi bi-chevron-right"></i></button></div>` : ""}
        </div>`;
    }

    function cardTpl(item, position = null) {
      const visits = getVisitCount(item.num_atr);
      const category = String(item.categoria || "").toUpperCase();
      const toneClass = category === "ATRACTIVOS NATURALES"
        ? "card-tone-natural"
        : (category === "MANIFESTACIONES CULTURALES" ? "card-tone-cultural" : "card-tone-other");
      const isTop = position !== null && position <= 3;
      return `
        <article class="card ${toneClass}${isTop ? " is-top" : ""}">
          <div class="card-head">
            <div class="card-title-wrap">
              <h3 class="card-title">${esc(item.nombre)}</h3>
              <p class="card-subtitle">${esc(item.categoria)} | ${esc(item.tipo)}</p>
            </div>
            <div class="head-tags">
              <span class="pill rank"><i class="bi bi-stars"></i>${position !== null ? popularityLabel(position) : "Ranking"}</span>
              <span class="pill visits"><i class="bi bi-eye-fill"></i>${visits} visitas</span>
              <span class="pill"><i class="bi bi-award-fill"></i>Jerarquía ${esc(item.jerarquia)}</span>
              <span class="pill code">#${esc(item.num_atr)}</span>
            </div>
          </div>
          <div class="media-card">
            ${cardImages(item)}
          </div>
          <div class="card-body">
            <div class="info-card">
              <div class="meta">
                <div class="meta-row">
                  <i class="bi bi-geo-alt-fill"></i>
                  <strong>Parroquia</strong>
                  <span>${esc(item.parroquia)}</span>
                </div>
                <div class="meta-row">
                  <i class="bi bi-grid-3x3-gap-fill"></i>
                  <strong>Categoría</strong>
                  <span>${esc(item.categoria)}</span>
                </div>
                <div class="meta-row">
                  <i class="bi bi-bank"></i>
                  <strong>Tipo</strong>
                  <span>${esc(item.tipo)}</span>
                </div>
                <div class="meta-row">
                  <i class="bi bi-search"></i>
                  <strong>Subtipo</strong>
                  <span>${esc(item.subtipo)}</span>
                </div>
                <div class="meta-row">
                  <i class="bi bi-check-circle-fill"></i>
                  <strong>Estado</strong>
                  <span>${esc(item.estado)}</span>
                </div>
              </div>
            </div>
            <div class="details-wrap">
              <button class="btn btn-main" type="button" data-toggle="${esc(item.num_atr)}"><i class="bi bi-chevron-down"></i>Ver más detalles</button>
              <div id="details-${esc(item.num_atr)}" class="more-details">
                <div class="access"><strong><i class="bi bi-signpost"></i> Ruta de acceso:</strong> ${esc(item.ruta)}</div>
                <div class="actions">
                  <a class="btn btn-map" href="${mapLink(item)}" target="_blank" rel="noopener"><i class="bi bi-map-fill"></i>Mapa</a>
                  <a class="btn btn-soft" href="${routeLink(item)}" target="_blank" rel="noopener"><i class="bi bi-sign-turn-right-fill"></i>Cómo llegar</a>
                  <button class="btn btn-main" type="button" data-detail="${esc(item.num_atr)}"><i class="bi bi-card-text"></i>Mini ficha</button>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    }

    function routeTpl(item, idx) {
      const distancia = item.distancia || "";
      const tiempoAuto = item.tiempo_auto || "";
      const coords = item.coordenadas || "";
      const visits = getVisitCount(item.num_atr);
      const colorClass = idx % 3 === 0 ? "green" : (idx % 3 === 1 ? "yellow" : "red");
      item._routeColor = colorClass;
      return `
        <article class="route-item ${colorClass}" data-route="${esc(item.num_atr)}">
          <div class="route-head">
            <span class="route-icon"><i class="bi bi-signpost-2-fill"></i></span>
            <div class="route-title-wrap">
              <span class="route-head-chip"><i class="bi bi-signpost-2-fill"></i>Ruta ${String(idx + 1).padStart(2, "0")}</span>
              <h4>${esc(item.nombre)}</h4>
              <p class="route-subtitle">${esc(item.parroquia || "Sin parroquia")} · ${visits} visitas</p>
            </div>
          </div>
          <div class="route-meta">
            <div class="route-row"><b>Parroquia</b><span><i class="bi bi-geo-alt-fill"></i> ${esc(item.parroquia || "No disponible")}</span></div>
            <div class="route-row"><b>Distancia</b><span><i class="bi bi-signpost-2-fill"></i> ${esc(distancia || "No disponible")}</span></div>
            <div class="route-row"><b>Tiempo</b><span><i class="bi bi-clock-fill"></i> ${esc(tiempoAuto || "No disponible")}</span></div>
            <div class="route-row"><b>Coordenadas</b><span><i class="bi bi-compass-fill"></i> ${esc(coords || "No disponible")}</span></div>
          </div>
          <div class="route-actions single">
            <button class="route-btn more" type="button" data-route-toggle="${esc(item.num_atr)}"><i class="bi bi-plus-lg"></i>Detalle</button>
          </div>
        </article>
      `;
    }

    function renderRoutes(list) {
      routeGrid.innerHTML = list.map((it, i) => routeTpl(it, i)).join("");
      routeGrid.querySelectorAll("[data-route-toggle]").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.routeToggle;
          const item = (DATA.places || []).find(x => String(x.num_atr) === String(id));
          if (!item) return;
          openRouteModal(item);
        });
      });
    }

    function drawMiniCard(item, focusPdf = false) {
      miniModalTitle.textContent = `${item.nombre || ""} | #${item.num_atr || ""}`;
      const miniCard = miniModal.querySelector(".details-card");
      const category = String(item.categoria || "").toUpperCase();
      const toneClass = category === "ATRACTIVOS NATURALES"
        ? "mini-tone-natural"
        : (category === "MANIFESTACIONES CULTURALES" ? "mini-tone-cultural" : "mini-tone-other");
      if (miniCard) {
        miniCard.classList.remove("mini-tone-natural", "mini-tone-cultural", "mini-tone-other");
        miniCard.classList.add(toneClass);
      }
      const fallbackHero = (DATA.hero_slides && DATA.hero_slides[0]) ? [DATA.hero_slides[0].image] : [];
      const fotos = (item.images && item.images.length ? item.images
        : (item.mini_foto ? [item.mini_foto] : fallbackHero));
        miniModalBody.innerHTML = `
          <div class="mini-hero">
            <div class="mini-carousel-wrap">
              ${fotos.length ? `
               <div class="mini-carousel" data-mini="${esc(item.num_atr)}" style="height:260px;">
                ${fotos.map((src,i)=>`<div class="mini-slide ${i===0?"active":""}"><img src="${pathUrl(src)}" alt="foto"></div>`).join("")}
                ${fotos.length>1 ? `<div class="mini-controls">
                  <button class="mini-ctl" data-mini-prev="${esc(item.num_atr)}"><i class="bi bi-chevron-left"></i></button>
                  <button class="mini-ctl" data-mini-next="${esc(item.num_atr)}"><i class="bi bi-chevron-right"></i></button>
                </div>` : ""}
              </div>
            ` : `
              <div class="mini-carousel" style="height:220px; display:grid; place-items:center; color:#5b695f;">
                No hay fotos registradas.
              </div>
            `}
          </div>
            <div class="mini-summary">
              <div class="mini-summary-top">
              <span class="mini-summary-kicker"><i class="bi bi-geo-alt-fill"></i>${esc(item.categoria || "Atractivo turístico")}</span>
              <h4 class="mini-summary-title">${esc(item.nombre || "Mini ficha turística")}</h4>
              <p class="mini-summary-subtitle">${esc(item.tipo || "Datos principales")}${item.parroquia ? ` · ${esc(item.parroquia)}` : ""}</p>
              </div>
              <div class="mini-summary-grid">
                <div class="mini-summary-card">
                  <b>Parroquia</b>
                  <span>${esc(item.parroquia || "No registrada")}</span>
                </div>
                <div class="mini-summary-card">
                  <b>Nivel</b>
                  <span>${esc(item.jerarquia || "No registrada")}</span>
                </div>
                <div class="mini-summary-card">
                  <b>Tiempo</b>
                  <span>${esc(item.duracion || "No registrada")}</span>
                </div>
                <div class="mini-summary-card">
                  <b>Archivo</b>
                  <span>${item.pdf ? "PDF" : "No"}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mini-topbar">
            <div class="mini-topbar-text">
              <span class="mini-topbar-kicker"><i class="bi bi-file-earmark-richtext-fill"></i>Resumen</span>
              <b>Ficha breve</b>
              <span>Datos clave, recomendaciones y PDF.</span>
            </div>
            <button class="btn btn-pdf" type="button" id="miniOpenPdf"><i class="bi bi-file-earmark-pdf-fill"></i>${item.pdf ? "Ver PDF" : "PDF no disponible"}</button>
          </div>
          <div class="mini-sections" data-mini-sec="${esc(item.num_atr)}">
            <div class="mini-sec active">
              <div class="mini-sec-title"><i class="bi bi-info-circle-fill"></i>Información general</div>
              <div class="route-modal-grid">
                <div class="route-modal-chip"><b><i class="bi bi-geo-alt-fill"></i>Ubicación</b>${esc(item.provincia)} - ${esc(item.canton)} - ${esc(item.parroquia)}</div>
                <div class="route-modal-chip"><b><i class="bi bi-clock-fill"></i>Horarios</b><span class="route-chip-text">${nl2br(item.horario)}</span></div>
                <div class="route-modal-chip"><b><i class="bi bi-cash-coin"></i>Costos</b><span class="route-chip-text">${nl2br(item.costo)}</span></div>
                <div class="route-modal-chip"><b><i class="bi bi-hourglass-split"></i>Tiempo sugerido</b>${esc(item.duracion)}</div>
                <div class="route-modal-chip"><b><i class="bi bi-stars"></i>Servicios</b>${esc(item.servicios)}</div>
              </div>
              <div class="route-modal-route">
                <b>Ruta</b>
                <p>${esc(item.ruta)}</p>
              </div>
            </div>
            <div class="mini-sec">
              <div class="mini-sec-title"><i class="bi bi-bookmark-star-fill"></i>Recomendaciones y referencia</div>
              <div class="route-modal-route">
                <b>Recomendaciones</b>
                <p>${esc(item.recomendaciones)}</p>
              </div>
              <div class="route-modal-route">
                <b>Reseña / Referencias</b>
                <p>${esc(item.resena || "No registrada")}</p>
                <div class="mini-meta-inline">
                  <div class="mini-meta-row">
                    <strong>Ubicación exacta</strong>
                    <span>${esc(item.ubicacion_ref || "No registrada")}</span>
                  </div>
                  <div class="mini-meta-row">
                    <strong>Mejor hora</strong>
                    <span>${esc(item.mejor_visita || "No registrada")}</span>
                  </div>
                  <div class="mini-meta-row">
                    <strong>Contacto</strong>
                    <span>${esc(item.contacto || "No registrado")}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="mini-sec-controls">
              <button class="mini-sec-ctl" data-mini-sec-prev="${esc(item.num_atr)}"><i class="bi bi-chevron-left"></i></button>
              <button class="mini-sec-ctl" data-mini-sec-next="${esc(item.num_atr)}"><i class="bi bi-chevron-right"></i></button>
            </div>
            <div class="mini-sec-dots">
              <button class="mini-sec-dot active" type="button" data-mini-sec-dot="0"></button>
              <button class="mini-sec-dot" type="button" data-mini-sec-dot="1"></button>
            </div>
          </div>
        `;
      const openBtn = document.getElementById("miniOpenPdf");
      if (openBtn) {
        openBtn.disabled = !item.pdf;
        if (!item.pdf) openBtn.style.opacity = ".65";
        openBtn.addEventListener("click", () => {
          if (!item.pdf) return;
          openPdf(item);
        });
      }
      const prevBtn = miniModalBody.querySelector("[data-mini-prev]");
      const nextBtn = miniModalBody.querySelector("[data-mini-next]");
      const moveMini = (dir) => {
        const box = miniModalBody.querySelector(".mini-carousel");
        if (!box) return;
        const slides = [...box.querySelectorAll(".mini-slide")];
        const current = slides.findIndex(s => s.classList.contains("active"));
        if (current < 0) return;
        let next = current + dir;
        if (next < 0) next = slides.length - 1;
        if (next >= slides.length) next = 0;
        slides[current].classList.remove("active");
        slides[next].classList.add("active");
      };
      if (prevBtn) prevBtn.addEventListener("click", () => moveMini(-1));
      if (nextBtn) nextBtn.addEventListener("click", () => moveMini(1));

      const secPrev = miniModalBody.querySelector("[data-mini-sec-prev]");
      const secNext = miniModalBody.querySelector("[data-mini-sec-next]");
      const secDots = [...miniModalBody.querySelectorAll(".mini-sec-dot")];
      const slides = [...miniModalBody.querySelectorAll(".mini-sec")];
      const setSec = (next) => {
        slides.forEach((s,i)=>s.classList.toggle("active", i===next));
        secDots.forEach((d,i)=>d.classList.toggle("active", i===next));
      };
      const moveSec = (dir) => {
        const box = miniModalBody.querySelector(".mini-sections");
        if (!box) return;
        const current = slides.findIndex(s => s.classList.contains("active"));
        if (current < 0) return;
        let next = current + dir;
        if (next < 0) next = slides.length - 1;
        if (next >= slides.length) next = 0;
        setSec(next);
      };
      if (secPrev) secPrev.addEventListener("click", () => moveSec(-1));
      if (secNext) secNext.addEventListener("click", () => moveSec(1));
      secDots.forEach((d)=>d.addEventListener("click",()=>{
        const next = parseInt(d.dataset.miniSecDot || "0", 10);
        setSec(next);
      }));

      // Asegura que se muestre siempre la primera seccion al abrir
      setSec(0);
      // Auto-slide si hay varias fotos
      if (fotos.length > 1) {
        const timer = setInterval(() => {
          if (!miniModal.classList.contains("open")) { clearInterval(timer); return; }
          moveMini(1);
        }, 3500);
      }
      miniModal.classList.add("open");
      miniModal.setAttribute("aria-hidden", "false");
      if (focusPdf) {
        const pdfBtn = document.getElementById("miniOpenPdf");
        if (pdfBtn) pdfBtn.focus();
      }
    }

    function openPdf(item) {
      viewerTitle.textContent = `${item.nombre || ""} | Ficha #${item.num_atr || ""}`;
      pdfFrame.src = pathUrl(item.pdf || "");
      openNew.href = pathUrl(item.pdf || "");
      downloadPdf.href = pathUrl(item.pdf || "");
      viewer.classList.add("open");
    }

    function closePdf() {
      viewer.classList.remove("open");
      pdfFrame.src = "about:blank";
    }

    function openRouteModal(item) {
      bumpVisitCount(item.num_atr);
      routeModalTitle.textContent = item.nombre || "Detalle de ruta";
      const modalCard = routeModal.querySelector(".route-modal-card");
      if (modalCard) {
        modalCard.classList.remove("green", "yellow", "red");
        modalCard.classList.add(item._routeColor || "green");
      }
      const icon = routeModal.querySelector(".route-modal-icon");
      if (icon) {
        icon.style.background =
          item._routeColor === "yellow" ? "#58b9c9" :
          item._routeColor === "red" ? "#d9a54b" :
          "#d15d7a";
      }
      const colorClass = item._routeColor || "green";
      const visits = getVisitCount(item.num_atr);
      routeModalBody.innerHTML = `
        <div class="route-modal-grid">
          <div class="route-modal-chip ${colorClass}"><b>Parroquia</b>${esc(item.parroquia || "No disponible")}</div>
          <div class="route-modal-chip ${colorClass}"><b>Distancia</b>${esc(item.distancia || "No disponible")}</div>
          <div class="route-modal-chip ${colorClass}"><b>Tiempo en auto</b>${esc(item.tiempo_auto || "No disponible")}</div>
          <div class="route-modal-chip ${colorClass}"><b>Coordenadas</b>${esc(item.coordenadas || "No disponible")}</div>
          <div class="route-modal-chip ${colorClass}"><b>Visitas</b>${visits}</div>
        </div>
        <div class="route-modal-route">
          <b>Ruta</b>
          <p>${esc(item.ruta || "No registrada")}</p>
        </div>
        <div class="route-actions center">
          <a class="route-btn go" href="${routeLink(item)}" target="_blank" rel="noopener"><i class="bi bi-sign-turn-right-fill"></i>Cómo llegar</a>
        </div>
      `;
      routeModal.classList.add("open");
      routeModal.setAttribute("aria-hidden", "false");
    }

    function closeRouteModal() {
      if (!routeModal.classList.contains("open")) return;
      routeModal.classList.add("closing");
      setTimeout(() => {
        routeModal.classList.remove("open", "closing");
        routeModal.setAttribute("aria-hidden", "true");
      }, 180);
    }

    function openDetailsModal(item) {
      detailsModalTitle.textContent = item.nombre || "Detalle del atractivo";
      const localNormalize = (v) => String(v || "").toLowerCase().trim();
      const itemNameNorm = localNormalize(item?.nombre || "");
      const itemNum = String(item?.num_atr || "");
      const placeIndex = (DATA.places || []).findIndex((p) => String(p.num_atr || "") === itemNum);
      const matchingSlide = (DATA.hero_slides || []).find((s) => {
        const byIndex = Number.isInteger(Number(s.place_index)) && Number(s.place_index) === placeIndex;
        const byName = itemNameNorm && localNormalize(s.place_name || s.title || "") === itemNameNorm;
        const byImage = Array.isArray(item.images) && item.images.length
          ? item.images.some((img) => String(img || "") === String(s.image || ""))
          : false;
        return byIndex || byName || byImage;
      });
      const placeDescription = matchingSlide?.caption || item.resena || item.recomendaciones || item.ruta || "No registrada";
      detailsModalBody.innerHTML = `
        <div class="details-route">
          <p>${esc(placeDescription)}</p>
        </div>
        <div class="details-actions">
          <a class="btn btn-map" href="${mapLink(item)}" target="_blank" rel="noopener"><i class="bi bi-map-fill"></i>Mapa</a>
          <a class="btn btn-soft" href="${routeLink(item)}" target="_blank" rel="noopener"><i class="bi bi-sign-turn-right-fill"></i>Cómo llegar</a>
          <button class="btn btn-main" type="button" data-detail="${esc(item.num_atr)}"><i class="bi bi-card-text"></i>Más información</button>
        </div>
      `;
      detailsModal.classList.add("open");
      detailsModal.setAttribute("aria-hidden", "false");
      const miniBtn = detailsModalBody.querySelector("[data-detail]");
      if (miniBtn) {
        miniBtn.addEventListener("click", () => {
          detailsModal.classList.remove("open");
          detailsModal.setAttribute("aria-hidden", "true");
          bumpVisitCount(item.num_atr);
          drawMiniCard(item);
          applyFilters();
        });
      }
    }

    function closeDetailsModal() {
      detailsModal.classList.remove("open");
      detailsModal.setAttribute("aria-hidden", "true");
    }

    function moveCardSlide(cardId, step, isManual = false) {
      const box = document.querySelector(`.card-carousel[data-card='${CSS.escape(cardId)}']`);
      if (!box) return;
      const slides = [...box.querySelectorAll(".card-slide")];
      const current = slides.findIndex(s => s.classList.contains("active"));
      if (current < 0) return;
      let next = current + step;
      if (next < 0) next = slides.length - 1;
      if (next >= slides.length) next = 0;
      slides[current].classList.remove("active");
      slides[next].classList.add("active");
      adjustCardCarouselHeight(cardId);
      if (isManual) cardManualPauseUntil.set(String(cardId), Date.now() + 7000);
    }

    function adjustCardCarouselHeight(cardId) {
      const box = document.querySelector(`.card-carousel[data-card='${CSS.escape(cardId)}']`);
      if (!box) return;
      const active = box.querySelector(".card-slide.active img");
      if (!active) return;
      const setHeight = () => {
        const naturalW = active.naturalWidth || 1;
        const naturalH = active.naturalHeight || 1;
        const boxW = box.clientWidth || 1;
        const scaled = Math.round((naturalH / naturalW) * boxW);
        const clamped = Math.max(180, Math.min(380, scaled));
        box.style.height = `${clamped}px`;
      };
      if (active.complete) setHeight();
      else active.addEventListener("load", setHeight, { once: true });
    }

    function adjustAllCardCarousels() {
      document.querySelectorAll(".card-carousel[data-card]").forEach((box) => {
        adjustCardCarouselHeight(box.dataset.card);
      });
    }

    function startCardAutoSlide() {
      cardAutoTimers.forEach((timer) => clearInterval(timer));
      cardAutoTimers.clear();
      document.querySelectorAll(".card-carousel[data-card]").forEach((box) => {
        const cardId = String(box.dataset.card || "");
        const slides = box.querySelectorAll(".card-slide");
        if (!cardId || slides.length < 2) return;
        const timer = setInterval(() => {
          if (Date.now() < (cardManualPauseUntil.get(cardId) || 0)) return;
          moveCardSlide(cardId, 1, false);
        }, 3600);
        cardAutoTimers.set(cardId, timer);
      });
    }

    function applyFilters() {
      const text = q.value.trim().toLowerCase();
      const fp = sParroquia.value;
      const fc = sCategoria.value;
      const fj = sJerarquia.value;
      const places = DATA.places || [];

      const filtered = places.filter(item => {
        const hay = [item.nombre, item.tipo, item.subtipo, item.parroquia, item.categoria].join(" ").toLowerCase();
        return (!text || hay.includes(text)) && (!fp || item.parroquia === fp) && (!fc || item.categoria === fc) && (!fj || item.jerarquia === fj);
      });
      const sorted = filtered.slice().sort((a, b) => {
        const diff = getVisitCount(b.num_atr) - getVisitCount(a.num_atr);
        if (diff !== 0) return diff;
        return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
      });

      cardsEl.innerHTML = sorted.map((item, index) => cardTpl(item, index + 1)).join("");
      const sortedRoutes = filtered.slice().sort((a, b) => {
        const diff = getVisitCount(b.num_atr) - getVisitCount(a.num_atr);
        if (diff !== 0) return diff;
        return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
      });
      renderRoutes(sortedRoutes);
      emptyEl.style.display = filtered.length ? "none" : "block";
      if (kpiTotalBtn) kpiTotalBtn.classList.toggle("active", !fc);
      if (kpiCultBtn) kpiCultBtn.classList.toggle("active", fc === "MANIFESTACIONES CULTURALES");
      if (kpiNatBtn) kpiNatBtn.classList.toggle("active", fc === "ATRACTIVOS NATURALES");

      cardsEl.querySelectorAll("[data-toggle]").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.toggle;
          const item = (DATA.places || []).find(x => String(x.num_atr) === String(id));
          if (item) {
            bumpVisitCount(item.num_atr);
            openDetailsModal(item);
            applyFilters();
          }
        });
      });

      cardsEl.querySelectorAll("[data-detail]").forEach(btn => {
        btn.addEventListener("click", () => {
          const item = places.find(x => String(x.num_atr) === String(btn.dataset.detail));
          if (item) {
            bumpVisitCount(item.num_atr);
            drawMiniCard(item);
            applyFilters();
          }
        });
      });

      // El PDF se abre desde la mini ficha para evitar duplicar botones en la card.

      cardsEl.querySelectorAll("[data-card-prev]").forEach(btn => btn.addEventListener("click", () => moveCardSlide(btn.dataset.cardPrev, -1, true)));
      cardsEl.querySelectorAll("[data-card-next]").forEach(btn => btn.addEventListener("click", () => moveCardSlide(btn.dataset.cardNext, 1, true)));
      adjustAllCardCarousels();
      startCardAutoSlide();

      // rutas ya renderizadas arriba
    }

    function showHeroSlide(index) {
      const slides = [...heroTrack.querySelectorAll(".hero-slide")];
      if (!slides.length) return;
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle("active", i === heroIndex));
      [...carDots.querySelectorAll(".car-dot")].forEach((d, i) => d.classList.toggle("active", i === heroIndex));
      adjustHeroTrackHeight();
      updateHeroInfo();
    }

    function adjustHeroTrackHeight() {
      const active = heroTrack.querySelector(".hero-slide.active img");
      if (!active) return;
      const setHeight = () => {
        const naturalW = active.naturalWidth || 1;
        const naturalH = active.naturalHeight || 1;
        const trackW = heroTrack.clientWidth || 1;
        const horizontalPadding = window.innerWidth <= 640 ? 16 : 18;
        const verticalChrome = window.innerWidth <= 640 ? 40 : 46;
        const usableW = Math.max(1, trackW - horizontalPadding);
        const scaledImageH = Math.round((naturalH / naturalW) * usableW);
        const desired = scaledImageH + verticalChrome;
        const viewportCap = window.innerWidth <= 640 ? Math.round(window.innerHeight * 0.46) : Math.round(window.innerHeight * 0.58);
        const minH = window.innerWidth <= 640 ? 220 : 280;
        const clamped = Math.max(minH, Math.min(viewportCap, desired));
        heroTrack.style.height = `${clamped}px`;
      };
      if (active.complete) setHeight();
      else active.addEventListener("load", setHeight, { once: true });
    }

    function initHeroCarousel() {
      const slides = [...heroTrack.querySelectorAll(".hero-slide")];
      carDots.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.className = "car-dot" + (i === 0 ? " active" : "");
        dot.type = "button";
        dot.addEventListener("click", () => { showHeroSlide(i); restartHeroTimer(); });
        carDots.appendChild(dot);
      });
      carPrev.onclick = () => { showHeroSlide(heroIndex - 1); restartHeroTimer(); };
      carNext.onclick = () => { showHeroSlide(heroIndex + 1); restartHeroTimer(); };
      adjustHeroTrackHeight();
      restartHeroTimer();
    }

    function restartHeroTimer() {
      if (heroTimer) clearInterval(heroTimer);
      heroTimer = setInterval(() => showHeroSlide(heroIndex + 1), 5000);
    }

    function init() {
      [q, sParroquia, sCategoria, sJerarquia].forEach(el => el.addEventListener("input", applyFilters));
      if (kpiTotalBtn) {
        kpiTotalBtn.addEventListener("click", () => {
          q.value = "";
          sParroquia.value = "";
          sCategoria.value = "";
          sJerarquia.value = "";
          applyFilters();
        });
      }
      if (kpiCultBtn) {
        kpiCultBtn.addEventListener("click", () => {
          sCategoria.value = (sCategoria.value === "MANIFESTACIONES CULTURALES") ? "" : "MANIFESTACIONES CULTURALES";
          applyFilters();
        });
      }
      if (kpiNatBtn) {
        kpiNatBtn.addEventListener("click", () => {
          sCategoria.value = (sCategoria.value === "ATRACTIVOS NATURALES") ? "" : "ATRACTIVOS NATURALES";
          applyFilters();
        });
      }
      if (routeParroquia) routeParroquia.addEventListener("input", renderRouteFilters);
      if (routeSearch) routeSearch.addEventListener("input", renderRouteFilters);
      if (miniModalClose) miniModalClose.addEventListener("click", () => { miniModal.classList.remove("open"); miniModal.setAttribute("aria-hidden", "true"); });
      closeViewer.addEventListener("click", closePdf);
      viewer.addEventListener("click", (e) => { if (e.target === viewer) closePdf(); });
        if (routeModalClose) routeModalClose.addEventListener("click", closeRouteModal);
        if (routeModal) routeModal.addEventListener("click", (e) => { if (e.target === routeModal) closeRouteModal(); });
        if (serviceModalClose) serviceModalClose.addEventListener("click", () => {
          serviceModal.classList.remove("open");
          serviceModal.setAttribute("aria-hidden", "true");
        });
        if (serviceModal) serviceModal.addEventListener("click", (e) => {
          if (e.target === serviceModal) {
            serviceModal.classList.remove("open");
            serviceModal.setAttribute("aria-hidden", "true");
          }
        });
        if (serviceStatsClose) serviceStatsClose.addEventListener("click", () => {
          serviceStatsModal.classList.remove("open");
          serviceStatsModal.setAttribute("aria-hidden", "true");
        });
        if (serviceStatsModal) serviceStatsModal.addEventListener("click", (e) => {
          if (e.target === serviceStatsModal) {
            serviceStatsModal.classList.remove("open");
            serviceStatsModal.setAttribute("aria-hidden", "true");
          }
        });
        if (serviceItemClose) serviceItemClose.addEventListener("click", () => {
          serviceItemModal.classList.remove("open");
          serviceItemModal.setAttribute("aria-hidden", "true");
        });
        if (serviceItemModal) serviceItemModal.addEventListener("click", (e) => {
          if (e.target === serviceItemModal) {
            serviceItemModal.classList.remove("open");
            serviceItemModal.setAttribute("aria-hidden", "true");
          }
        });
      if (detailsModalClose) detailsModalClose.addEventListener("click", closeDetailsModal);
      if (detailsModal) detailsModal.addEventListener("click", (e) => { if (e.target === detailsModal) closeDetailsModal(); });
      window.addEventListener("resize", () => { adjustHeroTrackHeight(); adjustAllCardCarousels(); });
      initTabs();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          if (miniModal) { miniModal.classList.remove("open"); miniModal.setAttribute("aria-hidden", "true"); }
          closePdf();
        }
      });
      loadData();
    }

    init();

    function renderRouteFilters() {
      const places = DATA.places || [];
      const p = (routeParroquia && routeParroquia.value) || "";
      const t = (routeSearch && routeSearch.value || "").toLowerCase().trim();
      const filtered = places.filter(item => {
        const okP = !p || item.parroquia === p;
        const okT = !t || (item.nombre || "").toLowerCase().includes(t);
        return okP && okT;
      });
      renderRoutes(filtered);
    }

    function initTabs() {
      const tabs = [...document.querySelectorAll(".nav-tab")];
      const sections = ["inicio", "servicios", "lugares", "rutas"]
        .map(id => document.getElementById(id))
        .filter(Boolean);
      const backHome = document.getElementById("backHome");

      function activate(id) {
        tabs.forEach(t => t.classList.toggle("active", t.dataset.section === id));
        sections.forEach(s => s.classList.toggle("active", s.id === id));
        if (backHome) backHome.classList.toggle("show", id !== "inicio");
      }

      tabs.forEach(t => {
        t.addEventListener("click", (e) => {
          e.preventDefault();
          const id = t.dataset.section;
          if (!id) return;
          history.replaceState(null, "", `#${id}`);
          localStorage.setItem("portal_tab", id);
          activate(id);
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });

      if (backHome) {
        backHome.addEventListener("click", () => {
          history.replaceState(null, "", "#inicio");
          localStorage.setItem("portal_tab", "inicio");
          activate("inicio");
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }

      const stored = localStorage.getItem("portal_tab");
      const hash = (location.hash || "").replace("#", "");
      const initial = ["inicio","servicios","lugares","rutas"].includes(hash) ? hash
        : (["inicio","servicios","lugares","rutas"].includes(stored) ? stored : "inicio");
      activate(initial);
    }
  



