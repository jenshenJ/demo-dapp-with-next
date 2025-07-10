import { NextApiRequest, NextApiResponse } from 'next';
import { sha256 } from "@ton/crypto";
import { createPayloadToken } from '../../server/utils/jwt';
import { TonProofService } from '../../server/services/ton-proof-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const service = new TonProofService();

        const randomBytes = await service.generateRandomBytes();
        const payloadToken = await createPayloadToken({
            randomBytes: randomBytes.toString('hex')
        });
        const payloadTokenHash = (await sha256(payloadToken)).toString('hex');

        return res.status(200).json({
            payloadToken: payloadToken,
            payloadTokenHash: payloadTokenHash,
        });
    } catch (e) {
        return res.status(400).json({ error: 'Invalid request', trace: e });
    }
} 