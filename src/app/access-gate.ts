/** Access curtain for non-production environments; Keycloak still gates the admin app. */

const KEY = 'eagle-gate';

const MARKUP = `<style id="eagle-gate-style">
#eagle-gate { position: fixed; inset: 0; z-index: 2000; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem; text-align: center;
  background: #fff; color: #313132; font-family: BCSans, Arial, sans-serif; }
#eagle-gate form { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; max-width: 20rem; text-align: left; }
#eagle-gate input, #eagle-gate button { font: inherit; padding: 0.5rem; }
#eagle-gate button { border: 0; background: #003366; color: #fff; cursor: pointer; }
#eagle-gate-err { color: #a12622; }
</style>
<main id="eagle-gate"><h1>Access restricted</h1><p>This is a non-production environment.</p>` +
  `<form><label for="eagle-gate-pw">Password</label>` +
  `<input id="eagle-gate-pw" type="password" autocomplete="current-password" required>` +
  `<button type="submit">Continue</button>` +
  `<p id="eagle-gate-err" role="alert" hidden></p></form></main>`;

/**
 * Resolves at once when the curtain is down. While it is up the returned promise never settles,
 * so the caller's app initializer never finishes and nothing bootstraps behind it.
 */
export function accessGate(enabled: boolean, apiPath: string, reload = () => location.reload()): Promise<void> {
  if (!enabled) { return Promise.resolve(); }
  try {
    if (sessionStorage.getItem(KEY) === '1') { return Promise.resolve(); }
  } catch {
    // Storage blocked (private browsing) — ask for the password again.
  }

  document.body.insertAdjacentHTML('afterbegin', MARKUP);
  const form = document.querySelector('#eagle-gate form') as HTMLFormElement;
  const input = document.getElementById('eagle-gate-pw') as HTMLInputElement;
  const error = document.getElementById('eagle-gate-err') as HTMLParagraphElement;
  const button = form.querySelector('button') as HTMLButtonElement;
  input.focus();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    button.disabled = true;
    error.hidden = true;
    let message = 'The password could not be checked. Please try again.';
    try {
      const response = await fetch(`${apiPath}/public/gate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: input.value }),
      });
      if (response.status === 204) {
        try {
          sessionStorage.setItem(KEY, '1');
        } catch {
          // Storage blocked — the reload puts the curtain straight back up.
        }
        // Reload rather than resolve: the initializer re-runs with the gate open, so Keycloak
        // init, the router and the deep link behave exactly as they do without the curtain.
        reload();
        return;
      }
      if (response.status === 401) { message = 'Incorrect password'; }
    } catch {
      // Network failure — the generic message already covers it.
    }
    error.textContent = message;
    error.hidden = false;
    button.disabled = false;
  });

  return new Promise<void>(() => { /* deliberately never settles */ });
}
