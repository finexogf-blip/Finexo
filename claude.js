// Finexo Advisory — Netlify Function
// Proxy seguro para la API de Anthropic
// La API key NUNCA llega al navegador del cliente

exports.handler = async function(event, context) {

  // Solo acepta POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Headers CORS para que la web pueda llamar a esta función
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body);

    // La API key viene de las variables de entorno de Netlify (nunca del cliente)
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key no configurada' })
      };
    }

    // Llamada a Anthropic
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: body.model || 'claude-sonnet-4-5-20251001',
        max_tokens: body.max_tokens || 1500,
        system: body.system || '',
        messages: body.messages || []
      })
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error interno: ' + error.message })
    };
  }
};
