import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const secret = process.env.WEBHOOK_SECRET;

function verifySignature(req, res, buf, encoding) {

    console.log("PUT YOUR HANDS UP");

    const signature = req.headers['x-hub-signature-256'];

    if (!signature) {
        return res.status(403).send('No signature found on request');
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(buf);
    const digest = `sha256=${hmac.digest('hex')}`;

    if (signature !== digest) {
        return res.status(403).send('Request body digest did not match');
    }
}

export default verifySignature;