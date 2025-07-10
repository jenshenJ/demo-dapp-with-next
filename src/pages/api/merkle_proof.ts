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

        // Create a mock merkle proof transaction
        const defaultBody = beginCell().storeUint(0, 32).storeStringTail("Merkle Proof").endCell();

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [
                {
                    address: 'EQD_5KMZVIqzYY91-t5CdRD_V71wRrVzxDXu9n2XEwz2wwdv',
                    amount: '5000000',
                    payload: defaultBody.toBoc().toString('base64'),
                },
            ],
        };

        return res.status(200).json(transaction);
    } catch (e) {
        return res.status(400).json({ error: 'Invalid request', trace: e });
    }
} 