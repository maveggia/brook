import fs from "fs";
import mercadopage from "mercadopago";

const logsDirectory = "./logs";
const logFilePath = "./logs/nuevos_pedidos.log";
const counterFilePath = "./logs/pedido_counter.txt";

if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory);
}
let pedidoCounter = fs.existsSync(counterFilePath) ? parseInt(fs.readFileSync(counterFilePath, 'utf8')) : 0;

export const createOrder = async (req, res) => {
    mercadopage.configure({
        access_token: "APP_USR-8445183659364760-011801-4797eb48cb743e1b8e9c914449498083-1642443019",
    });

    console.log(`Nuevo Pedido Recibido - ${pedidoCounter + 1}`);

    if (!req.body.items || !Array.isArray(req.body.items)) {
        console.log('No se proporcionaron items en la solicitud');
        return res.status(400).json({ message: 'Invalid request format: items must be an array' });
    }

    try {
        const { items } = req.body;
        const processedItems = [];
        
        for (const item of items) {
            if (item && item.title && item.unit_price && item.currency_id && item.quantity) {
                processedItems.push({
                    title: item.title,
                    unit_price: item.unit_price,
                    currency_id: item.currency_id,
                    quantity: item.quantity,
                });
            } else {
                console.warn('Item sin propiedades esperadas:', item);
            }
        }

        const result = await mercadopage.preferences.create({
            items: processedItems,
            notification_url: "https://3ded-2800-2161-5000-72d-b539-2138-e492-c6bb.ngrok-free.app/webhook",
            back_urls: {
                success: "https://e720-190-237-16-208.sa.ngrok.io/success",
                pending: "https://e720-190-237-16-208.sa.ngrok.io/pending",
                failure: "https://e720-190-237-16-208.sa.ngrok.io/failure",
            },
        });

        const logData = `Nuevo Pedido Recibido - ${pedidoCounter + 1}:\n${JSON.stringify(processedItems, null, 2)}\n\n`;
        fs.appendFileSync(logFilePath, logData);

        pedidoCounter++;
        fs.writeFileSync(counterFilePath, pedidoCounter.toString());

        console.log(result);
        res.json({ init_point: result.body.init_point }); // Enviar init_point en la respuesta
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const receiveWebhook = async (req, res) => {
    try {
        const payment = req.query;
        console.log(payment);
        
        if (payment.type === "payment") {
            const data = await mercadopage.payment.findById(payment["data.id"]);
            console.log(data);
        }

        res.sendStatus(204);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
