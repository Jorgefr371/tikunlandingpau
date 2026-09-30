// Vercel Serverless Function: registra el contacto en Brevo.
// Variables de entorno necesarias en Vercel (Settings → Environment Variables):
//   BREVO_API_KEY       → tu API key de Brevo
//   BREVO_LIST_MAPA     → ID de la lista "Mapa Tikún"
//   BREVO_LIST_CODICES  → ID de la lista "Códices"
//   BREVO_NAME_ATTR     → (opcional) nombre del atributo de nombre en tu cuenta: FIRSTNAME o NOMBRE
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { nombre = '', email = '', tikun = null, fuente = 'web' } = req.body || {};
  const cleanEmail = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Correo inválido' });
  }

  const nameAttr = process.env.BREVO_NAME_ATTR || 'NOMBRE';
  const attributes = { [nameAttr]: String(nombre).trim().slice(0, 60), FUENTE: String(fuente).slice(0, 20) };
  const listId = Number(fuente === 'codices' ? (process.env.BREVO_LIST_CODICES || 6) : (process.env.BREVO_LIST_MAPA || 5));
  const t = Number(tikun);
  if (t >= 1 && t <= 9) attributes.TIKUN = t;

  try {
    const r = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        attributes,
        listIds: [listId],
        updateEnabled: true,
      }),
    });
    // 201 = creado, 204 = actualizado
    if (r.status === 201 || r.status === 204) return res.status(200).json({ ok: true });
    const detail = await r.text();
    console.error('Brevo error', r.status, detail);
    return res.status(502).json({ error: 'No se pudo registrar' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error interno' });
  }
}
