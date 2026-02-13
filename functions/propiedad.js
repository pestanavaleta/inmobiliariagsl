export async function onRequest(context) {
  const url = new URL(context.request.url);
  const idBusqueda = url.searchParams.get('id');

  if (!idBusqueda) {
    return new Response("Error: No se proporcionó un ID de propiedad.", { status: 400 });
  }

  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1VctscCRyoQ-sdWa1vlGG0xsjjGY5Jznw6LaK20syz3g/export?format=csv";

  try {
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();
    
    // Procesar las filas del CSV
    const filas = csvText.split('\n').map(fila => {
      return fila.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    });

    // 1. Obtener los encabezados (la primera fila del Excel)
    const encabezados = filas[0].map(h => h.replace(/"/g, '').trim().toUpperCase());

    // 2. Buscar la propiedad por ID
    const propiedad = filas.find(f => f[0].replace(/"/g, '').trim() === idBusqueda.trim());

    if (!propiedad) {
      return new Response(`Propiedad ${idBusqueda} no encontrada.`, { status: 404 });
    }

    // 3. FUNCIÓN PARA BUSCAR DATO POR NOMBRE DE COLUMNA
    const getDato = (nombreColumna) => {
      const index = encabezados.indexOf(nombreColumna.toUpperCase());
      return index !== -1 ? propiedad[index]?.replace(/"/g, '').trim() : "";
    };

    // 4. MAPEO REAL CON TUS NOMBRES DE COLUMNA
    const titulo = getDato("TÍTULO") || "Sin título";
    const precio = getDato("PRECIO") || "Consultar";
    const operacion = getDato("OPERACIÓN") || "";
    const descripcion = getDato("DESCRIPCIÓN") || "Sin descripción.";
    const habitaciones = getDato("HABITACIONES") || "0";
    const ciudad = getDato("CIUDAD/UBICACIÓN") || "";
    
    // Usamos FOTO URL 1 como imagen destacada
    const imagenDestacada = getDato("FOTO URL 1") || "https://via.placeholder.com/800x600?text=Sin+Foto";

    return new Response(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${titulo} - Artefox</title>
          <style>
              body { font-family: 'Segoe UI', sans-serif; background: #f4f7f6; margin: 0; padding: 20px; color: #333; }
              .card { max-width: 700px; margin: auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              .foto { width: 100%; height: 350px; object-fit: cover; background: #eee; }
              .info { padding: 25px; }
              .badge { background: #2980b9; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; text-transform: uppercase; }
              .precio { color: #27ae60; font-size: 28px; font-weight: bold; margin: 10px 0; }
              h1 { margin: 0; font-size: 24px; color: #2c3e50; }
              .detalles { display: flex; gap: 20px; margin: 15px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 15px; }
              .descripcion { line-height: 1.8; color: #555; }
          </style>
      </head>
      <body>
          <div class="card">
              <img src="${imagenDestacada}" class="foto" alt="${titulo}">
              <div class="info">
                  <span class="badge">${operacion}</span>
                  <div class="precio">$ ${precio}</div>
                  <h1>${titulo}</h1>
                  <p style="color: #888; margin-bottom: 20px;">📍 ${ciudad}</p>
                  
                  <div class="detalles">
                      <span>🛏️ ${habitaciones} Hab.</span>
                      <span>🚿 ${getDato("BAÑOS")} Baños</span>
                      <span>📐 ${getDato("ÁREA CONSTRUIDA")} m²</span>
                  </div>

                  <div class="descripcion">${descripcion}</div>
              </div>
          </div>
      </body>
      </html>
    `, { headers: { "content-type": "text/html;charset=UTF-8" } });

  } catch (error) {
    return new Response("Error: " + error.message, { status: 500 });
  }
}
