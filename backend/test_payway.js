const crypto = require('crypto');
const https = require('https');

const MERCHANT_ID = 'ec477012';
const API_KEY = 'ce4b53b5c08f1e988db7cf6570a8b5dfc3685b48';
const req_time = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
const tran_id = 'CR' + Date.now();
const amt = '120.00';
const itemsB64 = Buffer.from(JSON.stringify([{name: 'Vehicle Rental', quantity: 1, price: 120}])).toString('base64');
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

async function testHash(extraFields) {
  let b4hash = req_time + MERCHANT_ID + tran_id + amt + itemsB64 + '' + firstname + lastname + email + phone + type + paymentOption + return_url + cancel_url + continue_success_url + '' + currency;
  
  if (extraFields) {
    b4hash += '' + '' + '' + '' + '' + '' + ''; // custom_fields, return_params, payout, lifetime, additional_params, google_pay_token, skip_success_page
  }

  const hash = sign(b4hash);

  const FormData = require('form-data');
  const form = new FormData();
  form.append('req_time', req_time);
  form.append('merchant_id', MERCHANT_ID);
  form.append('tran_id', tran_id);
  form.append('amount', amt);
  form.append('items', itemsB64);
  form.append('firstname', firstname);
  form.append('lastname', lastname);
  form.append('email', email);
  form.append('phone', phone);
  form.append('type', type);
  form.append('payment_option', paymentOption);
  form.append('currency', currency);
  form.append('hash', hash);
  // Add missing fields as empty string if needed?
  // form.append('shipping', '');

  return new Promise((resolve) => {
    const req = https.request('https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase', {
      method: 'POST',
      headers: form.getHeaders()
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    form.pipe(req);
  });
}

(async () => {
  console.log("With extra fields:");
  console.log(await testHash(true));
  console.log("Without extra fields:");
  console.log(await testHash(false));
})();
