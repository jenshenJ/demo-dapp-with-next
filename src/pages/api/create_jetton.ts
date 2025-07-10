import { NextApiRequest, NextApiResponse } from 'next';
import { beginCell } from '@ton/ton';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const body = req.body;

        // Create a mock jetton transaction
        const defaultBody = beginCell().storeUint(0, 32).storeStringTail("Create Jetton").endCell();

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [
                {
                    address: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
                    amount: '5000000',
                    stateInit: 'te6cckEBBAEAOgACATQCAQAAART/APSkE/S88sgLAwBI0wHQ0wMBcbCRW+D6QDBwgBDIywVYzxYh+gLLagHPFsmAQPsAlxCarA==',
                    payload: defaultBody.toBoc().toString('base64'),
                },
            ],
        };

        return res.status(200).json(transaction);
    } catch (e) {
        return res.status(400).json({ error: 'Invalid request', trace: e });
    }
} 