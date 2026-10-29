const form = document.getElementById('search-form');
const select = document.getElementById('product-id');
const result = document.getElementById('result');
const title = document.getElementById('result-title');
const statusEl = document.getElementById('result-status');
const fields = document.getElementById('result-fields');
const warnings = document.getElementById('result-warnings');
const timeEl = document.getElementById('result-time');
const jsonEl = document.getElementById('result-json');

const money = (value, currency) =>
  value === null ? 'No disponible' : new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(value);

function addField(label, value) {
  const dt = document.createElement('dt');
  dt.textContent = label;
  const dd = document.createElement('dd');
  dd.textContent = value;
  fields.append(dt, dd);
}

function render(data, elapsedMs) {
  result.hidden = false;
  fields.replaceChildren();
  warnings.textContent = '';
  statusEl.className = '';
  timeEl.textContent = `Tiempo de respuesta: ${elapsedMs} ms (una sola petición HTTP)`;
  jsonEl.textContent = JSON.stringify(data, null, 2);

  if (data.status === 'ERROR') {
    title.textContent = 'No se pudo obtener el resumen';
    statusEl.className = 'error';
    statusEl.textContent = `${data.error.code}: ${data.error.message}`;
    return;
  }

  title.textContent = `${data.title} (${data.product_id})`;
  statusEl.textContent = `Estado de la respuesta: ${data.status}`;
  addField('Precio en USD', money(data.price_usd, 'USD'));
  addField('Precio en MXN', money(data.price_mxn, 'MXN'));
  addField('Disponibilidad', data.stock_status);
  addField('Unidades', data.available_units === null ? 'No disponible' : String(data.available_units));
  addField('Fuente del tipo de cambio', data.currency_conversion_source);

  if (data.warnings) {
    warnings.textContent = 'Advertencias: ' + data.warnings.map((w) => `${w.service} (${w.code})`).join(', ');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const started = performance.now();
  try {
    const response = await fetch(`/api/v1/product-summary/${encodeURIComponent(select.value)}`);
    const data = await response.json();
    render(data, Math.round(performance.now() - started));
  } catch (err) {
    render(
      { status: 'ERROR', error: { code: 'NETWORK_ERROR', message: 'No fue posible contactar al gateway.' } },
      Math.round(performance.now() - started),
    );
  }
});
