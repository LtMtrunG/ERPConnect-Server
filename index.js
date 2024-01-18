const express = require('express');

const app = express();
app.use(express.json());
app.use(express.static("../public"))

const stripe = require('stripe')('sk_test_51OV2cBCI8KCBgRqhzwFZ18vrlxmlMEYnxPyC3Vte4mjid3hdAkFVLNNIEB02062CQrjFWnsXtzBxkR3qMzXyvEIg00961E4LUm');

app.get('/customers', async (req, res) => {
    try {
        const customers = await stripe.customers.list();
        console.log(customers);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

app.get('/subscriptions', async (req, res) => {
    try {
        const subscriptions = await stripe.subscriptions.list();
        console.log(subscriptions);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
})

app.listen(4242, () => console.log('Running on port 4242'));
