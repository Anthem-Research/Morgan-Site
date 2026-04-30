const PASSWORD_HASH = '0efca4bd1b215844b3c9d7dc30cad32a4d041d7a1bb3148f0df4db0d491b1444';
const AUTH_KEY = 'morgan-site-authorized';

async function sha256(value) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function unlockSite() {
  document.documentElement.classList.remove('locked');
  const gate = document.querySelector('.password-gate');
  if (gate) gate.remove();
}

function buildGate() {
  const gate = document.createElement('section');
  gate.className = 'password-gate';
  gate.setAttribute('aria-label', 'Password protected site');

  gate.innerHTML = `
    <form class="password-card" autocomplete="off">
      <p class="password-kicker">Private preview</p>
      <h1>Morgan Gil</h1>
      <p class="password-note">This site is temporarily password protected while it is being built.</p>
      <label for="site-password">Password</label>
      <input id="site-password" name="password" type="password" autocomplete="current-password" autofocus>
      <button type="submit">Enter</button>
      <p class="password-error" role="alert" aria-live="polite"></p>
    </form>
  `;

  document.body.appendChild(gate);

  const form = gate.querySelector('form');
  const input = gate.querySelector('input');
  const error = gate.querySelector('.password-error');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const attempt = input.value.trim();
    const attemptHash = await sha256(attempt);

    if (attemptHash === PASSWORD_HASH) {
      localStorage.setItem(AUTH_KEY, 'true');
      unlockSite();
      return;
    }

    error.textContent = 'Incorrect password.';
    input.value = '';
    input.focus();
  });
}

if (localStorage.getItem(AUTH_KEY) === 'true') {
  unlockSite();
} else {
  document.addEventListener('DOMContentLoaded', buildGate);
}
