-- ============================================
-- PRODIGY DENTAL LAB - ESQUEMA DE BASE DE DATOS
-- Sistema: PostgreSQL (Supabase)
-- Versión: 1.0
-- Fecha: Febrero 2026
-- ============================================

-- ============================================
-- EXTENSIONES REQUERIDAS
-- ============================================

-- Habilitar UUID para identificadores únicos seguros
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar Row Level Security (RLS) para seguridad por filas
-- Ya viene habilitado en Supabase por defecto


-- ============================================
-- TABLA 1: CLIENTES (Doctores/Clínicas)
-- ============================================

CREATE TABLE IF NOT EXISTS public.clientes (
    -- Identificador único seguro (UUID v4)
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Información básica del cliente
    nombre_completo VARCHAR(255) NOT NULL,
    nombre_clinica VARCHAR(255),

    -- Contacto
    email VARCHAR(255) NOT NULL UNIQUE,
    whatsapp VARCHAR(20) NOT NULL,
    telefono_secundario VARCHAR(20),

    -- Ubicación
    ciudad VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'Colombia',
    direccion TEXT,

    -- Estado de la cuenta
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
    tipo_cliente VARCHAR(20) DEFAULT 'regular' CHECK (tipo_cliente IN ('regular', 'premium', 'corporativo')),

    -- Metadatos
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Notas internas
    notas TEXT,

    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización de búsquedas
CREATE INDEX idx_clientes_email ON public.clientes(email);
CREATE INDEX idx_clientes_whatsapp ON public.clientes(whatsapp);
CREATE INDEX idx_clientes_estado ON public.clientes(estado);
CREATE INDEX idx_clientes_fecha_registro ON public.clientes(fecha_registro DESC);


-- ============================================
-- TABLA 2: PEDIDOS (Casos de Diseño)
-- ============================================

CREATE TABLE IF NOT EXISTS public.pedidos (
    -- Identificador único del pedido
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- ID del caso en formato PRD-XXXX (auto-generado)
    numero_caso VARCHAR(20) UNIQUE NOT NULL,

    -- Relación con cliente (Foreign Key)
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,

    -- Información del paciente
    nombre_paciente VARCHAR(255) NOT NULL,
    edad_paciente INTEGER,

    -- Tipo de trabajo dental
    tipo_trabajo VARCHAR(50) NOT NULL CHECK (tipo_trabajo IN (
        'corona',
        'carilla',
        'puente',
        'incrustacion',
        'hibrida',
        'guia_quirurgica',
        'modelo_diagnostico',
        'alineadores',
        'otro'
    )),

    -- Detalles del trabajo
    descripcion TEXT,
    cantidad_unidades INTEGER DEFAULT 1,
    dientes_afectados VARCHAR(100), -- Ej: "11, 12, 21, 22"

    -- Archivos y documentación
    link_archivos_drive TEXT,
    link_archivos_wetransfer TEXT,
    link_archivos_alternativo TEXT,
    tipo_escaner VARCHAR(50), -- Ej: "3Shape", "Medit", "iTero"
    formato_archivo VARCHAR(20), -- Ej: "STL", "PLY", "OBJ"

    -- Estado del pedido (Flujo de trabajo)
    estado VARCHAR(30) DEFAULT 'recibido' CHECK (estado IN (
        'recibido',
        'en_revision',
        'en_diseno',
        'diseno_completo',
        'aprobado_cliente',
        'en_produccion',
        'produccion_completa',
        'enviado',
        'entregado',
        'cancelado',
        'revision_solicitada'
    )),

    -- Fechas importantes
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_entrega_estimada TIMESTAMP WITH TIME ZONE,
    fecha_entrega_real TIMESTAMP WITH TIME ZONE,

    -- Prioridad
    prioridad VARCHAR(20) DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),

    -- Información de pago
    estado_pago VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_pago IN (
        'pendiente',
        'parcial',
        'pagado',
        'reembolsado'
    )),
    monto_total DECIMAL(10, 2),
    monto_pagado DECIMAL(10, 2) DEFAULT 0.00,
    link_comprobante_pago TEXT,
    metodo_pago VARCHAR(50), -- Ej: "Transferencia", "Nequi", "PayPal"

    -- Comunicación
    notas_cliente TEXT,
    notas_internas TEXT,
    requiere_atencion BOOLEAN DEFAULT FALSE,

    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID, -- ID del usuario que creó el registro
    updated_by UUID  -- ID del usuario que actualizó el registro
);

-- Índices para optimización
CREATE INDEX idx_pedidos_numero_caso ON public.pedidos(numero_caso);
CREATE INDEX idx_pedidos_cliente_id ON public.pedidos(cliente_id);
CREATE INDEX idx_pedidos_estado ON public.pedidos(estado);
CREATE INDEX idx_pedidos_fecha_solicitud ON public.pedidos(fecha_solicitud DESC);
CREATE INDEX idx_pedidos_estado_pago ON public.pedidos(estado_pago);
CREATE INDEX idx_pedidos_tipo_trabajo ON public.pedidos(tipo_trabajo);


-- ============================================
-- TABLA 3: LOGS DE AUDITORÍA
-- ============================================

CREATE TABLE IF NOT EXISTS public.logs_auditoria (
    -- Identificador único del log
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Información del cambio
    tabla_afectada VARCHAR(50) NOT NULL, -- 'clientes' o 'pedidos'
    registro_id UUID NOT NULL, -- ID del registro modificado

    -- Acción realizada
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),

    -- Datos del cambio
    datos_anteriores JSONB, -- Estado anterior en formato JSON
    datos_nuevos JSONB,      -- Estado nuevo en formato JSON
    cambios_especificos JSONB, -- Solo los campos que cambiaron

    -- Usuario responsable
    usuario_id UUID, -- ID del usuario que realizó el cambio
    usuario_email VARCHAR(255), -- Email del usuario (para referencia rápida)
    usuario_rol VARCHAR(50), -- Rol: 'admin', 'operador', 'cliente'

    -- Contexto
    ip_address INET, -- Dirección IP desde donde se hizo el cambio
    user_agent TEXT, -- Navegador/dispositivo usado

    -- Timestamp
    fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Notas
    comentario TEXT
);

-- Índices para búsqueda rápida de auditoría
CREATE INDEX idx_logs_tabla_registro ON public.logs_auditoria(tabla_afectada, registro_id);
CREATE INDEX idx_logs_usuario ON public.logs_auditoria(usuario_id);
CREATE INDEX idx_logs_fecha ON public.logs_auditoria(fecha_cambio DESC);
CREATE INDEX idx_logs_accion ON public.logs_auditoria(accion);


-- ============================================
-- TABLA 4: USUARIOS DEL SISTEMA (Opcional - Autenticación)
-- ============================================

-- Nota: Supabase tiene su propia tabla auth.users
-- Esta tabla es para extender la información de usuarios

CREATE TABLE IF NOT EXISTS public.usuarios_sistema (
    -- Relacionado con auth.users de Supabase
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Información adicional del usuario
    nombre_completo VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'operador', 'diseñador', 'cliente')),

    -- Permisos específicos
    puede_aprobar_pedidos BOOLEAN DEFAULT FALSE,
    puede_ver_finanzas BOOLEAN DEFAULT FALSE,
    puede_gestionar_usuarios BOOLEAN DEFAULT FALSE,

    -- Estado
    activo BOOLEAN DEFAULT TRUE,

    -- Metadatos
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usuarios_rol ON public.usuarios_sistema(rol);


-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a las tablas
CREATE TRIGGER trigger_clientes_updated_at
    BEFORE UPDATE ON public.clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_pedidos_updated_at
    BEFORE UPDATE ON public.pedidos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- Función para generar número de caso automático (PRD-XXXX)
CREATE OR REPLACE FUNCTION generar_numero_caso()
RETURNS TRIGGER AS $$
DECLARE
    ultimo_numero INTEGER;
    nuevo_numero VARCHAR(20);
BEGIN
    -- Obtener el último número de caso
    SELECT COALESCE(
        MAX(
            CAST(
                SUBSTRING(numero_caso FROM 5) AS INTEGER
            )
        ), 0
    ) INTO ultimo_numero
    FROM public.pedidos
    WHERE numero_caso LIKE 'PRD-%';

    -- Generar nuevo número (PRD-0001, PRD-0002, etc.)
    nuevo_numero := 'PRD-' || LPAD((ultimo_numero + 1)::TEXT, 4, '0');

    NEW.numero_caso := nuevo_numero;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para auto-generar número de caso
CREATE TRIGGER trigger_generar_numero_caso
    BEFORE INSERT ON public.pedidos
    FOR EACH ROW
    WHEN (NEW.numero_caso IS NULL)
    EXECUTE FUNCTION generar_numero_caso();


-- Función para registrar cambios en logs_auditoria
CREATE OR REPLACE FUNCTION registrar_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.logs_auditoria (
            tabla_afectada,
            registro_id,
            accion,
            datos_anteriores,
            usuario_id
        ) VALUES (
            TG_TABLE_NAME,
            OLD.id,
            'DELETE',
            row_to_json(OLD),
            auth.uid() -- Función de Supabase para obtener el usuario actual
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.logs_auditoria (
            tabla_afectada,
            registro_id,
            accion,
            datos_anteriores,
            datos_nuevos,
            usuario_id
        ) VALUES (
            TG_TABLE_NAME,
            NEW.id,
            'UPDATE',
            row_to_json(OLD),
            row_to_json(NEW),
            auth.uid()
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.logs_auditoria (
            tabla_afectada,
            registro_id,
            accion,
            datos_nuevos,
            usuario_id
        ) VALUES (
            TG_TABLE_NAME,
            NEW.id,
            'INSERT',
            row_to_json(NEW),
            auth.uid()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar triggers de auditoría
CREATE TRIGGER trigger_clientes_auditoria
    AFTER INSERT OR UPDATE OR DELETE ON public.clientes
    FOR EACH ROW
    EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_pedidos_auditoria
    AFTER INSERT OR UPDATE OR DELETE ON public.pedidos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_auditoria();


-- ============================================
-- ROW LEVEL SECURITY (RLS) - SEGURIDAD POR FILAS
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para CLIENTES
-- Los clientes solo pueden ver sus propios datos
CREATE POLICY "Clientes pueden ver sus datos"
    ON public.clientes
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM public.usuarios_sistema WHERE rol = 'cliente'
    ));

-- Los admins y operadores pueden ver todos los clientes
CREATE POLICY "Admins y operadores ven todos los clientes"
    ON public.clientes
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM public.usuarios_sistema WHERE rol IN ('admin', 'operador', 'diseñador')
    ));

-- Solo admins pueden insertar/actualizar/eliminar clientes
CREATE POLICY "Solo admins gestionan clientes"
    ON public.clientes
    FOR ALL
    USING (auth.uid() IN (
        SELECT id FROM public.usuarios_sistema WHERE rol = 'admin'
    ));


-- Políticas de seguridad para PEDIDOS
-- Los clientes solo ven sus propios pedidos
CREATE POLICY "Clientes ven sus pedidos"
    ON public.pedidos
    FOR SELECT
    USING (
        cliente_id IN (
            SELECT id FROM public.clientes WHERE email = auth.email()
        )
    );

-- Staff ve todos los pedidos
CREATE POLICY "Staff ve todos los pedidos"
    ON public.pedidos
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM public.usuarios_sistema WHERE rol IN ('admin', 'operador', 'diseñador')
    ));

-- Staff puede crear y actualizar pedidos
CREATE POLICY "Staff gestiona pedidos"
    ON public.pedidos
    FOR ALL
    USING (auth.uid() IN (
        SELECT id FROM public.usuarios_sistema WHERE rol IN ('admin', 'operador')
    ));


-- Políticas para LOGS (solo lectura para admins)
CREATE POLICY "Solo admins ven logs"
    ON public.logs_auditoria
    FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM public.usuarios_sistema WHERE rol = 'admin'
    ));


-- ============================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE public.clientes IS 'Tabla principal de clientes (doctores y clínicas)';
COMMENT ON TABLE public.pedidos IS 'Tabla de pedidos/casos de diseño dental';
COMMENT ON TABLE public.logs_auditoria IS 'Registro de auditoría de todos los cambios en el sistema';
COMMENT ON TABLE public.usuarios_sistema IS 'Información extendida de usuarios del sistema';

COMMENT ON COLUMN public.pedidos.numero_caso IS 'ID único del caso en formato PRD-XXXX (auto-generado)';
COMMENT ON COLUMN public.pedidos.estado IS 'Estado actual del pedido en el flujo de trabajo';
COMMENT ON COLUMN public.pedidos.estado_pago IS 'Estado del pago del pedido';


-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL - SOLO PARA DESARROLLO)
-- ============================================

-- Insertar cliente de prueba
-- INSERT INTO public.clientes (nombre_completo, nombre_clinica, email, whatsapp)
-- VALUES ('Dr. Juan Pérez', 'Clínica Dental Sonrisas', 'juan.perez@clinica.com', '+573001234567');

-- Insertar pedido de prueba
-- INSERT INTO public.pedidos (cliente_id, nombre_paciente, tipo_trabajo, descripcion)
-- VALUES (
--     (SELECT id FROM public.clientes WHERE email = 'juan.perez@clinica.com'),
--     'María González',
--     'corona',
--     'Corona de circonio para diente 11'
-- );


-- ============================================
-- FIN DEL ESQUEMA
-- ============================================

-- Para ejecutar este script en Supabase:
-- 1. Ve a tu proyecto en https://supabase.com
-- 2. Ve a "SQL Editor"
-- 3. Crea una nueva query
-- 4. Pega todo este código
-- 5. Haz clic en "Run"

-- Verificación del esquema:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
