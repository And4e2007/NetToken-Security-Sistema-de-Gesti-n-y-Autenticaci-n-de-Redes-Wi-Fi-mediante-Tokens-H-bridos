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
* Puertos libres en el sistema: `80` (Web), `3000` (API) y `3306` (MySQL).

> **Nota:** La base de datos, el backend y el frontend están contenerizados, por lo que *no* es necesario instalar Node.js ni MySQL de forma nativa en la máquina.

## Procedimiento básico de instalación y ejecución

**1. Clonar el repositorio:**
Abra una terminal y descargue el código fuente:
```bash
git clone [https://github.com/TU_USUARIO/TU_REPOSITORIO.git](https://github.com/TU_USUARIO/TU_REPOSITORIO.git)
cd TU_REPOSITORIO