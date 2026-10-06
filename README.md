# NetToken Security

## Descripción breve
NetToken Security es un sistema distribuido SDN (Software-Defined Networking) diseñado para gestionar, autenticar y aplicar políticas de Calidad de Servicio (QoS) en redes Wi-Fi empresariales. La solución reemplaza el uso de contraseñas estáticas por un portal cautivo validado mediante tokens dinámicos. Consta de un Dashboard Cloud para la administración centralizada y un Agente Local que inyecta reglas de firewall y control de tráfico directamente en el hardware de red.

## Integrantes
- Leandro Lagos
- Jose Lima
- Andre Lazo
- Nicolas Calle
- Eduardo Motta

## Tecnologías utilizadas
* **Frontend:** React 18, Bootstrap 5, Recharts, Nginx (Servidor Web Estático).
* **Backend:** Node.js, Express.js, JWT (JSON Web Tokens), Bcryptjs.
* **Base de Datos:** MySQL 8.0.
* **Agente Local:** Node.js, child_process (Ejecución de iptables y tc en Linux).
* **DevOps / Despliegue:** Docker, Docker Compose.

## Requisitos
Para instalar y ejecutar este proyecto, el entorno anfitrión debe contar como mínimo con:
* **Docker Desktop** (o Docker Engine v20+) ejecutándose.
* **Git** (Para la clonación del repositorio).
* Puertos libres en el sistema: `80` (Web), `3000` (API) y `3307` (MySQL).

> **Nota:** La base de datos, el backend y el frontend están contenerizados, por lo que *no* es necesario instalar Node.js ni MySQL de forma nativa en la máquina.

## Procedimiento básico de instalación y ejecución

**1. Clonar el repositorio:**
Abra una terminal y descargue el código fuente:
```bash
git clone https://github.com/And4e2007/NetTokenSecurity.git
cd NetTokenSecurity
```

**2. Configurar variables de entorno:**
El proyecto incluye una plantilla segura. Debe crear su archivo de entorno local copiando la plantilla:
* **En Linux / Mac / Git Bash:** `cp .env.example .env`
* **En Windows (CMD/PowerShell):** `copy .env.example .env`

**3. Construir y levantar la infraestructura:**
Ejecute el siguiente comando para descargar las imágenes, compilar React e iniciar los contenedores en segundo plano:
```bash
docker-compose up --build -d
```

**4. Inicialización de la Base de Datos (Importante):**
MySQL requiere aproximadamente 20 segundos para estructurar sus archivos internos por primera vez.
* Espere 20 segundos sin ejecutar ninguna acción.
* Una vez transcurrido el tiempo, reinicie el contenedor del backend para asegurar que la conexión a la base de datos sea exitosa y se inyecten las credenciales encriptadas maestras:
```bash
docker restart nettoken_backend
```

**5. Acceso al Sistema:**
Abra su navegador web e ingrese a la raíz del localhost:
👉 http://localhost/

Utilice las siguientes credenciales de administrador predeterminadas:
* **Usuario Maestro:** `admin_seguro`
* **Contraseña:** `admin123`

## 🛠 Comandos de Mantenimiento (Troubleshooting)
Si necesita reiniciar el sistema desde cero (formateando la base de datos para pruebas limpias), ejecute:
```bash
docker-compose down -v
docker-compose up --build -d
```
*(Recuerde aplicar el paso 4 tras un formateo).*