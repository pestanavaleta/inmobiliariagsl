export async function onRequest(context) {
  const url = new URL(context.request.url);
  const idBusqueda = url.searchParams.get('id');

  if (!idBusqueda) return new Response("ID no proporcionado", { status: 400 });

  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1VctscCRyoQ-sdWa1vlGG0xsjjGY5Jznw6LaK20syz3g/export?format=csv";

  try {
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();
    const filas = csvText.split('\n').map(f => f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
    const encabezados = filas[0].map(h => h.replace(/"/g, '').trim().toUpperCase());
    const propiedad = filas.find(f => f[0].replace(/"/g, '').trim() === idBusqueda.trim());

    if (!propiedad) return new Response("Propiedad no encontrada", { status: 404 });

    const getDato = (nombre) => {
      const i = encabezados.indexOf(nombre.toUpperCase());
      return i !== -1 ? propiedad[i]?.replace(/"/g, '').trim() : "";
    };

    // Recolectar las 8 fotos
    const fotos = [];
    for (let n = 1; n <= 8; n++) {
      const urlFoto = getDato(`FOTO URL ${n}`);
      if (urlFoto && urlFoto.startsWith('http')) fotos.push(urlFoto);
    }

    return new Response(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${getDato("TÍTULO")} | Artefox</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
          <style>
              :root { --primary: #2563eb; --dark: #1e293b; }
              body { font-family: 'Inter', sans-serif; margin: 0; background: #f8fafc; }
              .container { max-width: 900px; margin: 0 auto; background: white; min-height: 100vh; }
              
              /* Galería */
              .swiper { width: 100%; height: 450px; }
              .swiper-slide img { width: 100%; height: 100%; object-fit: cover; }
              
              .content { padding: 2rem; }
              .price { font-size: 2rem; font-weight: 800; color: var(--primary); margin: 0; }
              .title { font-size: 1.5rem; color: var(--dark); margin: 0.5rem 0; }
              .location { color: #64748b; display: flex; align-items: center; gap: 5px; }
              
              .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem; margin: 2rem 0; padding: 1rem; background: #f1f5f9; border-radius: 12px; }
              .feature-item { text-align: center; }
              .feature-val { block; font-weight: bold; font-size: 1.1rem; color: var(--dark); }
              .feature-lab { display: block; font-size: 0.8rem; color: #64748b; }
              
              .description { line-height: 1.8; color: #334155; white-space: pre-wrap; }
              .cta-whatsapp { display: block; text-align: center; background: #25d366; color: white; padding: 1.2rem; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 2rem; transition: transform 0.2s; }
              .cta-whatsapp:hover { transform: scale(1.02); }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="swiper mySwiper">
                  <div class="swiper-wrapper">
                      ${fotos.map(f => `<div class="swiper-slide"><img src="${f}" /></div>`).join('')}
                  </div>
                  <div class="swiper-button-next"></div>
                  <div class="swiper-button-prev"></div>
                  <div class="swiper-pagination"></div>
              </div>

              <div class="content">
                  <p class="price">$ ${getDato("PRECIO")}</p>
                  <h1 class="title">${getDato("TÍTULO")}</h1>
                  <div class="location">📍 ${getDato("CIUDAD/UBICACIÓN")}, ${getDato("ZONA")}</div>

                  <div class="features">
                      <div class="feature-item"><span class="feature-val">${getDato("HABITACIONES")}</span><span class="feature-lab">Habitaciones</span></div>
                      <div class="feature-item"><span class="feature-val">${getDato("BAÑOS")}</span><span class="feature-lab">Baños</span></div>
                      <div class="feature-item"><span class="feature-val">${getDato("ÁREA CONSTRUIDA")}m²</span><span class="feature-lab">Área</span></div>
                      <div class="feature-item"><span class="feature-val">${getDato("OPERACIÓN")}</span><span class="feature-lab">Estado</span></div>
                  </div>

                  <h3 style="margin-top: 2rem;">Descripción</h3>
                  <div class="description">${getDato("DESCRIPCIÓN")}</div>

                  <a href="https://wa.me/TU_TELEFONO?text=Hola,%20me%20interesa%20la%20propiedad:%20${getDato("TÍTULO")}%20(ID:%20${idBusqueda})" class="cta-whatsapp">
                      Contactar por WhatsApp
                  </a>
              </div>
          </div>

          <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
          <script>
              var swiper = new Swiper(".mySwiper", {
                  navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
                  pagination: { el: ".swiper-pagination", clickable: true },
                  loop: true,
              });
          </script>
      </body>
      </html>
    `, { headers: { "content-type": "text/html;charset=UTF-8" } });

  } catch (error) {
    return new Response("Error: " + error.message, { status: 500 });
  }
}
