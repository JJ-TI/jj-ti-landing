# Vista previa de diseño en GitHub Pages

Estado: artefacto IMPLEMENTED en rama gh-pages; activación del sitio pendiente. No equivale a publicación en jj-ti.net ni aceptación del release.

## Activación inicial

El propietario debe abrir https://github.com/JJ-TI/jj-ti-landing/settings/pages y seleccionar:

1. Source: Deploy from a branch.
2. Branch: gh-pages.
3. Folder: /(root).
4. Save.

La integración actual devuelve HTTP 403 al crear el sitio Pages. La rama ya está preparada. GitHub generará la URL https://jj-ti.github.io/jj-ti-landing/ cuando termine el despliegue; esta URL es la prevista, no una disponibilidad comprobada al escribir este documento.

## Contenido y actualización

La rama gh-pages contiene solo archivos públicos del diseño. No contiene CNAME, documentación interna, pruebas ni dependencias. Cada HTML incluye noindex y un aviso de vista previa. El formulario tiene botón deshabilitado y el JavaScript de preview no incluye fetch. Los planes siguen siendo seleccionables; correo y WhatsApp continúan como enlaces de contacto.

Para generar una nueva revisión desde la rama de diseño:

```bash
python3 scripts/build_preview.py --output /tmp/jjti-preview-nueva-revision
```

Usa un destino vacío. Publica exclusivamente esos archivos en gh-pages mediante un commit y comprueba el build Pages y la URL. No copies el directorio completo del proyecto. Este generador no sube ni publica por sí solo. Antes de actualizar, inspecciona la cabeza remota de gh-pages y conserva su historial; no fuerces cambios concurrentes.

Después de cada actualización, verificar la URL pública, banner, recursos CSS/JS y que el envío permanezca deshabilitado. noindex es una instrucción para buscadores, no un control de acceso: la vista previa es pública.

## GitHub Projects

Los issues #13–#21 y el PR #22 existen. La creación del tablero de organización fue rechazada con Resource not accessible by integration (createProjectV2). La conexión necesita permiso de Projects de organización de lectura/escritura; los permisos de administrador del repositorio no lo conceden automáticamente. Hasta disponer de esa autorización, la épica #13 sigue siendo el índice operativo.
