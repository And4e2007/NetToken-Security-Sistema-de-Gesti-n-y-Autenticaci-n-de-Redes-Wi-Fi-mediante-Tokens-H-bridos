const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'Se requiere token de autenticación' });
    
    try {
        // El formato estándar es "Bearer <token>"
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'NetToken_Secure_Key_2026');
        req.admin = decoded; // Guardamos los datos del admin en la petición
        next(); // El token es válido, dejamos pasar la petición
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = { verificarToken };