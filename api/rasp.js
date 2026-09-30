export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query || {};
  const params = new URLSearchParams();
  Object.keys(query).forEach(k => {
    if (k !== 'path') params.append(k, query[k]);
  });

  const path = query.path || 'v3.0/search/';
  const target = 'https://rasp.yandex.ru/' + path + '?' + params.toString();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(target, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeout);
    const data = await response.text();

    return res.status(200)
      .setHeader('Content-Type', 'application/json; charset=utf-8')
      .send(data);
  } catch (e) {
    return res.status(200).json({
      error: e.name === 'AbortError' ? 'timeout' : 'network_error',
      message: e.message || 'Не удалось получить данные'
    });
  }
}
