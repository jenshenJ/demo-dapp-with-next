import { NextApiRequest, NextApiResponse } from 'next';
import { Cell, loadMessage, TonClient, Transaction } from "@ton/ton";
import { getNormalizedExtMessageHash, retry } from '@/server/utils/transactions-utils';
import { jsonReplacer } from '@/server/utils/http-utils';

async function waitForTransaction(
    inMessageBoc: string,
    client: TonClient,
    retries: number = 10,
    timeout: number = 1000,
): Promise<Transaction | undefined> {
    const inMessage = loadMessage(Cell.fromBase64(inMessageBoc).beginParse());

    if (inMessage.info.type !== 'external-in') {
        throw new Error(`Message must be "external-in", got ${inMessage.info.type}`);
    }
    const account = inMessage.info.dest;

    const targetInMessageHash = getNormalizedExtMessageHash(inMessage);

    let attempt = 0;
    while (attempt < retries) {
        console.log(`Waiting for transaction to appear in network. Attempt: ${attempt}`);

        const transactions = await retry(
            () =>
                client.getTransactions(account, {
                    limit: 10,
                    archival: true,
                }),
            { delay: 1000, retries: 3 },
        );

        for (const transaction of transactions) {
            if (transaction.inMessage?.info.type !== 'external-in') {
                continue;
            }

            const inMessageHash = getNormalizedExtMessageHash(transaction.inMessage);
            if (inMessageHash.equals(targetInMessageHash)) {
                return transaction;
            }
        }

        await new Promise((resolve) => setTimeout(resolve, timeout));
    }

    return undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body;
        const network = body.network;
        const inMessageBoc = body.inMessageBoc;

        const client = new TonClient({
            endpoint: `https://${network === 'testnet' ? 'testnet.' : ''}toncenter.com/api/v2/jsonRPC`,
        });

        const transaction = await waitForTransaction(inMessageBoc, client);
        const transactionJson = JSON.stringify(transaction, jsonReplacer);
        return res.status(200).json({ transaction: JSON.parse(transactionJson) });
    } catch (e) {
        return res.status(400).json({
            error: 'Invalid request',
            trace: e instanceof Error ? e.message : e
        });
    }
} 