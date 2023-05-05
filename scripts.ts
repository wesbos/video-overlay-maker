import html2canvas from 'html2canvas';

const overlayEl = document.querySelector<HTMLDivElement>('.overlay');
const outputEl = document.querySelector<HTMLDivElement>('.output');
const wrap = document.querySelector<HTMLDivElement>('.wrap');
const generateButton = document.querySelector<HTMLButtonElement>('.generate');
const textarea = document.querySelector<HTMLButtonElement>('.controls textarea');
const h2 = document.querySelector<HTMLHeadingElement>('.text h2');
const sizeButtons = document.querySelectorAll<HTMLButtonElement>('.controls [data-width]');
const rangeInputs = document.querySelectorAll<HTMLInputElement>('.controls [type="range"]');

async function handleSnapshot() {
  if (!overlayEl || !outputEl || !wrap) return;
  // Take the preview class on
  wrap.classList.remove('preview');
  const canvas = await html2canvas(overlayEl, {
    backgroundColor: null,
  });
  const dataUrl = canvas.toDataURL('image/png');
  const html = /* html */ `
    <a href="${dataUrl}" download="${overlayEl?.textContent || 'thumbnail.png'}">
      <img src="${dataUrl}">
    </a>
    `;
  // make a dom fragment
  const frag = document.createRange().createContextualFragment(html);
  // append to output
  outputEl?.appendChild(frag);
  wrap?.classList.add('preview');
}

function handleTextareaInput() {
  if (!textarea || !h2 || !overlayEl) return;
  const text = textarea?.value;
  const lines = text
    ?.split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
    .map((line) => /* html */ `<mark>${line}</mark>`);

  h2.innerHTML = lines?.join('<br>') || '';
  // If there is only 1 line, add a class
  if (lines?.length === 1) {
    overlayEl?.classList.add('oneLiner');
  } else {
    overlayEl?.classList.remove('oneLiner');
  }
}

function handleSizeButtonClick(e: MouseEvent) {
  const target = e.currentTarget as HTMLButtonElement;
  const vars = Object.entries(target.dataset);
  vars.forEach(
    ([
      key,
      value,
    ]) => {
      if (!value) return;
      document.documentElement.style.setProperty(`--${key}`, value.toString());
      // If there are values bound to this variable. Update them
      const bound = document.querySelector(`[data-bind="--${key}"]`);
      if (bound) {
        bound.textContent = value.toString();
      }
    }
  );
}

function handleRangeInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const { value } = target;
  const { name } = target;
  const { unit } = target.dataset;
  document.documentElement.style.setProperty(`--${name}`, `${value}${unit || ''}`);
}

// Event Handlers
textarea?.addEventListener('input', handleTextareaInput);
sizeButtons.forEach((button) => button.addEventListener('click', handleSizeButtonClick));
rangeInputs.forEach((input) => input.addEventListener('input', handleRangeInput));
generateButton?.addEventListener('click', handleSnapshot);
handleTextareaInput();
