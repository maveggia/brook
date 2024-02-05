// payment.routes.js
import { Router } from "express";
import { createOrder, receiveWebhook } from "../controllers/payment.controller.js";


const router = Router();

router.post("/create-order", createOrder); // Cambiar a POST ya que el front-end hace una solicitud POST
router.post("/webhook", receiveWebhook); // Cambiar a POST también si es necesario

router.get("/success", (req, res) => res.send("Success"));

export default router;
