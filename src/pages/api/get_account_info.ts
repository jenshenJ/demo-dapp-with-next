import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // In a real app, you would verify the token here
        const token = authHeader.substring(7);

        // Return mock account info
        return res.status(200).json({
            address: "EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M",
            balance: "1000000000",
            network: "mainnet",
            lastActivity: new Date().toISOString(),
            transactions: [
                {
                    hash: "abc123",
                    amount: "1000000",
                    timestamp: new Date().toISOString()
                }
            ]
        });
    } catch (e) {
        return res.status(400).json({ error: 'Invalid request', trace: e });
    }
} 