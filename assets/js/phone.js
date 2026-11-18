// ============================================
// GROWTHIVE BOOK — PHONE NUMBER FIELD
// ============================================
// Country picker (Nigeria +234 first and selected by default) + number box.
// Customers can type 09019875292 or 9019875292: both are saved as +2349019875292.
//
// Usage:
//   <div id="phoneBox"></div>
//   GBPhone.mount('phoneBox', { value: '+2349019875292' });
//   GBPhone.read('phoneBox')   -> '+2349019875292'  (or '' if empty/invalid)
//   GBPhone.isValid('phoneBox') -> true / false

(function () {
  const COUNTRIES = [
    ['NG', 'Nigeria', '234'], ['GH', 'Ghana', '233'], ['GB', 'United Kingdom', '44'],
    ['US', 'United States / Canada', '1'], ['ZA', 'South Africa', '27'], ['KE', 'Kenya', '254'],
    ['CM', 'Cameroon', '237'], ['BJ', 'Benin', '229'], ['TG', 'Togo', '228'],
    ['CI', "Côte d'Ivoire", '225'], ['SN', 'Senegal', '221'], ['RW', 'Rwanda', '250'],
    ['UG', 'Uganda', '256'], ['TZ', 'Tanzania', '255'], ['EG', 'Egypt', '20'],
    ['AE', 'United Arab Emirates', '971'], ['SA', 'Saudi Arabia', '966'], ['QA', 'Qatar', '974'],
    ['IE', 'Ireland', '353'], ['DE', 'Germany', '49'], ['FR', 'France', '33'],
    ['NL', 'Netherlands', '31'], ['IT', 'Italy', '39'], ['ES', 'Spain', '34'],
    ['IN', 'India', '91'], ['CN', 'China', '86'], ['AU', 'Australia', '61']
  ];
  const flag = (iso) => String.fromCodePoint(...[...iso].map(c => 127397 + c.charCodeAt(0)));

  const css = `
  .gbp{display:flex;gap:8px;align-items:stretch;}
  .gbp select{flex:0 0 auto;width:auto;max-width:118px;padding:0 8px;border:1.5px solid var(--border,#E5E9F0);border-radius:10px;background:#fff;font:inherit;font-size:15px;color:inherit;cursor:pointer;}
  .gbp input{flex:1 1 auto;min-width:0;}
  .gbp select:focus{outline:none;border-color:var(--blue,#2563EB);box-shadow:0 0 0 3px rgba(37,99,235,.12);}
  .gbp-hint{font-size:12.5px;color:var(--text-muted,#6B7280);margin-top:6px;min-height:1em;}
  .gbp-hint.ok b{color:var(--success,#059669);font-weight:600;}`;
  if (!document.getElementById('gbp-style')) {
    const st = document.createElement('style'); st.id = 'gbp-style'; st.textContent = css; document.head.appendChild(st);
  }

  function split(value) {
    const v = String(value || '').trim();
    if (!v.startsWith('+')) return { cc: '234', local: v };
    const digits = v.replace(/\D/g, '');
    const match = COUNTRIES.map(c => c[2]).sort((a, b) => b.length - a.length).find(cc => digits.startsWith(cc));
    if (!match) return { cc: '234', local: v };
    let local = digits.slice(match.length);
    if (match === '234' && local.length === 10) local = '0' + local; // show Nigerians their usual 080... form
    return { cc: match, local };
  }

  function format(cc, localRaw) {
    let d = String(localRaw || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.startsWith('00')) return '+' + d.slice(2);               // typed full international number
    if (d.startsWith(cc) && d.length >= cc.length + 9) return '+' + d; // typed 234901... with no +
    d = d.replace(/^0+/, '');                                       // drop the leading 0
    return '+' + cc + d;
  }

  function pretty(e164) {
    const d = e164.replace(/\D/g, '');
    if (d.startsWith('234') && d.length === 13) return `+234 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
    return e164;
  }

  function mount(id, opts = {}) {
    const host = document.getElementById(id);
    if (!host) return;
    const { cc, local } = split(opts.value);
    host.innerHTML = `
      <div class="gbp">
        <select aria-label="Country code">${COUNTRIES.map(([iso, name, code]) =>
          `<option value="${code}" ${code === cc ? 'selected' : ''} title="${name}">${flag(iso)} +${code}</option>`).join('')}</select>
        <input type="tel" inputmode="tel" autocomplete="tel-national" placeholder="${opts.placeholder || '0901 234 5678'}" aria-label="Phone number">
      </div>
      <div class="gbp-hint" aria-live="polite"></div>`;
    const input = host.querySelector('input');
    const select = host.querySelector('select');
    if (opts.inputId) input.id = opts.inputId;
    input.value = local || '';
    const update = () => {
      const hint = host.querySelector('.gbp-hint');
      const val = read(id);
      if (!input.value.trim()) { hint.textContent = ''; hint.className = 'gbp-hint'; return; }
      if (isValid(id)) { hint.className = 'gbp-hint ok'; hint.innerHTML = `Saved as <b>${pretty(val)}</b>`; }
      else { hint.className = 'gbp-hint'; hint.textContent = 'Keep typing your number…'; }
    };
    input.addEventListener('input', update);
    select.addEventListener('change', update);
    update();
  }

  function read(id) {
    const host = document.getElementById(id);
    if (!host) return '';
    const input = host.querySelector('input'), select = host.querySelector('select');
    return format(select.value, input.value);
  }

  function isValid(id) {
    const v = read(id);
    const n = v.replace(/\D/g, '').length;
    if (v.startsWith('+234')) return n === 13;
    return n >= 8 && n <= 15;
  }

  function focus(id) { const i = document.querySelector('#' + id + ' input'); if (i) i.focus(); }

  window.GBPhone = { mount, read, isValid, focus, format, pretty };
})();
