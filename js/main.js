"use strict";

const WA_NUMBER = "962796012687";
const $ = (id) => document.getElementById(id);
const languageOptions = {
  ar: ["تدريب الخيل", "إيواء الخيل", "منتجات الألبان", "البقالة", "جلسة تصوير", "الكوخ"],
  en: ["Horse training", "Horse boarding", "Dairy products", "Farm grocery", "Photo session", "Cabin rental"]
};

function language() {
  return document.documentElement.lang === "en" ? "en" : "ar";
}

function localizeImageText() {
  document.querySelectorAll("img[data-alt-ar][data-alt-en]").forEach((image) => {
    image.alt = image.dataset["alt" + (language() === "ar" ? "Ar" : "En")];
    if (image.getAttribute("role") === "button") image.setAttribute("aria-label", image.alt);
  });
}

function setLanguage(nextLanguage) {
  const lang = nextLanguage === "en" ? "en" : "ar";
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.title = lang === "ar"
    ? "Green Reef Farm | مزرعة الخيول والمنتجات البلدية"
    : "Green Reef Farm | Horses and farm products";

  const nav = $("nav");
  nav.setAttribute("aria-label", lang === "ar" ? "التنقل الرئيسي" : "Main navigation");
  $("x").setAttribute("aria-label", lang === "ar" ? "إغلاق" : "Close");
  $("ov").setAttribute("aria-label", lang === "ar" ? "عارض الصور" : "Photo viewer");
  $("floating-wa").setAttribute("aria-label", lang === "ar"
    ? "تواصل مع المزرعة عبر واتساب"
    : "Contact Green Reef Farm on WhatsApp");

  const topic = $("t");
  topic.placeholder = lang === "ar" ? "مثلاً: إيواء حصان، جبنة" : "e.g. horse boarding, cheese";
  $("m").placeholder = lang === "ar" ? "اكتب رسالتك هنا" : "Write your message here";
  $("opts").replaceChildren(...languageOptions[lang].map((option) => {
    const element = document.createElement("option");
    element.value = option;
    return element;
  }));

  document.querySelector('meta[name="description"]').content = lang === "ar"
    ? "إسطبل لرعاية الخيل وتدريبها، وكوخ للإقامة، وجلسات تصوير، ومنتجات طازجة من المزرعة."
    : "Horse boarding and training, cabin stays, photo sessions, and fresh products from Green Reef Farm.";
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[name="twitter:title"]').content = document.title;
  document.querySelector('meta[property="og:description"]').content = lang === "ar"
    ? "إسطبل لرعاية الخيل وتدريبها، ومنتجات طازجة من مزرعتنا إلى بيتك."
    : "A stable for horse care and training. Fresh products from our farm to your home.";
  document.querySelector('meta[name="twitter:description"]').content =
    document.querySelector('meta[property="og:description"]').content;
  document.querySelector('meta[property="og:locale"]').content = lang === "ar" ? "ar_JO" : "en_US";
  document.querySelector('meta[property="og:locale:alternate"]').content = lang === "ar" ? "en_US" : "ar_JO";

  localizeImageText();
  document.querySelectorAll(".gallery-nav").forEach((button) => {
    button.setAttribute("aria-label", button.classList.contains("gallery-prev")
      ? (lang === "ar" ? "الصورة السابقة" : "Previous photo")
      : (lang === "ar" ? "الصورة التالية" : "Next photo"));
  });
  document.querySelectorAll("[data-whatsapp='greeting']").forEach((link) => {
    link.href = getWhatsAppUrl(greetingMessage());
  });
  $("photo-book").href = getWhatsAppUrl(lang === "ar"
    ? "مرحباً، أود حجز جلسة تصوير في المزرعة."
    : "Hello, I would like to book a photo session at the farm.");
  try {
    localStorage.setItem("lang", lang);
  } catch (error) {
    console.warn("Could not save the selected language.", error);
  }
  updateCabinBooking();
}

function getWhatsAppUrl(message) {
  return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(message);
}

function greetingMessage() {
  return language() === "ar"
    ? "مرحباً، أود الاستفسار عن مزرعة Green Reef Farm."
    : "Hello, I would like to ask about Green Reef Farm.";
}

function markProductCards() {
  document.querySelectorAll("#products .card, #shop .card").forEach((card) => {
    if (!card.querySelector("img") || card.querySelector(".product-stamp")) return;
    const stamp = document.createElement("span");
    stamp.className = "product-stamp";
    stamp.innerHTML = '<span class="a">من مزرعتنا</span><span class="e">From our farm</span>';
    card.prepend(stamp);
  });
}

function updateCabinBooking() {
  const nightsInput = $("nights");
  const guestsInput = $("guests");
  const totalOutput = $("cabin-total");
  if (!nightsInput || !guestsInput || !totalOutput) return;

  const nights = Number(nightsInput.value);
  const guests = Number(guestsInput.value);
  const error = $("booking-error");
  const validNights = Number.isInteger(nights) && nights >= 1 && nights <= 30;
  const validGuests = Number.isInteger(guests) && guests >= 1 && guests <= 8;
  const lang = language();
  const cabinBook = $("cabin-book");
  const stickyBook = $("sticky-booking").querySelector("a");

  if (!validNights || !validGuests) {
    error.textContent = !validNights
      ? (lang === "ar" ? "يرجى اختيار مدة من ليلة واحدة إلى 30 ليلة." : "Choose a stay from 1 to 30 nights.")
      : (lang === "ar" ? "الحد الأقصى للإقامة هو 8 ضيوف." : "The cabin accommodates a maximum of 8 guests.");
    totalOutput.textContent = "—";
    cabinBook.setAttribute("aria-disabled", "true");
    cabinBook.removeAttribute("href");
    stickyBook.setAttribute("aria-disabled", "true");
    stickyBook.removeAttribute("href");
    return;
  }

  error.textContent = "";
  const total = Math.floor(nights / 7) * 550 + Math.min((nights % 7) * 110, 550);
  totalOutput.textContent = new Intl.NumberFormat(lang).format(total);
  const mealText = $("meals").checked
    ? (lang === "ar" ? "مع فطور وغداء (السعر حسب الطلب)" : "Breakfast and lunch requested (price on request)")
    : (lang === "ar" ? "بدون وجبات إضافية" : "No additional meals");
  const nightDescription = lang === "ar"
    ? (nights === 1 ? "ليلة واحدة" : nights === 2 ? "ليلتين" : nights <= 10 ? nights + " ليالٍ" : nights + " ليلة")
    : nights + (nights === 1 ? " night" : " nights");
  const guestDescription = lang === "ar"
    ? (guests === 1 ? "ضيف واحد" : guests === 2 ? "ضيفين" : guests + " ضيوف")
    : guests + (guests === 1 ? " guest" : " guests");
  const bookingText = lang === "ar"
    ? "مرحباً، أود طلب حجز الكوخ لمدة " + nightDescription + " لعدد " + guestDescription + ". الوجبات: " + mealText + ". الإجمالي: " + total + " دينار أردني، دون سعر الوجبات الإضافية."
    : "Hello, I would like to request a cabin booking for " + nightDescription + " for " + guestDescription + ". Meals: " + mealText + ". Total: " + total + " JOD, excluding any meal add-on.";
  cabinBook.href = getWhatsAppUrl(bookingText);
  cabinBook.removeAttribute("aria-disabled");
  stickyBook.href = "#booking-title";
  stickyBook.removeAttribute("aria-disabled");
}

function route() {
  const requested = (window.location.hash || "#home").slice(1);
  const page = $(requested) && $("" + requested).classList.contains("page") ? requested : "home";
  document.querySelectorAll(".page").forEach((section) => {
    section.classList.toggle("on", section.id === page);
  });
  document.querySelectorAll("#nav a").forEach((link) => {
    link.classList.toggle("on", link.getAttribute("href") === "#" + page);
  });
  document.body.classList.toggle("is-cabin", page === "cabin");
  document.body.classList.toggle("is-contact", page === "contact");
  $("sticky-booking").hidden = page !== "cabin";

  if (page === "cabin") {
    const video = $("cv");
    if (!video.getAttribute("src")) video.src = "assets/cabin.mp4";
  }
  window.scrollTo(0, 0);
  updateCabinBooking();
  window.setTimeout(observeVisibleSections, 20);
}

let lastFocusedElement = null;
function openOverlay(element) {
  const isCabinPhoto = element.matches("#cabin .gal img.gz");
  lastFocusedElement = element;
  const box = $("bx");
  box.className = "box";

  if (isCabinPhoto) {
    const photos = Array.from(document.querySelectorAll("#cabin .gal img.gz"));
    window.cabinPhotoIndex = photos.indexOf(element);
    box.classList.add("photo-viewer");
    box.innerHTML = '<button class="gallery-nav gallery-prev" type="button" aria-label="Previous photo">‹</button><img class="gz" alt=""><button class="gallery-nav gallery-next" type="button" aria-label="Next photo">›</button>';
    showCabinPhoto(window.cabinPhotoIndex);
    setLanguage(language());
  } else {
    const copy = element.cloneNode(true);
    copy.removeAttribute("tabindex");
    box.innerHTML = element.tagName === "IMG"
      ? '<img class="gz" src="' + element.currentSrc + '" alt="' + element.alt.replace(/"/g, "&quot;") + '">'
      : copy.innerHTML;
  }

  $("ov").classList.add("on");
  $("x").focus();
}

function showCabinPhoto(index) {
  const photos = document.querySelectorAll("#cabin .gal img.gz");
  if (!photos.length) return;
  window.cabinPhotoIndex = (index + photos.length) % photos.length;
  const photo = photos[window.cabinPhotoIndex];
  const image = $("bx").querySelector("img");
  image.src = photo.currentSrc || photo.src;
  image.alt = photo.alt;
}

function closeOverlay() {
  $("ov").classList.remove("on");
  if (lastFocusedElement && lastFocusedElement.isConnected) lastFocusedElement.focus();
  lastFocusedElement = null;
}

let sectionObserver = null;
function observeVisibleSections() {
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    return;
  }
  if (!sectionObserver) {
    sectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
  }
  document.querySelectorAll(".page.on .wrap.reveal, .page.on .reveal:not(.is-visible)").forEach((element) => {
    sectionObserver.observe(element);
  });
}

document.querySelectorAll(".page .wrap").forEach((element) => element.classList.add("reveal"));
document.querySelectorAll("img.zoom, img.gz, img.pimg, .dairy-photos img, .gallery-photo").forEach((image) => {
  if (image.closest("a, .card")) return;
  image.tabIndex = 0;
  image.setAttribute("role", "button");
  image.setAttribute("aria-haspopup", "dialog");
});
markProductCards();

let savedLanguage = "ar";
try {
  savedLanguage = localStorage.getItem("lang") || "ar";
} catch (error) {
  console.warn("Could not read the saved language.", error);
}
setLanguage(savedLanguage);
$("lang").addEventListener("click", () => setLanguage(language() === "ar" ? "en" : "ar"));

["nights", "guests", "meals"].forEach((id) => {
  $(id).addEventListener("input", updateCabinBooking);
  $(id).addEventListener("change", updateCabinBooking);
});

$("f").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!$("f").reportValidity()) return;
  const lang = language();
  const topic = $("t").value.trim();
  const message = $("m").value.trim();
  const text = lang === "ar"
    ? "مرحباً، أنا " + $("n").value.trim() + ". أريد الاستفسار عن: " + topic + "\n" + message
    : "Hello, I am " + $("n").value.trim() + ". I would like to ask about: " + topic + "\n" + message;
  window.open(getWhatsAppUrl(text), "_blank", "noopener,noreferrer");
});

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;
  if ($("ov").classList.contains("on")) {
    if (target === $("ov") || target.closest("#x")) closeOverlay();
    else if (target.closest(".gallery-prev")) showCabinPhoto(window.cabinPhotoIndex - 1);
    else if (target.closest(".gallery-next")) showCabinPhoto(window.cabinPhotoIndex + 1);
    else if ($("bx").classList.contains("photo-viewer") && !target.closest("img")) closeOverlay();
    return;
  }

  const disabledBookingLink = target.closest("#cabin-book[aria-disabled='true'], #sticky-booking a[aria-disabled='true']");
  if (disabledBookingLink) {
    event.preventDefault();
    $("booking-error").focus();
    return;
  }

  const routeLink = target.closest("[data-route]");
  if (routeLink) {
    event.preventDefault();
    window.location.hash = routeLink.dataset.route;
    return;
  }
  const card = target.closest(".card");
  if (card && !target.closest("a")) {
    openOverlay(card);
    return;
  }
  const image = target.closest("img.zoom, img.gz, img.pimg, .dairy-photos img, .gallery-photo");
  if (image && !target.closest("a")) openOverlay(image);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && $("ov").classList.contains("on")) closeOverlay();
  const target = event.target instanceof Element ? event.target : null;
  const routeLink = target ? target.closest("[data-route][role='link']") : null;
  if (routeLink && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    window.location.hash = routeLink.dataset.route;
    return;
  }
  const image = target && target.matches("img.zoom, img.gz, img.pimg, .dairy-photos img, .gallery-photo")
    && !target.closest("a, .card") ? target : null;
  if (image && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openOverlay(image);
    return;
  }
  const card = target ? target.closest(".card[tabindex='0']:not([data-route])") : null;
  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openOverlay(card);
    return;
  }
  if (!$("ov").classList.contains("on") || !$("bx").classList.contains("photo-viewer")) return;
  if (event.key === "ArrowLeft") showCabinPhoto(window.cabinPhotoIndex - 1);
  if (event.key === "ArrowRight") showCabinPhoto(window.cabinPhotoIndex + 1);
});

$("bx").addEventListener("touchstart", (event) => {
  if ($("bx").classList.contains("photo-viewer")) window.cabinTouchX = event.changedTouches[0].clientX;
}, { passive: true });
$("bx").addEventListener("touchend", (event) => {
  if (!$("bx").classList.contains("photo-viewer") || window.cabinTouchX === undefined) return;
  const distance = event.changedTouches[0].clientX - window.cabinTouchX;
  if (Math.abs(distance) > 45) showCabinPhoto(window.cabinPhotoIndex + (distance < 0 ? 1 : -1));
  window.cabinTouchX = undefined;
}, { passive: true });

window.addEventListener("hashchange", route);
route();
