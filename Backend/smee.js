import SmeeClient from 'smee-client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const smee_source = process.env.SMEE_SOURCE;

const smee = new SmeeClient({
    source: `https://smee.io/${smee_source}`,
    target: 'http://localhost:5000/webhook',
    logger: console
})

const connectSmee = () => {
    const events = smee.start();
    return events;
}

export default connectSmee;