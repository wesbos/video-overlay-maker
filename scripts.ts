import { snapdom } from "@zumer/snapdom";

const overlayEl = document.querySelector<HTMLDivElement>(".overlay");
const outputEl = document.querySelector<HTMLDivElement>(".output");
const wrap = document.querySelector<HTMLDivElement>(".wrap");
const generateButton = document.querySelector<HTMLButtonElement>(".generate");
const textarea = document.querySelector<HTMLTextAreaElement>(".controls textarea");
const h2 = document.querySelector<HTMLHeadingElement>(".text h2");
const sizeButtons = document.querySelectorAll<HTMLButtonElement>(".controls [data-width]");
const rangeInputs = document.querySelectorAll<HTMLInputElement>('.controls [type="range"]');
const fitTextModeInput = document.querySelector<HTMLInputElement>('.controls [name="fitTextMode"]');

function randomGrit() {
  const randomX = Math.floor(Math.random() * 1000);
  const randomY = Math.floor(Math.random() * 1000);
  document.body.style.setProperty("--randomX", randomX.toString());
  document.body.style.setProperty("--randomY", randomY.toString());
}
// setInterval(randomGrit, 100);

function applyFitTextMode() {
  if (!h2) return;
  const marks = [...h2.querySelectorAll<HTMLElement>("mark")];
  if (!marks.length) return;
  marks.forEach((mark) => mark.style.removeProperty("font-size"));
  if (!fitTextModeInput?.checked) return;

  const widths = marks.map((mark) => mark.getBoundingClientRect().width);
  const largestWidth = Math.max(...widths);
  if (!largestWidth) return;

  marks.forEach((mark, index) => {
    const currentWidth = widths[index];
    if (!currentWidth || currentWidth >= largestWidth) return;
    const ratio = largestWidth / currentWidth;
    mark.style.fontSize = `${ratio}em`;
  });
}

async function handleSnapshot() {
  if (!overlayEl || !outputEl || !wrap) return;
  wrap.classList.remove("preview");
  try {
    const image = await snapdom.toPng(overlayEl);
    const dataUrl = image.src;
    image.style.removeProperty("width");
    image.style.removeProperty("height");
    image.removeAttribute("width");
    image.removeAttribute("height");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${overlayEl.textContent?.trim() || "thumbnail"}.png`;
    link.appendChild(image);
    outputEl.appendChild(link);
  } finally {
    wrap.classList.add("preview");
  }
}

function handleTextareaInput() {
  if (!textarea || !h2 || !overlayEl) return;
  const text = textarea?.value;
  const lines = text
    ?.split("\n")
    .map((line) => line.trim())
    .filter((line) => line)
    .map((line) => /* html */ `<mark>${line}</mark>`);

  h2.innerHTML = lines?.join("<br>") || "";
  // If there is only 1 line, add a class
  if (lines.length === 1 || lines.length === 1) {
    overlayEl?.classList.add("shortBoi");
  } else {
    overlayEl?.classList.remove("shortBoi");
  }
  applyFitTextMode();
}

function handleSizeButtonClick(e: MouseEvent) {
  const target = e.currentTarget as HTMLButtonElement;
  const vars = Object.entries(target.dataset);
  vars.forEach(([key, value]) => {
    if (!value) return;
    document.documentElement.style.setProperty(`--${key}`, value.toString());
    // If there are values bound to this variable. Update them
    const bound = document.querySelector(`[data-bind="--${key}"]`);
    if (bound) {
      bound.textContent = value.toString();
    }
  });
  applyFitTextMode();
}

function handleRangeInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const { value } = target;
  const { name } = target;
  const { unit } = target.dataset;
  document.documentElement.style.setProperty(`--${name}`, `${value}${unit || ""}`);
  applyFitTextMode();
}

// Event Handlers
textarea?.addEventListener("input", handleTextareaInput);
sizeButtons.forEach((button) => button.addEventListener("click", handleSizeButtonClick));
rangeInputs.forEach((input) => input.addEventListener("input", handleRangeInput));
generateButton?.addEventListener("click", handleSnapshot);
fitTextModeInput?.addEventListener("change", applyFitTextMode);
handleTextareaInput();
