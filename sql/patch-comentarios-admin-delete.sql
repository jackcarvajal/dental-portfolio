-- ================================================================
-- PRODIGY — Admin puede eliminar cualquier comentario del portafolio
-- Seguro de correr múltiples veces (DROP IF EXISTS antes de crear)
-- ================================================================

DROP POLICY IF EXISTS "comentarios_admin_delete" ON comentarios_portafolio;

CREATE POLICY "comentarios_admin_delete"
  ON comentarios_portafolio FOR DELETE
  USING (
    auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
  );
