import { NextApiRequest, NextApiResponse } from 'next';
import { TonClient } from '@ton/ton';
import { Cell, loadMessage, Transaction } from '@ton/core';
import { getNormalizedExtMessageHash, retry } from '@/server/utils/transactions-utils';
import { jsonReplacer } from '@/server/utils/http-utils';

async function getTransactionByInMessage(
    inMessageBoc: string,
    client: TonClient,
): Promise<Transaction | undefined> {
    // Step 1. Convert Base64 boc to Message if input is a string
    const inMessage = loadMessage(Cell.fromBase64(inMessageBoc).beginParse());

    // Step 2. Ensure the message is an external-in message
    if (inMessage.info.type !== 'external-in') {
        throw new Error(`Message must be "external-in", got ${inMessage.info.type}`);
    }
    const account = inMessage.info.dest;

    // Step 3. Compute the normalized hash of the input message
    const targetInMessageHash = getNormalizedExtMessageHash(inMessage);

    let lt: string | undefined = undefined;
    let hash: string | undefined = undefined;

    // Step 4. Paginate through transaction history of account
    while (true) {
        const transactions = await retry(
            () =>
                client.getTransactions(account, {
                    hash,
                    lt,
                    limit: 10,
                    archival: true,
                }),
            { delay: 1000, retries: 3 },
        );

        if (transactions.length === 0) {
            // No more transactions found - message may not be processed yet
            return undefined;
        }

        // Step 5. Search for a transaction whose input message matches the normalized hash
        for (const transaction of transactions) {
            if (transaction.inMessage?.info.type !== 'external-in') {
                continue;
            }

            const inMessageHash = getNormalizedExtMessageHash(transaction.inMessage);
            if (inMessageHash.equals(targetInMessageHash)) {
                return transaction;
            }
        }

        const last = transactions.at(-1)!;
        lt = last.lt.toString();
        hash = last.hash().toString('base64');
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body;
        const boc = body.boc;
        const network = body.network;

        if (typeof boc !== 'string' || (network !== 'mainnet' && network !== 'testnet')) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const client = new TonClient({
            endpoint: `https://${network === 'testnet' ? 'testnet.' : ''}toncenter.com/api/v2/jsonRPC`,
        });

        const transaction = await getTransactionByInMessage(boc, client);
        const transactionJson = JSON.stringify(transaction, jsonReplacer);

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        return res.status(200).json({ transaction: JSON.parse(transactionJson) });
    } catch (e) {
        return res.status(400).json({
            error: 'Invalid request',
            trace: e instanceof Error ? e.message : e
        });
    }
} 