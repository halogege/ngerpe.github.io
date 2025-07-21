const separatorSelect = document.getElementById('separator');
const doubleSeparatorSelect = document.getElementById('doubleSeparator');
const doubleSpacingSelect = document.getElementById('doubleSpacing');
const inputTextArea = document.getElementById('inputText');
const outputDiv = document.getElementById('output');
const customSeparatorInput = document.getElementById('customSeparator');
const customSeparatorDiv = document.getElementById('customSeparatorDiv');
const wordCharCount = document.getElementById('counter');
const specialCharFormatSelect = document.getElementById('specialCharFormat');
const specialCharFormatLabel = document.querySelector('label[for="specialCharFormat"]');

const SINGLE_SPACE_CHAR = "ᅠ";

const singleSeparators = [
  { value: "none", label: "(N/A)", prefix: '', suffix: '' },
  { value: ">", label: "... text >", prefix: '', suffix: '>' },
  { value: "+", label: "... text +", prefix: '', suffix: '+' },
  { value: "—", label: "... text —", prefix: '', suffix: '—' },
  { value: "&&.", label: "... text &&.", prefix: '', suffix: '&&.' },
  { value: "(+)", label: "... text (+)", prefix: '', suffix: '(+)' },
  { value: "(...)", label: "... text (...)", prefix: '', suffix: '(...)' },
  { value: SINGLE_SPACE_CHAR, label: "... text ᅠ(blank space)", prefix: '', suffix: SINGLE_SPACE_CHAR },
  { value: "custom", label: "Pilih Sendiri", prefix: '', suffix: '' }
];

const doubleSeparators = [
  { value: "none", label: "(N/A)", prefix: '', suffix: '' },
  { value: "<>", label: "< text >", prefix: '<', suffix: '>' },
  { value: "++", label: "+ text +", prefix: '+', suffix: '+' },
  { value: "—", label: "— text —", prefix: '—', suffix: '—' },
  { value: "&&.", label: "&&. text &&.", prefix: '&&.', suffix: '&&.' },
  { value: "(...)", label: "(...) text (...)", prefix: '(...)', suffix: '(...)' },
  { value: SINGLE_SPACE_CHAR, label: "ᅠ text ᅠ(blank space)", prefix: SINGLE_SPACE_CHAR, suffix: SINGLE_SPACE_CHAR },
  { value: "custom", label: "Pilih Sendiri", prefix: '', suffix: '' }
];

function createToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message) {
  const container = createToastContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, 2000);
}

function populateSeparatorOptions(list) {
  separatorSelect.innerHTML = '';
  list.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    option.dataset.prefix = opt.prefix || '';
    option.dataset.suffix = opt.suffix || '';
    separatorSelect.appendChild(option);
  });
  toggleCustomSeparator();
}

function toggleCustomSeparator() {
  customSeparatorDiv.style.display = separatorSelect.value === 'custom' ? 'block' : 'none';
}

function toggleSpecialCharFormatVisibility() {
  const isDouble = doubleSeparatorSelect.value === 'yes';
  const isDoubleSpacing = doubleSpacingSelect.value === 'yes';
  const isSpecialSeparator = separatorSelect.value === SINGLE_SPACE_CHAR;

  if (isDouble && isDoubleSpacing && isSpecialSeparator) {
    specialCharFormatLabel.style.display = 'block';
    specialCharFormatSelect.style.display = 'block';
  } else {
    specialCharFormatLabel.style.display = 'none';
    specialCharFormatSelect.style.display = 'none';
  }
}

function updateCounters() {
  const text = inputTextArea.value.trim();
  const words = text ? text.split(/\s+/).filter(w => w.length > 0) : [];
  wordCharCount.textContent = `Kata: ${words.length} | Karakter: ${text.length}`;
}

function splitTweets() {
  updateCounters();

  const inputText = inputTextArea.value.trim();
  if (!inputText) {
    outputDiv.innerHTML = '';
    return [];
  }

  const isDouble = doubleSeparatorSelect.value === 'yes';

  const maxLength = 280;
  // split by space but keep spaces as tokens (to preserve spacing)
  const words = inputText.split(/(\s+)/);
  const chunks = [];
  let currentChunk = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const tentative = currentChunk + word;
    // estimation length without prefix/suffix because added on render/copy
    const estimatedLength = tentative.length + (isDouble ? 0 : 1) + 10; // safe margin

    if (estimatedLength > maxLength) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trimEnd());
      }
      currentChunk = /^\s+$/.test(word) ? '' : word;
    } else {
      currentChunk = tentative;
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trimEnd());
  }
  return chunks;
}

function renderTweets({ chunks, prefix, suffix, isDouble, isDoubleSpacing, specialCharFormat }) {
  outputDiv.innerHTML = '';

  chunks.forEach((chunk, index) => {
    const isFirst = index === 0;
    const isLast = index === chunks.length - 1;
    let displayText = '';

    const isSpecialChar = prefix === SINGLE_SPACE_CHAR && suffix === SINGLE_SPACE_CHAR;

    if (isDouble && isDoubleSpacing && isSpecialChar) {
      if (specialCharFormat === 1) {
        // Format 1: prefix in first line, text, suffix in last line, no extra newlines before/after prefix/suffix
        displayText = `${prefix}\n${chunk}\n${suffix}`;
      } else if (specialCharFormat === 2) {
        // Format 2: newline before prefix and after suffix too
        displayText = `${prefix}\n\n${chunk}\n\n${suffix}`;
      }
    } else if (isDouble && isDoubleSpacing) {
      if (isFirst) {
        displayText = `${chunk}\n\n${suffix}`;
      } else if (isLast) {
        displayText = `${prefix}\n\n${chunk}`;
      } else {
        displayText = `${prefix}\n\n${chunk}\n\n${suffix}`;
      }
    } else if (isDouble) {
      if (isFirst) {
        displayText = `${chunk} ${suffix}`;
      } else if (isLast) {
        displayText = `${prefix} ${chunk}`;
      } else {
        displayText = `${prefix} ${chunk} ${suffix}`;
      }
    } else {
      displayText = !isLast ? `${chunk} ${suffix}` : chunk;
    }

    const container = document.createElement('div');
    container.className = 'tweet-box';

    const label = document.createElement('div');
    label.className = 'tweet-label';
    label.textContent = `Tweet ${index + 1} / ${chunks.length}`;
    label.style.fontWeight = 'bold';
    label.style.marginBottom = '6px';
    label.style.fontSize = '13px';

    const content = document.createElement('div');
    content.textContent = displayText;
    content.title = 'Klik untuk salin ke clipboard';
    content.style.cursor = 'pointer';

    content.addEventListener('click', () => {
      let copyText = '';

      if (isDouble && isDoubleSpacing && isSpecialChar) {
        if (specialCharFormat === 1) {
          copyText = `${prefix}\n${chunk}\n${suffix}`;
        } else if (specialCharFormat === 2) {
          copyText = `${prefix}\n\n${chunk}\n\n${suffix}`;
        }
      } else if (isDouble && isDoubleSpacing) {
        if (isFirst) {
          copyText = `${chunk}\n\n${suffix}`;
        } else if (isLast) {
          copyText = `${prefix}\n\n${chunk}`;
        } else {
          copyText = `${prefix}\n\n${chunk}\n\n${suffix}`;
        }
      } else if (isDouble) {
        if (isFirst) {
          copyText = `${chunk} ${suffix}`;
        } else if (isLast) {
          copyText = `${prefix} ${chunk}`;
        } else {
          copyText = `${prefix} ${chunk} ${suffix}`;
        }
      } else {
        copyText = !isLast ? `${chunk} ${suffix}` : chunk;
      }

  navigator.clipboard.writeText(copyText).then(() => {
    content.classList.add('copied');
    showToast(`Tweet ${index + 1} of ${chunks.length} copied!`);
    setTimeout(() => content.classList.remove('copied'), 2000);
  }).catch(() => {
    showToast('Failed to copy to clipboard');
      });
    });

    container.appendChild(label);
    container.appendChild(content);
    outputDiv.appendChild(container);
  });
}

function splitTweetsAndRender() {
  const isDouble = doubleSeparatorSelect.value === 'yes';
  const isDoubleSpacing = doubleSpacingSelect.value === 'yes';
  const specialCharFormat = Number(specialCharFormatSelect.value);

  const selectedOption = separatorSelect.options[separatorSelect.selectedIndex];
  let prefix = '';
  let suffix = '';

  if (separatorSelect.value === 'custom') {
  const custom = customSeparatorInput.value.trim();
  if (isDouble) {
    prefix = custom;
    suffix = custom;
  } else {
    suffix = custom;
  }
} else if (separatorSelect.value === 'none') {
  prefix = '';
  suffix = '';
} else {
  prefix = selectedOption.dataset.prefix || '';
  suffix = selectedOption.dataset.suffix || '';
  if (!isDouble) {
    suffix = selectedOption.value;
    prefix = '';
  }
}
  const inputText = inputTextArea.value.trim();
  if (!inputText) {
    outputDiv.innerHTML = '';
    updateCounters();
    return;
  }

  const chunks = splitTweets();
  renderTweets({ chunks, prefix, suffix, isDouble, isDoubleSpacing, specialCharFormat });
  updateCounters();
}

inputTextArea.addEventListener('input', splitTweetsAndRender);
separatorSelect.addEventListener('change', () => {
  toggleCustomSeparator();
  toggleSpecialCharFormatVisibility();
  splitTweetsAndRender();
});
doubleSeparatorSelect.addEventListener('change', () => {
  const isDouble = doubleSeparatorSelect.value === 'yes';
  populateSeparatorOptions(isDouble ? doubleSeparators : singleSeparators);
  toggleSpecialCharFormatVisibility();
  splitTweetsAndRender();
});
doubleSpacingSelect.addEventListener('change', () => {
  toggleSpecialCharFormatVisibility();
  splitTweetsAndRender();
});
customSeparatorInput.addEventListener('input', splitTweetsAndRender);
specialCharFormatSelect.addEventListener('change', splitTweetsAndRender);

// Initial population & UI state
populateSeparatorOptions(singleSeparators);
toggleSpecialCharFormatVisibility();
updateCounters();
