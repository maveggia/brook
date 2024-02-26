import mercadopago from 'mercadopago';

const configureMercadoPago = () => {
    mercadopago.configure({
        access_token: "APP_USR-8445183659364760-011801-4797eb48cb743e1b8e9c914449498083-1642443019",
    });
};

export default mercadopago;
