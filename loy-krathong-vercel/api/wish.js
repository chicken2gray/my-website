// POST /api/wish  { "wish": "..." }  ->  ส่งข้อความเข้า Telegram
//
// ตั้งค่าที่ Vercel > Project > Settings > Environment Variables
//   TELEGRAM_BOT_TOKEN   token ของ bot จาก BotFather
//   TELEGRAM_CHAT_ID     chat id ที่จะรับข้อความ
// ห้ามใส่ token ลงในโค้ดหรือในหน้าเว็บ

const RECIPIENT_NAME = 'พี่คนสวย';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return res.status(500).json({ ok: false });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const wish = String((body && body.wish) || '').trim().slice(0, 200);

  const when = new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date());

  const text = wish
    ? `🪔 ${RECIPIENT_NAME} ลอยกระทงแล้ว\n\nคำอธิษฐาน: ${wish}\n\n${when}`
    : `🪔 ${RECIPIENT_NAME} ลอยกระทงแล้ว (ไม่ได้เขียนคำอธิษฐาน)\n\n${when}`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
    if (!r.ok) {
      console.error('Telegram error', r.status, await r.text());
      return res.status(502).json({ ok: false });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Telegram request failed', e && e.message);
    return res.status(502).json({ ok: false });
  }
};
