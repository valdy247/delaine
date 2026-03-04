async function renderDynamicContent() {
  if (!window.SiteContentStore) return;

  let content = window.SiteContentStore.load();
  try {
    content = await window.SiteContentStore.loadRemote();
  } catch (error) {
    content = window.SiteContentStore.load();
  }
  const waInfoLink = window.SiteContentStore.buildWhatsAppLink(
    content.business.phoneE164,
    content.whatsapp.infoMessage
  );
  const waReserveLink = window.SiteContentStore.buildWhatsAppLink(
    content.business.phoneE164,
    content.whatsapp.reserveMessage
  );

  const menuBrand = document.getElementById("menu-brand");
  const footerBrand = document.getElementById("footer-brand");
  const heroTitle = document.getElementById("hero-title");
  const heroSubtitle = document.getElementById("hero-subtitle");
  const heroWhatsappBtn = document.getElementById("hero-whatsapp-btn");
  const floatingWhatsapp = document.querySelector(".floating-whatsapp");
  const instagramLink = document.getElementById("instagram-link");
  const contactArea = document.getElementById("contact-area");
  const contactHours = document.getElementById("contact-hours");
  const contactWhatsappBtn = document.getElementById("contact-whatsapp-btn");
  const paymentsSubtitle = document.getElementById("payments-subtitle");
  const paymentsText = document.getElementById("payments-text");
  const footerYear = document.getElementById("footer-year");
  const packagesList = document.getElementById("packages-list");
  const galleryList = document.getElementById("gallery-list");
  const titleTag = document.querySelector("title");
  const descriptionTag = document.querySelector('meta[name="description"]');
  const authorTag = document.querySelector('meta[name="author"]');
  const ogTitleTag = document.querySelector('meta[property="og:title"]');
  const ogDescriptionTag = document.querySelector('meta[property="og:description"]');
  const twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
  const twitterDescriptionTag = document.querySelector('meta[name="twitter:description"]');
  const canonicalTag = document.getElementById("canonical-link");
  const ogUrlTag = document.querySelector('meta[property="og:url"]');

  if (menuBrand) menuBrand.textContent = content.business.name;
  if (footerBrand) footerBrand.textContent = content.business.name;
  if (heroTitle) heroTitle.textContent = content.hero.title;
  if (heroSubtitle) heroSubtitle.textContent = content.hero.subtitle;
  if (heroWhatsappBtn) {
    heroWhatsappBtn.textContent = content.hero.ctaSecondaryText;
    heroWhatsappBtn.href = waInfoLink;
  }
  if (floatingWhatsapp) floatingWhatsapp.href = waInfoLink;
  if (instagramLink) instagramLink.href = content.business.instagramUrl;
  if (contactArea) contactArea.textContent = content.business.area;
  if (contactHours) contactHours.textContent = content.business.hours;
  if (contactWhatsappBtn) {
    contactWhatsappBtn.href = waReserveLink;
    contactWhatsappBtn.textContent = "Escribenos por WhatsApp";
  }
  if (paymentsSubtitle) paymentsSubtitle.textContent = content.payments.subtitle;
  if (paymentsText) paymentsText.textContent = content.payments.text;
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  const siteTitle = content.business.name + " | Decoracion con globos en Elche y Alicante";
  const siteDescription =
    "Decoracion con globos en " +
    content.business.area +
    " para bodas, comuniones, bautizos y cumpleanos. Presupuesto por WhatsApp.";

  if (titleTag) titleTag.textContent = siteTitle;
  if (descriptionTag) descriptionTag.setAttribute("content", siteDescription);
  if (authorTag) authorTag.setAttribute("content", content.business.name);
  if (ogTitleTag) ogTitleTag.setAttribute("content", siteTitle);
  if (ogDescriptionTag) ogDescriptionTag.setAttribute("content", siteDescription);
  if (twitterTitleTag) twitterTitleTag.setAttribute("content", siteTitle);
  if (twitterDescriptionTag) twitterDescriptionTag.setAttribute("content", siteDescription);

  const canonicalUrl = window.location.origin + window.location.pathname;
  if (canonicalTag) canonicalTag.setAttribute("href", canonicalUrl);
  if (ogUrlTag) ogUrlTag.setAttribute("content", canonicalUrl);

  const localBusinessSchema = document.getElementById("local-business-schema");
  if (localBusinessSchema) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: content.business.name,
      description: "Decoracion con globos para eventos en " + content.business.area,
      image: window.location.origin + "/logo.png",
      telephone: "+34 " + content.business.phoneDisplay,
      url: canonicalUrl,
      areaServed: content.business.area,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Elche",
        addressRegion: "Alicante",
        addressCountry: "ES"
      },
      sameAs: [content.business.instagramUrl]
    };
    localBusinessSchema.textContent = JSON.stringify(schema);
  }

  if (packagesList) {
    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    packagesList.innerHTML = content.packages
      .map(function (pkg) {
        const featuresHtml = pkg.features
          .map(function (feature) {
            return "<li>" + escapeHtml(feature) + "</li>";
          })
          .join("");

        return (
          '<article class="card">' +
          '<img src="' +
          escapeHtml(pkg.image) +
          '" alt="' +
          escapeHtml(pkg.alt) +
          '" loading="lazy" decoding="async" />' +
          '<div class="card-content">' +
          "<h3>" +
          escapeHtml(pkg.name) +
          "</h3>" +
          '<p class="price">' +
          escapeHtml(pkg.price) +
          "</p>" +
          "<ul>" +
          featuresHtml +
          "</ul>" +
          '<a class="btn btn-primary" href="#contacto">Reservar ahora</a>' +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  if (galleryList) {
    galleryList.innerHTML = content.gallery
      .map(function (item) {
        return (
          '<img src="' +
          String(item.image)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;") +
          '" alt="' +
          String(item.alt)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;") +
          '" loading="lazy" decoding="async" />'
        );
      })
      .join("");
  }
}

function setupRevealAnimation() {
  const sectionsToReveal = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  sectionsToReveal.forEach(function (section) {
    observer.observe(section);
  });
}

function setupMobileMenu() {
  const menu = document.querySelector(".menu");
  const menuToggle = document.querySelector(".menu-toggle");
  const menuLinks = document.querySelectorAll(".menu-links a");

  if (!menu || !menuToggle) return;

  menuToggle.addEventListener("click", function () {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menu.classList.toggle("menu-open", !isExpanded);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      menu.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  menuLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 680) {
      menu.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function setupPaymentsModal() {
  const openBtn = document.getElementById("open-payments-modal");
  const modal = document.getElementById("payments-modal");
  const closeBtn = document.getElementById("close-payments-modal");
  const status = document.getElementById("payments-modal-status");
  const options = document.querySelectorAll(".payment-option");

  if (!openBtn || !modal || !closeBtn || !status) return;

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    status.textContent = "";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
  });

  options.forEach(function (option) {
    option.addEventListener("click", function () {
      const method = option.getAttribute("data-method") || "metodo";
      status.textContent = method + " aun no esta configurado. Lo conectamos en el siguiente paso.";
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function setupHeroVideoFallback() {
  const hero = document.querySelector(".hero");
  const heroVideo = document.getElementById("hero-video");

  if (!hero || !heroVideo) return;

  heroVideo.addEventListener("ended", function () {
    hero.classList.add("video-ended");
  });
}

setupRevealAnimation();
setupMobileMenu();
setupPaymentsModal();
setupHeroVideoFallback();

renderDynamicContent();
