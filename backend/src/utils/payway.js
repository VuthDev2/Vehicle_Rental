/**
 * ABA PayWay (PWKH) helper — builds signed requests for the Purchase and
 * Check-Transaction APIs.
 *
 * Signing: hash = base64( HMAC_SHA512( concatenated_fields, PAYWAY_API_KEY ) )
 * The concatenation order is fixed by PayWay and every posted field must appear
 * in it (empty string for unused fields), in the exact order below.
 *
 * Docs: https://developer.payway.com.kh/ecommerce-checkout-3158159f0
 */
const crypto = require('crypto');

const MERCHANT_ID = process.env.PAYWAY_MERCHANT_ID;
const API_KEY = process.env.PAYWAY_API_KEY;
const PURCHASE_URL =
  process.env.PAYWAY_API_URL ||
  'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase';
const CHECK_TX_URL =
  process.env.PAYWAY_CHECK_TX_URL ||
  'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/check-transaction-2';
const CURRENCY = process.env.PAYWAY_CURRENCY || 'USD';

// UTC timestamp: YYYYMMDDHHmmss
const reqTime = () => new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

const b64 = (str) => Buffer.from(String(str), 'utf8').toString('base64');

const sign = (str) => crypto.createHmac('sha512', API_KEY).update(str, 'utf8').digest('base64');

const generateTranId = () =>
  `CR${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 20);

/**
 * Build the fields + action URL for an ABA PayWay purchase. The caller returns
 * these to the browser, which POSTs them as a form to `actionUrl`, landing the
 * user on ABA's hosted checkout page (KHQR / cards / ABA Pay).
 */
function buildPurchase({
  tranId,
  amount,
  items = [],
  firstname = '',
  lastname = '',
  email = '',
  phone = '',
  returnUrl = '',
  continueSuccessUrl = '',
  cancelUrl = '',
  paymentOption = '',
  // Not part of the hash. `hosted_view` + `payment_gate=0` makes the endpoint
  // return the full hosted checkout HTML page (cards + KHQR + ABA Pay) that the
  // browser can be redirected to, instead of the QR-only JSON response.
  viewType = 'hosted_view',
  paymentGate = '0',
}) {
  const req_time = reqTime();
  const merchant_id = MERCHANT_ID;
  const tran_id = tranId;
  const amt = Number(amount).toFixed(2);
  const itemsB64 = items && items.length ? b64(JSON.stringify(items)) : '';
  const type = 'purchase';
  const return_url = returnUrl ? b64(returnUrl) : '';
  const cancel_url = cancelUrl ? b64(cancelUrl) : '';
  const continue_success_url = continueSuccessUrl ? b64(continueSuccessUrl) : '';
  const currency = CURRENCY;

  // Unused fields — kept explicit so the hash order below is unambiguous.
  const shipping = '';
  const return_deeplink = '';
  const custom_fields = '';
  const return_params = '';
  const payout = '';
  const lifetime = '';
  const additional_params = '';
  const google_pay_token = '';
  const skip_success_page = '';

  const b4hash =
    req_time +
    merchant_id +
    tran_id +
    amt +
    itemsB64 +
    shipping +
    firstname +
    lastname +
    email +
    phone +
    type +
    paymentOption +
    return_url +
    cancel_url +
    continue_success_url +
    return_deeplink +
    currency +
    custom_fields +
    return_params +
    payout +
    lifetime +
    additional_params +
    google_pay_token +
    skip_success_page;

  const hash = sign(b4hash);

  // Only include the fields we actually use; every value here matches what went
  // into b4hash (omitted fields were empty in the hash too).
  const fields = {
    req_time,
    merchant_id,
    tran_id,
    amount: amt,
    items: itemsB64,
    firstname,
    lastname,
    email,
    phone,
    type,
    payment_option: paymentOption,
    return_url,
    cancel_url,
    continue_success_url,
    currency,
    hash,
  };

  // Excluded from the hash. Only send when set: `hosted_view` + `payment_gate=0`
  // yields the hosted HTML checkout; omitting them yields the QR JSON response.
  if (viewType) fields.view_type = viewType;
  if (paymentGate) fields.payment_gate = paymentGate;

  return { actionUrl: PURCHASE_URL, fields };
}

/**
 * Server-side call to ABA that returns a KHQR for a booking, so the app can
 * render the QR in its own modal (instead of redirecting to ABA's page).
 * Returns { qrString, qrImage, status } from ABA.
 */
async function requestKhqr(opts) {
  const { actionUrl, fields } = buildPurchase({
    ...opts,
    paymentOption: 'abapay_khqr_deeplink',
    viewType: '',
    paymentGate: '',
  });

  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.set(k, v ?? '');

  const resp = await fetch(actionUrl, { method: 'POST', body: form });
  const data = await resp.json().catch(() => ({}));
  return data;
}

/**
 * Query ABA for the real status of a transaction (used to reconcile a payment
 * on the success redirect, since ABA's server-to-server push can't reach a
 * localhost return_url during development).
 * Returns { approved, raw }.
 */
async function checkTransaction(tranId) {
  const req_time = reqTime();
  const hash = sign(req_time + MERCHANT_ID + tranId);

  const form = new URLSearchParams();
  form.set('req_time', req_time);
  form.set('merchant_id', MERCHANT_ID);
  form.set('tran_id', tranId);
  form.set('hash', hash);

  const resp = await fetch(CHECK_TX_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  const raw = await resp.json().catch(() => ({}));
  const approved =
    raw?.status?.code === '00' ||
    raw?.payment_status === 'APPROVED' ||
    raw?.payment_status_code === 0;

  return { approved, raw };
}

module.exports = { buildPurchase, requestKhqr, checkTransaction, generateTranId };
