CREATE DATABASE IF NOT EXISTS nettoken_security;
USE nettoken_security;

-- 1. Tablas independientes
CREATE TABLE administrador (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE politica_red (
    id_politica INT AUTO_INCREMENT PRIMARY KEY,
    nombre_descriptivo VARCHAR(100),
    limite_bajada_kbps INT,
    limite_subida_kbps INT,
    prioridad SMALLINT
);

CREATE TABLE nodo_local (
    id_nodo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_ubicacion VARCHAR(100),
    api_key_autenticacion VARCHAR(100),
    estado_conexion VARCHAR(20)
);

-- 2. Tablas dependientes
CREATE TABLE token (
    id_token INT AUTO_INCREMENT PRIMARY KEY,
    codigo_hash_seguridad VARCHAR(255) NOT NULL,
    fecha_hora_inicio DATETIME,
    fecha_hora_expiracion DATETIME,
    cupo_maximo_dispositivos SMALLINT,
    estado_actual VARCHAR(20),
    id_politica INT,
    id_nodo INT,
    FOREIGN KEY (id_politica) REFERENCES politica_red(id_politica),
    FOREIGN KEY (id_nodo) REFERENCES nodo_local(id_nodo)
);

CREATE TABLE dispositivo (
    direccion_mac VARCHAR(20) PRIMARY KEY,
    tiempo_extra_minutos INT DEFAULT 0,
    override_bajada_kbps INT,
    override_subida_kbps INT,
    estado_sesion_individual VARCHAR(20),
    id_token INT,
    FOREIGN KEY (id_token) REFERENCES token(id_token)
);

CREATE TABLE registro_auditoria (
    id_registro BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_nodo INT,
    mac_involucrada VARCHAR(20),
    fecha_evento DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo_resultado VARCHAR(50),
    motivo_detalle TEXT,
    FOREIGN KEY (id_nodo) REFERENCES nodo_local(id_nodo)
);

-- 3. Inserción de Datos por Defecto (Seeder)
-- Administrador: admin_seguro / admin123
INSERT INTO administrador (nombre_usuario, password_hash) VALUES ('admin_seguro', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa');
-- Política estándar de 5 Mbps
INSERT INTO politica_red (nombre_descriptivo, limite_bajada_kbps, limite_subida_kbps, prioridad) VALUES ('Política Estándar (5 Mbps)', 5000, 2000, 1);
-- Nodo Local para pruebas
INSERT INTO nodo_local (nombre_ubicacion, api_key_autenticacion, estado_conexion) VALUES ('Laboratorio Redes', 'API_KEY_TEST_123', 'ACTIVO');