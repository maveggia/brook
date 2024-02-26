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
        producto.dataset.precio = '8500';
        const tallaId = `talla${i}-${nombreOriginal.toLowerCase()}`;
        producto.innerHTML = `
            <div class="imagen-container">
                <div class="imagen" style="background-image: url('img/${nombreOriginal.toLowerCase()}.jpg')"></div>
            </div>
            <h2>${nombreParaUsuario}</h2>
            <p>Precio: $8500</p>
            <p>Detalles: Manga Corta</p>
            <div class="selector-tallas">
                <label for="${tallaId}">Talla:</label>
                <select id="${tallaId}" name="talla">
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                </select>
            </div>
            <button class="agregar-carrito">Agregar al Carrito</button>        `;
        productosContainer.appendChild(producto);
        const agregarCarritoBtn = producto.querySelector('.agregar-carrito');
        if (agregarCarritoBtn) {
            agregarCarritoBtn.addEventListener('click', function () {
                agregarAlCarrito(agregarCarritoBtn);
            });
        }
    });

    const selectEnvio = document.getElementById('select-envio');
    const listaCarrito = document.getElementById('lista-carrito');
    const totalCarrito = document.getElementById('total');
    const confirmarPedidoBtn = document.getElementById('confirmar-pedido');
    let carrito = [];

    selectEnvio.addEventListener('change', function () {
        const envioSeleccionado = selectEnvio.value;
        const costoEnvio = obtenerCostoEnvio(envioSeleccionado);

        const indiceEnvioExistente = carrito.findIndex(item => item.tipo === 'envio');
        if (indiceEnvioExistente !== -1) {
            carrito.splice(indiceEnvioExistente, 1);
        }

        const productoEnvio = {
            tipo: 'envio',
            nombre: obtenerNombreEnvio(envioSeleccionado),
            precio: costoEnvio,
            cantidad: 1,
        };

        carrito.push(productoEnvio);
        mostrarCarrito();
    });

    confirmarPedidoBtn.addEventListener('click', async () => {
        const alertasAnteriores = document.querySelectorAll('.alerta-envio');
        alertasAnteriores.forEach(alerta => alerta.remove());
    
        if (selectEnvio.value === "") {
            const alertaEspecifico = document.createElement('div');
            alertaEspecifico.classList.add('alerta-envio');
            alertaEspecifico.textContent = "Debes seleccionar un método de envío.";
            return;
        }
        const selectedForm = document.querySelector(".form-envio[style='display: block;']");
        
        if (selectedForm) {
            const requiredInputs = selectedForm.querySelectorAll("input[required]");
    
            let hayErrores = false;
    
            for (const input of requiredInputs) {
                if (!input.checkValidity()) {
                    const alertaGeneral = document.createElement('div');
                    alertaGeneral.textContent = "Completa este campo.";
                    hayErrores = true;
                }
            }
    
            if (hayErrores) {
                return;
            }
        }
        try {
            if (carrito.length === 0) {
                mostrarAlertaCarritoVacio();
                return;
            }
            const datosFormulario = {
                nombre: document.getElementById('nombreEncomienda').value,
                dni: document.getElementById('dniEncomienda').value,
                direccion: document.getElementById('direccionEncomienda').value,
                entreCalles: document.getElementById('entreCallesEncomienda').value,
                cp: document.getElementById('cpEncomienda').value,
                celular: document.getElementById('celularEncomienda').value,
                correoElectronico: document.getElementById('emailEncomienda').value
            };
            
            const productosEnCarrito = carrito.map(item => ({
                title: item.nombre,
                unit_price: item.precio,
                currency_id: "ARS",
                quantity: item.cantidad,
            }));
    
            const res = await fetch("http://localhost:3000/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ items: productosEnCarrito }),
            });
    
            if (res.ok) {
                const data = await res.json();
    
                if (data.init_point) {
                    window.location.href = data.init_point;
                } else {
                    console.error("Init_point not found in response");
                }
            } else {
                console.error("Failed to create order");
            }
        } catch (error) {
            console.error(error);
        }
    });

    listaCarrito.addEventListener('click', function (event) {
        if (event.target.classList.contains('quitar-producto')) {
            quitarDelCarrito(event.target);
        }
    });

    function obtenerNombreEnvio(envioSeleccionado) {
        switch (envioSeleccionado) {
            case 'encomienda':
                return 'Encomienda Clásica';
            case 'motomensajeria':
                return 'Envío Motomensajería';
            default:
                return 'Envío';
        }
    }

    function agregarAlCarrito(button) {
        const producto = button.closest('.producto');
        const nombreOriginal = producto.dataset.nombre; 
        const nombre = obtenerNombreParaUsuario(nombreOriginal); 
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
    }, 2000);
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
            li.dataset.envio = item.envio;
    
            if (item.talla) {
                li.textContent = `${item.nombre} - Talla: ${item.talla} - Cantidad: ${item.cantidad} - Precio: $${item.precio * item.cantidad}`;
            } else {
                li.textContent = `${item.nombre} - Precio: $${item.precio}`;
            }
    
            const quitarBtn = document.createElement('button');
            
            if (item.talla) {
                quitarBtn.classList.add('quitar-producto');
            } else {
                quitarBtn.classList.add('quitar-envio');
                quitarBtn.style.display = 'none'; 
            }
    
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
