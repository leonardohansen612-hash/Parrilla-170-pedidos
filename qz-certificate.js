function readPem(raw, b64) {
  if (b64) return Buffer.from(b64, 'base64').toString('utf8')
  return (raw || '').replace(/\\n/g, '\n')
}

export default function handler(req, res) {
  const cert = readPem(process.env.QZ_CERTIFICATE, process.env.QZ_CERTIFICATE_B64)
  if (!cert || !cert.includes('BEGIN CERTIFICATE')) {
    return res.status(503).send('QZ certificate not configured')
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).send(cert)
}
