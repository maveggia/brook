import express from "express";
import morgan from "morgan";
import path from "path";
import paymentRoutes from "./routes/payment.routes.js";
import mysql from 'mysql';

const app = express();

const connectionProductos = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'remeras_productos',
    port: '3306' 
});

const connectionClientes = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'clientes_ordenes',
    port: '3306' 
});

connectionProductos.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos "remeras_productos": ', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos "remeras_productos"');
});

connectionClientes.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos "clientes_ordenes": ', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos "clientes_ordenes"');
});

app.use(morgan("dev"));
app.use(express.static(path.resolve("src/public")));
app.use(express.json());
app.use(paymentRoutes);

app.post('/create-order', (req, res) => {
    const { selectEnvio } = req.body;
    let nombre, dni, direccion, entreCalles, cp, celular, correoElectronico;

    if (selectEnvio === "encomienda") {
        ({ nombreEncomienda: nombre, dniEncomienda: dni, direccionEncomienda: direccion, entreCallesEncomienda: entreCalles, cpEncomienda: cp, celularEncomienda: celular, emailEncomienda: correoElectronico } = req.body);
    } else if (selectEnvio === "motomensajeria") {
        ({ nombreMotomensajeria: nombre, dniMotomensajeria: dni, direccionMotomensajeria: direccion, entreCallesMotomensajeria: entreCalles, cpMotomensajeria: cp, celularMotomensajeria: celular, emailMotomensajeria: correoElectronico } = req.body);
    }

    const sqlInsertOrder = `INSERT INTO clientes_ordenes.clientes (nombre_apellido, dni, direccion, entre_calles, codigo_postal, celular, correo_electronico) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    connectionClientes.query(sqlInsertOrder, [nombre, dni, direccion, entreCalles, cp, celular, correoElectronico], (error, results) => {
        if (error) {
            console.error('Error al insertar información del cliente:', error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
        console.log('Información del cliente insertada correctamente');
        return res.status(200).json({ message: 'Información del cliente insertada correctamente' });
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});

export { connectionProductos, connectionClientes };
