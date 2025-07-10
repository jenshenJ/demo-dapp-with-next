import { NextApiRequest, NextApiResponse } from 'next';
import { CheckSignDataRequest } from '../../server/dto/check-sign-data-request-dto';
import { SignDataService } from '../../server/services/sign-data-service';
import { TonApiService } from '../../server/services/ton-api-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body;

        // Validate request body
        const validatedBody = CheckSignDataRequest.parse(body);

        const service = new SignDataService();
        const client = TonApiService.create(validatedBody.network);

        const isValid = await service.checkSignData(validatedBody, (address) =>
            client.getWalletPublicKey(address)
        );

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        return res.status(200).json({
            valid: true,
            message: "Signature verified successfully",
            payload: validatedBody.payload,
            address: validatedBody.address,
            timestamp: validatedBody.timestamp,
            domain: validatedBody.domain,
        });
    } catch (e) {
        return res.status(400).json({ error: "Invalid request", trace: e });
    }
} 