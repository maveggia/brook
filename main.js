document.addEventListener('DOMContentLoaded', function () {
    const carritoBtn = document.getElementById('carrito-btn');
    const whatsappIcon = document.querySelector('.whatsapp-icon');
    const instagramIcon = document.querySelector('.instagram-logo');
    const rutaImagenCarrito = 'img/carrito.png';
    carritoBtn.innerHTML = `<img src="${rutaImagenCarrito}" alt="Carrito de compras">`;

    carritoBtn.addEventListener('click', function () {
        const carritoSection = document.getElementById('carrito');
        const carritoSectionTop = carritoSection.offsetTop;
        window.scrollTo({
            top: carritoSectionTop,
            behavior: 'smooth'
        });
    });
    window.addEventListener('scroll', function () {
        const distanceFromTop = window.scrollY;
        const distanceToBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
        if (distanceFromTop > 100) {
            if (carritoBtn) carritoBtn.style.display = 'block';
        } else {
            if (carritoBtn) carritoBtn.style.display = 'none';
        }
        if (distanceToBottom < 100) {
            if (whatsappIcon) whatsappIcon.style.display = 'none';
            if (instagramIcon) instagramIcon.style.display = 'none';
        } else {
            if (whatsappIcon) whatsappIcon.style.display = 'block';
            if (instagramIcon) instagramIcon.style.display = 'block';
        }
    });
    const productosContainer = document.getElementById('productos');
    const nombresRemeras = [
        'Miller',
        'Colors',
        'Eminem',
        'Mari',
        'Train',
        'Tears',
        'Rock',
        'Cala',
        'Heart'
    ];
    nombresRemeras.forEach((nombreOriginal, i) => {
        const nombreParaUsuario = obtenerNombreParaUsuario(nombreOriginal);
        const producto = document.createElement('article');
        producto.classList.add('producto');
        producto.dataset.nombre = nombreOriginal;
        producto.dataset.precio = '25';
        const tallaId = `talla${i}-${nombreOriginal.toLowerCase()}`;
        producto.innerHTML = `
            <div class="imagen-container">
                <div class="imagen" style="background-image: url('img/${nombreOriginal.toLowerCase()}.jpg')"></div>
            </div>
            <h2>${nombreParaUsuario}</h2>
            <p>Precio: $25</p>
            <p>Detalles: Manga Corta</p>
            <div class="selector-tallas">
                <label for="${tallaId}">Talla:</label>
                <select id="${tallaId}" name="talla">
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                </select>
            </div>
            <button class="agregar-carrito">Agregar al Carrito</button>
        `;
        productosContainer.appendChild(producto);
    });

    const listaCarrito = document.getElementById('lista-carrito');
    const totalCarrito = document.getElementById('total');
    const confirmarPedidoBtn = document.getElementById('confirmar-pedido');
    let carrito = [];
    productosContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('agregar-carrito')) {
            agregarAlCarrito(event.target);
        }
    });
    confirmarPedidoBtn.addEventListener('click', function () {
        if (carrito.length === 0) {
            mostrarAlertaCarritoVacio();
        } else {
            // Redirige a la página de pago
            redirigirAPaginaDePago();
        }
    });
    listaCarrito.addEventListener('click', function (event) {
        if (event.target.classList.contains('quitar-producto')) {
            quitarDelCarrito(event.target);
        }
    });
    function agregarAlCarrito(button) {
        const producto = button.closest('.producto');
        const nombre = producto.dataset.nombre;
        mostrarLeyenda('Producto agregado');
        const precio = Number(producto.dataset.precio);
        const talla = obtenerTallaSeleccionada(producto);
        const productoEnCarrito = carrito.find(item => item.nombre === nombre && item.talla === talla);
        if (productoEnCarrito) {
            productoEnCarrito.cantidad++;
        } else {
            carrito.push({
                nombre,
                precio,
                talla,
                cantidad: 1
            });
        }
        mostrarCarrito();
    }
    function mostrarLeyenda(mensaje) {
        const leyenda = document.getElementById('producto-agregado-leyenda');
        leyenda.textContent = mensaje;
        leyenda.style.display = 'block';
        leyenda.style.position = 'fixed';
        leyenda.style.top = '0';
        leyenda.style.left = '50%';
        leyenda.style.transform = 'translateX(-50%)';
        setTimeout(function () {
            leyenda.style.display = 'none';
        }, 1000);
    }
    function quitarDelCarrito(button) {
        const li = button.closest('li');
        const nombre = li.dataset.nombre;
        const talla = li.dataset.talla;
        const productoEnCarrito = carrito.find(item => item.nombre === nombre && item.talla === talla);
        if (productoEnCarrito) {
            if (productoEnCarrito.cantidad > 1) {
                productoEnCarrito.cantidad--;
            } else {
                carrito = carrito.filter(item => !(item.nombre === nombre && item.talla === talla));
            }
            mostrarCarrito();
        }
    }
    function mostrarCarrito() {
        listaCarrito.innerHTML = '';
        totalCarrito.textContent = `Total: $${calcularTotal()}`;
        carrito.forEach(item => {
            const li = document.createElement('li');
            li.dataset.nombre = item.nombre;
            li.dataset.talla = item.talla;
            li.textContent = `${item.nombre} - Talla: ${item.talla} - Cantidad: ${item.cantidad} - Precio: $${item.precio * item.cantidad}`;
            const quitarBtn = document.createElement('button');
            quitarBtn.classList.add('quitar-producto');
            quitarBtn.textContent = 'Quitar';
            li.appendChild(quitarBtn);
            listaCarrito.appendChild(li);
        });
    }
    function calcularTotal() {
        return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
    }
    function obtenerTallaSeleccionada(producto) {
        const selectorTallas = producto.querySelector('.selector-tallas select');
        return selectorTallas ? selectorTallas.value : null;
    }
    function redirigirAPaginaDePago() {
        window.location.href = "https://link.mercadopago.com.ar/chinomp";
    }
    function mostrarAlertaCarritoVacio() {
        alert('El carrito está vacío. Agrega productos antes de confirmar el pedido.');
    }
    function obtenerNombreParaUsuario(nombreOriginal) {
        const nombresMapeados = {
            'Miller': 'Mac Miller',
            'Colors': 'Colors',
            'Eminem': 'Eminem',
            'Mari': 'Marijuana',
            'Train': 'Trainspotting',
            'Tears': 'Tears',
            'Rock': 'Rock',
            'Cala': 'Dead',
            'Heart': 'Heart'
        };
        return nombresMapeados[nombreOriginal] || nombreOriginal;
    }
});