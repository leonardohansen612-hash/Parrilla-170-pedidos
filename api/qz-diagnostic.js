import crypto from 'node:crypto'

function readPem(raw, b64) {
  if (b64) return Buffer.from(b64, 'base64').toString('utf8')
  return (raw || '').replace(/\\n/g, '\n')
}

export default function handler(req, res) {
  res.setHeader('Cache-Control','no-store')
  try {
    const cert = readPem(process.env.QZ_CERTIFICATE, process.env.QZ_CERTIFICATE_B64)
    const key = readPem(process.env.QZ_PRIVATE_KEY, process.env.QZ_PRIVATE_KEY_B64)
    if (!cert || !cert.includes('BEGIN CERTIFICATE')) return res.status(503).json({ok:false,error:'QZ_CERTIFICATE não configurado ou inválido'})
    if (!key || !key.includes('PRIVATE KEY')) return res.status(503).json({ok:false,error:'QZ_PRIVATE_KEY não configurado ou inválido'})

    const probe='parrilla170-qz-diagnostic'
    const signature=crypto.sign('sha512',Buffer.from(probe),key)
    const publicKey=crypto.createPublicKey(cert)
    const keyMatch=crypto.verify('sha512',Buffer.from(probe),publicKey,signature)
    const keyType=key.includes('BEGIN RSA PRIVATE KEY')?'RSA PRIVATE KEY':key.includes('BEGIN EC PRIVATE KEY')?'EC PRIVATE KEY':'PRIVATE KEY'
    if(!keyMatch) return res.status(500).json({ok:false,certificate:true,keyMatch:false,keyType,error:'Certificado e chave privada não correspondem'})
    return res.status(200).json({ok:true,certificate:true,keyMatch:true,keyType})
  } catch(e) {
    return res.status(500).json({ok:false,error:`Diagnóstico falhou: ${e.message}`})
  }
}
