const locationButton = document.getElementById("locationBtn");
const locationMessage = document.getElementById("locationMessage");
const menuToggle = document.getElementById("menuToggle");
const mainMenu = document.getElementById("mainMenu");

if (menuToggle && mainMenu) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));

    if (isExpanded) {
      mainMenu.setAttribute("hidden", "");
    } else {
      mainMenu.removeAttribute("hidden");
    }
  });

  mainMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      mainMenu.setAttribute("hidden", "");
    });
  });
}

if (locationButton && locationMessage) {
  locationButton.addEventListener("click", () => {
    const isHidden = locationMessage.hasAttribute("hidden");

    if (isHidden) {
      locationMessage.removeAttribute("hidden");
      locationButton.textContent = "Hide Location";
    } else {
      locationMessage.setAttribute("hidden", "");
      locationButton.textContent = "Find Our Location";
    }
  });
}

const whatsappLink = document.getElementById("whatsappLink");
if (whatsappLink) {
  const defaultWhatsAppText =
    "Hello! i just saw your Collection on Your Website and i'd love to get some more details on your latest arrivals.Could you help me?";
  const baseUrl = whatsappLink.getAttribute("href") || "";
  if (baseUrl) {
    const separator = baseUrl.includes("?") ? "&" : "?";
    whatsappLink.setAttribute(
      "href",
      `${baseUrl}${separator}text=${encodeURIComponent(defaultWhatsAppText)}`,
    );
  }
}

const imageModal = document.getElementById("imageModal");
const imageModalImg = document.getElementById("imageModalImg");
const imageModalClose = document.getElementById("imageModalClose");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomResetBtn = document.getElementById("zoomResetBtn");
let modalScale = 1;
let modalTranslateX = 0;
let modalTranslateY = 0;
let pinchStartDistance = null;
let pinchStartScale = 1;
let panStartX = 0;
let panStartY = 0;
let panOriginX = 0;
let panOriginY = 0;

function applyModalZoom() {
  if (imageModalImg) {
    imageModalImg.style.transform = `translate(${modalTranslateX}px, ${modalTranslateY}px) scale(${modalScale})`;
  }
}

function resetModalTransform() {
  modalScale = 1;
  modalTranslateX = 0;
  modalTranslateY = 0;
  applyModalZoom();
}

function setModalScale(nextScale) {
  modalScale = Math.min(4, Math.max(1, nextScale));
  if (modalScale === 1) {
    modalTranslateX = 0;
    modalTranslateY = 0;
  }
  applyModalZoom();
}

function touchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function closeImageModal() {
  if (!imageModal) {
    return;
  }
  imageModal.setAttribute("hidden", "");
  imageModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  resetModalTransform();
}

function openImageModal(src, alt) {
  if (!imageModal || !imageModalImg) {
    return;
  }
  imageModalImg.setAttribute("src", src);
  imageModalImg.setAttribute("alt", alt || "Expanded product image");
  resetModalTransform();
  imageModal.removeAttribute("hidden");
  imageModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

if (imageModal && imageModalImg) {
  document.querySelectorAll(".carousel-image").forEach((image) => {
    image.addEventListener("click", () => {
      if (!image.classList.contains("active")) {
        return;
      }
      openImageModal(
        image.getAttribute("src") || "",
        image.getAttribute("alt") || "",
      );
    });
  });

  if (imageModalClose) {
    imageModalClose.addEventListener("click", closeImageModal);
  }

  imageModal.addEventListener("click", (event) => {
    if (event.target === imageModal) {
      closeImageModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !imageModal.hasAttribute("hidden")) {
      closeImageModal();
    }
  });

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => {
      setModalScale(modalScale + 0.25);
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => {
      setModalScale(modalScale - 0.25);
    });
  }

  if (zoomResetBtn) {
    zoomResetBtn.addEventListener("click", () => {
      resetModalTransform();
    });
  }

  imageModalImg.addEventListener("dblclick", () => {
    setModalScale(modalScale > 1 ? 1 : 2);
  });

  imageModalImg.addEventListener("touchstart", (event) => {
    if (event.touches.length === 2) {
      pinchStartDistance = touchDistance(event.touches);
      pinchStartScale = modalScale;
      return;
    }

    if (event.touches.length === 1 && modalScale > 1) {
      panStartX = event.touches[0].clientX;
      panStartY = event.touches[0].clientY;
      panOriginX = modalTranslateX;
      panOriginY = modalTranslateY;
    }
  });

  imageModalImg.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length === 2 && pinchStartDistance) {
        event.preventDefault();
        const currentDistance = touchDistance(event.touches);
        const zoomRatio = currentDistance / pinchStartDistance;
        setModalScale(pinchStartScale * zoomRatio);
        return;
      }

      if (event.touches.length === 1 && modalScale > 1) {
        event.preventDefault();
        const dx = event.touches[0].clientX - panStartX;
        const dy = event.touches[0].clientY - panStartY;
        modalTranslateX = panOriginX + dx;
        modalTranslateY = panOriginY + dy;
        applyModalZoom();
      }
    },
    { passive: false },
  );

  imageModalImg.addEventListener("touchend", () => {
    if (pinchStartDistance && modalScale <= 1.05) {
      resetModalTransform();
    }
    pinchStartDistance = null;
  });
}

// Product carousel functionality
const carousels = document.querySelectorAll(".carousel");
const carouselStates = Array.from(carousels).map(() => 0);

function stepCarousel(carouselIndex, step) {
  const carousel = carousels[carouselIndex];
  if (!carousel) {
    return;
  }

  const images = carousel.querySelectorAll(".carousel-image");
  const totalImages = images.length;
  if (!totalImages) {
    return;
  }

  carouselStates[carouselIndex] =
    (carouselStates[carouselIndex] + step + totalImages) % totalImages;

  images.forEach((img) => img.classList.remove("active"));
  images[carouselStates[carouselIndex]].classList.add("active");

  const current = carousel.querySelector(".carousel-current");
  if (current) {
    current.textContent = carouselStates[carouselIndex] + 1;
  }
}

document.querySelectorAll(".carousel-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const carouselIndex = parseInt(btn.dataset.carousel);
    const isNext = btn.classList.contains("carousel-next");
    stepCarousel(carouselIndex, isNext ? 1 : -1);
  });
});

carousels.forEach((carousel, index) => {
  const imageArea = carousel.querySelector(".carousel-images");
  if (!imageArea) {
    return;
  }

  let swipeStartX = 0;
  let swipeStartY = 0;

  imageArea.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1) {
      return;
    }
    swipeStartX = event.touches[0].clientX;
    swipeStartY = event.touches[0].clientY;
  });

  imageArea.addEventListener("touchend", (event) => {
    if (event.changedTouches.length !== 1) {
      return;
    }
    const dx = event.changedTouches[0].clientX - swipeStartX;
    const dy = event.changedTouches[0].clientY - swipeStartY;

    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) {
      return;
    }

    stepCarousel(index, dx < 0 ? 1 : -1);
  });
});

const revealItems = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${index * 80}ms`;
  observer.observe(item);
});
