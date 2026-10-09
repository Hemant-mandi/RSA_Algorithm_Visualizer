/**
 * demo.js — RSA Demo page: step-by-step encrypt/decrypt animations
 */

/* ── State ── */
const state = {
  plaintext:   '',
  cipherInts:  [],
  dKey:        null,
  nKey:        null,
  encryptData: null,
  decryptData: null,
};

/* ── DOM refs ── */
const $ = id => document.getElementById(id);

const plaintextInput    = $('plaintext-input');
const charCount         = $('char-count');
const inputError        = $('input-error');
const btnEncrypt        = $('btn-encrypt');
const btnDecrypt        = $('btn-decrypt');
const btnReset          = $('btn-reset');
const cipherDisplay     = $('cipher-display');
const decryptedDisplay  = $('decrypted-display');

// Sections
const secEncryptProc    = $('section-encrypt-process');
const secCipherResult   = $('section-cipher-result');
const secDecryptProc    = $('section-decrypt-process');
const secDecryptResult  = $('section-decrypted-result');
const secComparison     = $('section-comparison');

// Param value elements
const epP   = $('ep-p');
const epQ   = $('ep-q');
const epN   = $('ep-n');
const epPhi = $('ep-phi');
const epE   = $('ep-e');
const epD   = $('ep-d');
const dpD   = $('dp-d');
const dpN   = $('dp-n');

// Table bodies
const encryptTBody = $('encrypt-table-body');
const decryptTBody = $('decrypt-table-body');
const compBody     = $('comparison-body');
const buttonSound   = new Audio(''); // /ravi.mp3 paste it inside
buttonSound.preload = 'auto';

/* ── Char counter ── */
plaintextInput.addEventListener('input', () => {
  charCount.textContent = plaintextInput.value.length;
});

/* ── Helpers ── */
function showSection(el) {
  el.classList.remove('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideSection(el) {
  el.classList.add('hidden');
}

function showError(msg) {
  inputError.textContent = msg;
  inputError.classList.remove('hidden');
}

function hideError() {
  inputError.classList.add('hidden');
}

function setButtonLoading(btn, loading) {
  const txt = btn.querySelector('.btn-text');
  const ldr = btn.querySelector('.btn-loader');
  if (loading) {
    txt.classList.add('hidden');
    ldr.classList.remove('hidden');
    btn.disabled = true;
  } else {
    txt.classList.remove('hidden');
    ldr.classList.add('hidden');
    btn.disabled = false;
  }
}

function playButtonSound() {
  buttonSound.currentTime = 0;
  buttonSound.play().catch(() => {});
}

/* Animate a single param item appearing */
function revealParam(el, value, delay = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      el.textContent = value;
      el.closest('.param-item').classList.add('revealed');
      resolve();
    }, delay);
  });
}

/* Animate table rows appearing one by one */
function populateTableAnimated(tbody, rows, delay = 60) {
  tbody.innerHTML = '';
  return new Promise(resolve => {
    rows.forEach((rowData, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = rowData;
      tbody.appendChild(tr);
      setTimeout(() => {
        tr.classList.add('row-visible');
        if (i === rows.length - 1) resolve();
      }, i * delay + 50);
    });
    if (rows.length === 0) resolve();
  });
}

/* Typewriter effect for result boxes */
function typewriterEffect(el, text, speed = 18) {
  return new Promise(resolve => {
    el.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) { clearInterval(timer); resolve(); }
    }, speed);
  });
}

/* Trigger MathJax re-render after DOM changes */
function rerenderMath() {
  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise().catch(() => {});
  }
}

/* ── ENCRYPT ── */
btnEncrypt.addEventListener('click', async () => {
  hideError();
  const text = plaintextInput.value.trim();

  if (!text) {
    showError('chotee achhe se baat kar, kuuurrrr kups');
    return;
  }

  // Basic ASCII validation (printable chars 32–126)
  const invalid = [...text].some(c => c.charCodeAt(0) < 32 || c.charCodeAt(0) > 126);
  if (invalid) {
    showError('chotee achhe se baat kar, kuuurrrr kups');
    return;
  }

  playButtonSound();
  setButtonLoading(btnEncrypt, true);
  // Reset previous results
  [secEncryptProc, secCipherResult, secDecryptProc, secDecryptResult, secComparison]
    .forEach(hideSection);

  // Reset param displays
  [epP, epQ, epN, epPhi, epE, epD].forEach(el => {
    el.textContent = '…';
    el.closest('.param-item').classList.remove('revealed');
  });
  encryptTBody.innerHTML = '';
  compBody.innerHTML = '';

  let data;
  try {
    const res = await fetch('/encrypt', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text }),
    });

    if (!res.ok) {
      const err = await res.json();
      showError(err.error || 'Encryption failed.');
      setButtonLoading(btnEncrypt, false);
      return;
    }
    data = await res.json();
  } catch (e) {
    showError('Network error — is the server running?');
    setButtonLoading(btnEncrypt, false);
    return;
  }

  state.plaintext  = text;
  state.cipherInts = data.cipher_ints;
  state.dKey       = data.d_key;
  state.nKey       = data.n_key;
  state.encryptData = data;

  // Show encryption process section
  showSection(secEncryptProc);

  // Animate key parameters sequentially
  await revealParam(epP,   data.p,   0);
  await revealParam(epQ,   data.q,   200);
  await revealParam(epN,   data.n,   400);
  await revealParam(epPhi, data.phi, 600);
  await revealParam(epE,   data.e,   800);
  await revealParam(epD,   data.d,   1000);

  rerenderMath();

  // Animate per-character table
  const encRows = data.per_char.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="td-char">${escapeHtml(item.char)}</td>
      <td class="td-m">${item.M}</td>
      <td class="td-c">${item.C}</td>
    </tr>
  `);
  await populateTableAnimated(encryptTBody, encRows, 70);

  // Show cipher result
  await new Promise(r => setTimeout(r, 300));
  showSection(secCipherResult);

  // Display cipher integers
  const cipherStr = data.per_char.map(x => x.C).join(' ');
  await typewriterEffect(cipherDisplay, cipherStr, 12);

  setButtonLoading(btnEncrypt, false);
  btnEncrypt.disabled = true; // prevent re-encrypt until reset
});

/* ── DECRYPT ── */
btnDecrypt.addEventListener('click', async () => {
  playButtonSound();
  setButtonLoading(btnDecrypt, true);

  // Reset decrypt sections
  [secDecryptProc, secDecryptResult, secComparison].forEach(hideSection);
  decryptTBody.innerHTML = '';

  // Reset decrypt params
  [dpD, dpN].forEach(el => {
    el.textContent = '…';
    el.closest('.param-item').classList.remove('revealed');
  });

  let data;
  try {
    const res = await fetch('/decrypt', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        cipher_ints: state.cipherInts,
        d_key:       state.dKey,
        n_key:       state.nKey,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      showError(err.error || 'Decryption failed.');
      setButtonLoading(btnDecrypt, false);
      return;
    }
    data = await res.json();
  } catch (e) {
    showError('Network error — is the server running?');
    setButtonLoading(btnDecrypt, false);
    return;
  }

  state.decryptData = data;

  // Show decryption process section
  showSection(secDecryptProc);

  // Animate key parameters
  await revealParam(dpD, state.dKey, 0);
  await revealParam(dpN, state.nKey, 300);

  rerenderMath();

  // Animate per-character table
  const decRows = data.per_char.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="td-c">${item.C}</td>
      <td class="td-m">${item.M}</td>
      <td class="td-char">${escapeHtml(item.char)}</td>
    </tr>
  `);
  await populateTableAnimated(decryptTBody, decRows, 70);

  // Show decrypted result
  await new Promise(r => setTimeout(r, 300));
  showSection(secDecryptResult);
  await typewriterEffect(decryptedDisplay, data.decrypted_text, 40);

  // Build comparison table
  await new Promise(r => setTimeout(r, 400));
  showSection(secComparison);

  const cipherStr = state.cipherInts.join(' ');
  compBody.innerHTML = `
    <tr class="row-visible">
      <td>${escapeHtml(state.plaintext)}</td>
      <td>${escapeHtml(cipherStr)}</td>
      <td>${escapeHtml(data.decrypted_text)}</td>
    </tr>
  `;

  setButtonLoading(btnDecrypt, false);
  btnDecrypt.disabled = true;
});

/* ── RESET ── */
btnReset.addEventListener('click', () => {
  // Clear state
  Object.assign(state, { plaintext: '', cipherInts: [], dKey: null, nKey: null,
    encryptData: null, decryptData: null });

  // Clear input
  plaintextInput.value = '';
  charCount.textContent = '0';
  hideError();

  // Hide all result sections
  [secEncryptProc, secCipherResult, secDecryptProc, secDecryptResult, secComparison]
    .forEach(hideSection);

  // Re-enable buttons
  btnEncrypt.disabled = false;
  btnDecrypt.disabled = false;

  // Scroll to top
  plaintextInput.focus();
  plaintextInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* ── Utility: escape HTML special chars ── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
