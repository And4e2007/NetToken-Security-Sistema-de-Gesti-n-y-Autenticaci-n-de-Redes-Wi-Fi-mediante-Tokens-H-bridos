const crypto = require('crypto');

// Genera un token aleatorio seguro (ej. 16 caracteres)
const generarTokenRaw = () => {
    return crypto.randomBytes(8).toString('hex');
};

// Genera el Hash SHA-256 para guardarlo en BD (Nunca guardamos el token en texto plano)
const hashearToken = (tokenRaw) => {
    return crypto.createHash('sha256').update(tokenRaw).digest('hex');
};

// Generación de par de claves RSA para el servidor
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
});

module.exports = {
    generarTokenRaw,
    hashearToken,
    publicKey,
    privateKey
};