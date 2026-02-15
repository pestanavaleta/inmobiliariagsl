
/*====MENÚ SUBMENÚS====*/

document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos los elementos principales
    const menu = document.querySelector('.menu');
    const openBtn = document.querySelector('.menu-toggle');
    const closeBtn = document.querySelector('.menu-close');
    const submenuTriggers = document.querySelectorAll('.submenu-trigger');

    /**
     * FUNCIÓN PARA CERRAR TODOS LOS SUBMENÚS
     * Útil para el efecto acordeón y para resetear el menú
     */
    const closeAllSubmenus = () => {
        submenuTriggers.forEach(trigger => {
            const parentLi = trigger.parentElement;
            const submenu = parentLi.querySelector('.submenu');
            if (submenu) submenu.classList.remove('show');
            parentLi.classList.remove('active');
        });
    };

    // 1. ABRIR MENÚ MÓVIL
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            menu.classList.add('active');
            // Bloquea el scroll del body al abrir (opcional pero recomendado)
            document.body.style.overflow = 'hidden';
        });
    }

    // 2. CERRAR MENÚ MÓVIL
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            menu.classList.remove('active');
            // Habilita el scroll del body al cerrar
            document.body.style.overflow = 'auto';
            // Reseteamos los submenús para que la próxima vez esté limpio
            closeAllSubmenus();
        });
    }

    // 3. LÓGICA DE SUBMENÚS (EFECTO ACORDEÓN)
    submenuTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            
            const parentLi = trigger.parentElement;
            const submenu = parentLi.querySelector('.submenu');
            
            // Si el que clicamos NO está abierto, cerramos los demás
            if (!parentLi.classList.contains('active')) {
                closeAllSubmenus();
                // Luego abrimos el actual
                submenu.classList.add('show');
                parentLi.classList.add('active');
            } else {
                // Si ya estaba abierto, simplemente lo cerramos
                submenu.classList.remove('show');
                parentLi.classList.remove('active');
            }
        });
    });

    // 4. CERRAR AL HACER CLIC FUERA DEL MENÚ
    document.addEventListener('click', (e) => {
        if (menu && menu.classList.contains('active')) {
            // Si el clic no es dentro del menú ni en el botón de abrir
            if (!menu.contains(e.target) && openBtn && !openBtn.contains(e.target)) {
                menu.classList.remove('active');
                document.body.style.overflow = 'auto';
                closeAllSubmenus();
            }
        }
    });
});
/*====FIN MENÚ SUBMENÚS====*/


/*====TAPS====*/
document.addEventListener('DOMContentLoaded', () => {
    const botonesFiltro = document.querySelectorAll('.filtro-btn');

    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', () => {
            // Quitamos la clase 'activo' de todos los botones
            botonesFiltro.forEach(b => b.classList.remove('activo'));
            
            // Se la ponemos al que acabamos de cliquear
            boton.classList.add('activo');
        });
    });
});
/*====FIN TAPS====*/


/*====RETRASO ANCLA====*/
const ejecutarScrollAncla = () => {
    if (window.location.hash) {
        const id = window.location.hash.substring(1);
        const elemento = document.getElementById(id);
        if (elemento) {
            // Un pequeño retraso para asegurar que el render de las tarjetas no mueva el scroll
            setTimeout(() => {
                elemento.scrollIntoView({ behavior: 'smooth' });
            }, 300); 
        }
    }
};

// 1. Ejecutar al cargar la página (con retraso para esperar al CSV)
window.addEventListener('load', ejecutarScrollAncla);

// 2. Ejecutar si el hash cambia sin recargar la página (clics en el menú)
window.addEventListener('hashchange', ejecutarScrollAncla);
/*====FIN RETRASO ANCLA====*/
