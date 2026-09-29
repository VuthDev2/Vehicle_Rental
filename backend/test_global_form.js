const crypto = require('crypto');

const MERCHANT_ID = 'ec477012';
const API_KEY = 'ce4b53b5c08f1e988db7cf6570a8b5dfc3685b48';
const req_time = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const tran_id = 'CR' + Date.now();
const amt = '120.00';
const itemsB64 = Buffer.from(JSON.stringify([{name: 'Porsche Taycan', quantity: 1, price: 120}])).toString('base64');
const firstname = 'Customer';
const lastname = '-';
const email = '';
const phone = '';
const type = 'purchase';
const paymentOption = 'abapay_khqr_deeplink';
const return_url = '';
const cancel_url = '';
const continue_success_url = '';
const currency = 'USD';

const sign = (str) => crypto.createHmac('sha512', API_KEY).update(str, 'utf8').digest('base64');

let b4hash = req_time + MERCHANT_ID + tran_id + amt + itemsB64 + '' + firstname + lastname + email + phone + type + paymentOption + return_url + cancel_url + continue_success_url + '' + currency;

const hash = sign(b4hash);

const form = new FormData();
form.set('req_time', req_time);
form.set('merchant_id', MERCHANT_ID);
form.set('tran_id', tran_id);
form.set('amount', amt);
form.set('items', itemsB64);
form.set('firstname', firstname);
form.set('lastname', lastname);
form.set('email', email);
form.set('phone', phone);
form.set('type', type);
form.set('payment_option', paymentOption);
form.set('currency', currency);
form.set('hash', hash);

fetch('https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase', { method: 'POST', body: form })
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
