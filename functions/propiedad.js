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
      return (i !== -1 && propiedad[i]) ? propiedad[i].replace(/"/g, '').trim() : "";
    };

    // --- Lógica de Galería ---
    const fotos = [];
    for (let n = 1; n <= 8; n++) {
      const u = getDato(`FOTO URL ${n}`);
      if (u && u.startsWith('http')) fotos.push(u);
    }

    // --- Metadatos Dinámicos ---
    const tituloMeta = `${getDato("TÍTULO")} - Artefox Real Estate`;
    const descMeta = `${getDato("OPERACIÓN")} de ${getDato("TIPO")} en ${getDato("ZONA")} con: ${getDato("HABITACIONES")} habitaciones, ${getDato("BAÑOS")} baños, ${getDato("ÁREA DEL LOTE")} de área.`;
    const imagenMeta = fotos[0] || "";

    return new Response(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <title>${tituloMeta}</title>
    <meta name="description" content="${descMeta}">
    <meta property="og:title" content="${tituloMeta}">
    <meta property="og:description" content="${descMeta}">
    <meta property="og:image" content="${imagenMeta}">
    <meta property="og:type" content="website">

    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap"></noscript>
    
    <link rel="stylesheet" type="text/css" href="/css/inmobiliaria.css">
    <link rel="stylesheet" type="text/css" href="/css/icons.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/magnific-popup/dist/magnific-popup.css">
    
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/magnific-popup/dist/jquery.magnific-popup.min.js"></script>
    <script src="/script.js"></script>

    <style>
        /* Aquí pegué todo tu CSS original */
        body { background: var(--color-gris-1); font-family: 'Montserrat', sans-serif; }
        .contenido-propiedad { display: grid; gap: 20px; }
        @media (min-width: 768px) {
            .contenido-propiedad { grid-template-columns: repeat(6, 1fr); }
            .col-iz { grid-column: span 4; }
            .col-de { grid-column: span 2; }
        }
        .detalles-items-fx { padding: 25px; background: rgba(234,236,240,1); border: solid 2px #ccc; border-radius: 7px; }
        @media (min-width: 768px) { .detalles-items-fx { grid-template-columns: 1fr 1fr; display: grid; gap: 0 30px; } }
        .item-detalle-fx { display: flex; justify-content: space-between; border-bottom: 1px solid #dce0e0; padding: 8px 0px; }
        .item-detalle-fx span:first-child { font-weight: 600; }
        .grupo-bloque-fx { margin-bottom: 20px; background: #fff; padding: 18px; border-radius: 8px; }
        .cabecera-fx .precio p { font-size: 23px; font-weight: 800; color: var(--color-negro-1); }
        .contenodie .mySwiper2 { padding-top: 70% !important; position: relative; border-radius: 8px; overflow: hidden; }
        .contenodie .swiper-slide a { display: block; width: 100%; height: 100%; background-size: cover; background-position: center; }
        .miniaturas-fx-galeria .swiper-slide img { width: 100%; height: 100%; object-fit: cover; }
        .btn-whatsapp { width: 100%; background: #25d366; color: #fff; border: none; padding: 12px; border-radius: 5px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; }
    </style>
</head>
<body>
    <header class="header">
        <div class="contenedor-header">
            <h1 class="logo"><a href="/index.html"><img src="/imagenes/logo-real-state-fx-2.png" alt="Logo"></a></h1>
            <nav class="menu">
                <ul>
                    <li><a href="/index.html">Inicio</a></li>
                    <li><a href="/propiedades.html">Propiedades</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main>
        <section class="detalle-propiedad relleno-1">
            <article class="contenedor contenido-propiedad bloques">
                <div class="col-iz">
                    <div class="galeria-fx">
                        <div class="contenodie">
                            <div class="swiper mySwiper2">
                                <div class="swiper-wrapper">
                                    ${fotos.map(f => `
                                        <div class="swiper-slide">
                                            <a href="${f}" class="popup-image" style="background-image: url('${f}');"></a>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="swiper-button-next"></div>
                                <div class="swiper-button-prev"></div>
                            </div>
                            <div thumbsSlider="" class="swiper mySwiper miniaturas-fx-galeria">
                                <div class="swiper-wrapper">
                                    ${fotos.map(f => `
                                        <div class="swiper-slide">
                                            <img src="${f}" alt="miniatura">
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="swiper-button-next mini-next"></div>
                                <div class="swiper-button-prev mini-prev"></div>
                            </div>
                        </div>
                    </div>

                    <div class="grupo-bloque-fx grupo-detalle">
                        <span class="detalle-fx">
                            <span class="doemitorios"><i class="houzez-icon icon-hotel-double-bed-1 me-2"></i> ${getDato("HABITACIONES")} <span class="bloque-texto-fx">Habitaciones</span></span>
                            <span class="banos"><i class="houzez-icon icon-bathroom-shower-1 me-2"></i> ${getDato("BAÑOS")} <span class="bloque-texto-fx">Baños</span></span>
                            <span class="area-lote"><i class="houzez-icon icon-ruler-triangle me-2"></i> ${getDato("ÁREA DEL LOTE")} <span class="bloque-texto-fx">Área</span></span>
                            <span class="estacionamientos"><i class="houzez-icon icon-car-1 me-2"></i> ${getDato("ESTACIONAMIENTO")} <span class="bloque-texto-fx">Parqueos</span></span>
                        </span>
                    </div>

                    <div class="grupo-bloque-fx cabecera-fx">
                        <span class="titulo">
                            <h1>${getDato("TÍTULO")}</h1>
                            <p style="color:var(--color-maestro);">📍 ${getDato("DIRECCIÓN")} - ${getDato("CIUDAD/UBICACIÓN")}</p>
                        </span>
                        <span class="precio">
                            <p>$ ${getDato("PRECIO")}</p>
                        </span>
                    </div>
                
                    <div class="grupo-bloque-fx descripcion-fx">
                        <h2>Descripción</h2>
                        <p style="white-space: pre-wrap;">${getDato("DESCRIPCIÓN")}</p>
                    </div>

                    <div class="grupo-bloque-fx detalles-fx">
                        <h2>Detalles</h2>
                        <div class="detalles-items-fx">
                            <div class="item-detalle-fx"><span>Tipo:</span> <span>${getDato("TIPO")}</span></div>
                            <div class="item-detalle-fx"><span>Operación:</span> <span>${getDato("OPERACIÓN")}</span></div>
                            <div class="item-detalle-fx"><span>Precio:</span> <span>$ ${getDato("PRECIO")}</span></div>
                            <div class="item-detalle-fx"><span>Habitaciones:</span> <span>${getDato("HABITACIONES")}</span></div>
                            <div class="item-detalle-fx"><span>Baños:</span> <span>${getDato("BAÑOS")}</span></div>
                            <div class="item-detalle-fx"><span>Área construida:</span> <span>${getDato("ÁREA CONSTRUIDA")}</span></div>
                            <div class="item-detalle-fx"><span>País:</span> <span>${getDato("PÁIS")}</span></div>
                            <div class="item-detalle-fx"><span>Ciudad:</span> <span>${getDato("CIUDAD/UBICACIÓN")}</span></div>
                            <div class="item-detalle-fx"><span>Zona:</span> <span>${getDato("ZONA")}</span></div>
                        </div>
                    </div>
                </div>

                <div class="col-de">
                    <div class="grupo-bloque-fx formulario-fx">
                        <div class="formulario-contacto">
                            <h3 style="margin-top:0">¿Te interesa?</h3>
                            <a href="https://wa.me/3232844851?text=Hola,%20me%20interesa%20la%20propiedad:%20${getDato("TÍTULO")}%20(ID:%20${idBusqueda})" class="btn-whatsapp">
                                <i class="houzez-icon icon-messaging-whatsapp" style="font-size: 20px;"></i>
                                Contactar por WhatsApp
                            </a>
                            <p style="font-size:12px; text-align:center; margin-top:10px; color:#666">O déjanos tus datos y te llamamos.</p>
                        </div>
                    </div>
                </div>
            </article>
        </section>
    </main>

    <footer class="footer relleno-1">
        <div class="contenedor">
            <article class="info">
                <img class="logo-footer" src="/imagenes/logo-real-state-fx-2.png" alt="logo">
                <p>&copy; 2026 Inmobiliaria RealState - Santo Grial por Artefox</p>
            </article>
        </div>
    </footer>

    <script>
        document.addEventListener("DOMContentLoaded", function() {
            var swiperThumbs = new Swiper(".mySwiper", {
                spaceBetween: 10,
                slidesPerView: 4,
                freeMode: true,
                watchSlidesProgress: true,
                navigation: { nextEl: ".mini-next", prevEl: ".mini-prev" }
            });
            var swiperMain = new Swiper(".mySwiper2", {
                spaceBetween: 10,
                navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
                thumbs: { swiper: swiperThumbs }
            });

            jQuery(".popup-image").magnificPopup({
                type: "image",
                gallery: { enabled: true }
            });
        });
    </script>
</body>
</html>
    `, { headers: { "content-type": "text/html;charset=UTF-8" } });

  } catch (error) {
    return new Response("Error: " + error.message, { status: 500 });
  }
}
