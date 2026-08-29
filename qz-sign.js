import crypto from 'node:crypto'

function readKey(raw, b64) {
  if (b64) return Buffer.from(b64, 'base64').toString('utf8')
  return (raw || '').replace(/\\n/g, '\n')
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')
  const key = readKey(process.env.QZ_PRIVATE_KEY, process.env.QZ_PRIVATE_KEY_B64)
  if (!key || !key.includes('BEGIN PRIVATE KEY')) return res.status(503).send('QZ private key not configured')
  const request = req.body?.request
  if (typeof request !== 'string' || !request.length) return res.status(400).send('Missing request')
  try {
    const signer = crypto.createSign('SHA512')
    signer.update(request, 'utf8')
    signer.end()
    const signature = signer.sign(key, 'base64')
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).send(signature)
  } catch (e) {
    return res.status(500).send(`Signing failed: ${e.message}`)
  }
}
