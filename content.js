const CAPTION_PATTERNS = [
  /写真はイメージです/,
  /画像はイメージです/,
  /AI-generatedillustration/i,
  /GettyImages/i,
  /Unsplash/i,
  /AI-generatedimage/i
];

const CAPTION_SELECTORS = [
  ".caption",
  "figcaption",
];

const DONE_ATTR = "data-img-reveal-done";

function isCaption(el) {
  const text = (el.textContent || "").replace(/\s+/g, "");
  return CAPTION_PATTERNS.some((re) => re.test(text));
}

// Find image: try preceding siblings first, then fallback to closest figure
function findImageNearCaption(captionEl) {
  let node = captionEl.previousElementSibling;
  while (node) {
    if (node.tagName === "IMG") return node;
    if (node.querySelector) {
      const img = node.querySelector("img");
      if (img) return img;
    }
    node = node.previousElementSibling;
  }

  const figure = captionEl.closest("figure");
  if (figure) {
    const img = figure.querySelector("img");
    if (img) return img;
  }

  return null;
}

// Hide image and insert reveal button
function hideImageWithButton(img, label) {
  if (img.hasAttribute(DONE_ATTR)) return;
  img.setAttribute(DONE_ATTR, "1");
  img.style.display = "none";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label || "画像を表示";
  button.style.cssText =
    "display:inline-block;padding:8px 16px;border:1px solid #999;" +
    "border-radius:4px;background:#f5f5f5;color:#333;" +
    "font-size:14px;cursor:pointer;";

  button.addEventListener("click", () => {
    img.style.display = "";
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
    el.style.display = "none";
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
