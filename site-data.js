(function () {
  const STORAGE_KEY = "balloons_queens_site_content_v1";

  const DEFAULT_SITE_CONTENT = {
    business: {
      name: "Alisseo",
      phoneE164: "+34617144121",
      phoneDisplay: "617144121",
      area: "Elche, Alicante y alrededores",
      hours: "Lunes a Sabado, 9:00 a 20:00",
      instagramUrl: "https://www.instagram.com"
    },
    hero: {
      title: "Decoraciones premium para bodas, comuniones y cumpleanos en Elche y Alicante",
      subtitle: "Hacemos montajes elegantes con globos en Elche, Alicante y alrededores para eventos inolvidables.",
      ctaPrimaryText: "Ver paquetes",
      ctaSecondaryText: "Pedir presupuesto"
    },
    whatsapp: {
      infoMessage: "Hola Alisseo, quiero informacion para mi evento en Elche o Alicante",
      reserveMessage: "Hola Alisseo, quiero reservar decoracion con globos en Elche o Alicante"
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
      { image: "idea delaine.jpeg", alt: "Arco de globos para cumpleanos" },
      { image: "idea delaine.jpeg", alt: "Decoracion elegante en rosa y dorado" },
      { image: "idea delaine.jpeg", alt: "Montaje premium con globos en Elche" }
    ],
    payments: {
      subtitle: "Senal segura para confirmar tu fecha.",
      text: "Aceptamos Bizum, transferencia bancaria y enlace de pago."
    }
  };

  const DEFAULT_SUPABASE_CONFIG = {
    url: "",
    anonKey: "",
    table: "site_content",
    rowId: 1,
    storageBucket: "site-media"
  };

  function getSupabaseConfig() {
    const runtime = window.SUPABASE_CONFIG && typeof window.SUPABASE_CONFIG === "object"
      ? window.SUPABASE_CONFIG
      : {};
    return {
      url: String(runtime.url || DEFAULT_SUPABASE_CONFIG.url).trim(),
      anonKey: String(runtime.anonKey || DEFAULT_SUPABASE_CONFIG.anonKey).trim(),
      table: String(runtime.table || DEFAULT_SUPABASE_CONFIG.table).trim(),
      rowId: Number(runtime.rowId || DEFAULT_SUPABASE_CONFIG.rowId),
      storageBucket: String(runtime.storageBucket || DEFAULT_SUPABASE_CONFIG.storageBucket).trim()
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
        subtitle: asText(data.payments && data.payments.subtitle, defaults.payments.subtitle),
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

    if (normalized.business.name === "Balloons Queens") {
      normalized.business.name = "Alisseo";
    }
    normalized.whatsapp.infoMessage = normalized.whatsapp.infoMessage.replace(/Balloons Queens/gi, "Alisseo");
    normalized.whatsapp.reserveMessage = normalized.whatsapp.reserveMessage.replace(/Balloons Queens/gi, "Alisseo");

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
      cache: "no-store",
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
      cache: "no-store",
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
    let phone = String(phoneE164 || "").replace(/[^\d]/g, "");
    if (phone.startsWith("00")) phone = phone.slice(2);
    if (phone.length === 9) phone = "34" + phone;
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message || "");
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

