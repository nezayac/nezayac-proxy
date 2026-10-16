export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const query = req.query || {};
  const params = new URLSearchParams();
  Object.keys(query).forEach(k => {
    if (k !== 'path') params.append(k, query[k]);
  });

  // Важно: /v3.0/ путь, и домен api.rasp.yandex.net
  const path = query.path || 'search';
  const yandexPath = path.startsWith('v3.0') ? path : ('v3.0/' + path + '/');
  const target = 'https://api.rasp.yandex.net/' + yandexPath + '?' + params.toString();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(target, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeout);
    const data = await response.text();

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(response.status).send(data);
  } catch (e) {
    return res.status(504).json({
      error: e.name === 'AbortError' ? 'timeout' : 'network_error',
      message: e.message || 'Не удалось получить данные'
    });
  }
}
