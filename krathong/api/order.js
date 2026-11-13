// Vercel Serverless Function: รับออเดอร์แล้วส่งเข้า Telegram
// ตั้ง Environment Variables ใน Vercel: BOT_TOKEN และ CHAT_ID
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const { BOT_TOKEN, CHAT_ID } = process.env;
  if (!BOT_TOKEN || !CHAT_ID) return res.status(500).send('missing config');

  let o = req.body;
  if (typeof o === 'string') { try { o = JSON.parse(o); } catch (e) { return res.status(400).send('bad json'); } }
  o = o || {};
  const s = (v, n) => String(v == null ? '' : v).slice(0, n);

  const lines = [
    'ออเดอร์กระทงใหม่ ' + s(o.code, 20),
    'จุดลอย: ' + s(o.place, 80),
    'รอบ: ' + s(o.slot, 60),
    'กระทง: ' + s(o.items, 300),
    'ยอดชำระ: ' + (Number(o.total) || 0) + ' บาท'
  ];
  if (o.wish) lines.push('คำอธิษฐาน: ' + s(o.wish, 80));

  const r = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text: lines.join('\n') })
  });
  return res.status(r.ok ? 200 : 502).send(r.ok ? 'ok' : 'telegram error');
};
