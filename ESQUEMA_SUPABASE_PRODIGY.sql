
================================================================================
                    ESQUEMA DE BASE DE DATOS SUPABASE
                        Sistema PRODIGY - Arquitectura Completa
================================================================================

📊 ESTRUCTURA DE TABLAS
-----------------------

1. TABLA: usuarios
   Almacena todos los usuarios del sistema con sus roles

   CREATE TABLE usuarios (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       email TEXT UNIQUE NOT NULL,
       nombre_completo TEXT NOT NULL,
       whatsapp TEXT,
       rol TEXT CHECK (rol IN ('admin', 'tecnico', 'cliente')) NOT NULL,
       clinica_nombre TEXT,  -- Solo para clientes
       estado TEXT DEFAULT 'activo',
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Índices
   CREATE INDEX idx_usuarios_rol ON usuarios(rol);
   CREATE INDEX idx_usuarios_email ON usuarios(email);

================================================================================

2. TABLA: ordenes
   Almacena todas las órdenes (Fresado + Impresión)

   CREATE TABLE ordenes (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       codigo_orden TEXT UNIQUE NOT NULL,  -- Ej: FRESADO-2026-001
       cliente_id UUID REFERENCES usuarios(id),
       tipo_orden TEXT CHECK (tipo_orden IN ('fresado', 'impresion')) NOT NULL,

       -- Información del caso
       nombre_paciente TEXT NOT NULL,
       fecha_entrega_solicitada DATE NOT NULL,
       fecha_entrega_real DATE,

       -- Estado del trabajo
       estado TEXT CHECK (estado IN (
           'pendiente',
           'esperando_material',
           'en_produccion',
           'en_sinterizado',
           'en_glaze',
           'control_calidad',
           'listo',
           'entregado',
           'cancelado'
       )) DEFAULT 'pendiente',

       -- Asignación
       tecnico_asignado_id UUID REFERENCES usuarios(id),

       -- Datos específicos del trabajo (JSON para flexibilidad)
       especificaciones JSONB NOT NULL,

       -- Archivos
       archivo_stl_url TEXT,
       archivo_foto_url TEXT,
       comprobante_pago_url TEXT,
       archivos_retroalimentacion JSONB,  -- Array de URLs con comentarios

       -- QR Code
       qr_code_url TEXT,

       -- Notas y observaciones
       instrucciones_cliente TEXT,
       notas_tecnico TEXT,
       retroalimentacion_cliente TEXT,

       -- Control de garantía
       fecha_entrega_cliente TIMESTAMP,
       garantia_activa BOOLEAN DEFAULT TRUE,
       garantia_vence_en TIMESTAMP,  -- 12 horas después de entrega

       -- Auditoría
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW(),
       created_by UUID REFERENCES usuarios(id)
   );

   -- Índices
   CREATE INDEX idx_ordenes_codigo ON ordenes(codigo_orden);
   CREATE INDEX idx_ordenes_cliente ON ordenes(cliente_id);
   CREATE INDEX idx_ordenes_estado ON ordenes(estado);
   CREATE INDEX idx_ordenes_tipo ON ordenes(tipo_orden);
   CREATE INDEX idx_ordenes_tecnico ON ordenes(tecnico_asignado_id);

   -- Trigger para código autogenerado
   CREATE OR REPLACE FUNCTION generar_codigo_orden()
   RETURNS TRIGGER AS $$
   DECLARE
       contador INT;
       anio INT;
       tipo_upper TEXT;
   BEGIN
       anio := EXTRACT(YEAR FROM NOW());
       tipo_upper := UPPER(NEW.tipo_orden);

       SELECT COUNT(*) + 1 INTO contador
       FROM ordenes
       WHERE tipo_orden = NEW.tipo_orden
       AND EXTRACT(YEAR FROM created_at) = anio;

       NEW.codigo_orden := tipo_upper || '-' || anio || '-' || LPAD(contador::TEXT, 3, '0');

       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER trigger_generar_codigo
   BEFORE INSERT ON ordenes
   FOR EACH ROW
   WHEN (NEW.codigo_orden IS NULL)
   EXECUTE FUNCTION generar_codigo_orden();

================================================================================

3. TABLA: historial_estados
   Rastrea todos los cambios de estado de una orden

   CREATE TABLE historial_estados (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       orden_id UUID REFERENCES ordenes(id) ON DELETE CASCADE,
       estado_anterior TEXT,
       estado_nuevo TEXT NOT NULL,
       comentario TEXT,
       cambiado_por UUID REFERENCES usuarios(id),
       created_at TIMESTAMP DEFAULT NOW()
   );

   -- Índices
   CREATE INDEX idx_historial_orden ON historial_estados(orden_id);

   -- Trigger para registrar cambios de estado
   CREATE OR REPLACE FUNCTION registrar_cambio_estado()
   RETURNS TRIGGER AS $$
   BEGIN
       IF OLD.estado IS DISTINCT FROM NEW.estado THEN
           INSERT INTO historial_estados (
               orden_id,
               estado_anterior,
               estado_nuevo,
               cambiado_por
           ) VALUES (
               NEW.id,
               OLD.estado,
               NEW.estado,
               NEW.updated_by
           );
       END IF;
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER trigger_cambio_estado
   AFTER UPDATE ON ordenes
   FOR EACH ROW
   EXECUTE FUNCTION registrar_cambio_estado();

================================================================================

4. TABLA: facturacion
   Manejo de pagos y facturación

   CREATE TABLE facturacion (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       orden_id UUID REFERENCES ordenes(id) ON DELETE CASCADE,
       cliente_id UUID REFERENCES usuarios(id),

       -- Montos
       subtotal DECIMAL(10,2) NOT NULL,
       iva DECIMAL(10,2) DEFAULT 0,
       total DECIMAL(10,2) NOT NULL,

       -- Pagos
       anticipo DECIMAL(10,2) DEFAULT 0,  -- 50%
       saldo_pendiente DECIMAL(10,2),
       pagado_completo BOOLEAN DEFAULT FALSE,

       -- Método de pago
       metodo_pago TEXT CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'nequi', 'daviplata')),

       -- Comprobantes
       comprobante_anticipo_url TEXT,
       comprobante_saldo_url TEXT,

       -- Factura
       numero_factura TEXT UNIQUE,
       factura_url TEXT,
       fecha_factura DATE,

       -- Control
       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Índices
   CREATE INDEX idx_facturacion_orden ON facturacion(orden_id);
   CREATE INDEX idx_facturacion_cliente ON facturacion(cliente_id);

================================================================================

5. TABLA: notificaciones
   Sistema de notificaciones para los usuarios

   CREATE TABLE notificaciones (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
       orden_id UUID REFERENCES ordenes(id) ON DELETE CASCADE,

       tipo TEXT CHECK (tipo IN ('cambio_estado', 'nuevo_comentario', 'pago_recibido', 'listo_entrega', 'recordatorio')),
       titulo TEXT NOT NULL,
       mensaje TEXT NOT NULL,

       leida BOOLEAN DEFAULT FALSE,
       leida_en TIMESTAMP,

       created_at TIMESTAMP DEFAULT NOW()
   );

   -- Índices
   CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
   CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);

================================================================================

6. TABLA: materiales_inventario
   Control de materiales disponibles (para estado "esperando_material")

   CREATE TABLE materiales_inventario (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       nombre TEXT NOT NULL,
       tipo TEXT CHECK (tipo IN ('zirconio', 'pmma', 'disilicato', 'resina', 'metal', 'otro')),
       marca TEXT,
       codigo_producto TEXT,

       stock_actual INT DEFAULT 0,
       stock_minimo INT DEFAULT 5,

       precio_unitario DECIMAL(10,2),

       estado TEXT DEFAULT 'activo',

       created_at TIMESTAMP DEFAULT NOW(),
       updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Índices
   CREATE INDEX idx_materiales_tipo ON materiales_inventario(tipo);
   CREATE INDEX idx_materiales_stock ON materiales_inventario(stock_actual);

================================================================================

7. TABLA: mensajes_orden
   Chat interno entre técnico y cliente por orden

   CREATE TABLE mensajes_orden (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       orden_id UUID REFERENCES ordenes(id) ON DELETE CASCADE,
       remitente_id UUID REFERENCES usuarios(id),

       mensaje TEXT NOT NULL,
       archivo_url TEXT,

       leido BOOLEAN DEFAULT FALSE,
       leido_en TIMESTAMP,

       created_at TIMESTAMP DEFAULT NOW()
   );

   -- Índices
   CREATE INDEX idx_mensajes_orden ON mensajes_orden(orden_id);
   CREATE INDEX idx_mensajes_remitente ON mensajes_orden(remitente_id);

================================================================================
                        POLÍTICAS DE SEGURIDAD (RLS)
================================================================================

-- Habilitar Row Level Security en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes_orden ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA USUARIOS

-- Admin: Acceso total
CREATE POLICY "Admin puede ver todos los usuarios"
ON usuarios FOR SELECT
USING (auth.jwt() ->> 'rol' = 'admin');

-- Técnico: Ver solo clientes y otros técnicos
CREATE POLICY "Técnico puede ver clientes y técnicos"
ON usuarios FOR SELECT
USING (
    auth.jwt() ->> 'rol' = 'tecnico'
    AND (rol IN ('cliente', 'tecnico') OR id = auth.uid())
);

-- Cliente: Solo ver su propio perfil
CREATE POLICY "Cliente solo ve su perfil"
ON usuarios FOR SELECT
USING (id = auth.uid());

-- POLÍTICAS PARA ÓRDENES

-- Admin: Acceso total
CREATE POLICY "Admin acceso total a órdenes"
ON ordenes FOR ALL
USING (auth.jwt() ->> 'rol' = 'admin');

-- Técnico: Ver órdenes asignadas o sin asignar
CREATE POLICY "Técnico ve órdenes asignadas"
ON ordenes FOR SELECT
USING (
    auth.jwt() ->> 'rol' = 'tecnico'
    AND (tecnico_asignado_id = auth.uid() OR tecnico_asignado_id IS NULL)
);

CREATE POLICY "Técnico puede actualizar órdenes asignadas"
ON ordenes FOR UPDATE
USING (
    auth.jwt() ->> 'rol' = 'tecnico'
    AND tecnico_asignado_id = auth.uid()
);

-- Cliente: Solo ver sus propias órdenes
CREATE POLICY "Cliente ve solo sus órdenes"
ON ordenes FOR SELECT
USING (cliente_id = auth.uid());

CREATE POLICY "Cliente puede crear órdenes"
ON ordenes FOR INSERT
WITH CHECK (cliente_id = auth.uid());

-- POLÍTICAS PARA FACTURACIÓN

-- Admin: Acceso total
CREATE POLICY "Admin acceso total a facturación"
ON facturacion FOR ALL
USING (auth.jwt() ->> 'rol' = 'admin');

-- Cliente: Solo ver su facturación
CREATE POLICY "Cliente ve su facturación"
ON facturacion FOR SELECT
USING (cliente_id = auth.uid());

-- POLÍTICAS PARA NOTIFICACIONES

-- Usuario ve solo sus notificaciones
CREATE POLICY "Usuario ve sus notificaciones"
ON notificaciones FOR SELECT
USING (usuario_id = auth.uid());

CREATE POLICY "Usuario puede actualizar sus notificaciones"
ON notificaciones FOR UPDATE
USING (usuario_id = auth.uid());

-- POLÍTICAS PARA MENSAJES

-- Usuario ve mensajes de sus órdenes
CREATE POLICY "Ver mensajes de órdenes propias"
ON mensajes_orden FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM ordenes
        WHERE ordenes.id = mensajes_orden.orden_id
        AND (
            ordenes.cliente_id = auth.uid()
            OR ordenes.tecnico_asignado_id = auth.uid()
            OR (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
        )
    )
);

CREATE POLICY "Crear mensajes en órdenes propias"
ON mensajes_orden FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM ordenes
        WHERE ordenes.id = orden_id
        AND (
            ordenes.cliente_id = auth.uid()
            OR ordenes.tecnico_asignado_id = auth.uid()
        )
    )
);

================================================================================
                    FUNCIONES AUXILIARES ÚTILES
================================================================================

-- Función para obtener próximo número de factura
CREATE OR REPLACE FUNCTION obtener_siguiente_numero_factura()
RETURNS TEXT AS $$
DECLARE
    contador INT;
    anio INT;
BEGIN
    anio := EXTRACT(YEAR FROM NOW());

    SELECT COUNT(*) + 1 INTO contador
    FROM facturacion
    WHERE EXTRACT(YEAR FROM fecha_factura) = anio;

    RETURN 'FAC-' || anio || '-' || LPAD(contador::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si garantía está activa
CREATE OR REPLACE FUNCTION verificar_garantia(orden_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    vencimiento TIMESTAMP;
BEGIN
    SELECT garantia_vence_en INTO vencimiento
    FROM ordenes
    WHERE id = orden_uuid;

    RETURN (vencimiento IS NOT NULL AND NOW() < vencimiento);
END;
$$ LANGUAGE plpgsql;

-- Función para calcular estadísticas del técnico
CREATE OR REPLACE FUNCTION estadisticas_tecnico(tecnico_uuid UUID)
RETURNS TABLE (
    total_ordenes BIGINT,
    ordenes_en_proceso BIGINT,
    ordenes_completadas BIGINT,
    tiempo_promedio_entrega INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total,
        COUNT(*) FILTER (WHERE estado IN ('en_produccion', 'en_sinterizado', 'control_calidad'))::BIGINT as proceso,
        COUNT(*) FILTER (WHERE estado = 'entregado')::BIGINT as completadas,
        AVG(fecha_entrega_real - created_at::DATE) as tiempo_promedio
    FROM ordenes
    WHERE tecnico_asignado_id = tecnico_uuid;
END;
$$ LANGUAGE plpgsql;

================================================================================
                        ESTRUCTURA JSONB PARA ESPECIFICACIONES
================================================================================

-- Ejemplo de ESPECIFICACIONES para FRESADO:
{
    "proceso": "glaze",
    "material": "xtcera_3dpro",
    "material_propio": false,
    "color_vita": "A2",
    "translucidez": "MT",
    "cantidad": 2,
    "encia_rosa": false,
    "advertencias_aceptadas": ["material_propio", "encia_rosa"]
}

-- Ejemplo de ESPECIFICACIONES para IMPRESIÓN:
{
    "modelos": ["estudio", "geller"],
    "servicios": ["guia_quirurgica"],
    "biocompatible": ["definitivo_impreso"],
    "tipo_analogo": "prodigy",
    "mascara_encia": true,
    "tipo_resina": "bio_permanent",
    "resolucion": 25,
    "color_vita": "A3",
    "cantidad": 1,
    "advertencias_aceptadas": ["guia_autoclave"]
}

================================================================================
                        ESTRUCTURA DE ROLES Y PERMISOS
================================================================================

ADMIN (Administrador)
=====================
Permisos:
✅ Ver/Editar/Eliminar todas las órdenes
✅ Ver/Editar/Eliminar todos los usuarios
✅ Asignar órdenes a técnicos
✅ Ver toda la facturación
✅ Generar reportes completos
✅ Gestionar inventario de materiales
✅ Configuración del sistema
✅ Ver estadísticas globales

Acceso:
- Dashboard completo con métricas
- Panel de control de usuarios
- Panel de asignación de trabajos
- Reportes financieros
- Configuración de precios

TÉCNICO (Técnico de Laboratorio)
=================================
Permisos:
✅ Ver órdenes asignadas o sin asignar
✅ Actualizar estado de órdenes asignadas
✅ Subir archivos de trabajo (STL modificados, fotos de progreso)
✅ Agregar notas técnicas
✅ Enviar retroalimentación al cliente
✅ Marcar verificaciones de control de calidad
✅ Ver detalles completos de materiales y especificaciones
✅ Chat con cliente por orden específica
❌ No puede ver facturación
❌ No puede eliminar órdenes
❌ No puede crear usuarios

Acceso:
- Dashboard con órdenes asignadas
- Lista de órdenes disponibles para asignar
- Panel de carga de archivos
- Control de calidad checklist
- Chat interno

CLIENTE (Doctor/Clínica)
=========================
Permisos:
✅ Crear nuevas órdenes
✅ Ver solo sus propias órdenes
✅ Ver historial de pedidos
✅ Ver estado actual y fase del laboratorio
✅ Ver su facturación
✅ Descargar facturas
✅ Chat con técnico asignado
✅ Reportar problemas (dentro de 12h)
❌ No puede ver órdenes de otros clientes
❌ No puede editar orden después de enviar
❌ No puede ver datos internos del laboratorio

Acceso:
- Dashboard con seguimiento de órdenes activas
- Historial de pedidos completo
- Estado en tiempo real (con % de avance)
- Facturación y pagos pendientes
- Formulario de nueva orden
- Chat por orden

================================================================================
                            FLUJO DE TRABAJO COMPLETO
================================================================================

1. CLIENTE crea orden desde landing-prodigy.html
   ↓
2. Sistema genera:
   - Código único (FRESADO-2026-001)
   - QR Code
   - Notifica a ADMIN por WhatsApp
   ↓
3. ADMIN/TÉCNICO revisa y asigna a técnico
   ↓
4. TÉCNICO recibe notificación
   ↓
5. TÉCNICO actualiza estado: "en_produccion"
   ↓
6. Cliente ve cambio en tiempo real en su dashboard
   ↓
7. TÉCNICO sube archivos de progreso
   ↓
8. TÉCNICO marca "control_calidad"
   ↓
9. TÉCNICO marca "listo"
   ↓
10. Cliente recibe notificación para recoger
    ↓
11. ADMIN/TÉCNICO marca "entregado"
    ↓
12. Sistema activa garantía de 12 horas
    ↓
13. Tras 12h, garantía expira automáticamente

================================================================================
                        CONFIGURACIÓN DE SUPABASE
================================================================================

1. Crear proyecto en Supabase
2. Ejecutar este esquema SQL en el editor SQL
3. Configurar autenticación:
   - Email/Password
   - Magic Link (opcional)
   - OAuth Google (opcional)
4. Configurar Storage buckets:
   - bucket: "archivos-stl" (privado)
   - bucket: "comprobantes-pago" (privado)
   - bucket: "archivos-trabajo" (privado)
   - bucket: "qr-codes" (público)
   - bucket: "facturas" (privado)
5. Variables de entorno:
   SUPABASE_URL=tu_url
   SUPABASE_ANON_KEY=tu_key
   SUPABASE_SERVICE_KEY=tu_service_key

================================================================================
                            FIN DEL ESQUEMA
================================================================================
