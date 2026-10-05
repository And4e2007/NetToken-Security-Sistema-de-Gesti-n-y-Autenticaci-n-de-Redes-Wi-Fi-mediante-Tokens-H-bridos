const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { usuario, password } = req.body;
        
        // 1. Buscar al usuario en la base de datos
        const [admins] = await db.execute('SELECT * FROM administrador WHERE nombre_usuario = ?', [usuario]);
        if (admins.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });
        
        const admin = admins[0];
        
        // 2. Comparar la contraseña en texto plano con el Hash de MySQL
        const passwordValida = await bcrypt.compare(password, admin.password_hash);
        if (!passwordValida) return res.status(401).json({ error: 'Contraseña incorrecta' });
        
        // 3. Generar el Token JWT (Válido por 8 horas)
        const token = jwt.sign(
            { id: admin.id_admin, usuario: admin.nombre_usuario }, 
            process.env.JWT_SECRET || 'NetToken_Secure_Key_2026', 
            { expiresIn: '8h' }
        );
        
        res.status(200).json({ mensaje: 'Login exitoso', token, usuario: admin.nombre_usuario });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = { login };