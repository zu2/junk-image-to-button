// Hide "stock photo" captions + their images, replace with a reveal button.

const CAPTION_PATTERNS = [
  /写真はイメージです/,
  /画像はイメージです/,
  /AI-generatedillustration/i,
  /GettyImages/i,
  /Unsplash/i,
  /AI-generatedimage/i,
  /iStock\.com/i,
  /（イメージ）/i,
  /stock\.adobe\.com/i,
];

// Matches .caption, figcaption, .story-media-caption, .photo-caption, etc.
const CAPTION_SELECTORS = [
  "figcaption",
  '[class*="caption"]',
  "img + .source",
  "figure",
];

const DONE_ATTR = "data-img-reveal-done";
const originalDisplays = new WeakMap();

function isCaption(el) {
  const text = (el.textContent || "").replace(/\s+/g, "");
  return CAPTION_PATTERNS.some((re) => re.test(text));
}

// Find image: try preceding siblings first, then fallback to closest figure
function findImageNearCaption(captionEl) {
  if (captionEl.tagName === "FIGURE") {
    return captionEl.querySelector("img");
  }
  const figure = captionEl.closest("figure");
  if (figure) {
    return figure.querySelector("img");
  }
  let node = captionEl.previousElementSibling;
  while (node) {
    if (node.tagName === "IMG") return node;
    const imgs = node.querySelectorAll ? node.querySelectorAll("img") : [];
    if (imgs.length === 1) return imgs[0];
    node = node.previousElementSibling;
  }
  return null;
}

function hideElement(el) {
  originalDisplays.set(el, el.style.display);
  el.style.display = "none";
}

// Hide image and insert reveal button
function hideImageWithButton(img, label) {
  if (img.hasAttribute(DONE_ATTR)) return;
  img.setAttribute(DONE_ATTR, "1");
  originalDisplays.set(img, img.style.display);
  img.style.display = "none";
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label || "画像を表示";
  button.style.cssText =
    "display:inline-block;padding:8px 16px;border:1px solid #999;" +
    "border-radius:4px;background:#f5f5f5;color:#333;" +
    "font-size:14px;cursor:pointer;";
  button.addEventListener("click", (e) => {
    e.preventDefault();
	e.stopPropagation();
    const display = originalDisplays.get(img);
    if (display !== undefined) {
      img.style.display = display;
    }
    button.remove();
  });
  img.after(button);
}

// Main runner
function run() {
  document.querySelectorAll(CAPTION_SELECTORS.join(",")).forEach((el) => {
    if (!isCaption(el)) return;
    const img = findImageNearCaption(el);
    if (!img) return;
    const label = (el.textContent || "").trim();
    hideImageWithButton(img, label);
    if (el.tagName !== "FIGURE") {
      hideElement(el);
    }
  });
}

run();

// Observe DOM changes for dynamic content
const observer = new MutationObserver(() => {
  clearTimeout(observer._t);
  observer._t = setTimeout(run, 150);
});
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});
