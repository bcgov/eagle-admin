import { accessGate } from './access-gate';

const KEY = 'eagle-gate';

/** Lets the submit handler's awaited fetch settle. */
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

function submitPassword(password: string): Promise<unknown> {
  const input = document.getElementById('eagle-gate-pw') as HTMLInputElement;
  input.value = password;
  document.querySelector('#eagle-gate form')!.dispatchEvent(new Event('submit'));
  return flush();
}

/** Resolves to 'gated' when the gate promise has not settled within 50ms. */
function settledWithin50ms(gate: Promise<void>): Promise<string> {
  return Promise.race([
    gate.then(() => 'resolved'),
    new Promise<string>(resolve => setTimeout(() => resolve('gated'), 50)),
  ]);
}

describe('accessGate', () => {
  let reload: jasmine.Spy;

  beforeEach(() => {
    sessionStorage.removeItem(KEY);
    reload = jasmine.createSpy('reload');
  });

  afterEach(() => {
    sessionStorage.removeItem(KEY);
    document.getElementById('eagle-gate')?.remove();
    document.getElementById('eagle-gate-style')?.remove();
  });

  it('resolves immediately and renders nothing when ACCESS_GATE is off', async () => {
    await accessGate(false, '/api', reload);
    expect(document.getElementById('eagle-gate')).toBeNull();
  });

  it('resolves immediately when this tab already answered', async () => {
    sessionStorage.setItem(KEY, '1');
    await accessGate(true, '/api', reload);
    expect(document.getElementById('eagle-gate')).toBeNull();
  });

  it('renders the form and never resolves while gated', async () => {
    const gate = accessGate(true, '/api', reload);
    expect(document.getElementById('eagle-gate')).not.toBeNull();
    expect(document.getElementById('eagle-gate-pw')).not.toBeNull();
    expect(await settledWithin50ms(gate)).toBe('gated');
  });

  it('shows a wrong-password message on 401 and stays gated', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 401 }));
    accessGate(true, '/api', reload);

    await submitPassword('nope');

    const error = document.getElementById('eagle-gate-err') as HTMLParagraphElement;
    expect(error.hidden).toBeFalse();
    expect(error.textContent).toBe('Incorrect password');
    expect(reload).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it('shows a generic message when the check fails for any other reason', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 500 }));
    accessGate(true, '/api', reload);

    await submitPassword('letmein');

    const error = document.getElementById('eagle-gate-err') as HTMLParagraphElement;
    expect(error.textContent).toBe('The password could not be checked. Please try again.');
    expect(reload).not.toHaveBeenCalled();
  });

  it('remembers the tab and reloads on 204', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 204 }));
    accessGate(true, '/api', reload);

    await submitPassword('letmein');

    expect(fetchSpy).toHaveBeenCalledWith('/api/public/gate', jasmine.objectContaining({
      method: 'POST',
      body: JSON.stringify({ password: 'letmein' }),
    }));
    expect(sessionStorage.getItem(KEY)).toBe('1');
    expect(reload).toHaveBeenCalled();
  });
});
