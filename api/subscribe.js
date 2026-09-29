// Vercel Serverless Function: registra el contacto en Brevo.
// Variables de entorno necesarias en Vercel (Settings → Environment Variables):
//   BREVO_API_KEY  → tu API key de Brevo (SMTP & API → API Keys)
//   BREVO_LIST_ID  → el número de la lista donde caen los contactos
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { nombre = '', email = '', tikun = null, fuente = 'web' } = req.body || {};
  const cleanEmail = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Correo inválido' });
  }

  const attributes = { FIRSTNAME: String(nombre).trim().slice(0, 60), FUENTE: String(fuente).slice(0, 20) };
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
        listIds: [Number(process.env.BREVO_LIST_ID)],
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
