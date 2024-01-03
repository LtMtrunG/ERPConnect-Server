const express = require('express');

const app = express();
app.use(express.json());
app.use(express.static("../public"))


const stripe = require('stripe')('sk_test_51ORWc2DplToi6UQra8zjmk6QtCmT8dRv8z2GTumoVzl1wQ9CRlrkIueYLrZVpF921C7MbJNOJTKjlZw4v05ajfTU002X3C38GY');

app.post('/payment-sheet', async (req, res) => {
    try {
        const { customerId, action, amount } = req.body;
        console.log('Received customerId:', customerId); // Add this line for debugging

        // Check if the customer ID exists in your system
        if (!customerId) {
            return res.status(400).json({ error: 'No customerId received' });
        }

        const customer = await stripe.customers.retrieve(customerId);
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2023-10-16' }
        );

        let intent = '';
        if (action === 'setupIntent') {
            intent = await stripe.setupIntents.create({
                customer: customer.id,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
        } else {
            intent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'vnd',
                customer: customer.id,
                automatic_payment_methods: {
                    enabled: true,
                  },
            });
        }

        res.json({
            clientSecret: intent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
            publishableKey: 'pk_test_51ORWc2DplToi6UQrTbCGt0eg4emiu4SaE8a5VOeNmR4vEH6L9d3cfPmr3OxyDsVENLSak03AMWtEEGYdwurLEt6a001EjVM892',
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});

app.post('/connected-account', async (req, res) => {
    try {
        const account = await stripe.accounts.create({
            type: 'custom',
            country: 'SG',
            capabilities: {
              card_payments: {
                requested: true,
              },
              transfers: {
                requested: true,
              },
            },
          });
        res.json({ driverId: account.id});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server Error');
    }
});


// app.post('/get-payment-methods', async (req, res) => {
//     try {
//         const { customerId } = req.body;
//         console.log('Received customerId:', customerId); // Add this line for debugging

//         if (customerId) {
//             const paymentMethods = await stripe.paymentMethods.list({
//                 customer: customerId,
//                 type: 'card', // You can adjust this based on the type of payment methods you want to retrieve
//             });

//             res.json({ paymentMethods: paymentMethods.data });
//         } else {
//             res.status(400).send('No customerId received');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Server Error');
//     }
// });

app.listen(4242, () => console.log('Running on port 4242'));
