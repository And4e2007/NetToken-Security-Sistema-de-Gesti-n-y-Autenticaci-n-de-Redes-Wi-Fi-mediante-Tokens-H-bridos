const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas y configuración de BD
const tokenRoutes = require('./routes/tokenRoutes');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;
const authController = require('./controllers/authController');

// Middlewares
app.use(cors());
app.use(express.json()); // Permite recibir JSON en el body de las peticiones
app.post('/api/auth/login', authController.login);

// Configuración de Rutas
app.use('/api/tokens', tokenRoutes);

// Iniciar servidor y probar conexión a la Base de Datos
app.listen(PORT, async () => {
    console.log(`Servidor NetToken Core corriendo en http://localhost:${PORT}`);
    
    try {
        // Intentamos obtener una conexión del pool para verificar que las credenciales del .env son correctas
        const connection = await db.getConnection();
        console.log('Conexión exitosa a la base de datos MySQL (nettoken_security).');
        connection.release(); // Liberamos la conexión de vuelta al pool
    } catch (error) {
        console.error('Error conectando a MySQL:', error.message);
        console.error('Verifica las credenciales en tu archivo .env y asegúrate de que MySQL Workbench esté corriendo.');
    }
});