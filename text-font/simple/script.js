/**
 * Simple Type Playground
 */

const fontStacks = {
  sans: {
    label: 'Sans',
    value: "'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  serif: {
    label: 'Serif',
    value: "Georgia, 'Times New Roman', serif"
  },
  mono: {
    label: 'Mono',
    value: "'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
  },
  display: {
    label: 'Display',
    value: "'Trebuchet MS', 'Gill Sans', system-ui, sans-serif"
  }
};

const defaults = {
  family: 'sans',
  size: 40,
  weight: 600,
  lineHeight: 1.25,
  letterSpacing: 0,
  measure: 54,
  italic: false,
  uppercase: false,
  text: `文字のリズムを整える。
Typography makes interfaces feel calm, sharp, and readable.
0123456789 / UI Lab`
};

const state = { ...defaults };

const elements = {
  fontButtons: [...document.querySelectorAll('.font-option')],
  sampleText: document.querySelector('#sampleText'),
  fontSize: document.querySelector('#fontSize'),
  fontWeight: document.querySelector('#fontWeight'),
  lineHeight: document.querySelector('#lineHeight'),
  letterSpacing: document.querySelector('#letterSpacing'),
  measure: document.querySelector('#measure'),
  italicToggle: document.querySelector('#italicToggle'),
  uppercaseToggle: document.querySelector('#uppercaseToggle'),
  previewText: document.querySelector('#previewText'),
  currentFont: document.querySelector('#currentFont'),
  currentMetrics: document.querySelector('#currentMetrics'),
  cssOutput: document.querySelector('#cssOutput'),
  copyButton: document.querySelector('#copyButton'),
  copyStatus: document.querySelector('#copyStatus'),
  resetButton: document.querySelector('#resetButton'),
  fontSizeValue: document.querySelector('#fontSizeValue'),
  fontWeightValue: document.querySelector('#fontWeightValue'),
  lineHeightValue: document.querySelector('#lineHeightValue'),
  letterSpacingValue: document.querySelector('#letterSpacingValue'),
  measureValue: document.querySelector('#measureValue')
};

function syncInputs() {
  elements.sampleText.value = state.text;
  elements.fontSize.value = state.size;
  elements.fontWeight.value = state.weight;
  elements.lineHeight.value = state.lineHeight;
  elements.letterSpacing.value = state.letterSpacing;
  elements.measure.value = state.measure;
  elements.italicToggle.checked = state.italic;
  elements.uppercaseToggle.checked = state.uppercase;
}

function formatTracking(value) {
  const rounded = Number(value).toFixed(1).replace(/\.0$/, '');
  return `${rounded}px`;
}

function getCssSnippet() {
  const font = fontStacks[state.family];
  const fontStyle = state.italic ? 'italic' : 'normal';
  const textTransform = state.uppercase ? 'uppercase' : 'none';

  return `.type-sample {
  font-family: ${font.value};
  font-size: ${state.size}px;
  font-weight: ${state.weight};
  font-style: ${fontStyle};
  line-height: ${Number(state.lineHeight).toFixed(2)};
  letter-spacing: ${formatTracking(state.letterSpacing)};
  max-width: ${state.measure}ch;
  text-transform: ${textTransform};
}`;
}

function render() {
  const font = fontStacks[state.family];

  elements.fontButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.font === state.family);
  });

  elements.previewText.textContent = state.text;
  elements.previewText.style.fontFamily = font.value;
  elements.previewText.style.fontSize = `${state.size}px`;
  elements.previewText.style.fontWeight = state.weight;
  elements.previewText.style.lineHeight = state.lineHeight;
  elements.previewText.style.letterSpacing = formatTracking(state.letterSpacing);
  elements.previewText.style.maxWidth = `${state.measure}ch`;
  elements.previewText.style.fontStyle = state.italic ? 'italic' : 'normal';
  elements.previewText.style.textTransform = state.uppercase ? 'uppercase' : 'none';

  elements.fontSizeValue.textContent = `${state.size}px`;
  elements.fontWeightValue.textContent = state.weight;
  elements.lineHeightValue.textContent = Number(state.lineHeight).toFixed(2);
  elements.letterSpacingValue.textContent = formatTracking(state.letterSpacing);
  elements.measureValue.textContent = `${state.measure}ch`;

  elements.currentFont.textContent = font.label;
  elements.currentMetrics.textContent = `${state.size}px / ${state.weight} / ${Number(state.lineHeight).toFixed(2)}`;
  elements.cssOutput.textContent = getCssSnippet();
}

function updateNumber(key, value) {
  state[key] = Number(value);
  elements.copyStatus.textContent = '';
  render();
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
  return Promise.resolve();
}

elements.fontButtons.forEach((button) => {
  button.addEventListener('click', () => {
    state.family = button.dataset.font;
    elements.copyStatus.textContent = '';
    render();
  });
});

elements.sampleText.addEventListener('input', (event) => {
  state.text = event.target.value;
  elements.copyStatus.textContent = '';
  render();
});

elements.fontSize.addEventListener('input', (event) => updateNumber('size', event.target.value));
elements.fontWeight.addEventListener('input', (event) => updateNumber('weight', event.target.value));
elements.lineHeight.addEventListener('input', (event) => updateNumber('lineHeight', event.target.value));
elements.letterSpacing.addEventListener('input', (event) => updateNumber('letterSpacing', event.target.value));
elements.measure.addEventListener('input', (event) => updateNumber('measure', event.target.value));

elements.italicToggle.addEventListener('change', (event) => {
  state.italic = event.target.checked;
  elements.copyStatus.textContent = '';
  render();
});

elements.uppercaseToggle.addEventListener('change', (event) => {
  state.uppercase = event.target.checked;
  elements.copyStatus.textContent = '';
  render();
});

elements.resetButton.addEventListener('click', () => {
  Object.assign(state, defaults);
  syncInputs();
  elements.copyStatus.textContent = '';
  render();
});

elements.copyButton.addEventListener('click', async () => {
  await copyText(elements.cssOutput.textContent);
  elements.copyStatus.textContent = 'Copied';
  window.setTimeout(() => {
    elements.copyStatus.textContent = '';
  }, 1600);
});

syncInputs();
render();
