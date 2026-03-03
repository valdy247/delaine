(function () {
  const STORAGE_KEY = "balloons_queens_site_content_v1";

  const DEFAULT_SITE_CONTENT = {
    business: {
      name: "Balloons Queens",
      phoneE164: "+34600000000",
      phoneDisplay: "+34 600 000 000",
      area: "Elche y alrededores",
      hours: "Lunes a Sabado, 9:00 a 20:00",
      instagramUrl: "https://www.instagram.com"
    },
    hero: {
      title: "Decoraciones premium para la fiesta de tus sueños",
      subtitle: "Hacemos montajes elegantes en Elche y alrededores, bautizos bodas y cumpleaños.",
      ctaPrimaryText: "Ver paquetes",
      ctaSecondaryText: "Pedir presupuesto"
    },
    whatsapp: {
      infoMessage: "Hola Balloons Queens, quiero informacion para mi evento en Elche",
      reserveMessage: "Hola Balloons Queens, quiero reservar decoracion con globos en Elche"
    },
    packages: [
      {
        name: "Paquete Basico",
        price: "99 EUR",
        image: "basico.png",
        alt: "Paquete Basico de decoracion con globos",
        features: [
          "Arco compacto en tonos pastel",
          "Montaje en 60 minutos",
          "Ideal para espacios pequenos"
        ]
      },
      {
        name: "Paquete Deluxe",
        price: "150 EUR",
        image: "deluxe.png",
        alt: "Paquete Deluxe de decoracion con globos",
        features: [
          "Arco principal + base de bienvenida",
          "Paleta personalizada",
          "Soporte de montaje y desmontaje"
        ]
      },
      {
        name: "Paquete Premium",
        price: "220 EUR",
        image: "premium.png",
        alt: "Paquete Premium de decoracion con globos",
        features: [
          "Escenografia completa para fotos",
          "Globos metalicos en dorado suave",
          "Diseno a medida para tu evento"
        ]
      }
    ],
    gallery: [
      { image: "idea delaine.jpeg", alt: "Decoracion de mesa con globos" },
      { image: "idea delaine.jpeg", alt: "Arco de globos para cumpleaños" },
      { image: "idea delaine.jpeg", alt: "Decoracion elegante en rosa y dorado" },
      { image: "idea delaine.jpeg", alt: "Montaje premium con globos en Elche" }
    ],
    payments: {
      text: "Aceptamos Bizum, transferencia bancaria y enlace de pago."
    }
  };

  const DEFAULT_SUPABASE_CONFIG = {
    url: "",
    anonKey: "",
    table: "site_content",
    rowId: 1
  };

  function getSupabaseConfig() {
    const runtime = window.SUPABASE_CONFIG && typeof window.SUPABASE_CONFIG === "object"
      ? window.SUPABASE_CONFIG
      : {};
    return {
      url: String(runtime.url || DEFAULT_SUPABASE_CONFIG.url).trim(),
      anonKey: String(runtime.anonKey || DEFAULT_SUPABASE_CONFIG.anonKey).trim(),
      table: String(runtime.table || DEFAULT_SUPABASE_CONFIG.table).trim(),
      rowId: Number(runtime.rowId || DEFAULT_SUPABASE_CONFIG.rowId)
    };
  }

  function isSupabaseEnabled() {
    const cfg = getSupabaseConfig();
    return Boolean(cfg.url && cfg.anonKey);
  }

  function cloneDefault() {
    return JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT));
  }

  function asText(value, fallback) {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  function asArray(value, fallback) {
    return Array.isArray(value) && value.length > 0 ? value : fallback;
  }

  function normalize(input) {
    const defaults = cloneDefault();
    const data = input && typeof input === "object" ? input : {};

    const normalized = {
      business: {
        name: asText(data.business && data.business.name, defaults.business.name),
        phoneE164: asText(data.business && data.business.phoneE164, defaults.business.phoneE164),
        phoneDisplay: asText(data.business && data.business.phoneDisplay, defaults.business.phoneDisplay),
        area: asText(data.business && data.business.area, defaults.business.area),
        hours: asText(data.business && data.business.hours, defaults.business.hours),
        instagramUrl: asText(data.business && data.business.instagramUrl, defaults.business.instagramUrl)
      },
      hero: {
        title: asText(data.hero && data.hero.title, defaults.hero.title),
        subtitle: asText(data.hero && data.hero.subtitle, defaults.hero.subtitle),
        ctaPrimaryText: asText(data.hero && data.hero.ctaPrimaryText, defaults.hero.ctaPrimaryText),
        ctaSecondaryText: asText(data.hero && data.hero.ctaSecondaryText, defaults.hero.ctaSecondaryText)
      },
      whatsapp: {
        infoMessage: asText(data.whatsapp && data.whatsapp.infoMessage, defaults.whatsapp.infoMessage),
        reserveMessage: asText(data.whatsapp && data.whatsapp.reserveMessage, defaults.whatsapp.reserveMessage)
      },
      packages: [],
      gallery: [],
      payments: {
        text: asText(data.payments && data.payments.text, defaults.payments.text)
      }
    };

    normalized.packages = asArray(data.packages, defaults.packages).map(function (item, index) {
      const fallback = defaults.packages[index] || defaults.packages[defaults.packages.length - 1];
      const safeItem = item && typeof item === "object" ? item : {};
      const features = Array.isArray(safeItem.features)
        ? safeItem.features.map(function (feature) { return String(feature || "").trim(); }).filter(Boolean)
        : fallback.features;

      return {
        name: asText(safeItem.name, fallback.name),
        price: asText(safeItem.price, fallback.price),
        image: asText(safeItem.image, fallback.image),
        alt: asText(safeItem.alt, fallback.alt),
        features: features.length ? features : fallback.features
      };
    });

    normalized.gallery = asArray(data.gallery, defaults.gallery).map(function (item, index) {
      const fallback = defaults.gallery[index] || defaults.gallery[defaults.gallery.length - 1];
      const safeItem = item && typeof item === "object" ? item : {};
      return {
        image: asText(safeItem.image, fallback.image),
        alt: asText(safeItem.alt, fallback.alt)
      };
    });

    return normalized;
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneDefault();
      return normalize(JSON.parse(raw));
    } catch (error) {
      return cloneDefault();
    }
  }

  function saveLocal(data) {
    const normalized = normalize(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  async function loadRemote() {
    const local = loadLocal();
    if (!isSupabaseEnabled()) return local;

    const cfg = getSupabaseConfig();
    const endpoint =
      cfg.url +
      "/rest/v1/" +
      encodeURIComponent(cfg.table) +
      "?id=eq." +
      encodeURIComponent(String(cfg.rowId)) +
      "&select=content";

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: cfg.anonKey,
        Authorization: "Bearer " + cfg.anonKey,
        "Cache-Control": "no-cache"
      }
    });

    if (!response.ok) {
      let details = "Error HTTP " + response.status;
      try {
        const errorBody = await response.json();
        if (errorBody && errorBody.message) details = errorBody.message;
      } catch (error) {}
      throw new Error(details);
    }

    const rows = await response.json();
    if (!Array.isArray(rows) || rows.length === 0 || !rows[0].content) {
      return local;
    }

    const normalized = normalize(rows[0].content);
    saveLocal(normalized);
    return normalized;
  }

  async function saveRemote(data) {
    const normalized = saveLocal(data);
    if (!isSupabaseEnabled()) return normalized;

    const cfg = getSupabaseConfig();

    const endpoint =
      cfg.url +
      "/rest/v1/" +
      encodeURIComponent(cfg.table) +
      "?on_conflict=id";

    const payload = JSON.stringify([
      {
        id: cfg.rowId,
        content: normalized,
        updated_at: new Date().toISOString()
      }
    ]);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: cfg.anonKey,
        Authorization: "Bearer " + cfg.anonKey,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
        "Cache-Control": "no-cache"
      },
      body: payload
    });

    if (!response.ok) {
      let details = "Error HTTP " + response.status;
      try {
        const errorBody = await response.json();
        if (errorBody && errorBody.message) details = errorBody.message;
      } catch (error) {}
      throw new Error(details);
    }

    return normalized;
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    return cloneDefault();
  }

  function buildWhatsAppLink(phoneE164, message) {
    const phone = String(phoneE164 || "").replace(/[^\d+]/g, "");
    return "https://wa.me/" + phone.replace("+", "") + "?text=" + encodeURIComponent(message || "");
  }

  window.SiteContentStore = {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_SITE_CONTENT: DEFAULT_SITE_CONTENT,
    normalize: normalize,
    load: loadLocal,
    save: saveLocal,
    loadRemote: loadRemote,
    saveRemote: saveRemote,
    reset: reset,
    buildWhatsAppLink: buildWhatsAppLink,
    isSupabaseEnabled: isSupabaseEnabled,
    getSupabaseConfig: getSupabaseConfig
  };
})();
