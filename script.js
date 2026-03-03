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
  const heroPrimaryCta = document.getElementById("hero-primary-cta");
  const heroWhatsappBtn = document.getElementById("hero-whatsapp-btn");
  const floatingWhatsapp = document.querySelector(".floating-whatsapp");
  const instagramLink = document.getElementById("instagram-link");
  const contactArea = document.getElementById("contact-area");
  const contactHours = document.getElementById("contact-hours");
  const contactWhatsappBtn = document.getElementById("contact-whatsapp-btn");
  const paymentsText = document.getElementById("payments-text");
  const footerYear = document.getElementById("footer-year");
  const packagesList = document.getElementById("packages-list");
  const galleryList = document.getElementById("gallery-list");
  const titleTag = document.querySelector("title");
  const authorTag = document.querySelector('meta[name="author"]');
  const ogTitleTag = document.querySelector('meta[property="og:title"]');

  if (menuBrand) menuBrand.textContent = content.business.name;
  if (footerBrand) footerBrand.textContent = content.business.name;
  if (heroTitle) heroTitle.textContent = content.hero.title;
  if (heroSubtitle) heroSubtitle.textContent = content.hero.subtitle;
  if (heroPrimaryCta) heroPrimaryCta.textContent = content.hero.ctaPrimaryText;
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
    contactWhatsappBtn.textContent = "Escribenos al " + content.business.phoneDisplay;
  }
  if (paymentsText) paymentsText.textContent = content.payments.text;
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());
  if (titleTag) titleTag.textContent = content.business.name + " | Decoracion con globos en Elche";
  if (authorTag) authorTag.setAttribute("content", content.business.name);
  if (ogTitleTag) ogTitleTag.setAttribute("content", content.business.name + " | Decoracion con globos en Elche");

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
          '<img src="' + escapeHtml(pkg.image) + '" alt="' + escapeHtml(pkg.alt) + '" loading="lazy" decoding="async" />' +
          '<div class="card-content">' +
          "<h3>" + escapeHtml(pkg.name) + "</h3>" +
          '<p class="price">' + escapeHtml(pkg.price) + "</p>" +
          "<ul>" + featuresHtml + "</ul>" +
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

setupRevealAnimation();
setupMobileMenu();

renderDynamicContent();
