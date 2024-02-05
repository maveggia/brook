// index.js
import express from "express";
import morgan from "morgan";
import path from "path";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(express.static(path.resolve("src/public")));
app.use(express.json());
app.use(paymentRoutes);

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});
