import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import verifySignature from './verifySignature.js';

const app = express();

app.use(cors());
app.use(bodyParser.json({verify: verifySignature}));

app.post('/exchange-code', async (req, res) => {
    console.log(req.body.code);
    return res.status(200).json({ access_token: 'edwjnowihnjn' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));