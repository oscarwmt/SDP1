-- Script compatible con MySQL 5.7 y MariaDB

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- 1. Crear procedimiento para insertar datos en configuracion si está vacía
DELIMITER //
CREATE PROCEDURE InsertarDatosConfiguracion()
BEGIN
    DECLARE config_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO config_count FROM `configuracion`;
    
    IF config_count = 0 THEN
        INSERT INTO `configuracion` VALUES
        (1, 0, 0, 0, 0, 0, 0, 'Santo Domingo - Chile', '+56 9 6818 5099', '+56 9 6818 5099', 
        'contacto@sdpropiedades.cl', 'de 09.00 horas a 18.00 horas', 'Mapa', 
        'https://web.facebook.com/profile.php?id=100093330398183', '', 'f', 'admin', 
        'Ticex2021', 'oscarwmt@gmail.com');
    END IF;
END //
DELIMITER ;

-- 2. Crear procedimiento para insertar datos en paises si está vacía
DELIMITER //
CREATE PROCEDURE InsertarDatosPaises()
BEGIN
    DECLARE paises_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO paises_count FROM `paises`;
    
    IF paises_count = 0 THEN
        INSERT INTO `paises` VALUES (1, 'Chile'), (2, '');
    END IF;
END //
DELIMITER ;

-- 3. Crear procedimiento para insertar datos en tipos si está vacía
DELIMITER //
CREATE PROCEDURE InsertarDatosTipos()
BEGIN
    DECLARE tipos_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO tipos_count FROM `tipos`;
    
    IF tipos_count = 0 THEN
        INSERT INTO `tipos` VALUES 
        (1, 'Casa'),
        (2, 'Departamento'),
        (3, 'Terreno habitacional'),
        (4, 'Terreno industrial');
    END IF;
END //
DELIMITER ;

-- 4. Crear procedimiento para insertar datos en usuarios si está vacía
DELIMITER //
CREATE PROCEDURE InsertarDatosUsuarios()
BEGIN
    DECLARE usuarios_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO usuarios_count FROM `usuarios`;
    
    IF usuarios_count = 0 THEN
        INSERT INTO `usuarios` VALUES
        (2, 'Oscar Willen Miranda Tiemann', 'oscarwmt@gmail.com', 'admin', 
        '$2b$10$u45PQtwabk8jBhiub6vIH./UG5/AlBJQ5ad5qbhpIVLjIQSrnP4DO', 
        'admin', '2025-03-26 14:59:48'),
        (3, 'Oscar2', 'oscar.w.mt@gmail.com', 'admin2', 
        '$2b$10$RkE/RX6RjQOTM8A2yjSb5uiGtgWxxSsZHdYmjox0Au3ZevI63d7W.', 
        'user', '2025-03-26 14:59:48');
    END IF;
END //
DELIMITER ;

-- 5. Crear procedimiento para añadir AUTO_INCREMENT
DELIMITER //
CREATE PROCEDURE AgregarAutoIncrement()
BEGIN
    -- Para ciudades
    IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'ciudades' 
        AND COLUMN_KEY = 'PRI' 
        AND EXTRA = 'auto_increment') = 0 THEN
        ALTER TABLE `ciudades` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
    END IF;
    
    -- Repetir para otras tablas que necesiten AUTO_INCREMENT...
END //
DELIMITER ;

-- 6. Crear procedimiento para añadir clave foránea
DELIMITER //
CREATE PROCEDURE AgregarClaveForanea()
BEGIN
    IF (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE CONSTRAINT_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'imagenes_propiedad' 
        AND CONSTRAINT_NAME = 'imagenes_propiedad_ibfk_1') = 0 THEN
        ALTER TABLE `imagenes_propiedad` ADD CONSTRAINT `imagenes_propiedad_ibfk_1` 
        FOREIGN KEY (`propiedad_id`) REFERENCES `propiedades` (`id`) ON DELETE CASCADE;
    END IF;
END //
DELIMITER ;

-- 7. Ejecutar todos los procedimientos
CALL InsertarDatosConfiguracion();
CALL InsertarDatosPaises();
CALL InsertarDatosTipos();
CALL InsertarDatosUsuarios();
CALL AgregarAutoIncrement();
CALL AgregarClaveForanea();

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;