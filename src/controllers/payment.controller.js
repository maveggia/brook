import fs from "fs";
import fetch from "node-fetch";
import mercadopago from 'mercadopago';
import { connectionClientes } from '../index.js';
import { connectionProductos } from '../index.js';

const logsDirectory = "./logs";
const logFilePath = "./logs/nuevos_pedidos.log";
const counterFilePath = "./logs/pedido_counter.txt";

if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory);
}
let pedidoCounter = fs.existsSync(counterFilePath) ? parseInt(fs.readFileSync(counterFilePath, 'utf8')) : 0;

export const createOrder = async (req, res) => {
    console.log(`Nuevo Pedido Recibido - ${pedidoCounter + 1}`);
    const {
        nombre_apellido,
        dni,
        direccion,
        entre_calles,
        cp,
        celular,
        correo_electronico
    } = req.body;

    console.log("Valores recibidos del formulario:", req.body);

    if (!req.body.items || !Array.isArray(req.body.items)) {
        console.log('No se proporcionaron items en la solicitud');
        return res.status(400).json({ message: 'Invalid request format: items must be an array' });
    }

    try {
        const { items } = req.body;
        const processedItems = [];

        for (const item of items) {
            if (!validateItem(item)) {
                console.warn('Item sin propiedades esperadas:', item);
                return res.status(400).json({ message: 'Invalid item format' });
            }

            processedItems.push({
                title: item.title,
                unit_price: item.unit_price,
                currency_id: item.currency_id,
                quantity: item.quantity,
            });
        }

        const preference = {
            items: processedItems,
            notification_url: "https://da7c-2800-2161-5000-72d-ed34-bec1-8966-fffc.ngrok-free.app/webhook",
            back_urls: {
                success: "https://da7c-2800-2161-5000-72d-ed34-bec1-8966-fffc.ngrok-free.app/success",
                pending: "https://da7c-2800-2161-5000-72d-ed34-bec1-8966-fffc.ngrok-free.app/pending",
                failure: "https://da7c-2800-2161-5000-72d-ed34-bec1-8966-fffc.ngrok-free.app/failure",
            },
        };

        const sqlInsertOrder = `INSERT INTO clientes_ordenes.clientes (nombre_apellido, dni, direccion, entre_calles, codigo_postal, celular, correo_electronico) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        connectionClientes.query(sqlInsertOrder, [nombre_apellido, dni, direccion, entre_calles, cp, celular, correo_electronico], (error, results) => {
            if (error) {
                console.error('Error al insertar información del cliente:', error);
                return res.status(500).json({ message: 'Error interno del servidor' });
            }
            console.log('Información del cliente insertada correctamente');
        });

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer APP_USR-8445183659364760-011801-4797eb48cb743e1b8e9c914449498083-1642443019',
            },
            body: JSON.stringify(preference),
        });

        const result = await response.json();

        const logData = `Nuevo Pedido Recibido - ${pedidoCounter + 1}:\n${JSON.stringify(processedItems, null, 2)}\n\n`;
        fs.appendFileSync(logFilePath, logData);
        pedidoCounter++;
        fs.writeFileSync(counterFilePath, pedidoCounter.toString());

        console.log(result);
        res.json({ init_point: result.init_point });
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

function validateItem(item) {
    return item && item.title && item.unit_price && item.currency_id && item.quantity;
}

export const receiveWebhook = async (req, res) => {
    try {
        const payment = req.query;
        console.log(payment);
        
        if (payment.type === "payment") {
            const data = await mercadopago.payment.findById(payment["data.id"], { access_token: accessToken });
            console.log(data);
        }

        res.sendStatus(204);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
