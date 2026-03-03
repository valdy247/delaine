(function () {
  if (!window.SiteContentStore) return;

  const form = document.getElementById("admin-form");
  const packagesEditor = document.getElementById("packages-editor");
  const galleryEditor = document.getElementById("gallery-editor");
  const addPackageBtn = document.getElementById("add-package");
  const addGalleryItemBtn = document.getElementById("add-gallery-item");
  const resetDefaultsBtn = document.getElementById("reset-defaults");
  const exportJsonBtn = document.getElementById("export-json");
  const importJsonFileInput = document.getElementById("import-json-file");
  const saveStatus = document.getElementById("save-status");

  let state = window.SiteContentStore.load();

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function packageTemplate(pkg, index) {
    return (
      '<div class="item-editor package-item" data-index="' +
      index +
      '">' +
      '<div class="item-top">' +
      '<h3 class="item-title">Paquete ' +
      (index + 1) +
      "</h3>" +
      '<button type="button" class="remove-btn remove-package">Eliminar</button>' +
      "</div>" +
      '<div class="grid-2">' +
      '<label>Nombre<input class="pkg-name" type="text" value="' +
      escapeHtml(pkg.name) +
      '" required /></label>' +
      '<label>Precio<input class="pkg-price" type="text" value="' +
      escapeHtml(pkg.price) +
      '" required /></label>' +
      '<label>Imagen (URL o archivo local)<input class="pkg-image" type="text" value="' +
      escapeHtml(pkg.image) +
      '" required /></label>' +
      '<label>Subir imagen desde dispositivo' +
      '<button type="button" class="upload-btn upload-package-btn">Elegir imagen</button>' +
      '<input class="pkg-file sr-only-file" type="file" accept="image/*" />' +
      "</label>" +
      '<label>Alt imagen<input class="pkg-alt" type="text" value="' +
      escapeHtml(pkg.alt) +
      '" required /></label>' +
      "</div>" +
      '<label>Descripcion (una linea por punto)<textarea class="pkg-features" rows="4" required>' +
      escapeHtml(pkg.features.join("\n")) +
      "</textarea></label>" +
      "</div>"
    );
  }

  function galleryTemplate(item, index) {
    return (
      '<div class="item-editor gallery-item" data-index="' +
      index +
      '">' +
      '<div class="item-top">' +
      '<h3 class="item-title">Foto ' +
      (index + 1) +
      "</h3>" +
      '<button type="button" class="remove-btn remove-gallery-item">Eliminar</button>' +
      "</div>" +
      '<div class="grid-2">' +
      '<label>Imagen (URL o archivo local)<input class="gallery-image" type="text" value="' +
      escapeHtml(item.image) +
      '" required /></label>' +
      '<label>Subir imagen desde dispositivo' +
      '<button type="button" class="upload-btn upload-gallery-btn">Elegir imagen</button>' +
      '<input class="gallery-file sr-only-file" type="file" accept="image/*" />' +
      "</label>" +
      '<label>Alt imagen<input class="gallery-alt" type="text" value="' +
      escapeHtml(item.alt) +
      '" required /></label>' +
      "</div>" +
      "</div>"
    );
  }

  function renderDynamicEditors() {
    packagesEditor.innerHTML = state.packages
      .map(function (pkg, index) {
        return packageTemplate(pkg, index);
      })
      .join("");

    galleryEditor.innerHTML = state.gallery
      .map(function (item, index) {
        return galleryTemplate(item, index);
      })
      .join("");
  }

  function fillStaticFields() {
    form.elements.businessName.value = state.business.name;
    form.elements.phoneE164.value = state.business.phoneE164;
    form.elements.phoneDisplay.value = state.business.phoneDisplay;
    form.elements.instagramUrl.value = state.business.instagramUrl;
    form.elements.area.value = state.business.area;
    form.elements.hours.value = state.business.hours;
    form.elements.heroTitle.value = state.hero.title;
    form.elements.heroSubtitle.value = state.hero.subtitle;
    form.elements.heroCtaPrimary.value = state.hero.ctaPrimaryText;
    form.elements.heroCtaSecondary.value = state.hero.ctaSecondaryText;
    form.elements.whatsappInfoMessage.value = state.whatsapp.infoMessage;
    form.elements.whatsappReserveMessage.value = state.whatsapp.reserveMessage;
    form.elements.paymentsText.value = state.payments.text;
  }

  function collectDynamicEditors() {
    const packageNodes = packagesEditor.querySelectorAll(".package-item");
    const galleryNodes = galleryEditor.querySelectorAll(".gallery-item");

    const packages = Array.from(packageNodes).map(function (node) {
      const features = node
        .querySelector(".pkg-features")
        .value.split("\n")
        .map(function (line) {
          return line.trim();
        })
        .filter(Boolean);

      return {
        name: node.querySelector(".pkg-name").value.trim(),
        price: node.querySelector(".pkg-price").value.trim(),
        image: node.querySelector(".pkg-image").value.trim(),
        alt: node.querySelector(".pkg-alt").value.trim(),
        features: features
      };
    });

    const gallery = Array.from(galleryNodes).map(function (node) {
      return {
        image: node.querySelector(".gallery-image").value.trim(),
        alt: node.querySelector(".gallery-alt").value.trim()
      };
    });

    return { packages: packages, gallery: gallery };
  }

  function refreshForm() {
    fillStaticFields();
    renderDynamicEditors();
  }

  function setStatus(message, isError) {
    saveStatus.textContent = message;
    saveStatus.style.color = isError ? "#9f2d2d" : "#357a44";
  }

  function sanitizeFileName(name) {
    return String(name || "image")
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function uploadImageFile(file, folder) {
    if (!window.SiteContentStore.isSupabaseEnabled()) {
      throw new Error("Supabase no esta configurado.");
    }

    const cfg = window.SiteContentStore.getSupabaseConfig();
    const bucket = cfg.storageBucket || "site-media";
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    const safeName = sanitizeFileName(file.name || "image.jpg");
    const objectPath = folder + "/" + timestamp + "-" + random + "-" + safeName;
    const encodedObjectPath = objectPath
      .split("/")
      .map(function (part) {
        return encodeURIComponent(part);
      })
      .join("/");
    const uploadUrl = cfg.url + "/storage/v1/object/" + encodeURIComponent(bucket) + "/" + encodedObjectPath;
    const response = await fetch(uploadUrl, {
      method: "POST",
      cache: "no-store",
      headers: {
        apikey: cfg.anonKey,
        Authorization: "Bearer " + cfg.anonKey,
        "x-upsert": "true",
        "Content-Type": file.type || "application/octet-stream"
      },
      body: file
    });

    if (!response.ok) {
      let reason = "Error HTTP " + response.status;
      try {
        const details = await response.json();
        reason = details.message || details.error || reason;
      } catch (error) {}
      throw new Error(reason);
    }

    return cfg.url + "/storage/v1/object/public/" + encodeURIComponent(bucket) + "/" + encodedObjectPath;
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function serializeContent(data) {
    return JSON.stringify(window.SiteContentStore.normalize(data));
  }

  async function verifyGlobalSync(expectedData) {
    const expected = serializeContent(expectedData);
    const attempts = 4;

    for (let i = 0; i < attempts; i += 1) {
      try {
        const remote = await window.SiteContentStore.loadRemote();
        const actual = serializeContent(remote);
        if (actual === expected) return true;
      } catch (error) {}
      await sleep(700);
    }

    return false;
  }

  addPackageBtn.addEventListener("click", function () {
    state.packages.push({
      name: "Nuevo paquete",
      price: "0 EUR",
      image: "logo.png",
      alt: "Nuevo paquete de decoracion",
      features: ["Detalle 1", "Detalle 2", "Detalle 3"]
    });
    renderDynamicEditors();
  });

  addGalleryItemBtn.addEventListener("click", function () {
    state.gallery.push({
      image: "idea delaine.jpeg",
      alt: "Nueva foto de decoracion"
    });
    renderDynamicEditors();
  });

  packagesEditor.addEventListener("click", function (event) {
    if (event.target.classList.contains("upload-package-btn")) {
      const editor = event.target.closest(".package-item");
      const fileInput = editor && editor.querySelector(".pkg-file");
      if (fileInput) fileInput.click();
      return;
    }

    if (!event.target.classList.contains("remove-package")) return;
    if (state.packages.length <= 1) {
      setStatus("Debe existir al menos un paquete.", true);
      return;
    }
    const editor = event.target.closest(".package-item");
    const index = Number(editor && editor.dataset.index);
    if (Number.isInteger(index) && index >= 0) {
      state.packages.splice(index, 1);
      renderDynamicEditors();
    }
  });

  packagesEditor.addEventListener("change", function (event) {
    if (!event.target.classList.contains("pkg-file")) return;
    const input = event.target;
    const file = input.files && input.files[0];
    if (!file) return;

    const editor = input.closest(".package-item");
    const imageField = editor && editor.querySelector(".pkg-image");
    if (!imageField) return;

    setStatus("Subiendo imagen de paquete...", false);
    uploadImageFile(file, "packages")
      .then(function (publicUrl) {
        imageField.value = publicUrl;
        setStatus("Imagen de paquete subida. Guardando cambios...", false);
        form.requestSubmit();
      })
      .catch(function (error) {
        const reason = error && error.message ? " (" + error.message + ")" : "";
        setStatus("No se pudo subir la imagen de paquete." + reason, true);
      })
      .finally(function () {
        input.value = "";
      });
  });

  galleryEditor.addEventListener("click", function (event) {
    if (event.target.classList.contains("upload-gallery-btn")) {
      const editor = event.target.closest(".gallery-item");
      const fileInput = editor && editor.querySelector(".gallery-file");
      if (fileInput) fileInput.click();
      return;
    }

    if (!event.target.classList.contains("remove-gallery-item")) return;
    if (state.gallery.length <= 1) {
      setStatus("Debe existir al menos una foto de galeria.", true);
      return;
    }
    const editor = event.target.closest(".gallery-item");
    const index = Number(editor && editor.dataset.index);
    if (Number.isInteger(index) && index >= 0) {
      state.gallery.splice(index, 1);
      renderDynamicEditors();
    }
  });

  galleryEditor.addEventListener("change", function (event) {
    if (!event.target.classList.contains("gallery-file")) return;
    const input = event.target;
    const file = input.files && input.files[0];
    if (!file) return;

    const editor = input.closest(".gallery-item");
    const imageField = editor && editor.querySelector(".gallery-image");
    if (!imageField) return;

    setStatus("Subiendo imagen de galeria...", false);
    uploadImageFile(file, "gallery")
      .then(function (publicUrl) {
        imageField.value = publicUrl;
        setStatus("Imagen de galeria subida. Guardando cambios...", false);
        form.requestSubmit();
      })
      .catch(function (error) {
        const reason = error && error.message ? " (" + error.message + ")" : "";
        setStatus("No se pudo subir la imagen de galeria." + reason, true);
      })
      .finally(function () {
        input.value = "";
      });
  });

  resetDefaultsBtn.addEventListener("click", function () {
    const accepted = window.confirm("Se borraran tus cambios guardados y se restauraran los valores iniciales. Continuar?");
    if (!accepted) return;
    state = window.SiteContentStore.reset();
    window.SiteContentStore
      .saveRemote(state)
      .then(function (saved) {
        state = saved;
        refreshForm();
        setStatus("Valores iniciales restaurados.", false);
      })
      .catch(function (error) {
        const reason = error && error.message ? " (" + error.message + ")" : "";
        refreshForm();
        setStatus("Restaurado localmente, pero fallo al sincronizar con Supabase." + reason, true);
      });
  });

  exportJsonBtn.addEventListener("click", function () {
    const payload = window.SiteContentStore.normalize({
      business: {
        name: form.elements.businessName.value.trim(),
        phoneE164: form.elements.phoneE164.value.trim(),
        phoneDisplay: form.elements.phoneDisplay.value.trim(),
        instagramUrl: form.elements.instagramUrl.value.trim(),
        area: form.elements.area.value.trim(),
        hours: form.elements.hours.value.trim()
      },
      hero: {
        title: form.elements.heroTitle.value.trim(),
        subtitle: form.elements.heroSubtitle.value.trim(),
        ctaPrimaryText: form.elements.heroCtaPrimary.value.trim(),
        ctaSecondaryText: form.elements.heroCtaSecondary.value.trim()
      },
      whatsapp: {
        infoMessage: form.elements.whatsappInfoMessage.value.trim(),
        reserveMessage: form.elements.whatsappReserveMessage.value.trim()
      },
      packages: collectDynamicEditors().packages,
      gallery: collectDynamicEditors().gallery,
      payments: {
        text: form.elements.paymentsText.value.trim()
      }
    });

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "site-content.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
    setStatus("JSON exportado.", false);
  });

  importJsonFileInput.addEventListener("change", function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const normalized = window.SiteContentStore.normalize(parsed);
        window.SiteContentStore
          .saveRemote(normalized)
          .then(function (saved) {
            state = saved;
            refreshForm();
            return verifyGlobalSync(saved);
          })
          .then(function (ok) {
            if (ok) {
              setStatus("JSON importado y sincronizado globalmente.", false);
            } else {
              setStatus("Error: guardado local pero no se confirmo sincronizacion global.", true);
            }
          })
          .catch(function (error) {
            const reason = error && error.message ? " (" + error.message + ")" : "";
            state = window.SiteContentStore.save(normalized);
            refreshForm();
            setStatus("Error: JSON importado solo en local. No se sincronizo global." + reason, true);
          });
      } catch (error) {
        setStatus("El archivo no es un JSON valido.", true);
      } finally {
        importJsonFileInput.value = "";
      }
    };
    reader.readAsText(file, "utf-8");
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const dynamicData = collectDynamicEditors();
    const updated = {
      business: {
        name: form.elements.businessName.value.trim(),
        phoneE164: form.elements.phoneE164.value.trim(),
        phoneDisplay: form.elements.phoneDisplay.value.trim(),
        instagramUrl: form.elements.instagramUrl.value.trim(),
        area: form.elements.area.value.trim(),
        hours: form.elements.hours.value.trim()
      },
      hero: {
        title: form.elements.heroTitle.value.trim(),
        subtitle: form.elements.heroSubtitle.value.trim(),
        ctaPrimaryText: form.elements.heroCtaPrimary.value.trim(),
        ctaSecondaryText: form.elements.heroCtaSecondary.value.trim()
      },
      whatsapp: {
        infoMessage: form.elements.whatsappInfoMessage.value.trim(),
        reserveMessage: form.elements.whatsappReserveMessage.value.trim()
      },
      packages: dynamicData.packages,
      gallery: dynamicData.gallery,
      payments: {
        text: form.elements.paymentsText.value.trim()
      }
    };

    window.SiteContentStore
      .saveRemote(updated)
      .then(function (saved) {
        state = saved;
        return verifyGlobalSync(saved);
      })
      .then(function (ok) {
        if (ok) {
          setStatus("Cambios guardados y sincronizados globalmente.", false);
        } else {
          setStatus("Error: guardado local pero no se confirmo sincronizacion global.", true);
        }
      })
      .catch(function (error) {
        const reason = error && error.message ? " (" + error.message + ")" : "";
        state = window.SiteContentStore.save(updated);
        setStatus("Guardado local. Revisa conexion/configuracion de Supabase." + reason, true);
      });
  });

  window.SiteContentStore
    .loadRemote()
    .then(function (remoteState) {
      state = remoteState;
      refreshForm();
      if (window.SiteContentStore.isSupabaseEnabled()) {
        setStatus("Conectado a Supabase.", false);
      } else {
        setStatus("Modo local activo. Configura Supabase para cambios globales.", true);
      }
    })
    .catch(function (error) {
      const reason = error && error.message ? " (" + error.message + ")" : "";
      state = window.SiteContentStore.load();
      refreshForm();
      setStatus("No se pudo leer Supabase. Modo local activo." + reason, true);
    });
})();
