const crypto = require('crypto');

// Generate a key pair
const { generateKeyPairSync } = require('crypto');

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki', // SPKI format for the public key
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8', // PKCS#8 format for the private key
    format: 'pem',
  },
});

console.log('Public Key (SPKI):', publicKey);
console.log('Private Key (PKCS#8):', privateKey);

// Sign a message
const sign = crypto.createSign('SHA256');
sign.update('This is a secret message');
sign.end();

const signature = sign.sign(privateKey, 'hex');
console.log('Signature:', signature);

// Verify the signature
const verify = crypto.createVerify('SHA256');
verify.update('This is a secret message');
verify.end();

const isVerified = verify.verify(publicKey, signature, 'hex');
console.log('Signature verified:', isVerified);
