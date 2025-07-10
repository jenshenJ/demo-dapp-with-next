import { NextApiRequest, NextApiResponse } from 'next';
import { sha256 } from '@ton/crypto';
import { CheckProofRequest } from '../../server/dto/check-proof-request-dto';
import { TonProofService } from '../../server/services/ton-proof-service';
import { TonApiService } from '../../server/services/ton-api-service';
import { createAuthToken, verifyToken } from '../../server/utils/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = CheckProofRequest.parse(JSON.parse(req.body));

        const client = TonApiService.create(body.network);
        const service = new TonProofService();

        const isValid = await service.checkProof(body, (address) => client.getWalletPublicKey(address));

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid proof' });
        }

        const payloadTokenHash = body.proof.payload;
        const payloadToken = body.payloadToken;

        if (!await verifyToken(payloadToken)) {
            return res.status(400).json({ error: 'Invalid token' });
        }

        if ((await sha256(payloadToken)).toString('hex') !== payloadTokenHash) {
            return res.status(400).json({ error: 'Invalid payload token hash' });
        }

        const token = await createAuthToken({ address: body.address, network: body.network });

        return res.status(200).json({ token });
    } catch (e) {
        console.log('ОШИБКА',e);
        return res.status(400).json({ error: 'Invalid request', trace: e });
    }
} 