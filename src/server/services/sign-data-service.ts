import { Buffer } from "buffer";
import {
    CheckSignDataRequestDto,
} from "../dto/check-sign-data-request-dto";

const allowedDomains = ["ton-connect.github.io", "localhost:3000", "localhost:3002", "localhost:5173"];
const validAuthTime = 15 * 60; // 15 minutes

export class SignDataService {
    /**
     * Verifies sign-data signature.
     * Simplified implementation for demo purposes.
     */
    public async checkSignData(
        payload: CheckSignDataRequestDto,
        getWalletPublicKey: (address: string) => Promise<Buffer | null>
    ): Promise<boolean> {
        try {
            const {
                address,
                timestamp,
                domain,
            } = payload;

            // Check domain
            if (!allowedDomains.includes(domain)) {
                console.log("Domain not allowed:", domain);
                return false;
            }

            // Check timestamp
            const now = Math.floor(Date.now() / 1000);
            if (now - validAuthTime > timestamp) {
                console.log("Timestamp expired");
                return false;
            }

            // For demo purposes, return true if basic checks pass
            // In a real implementation, you would verify the signature here
            return true;
        } catch (e) {
            console.error("Sign data verification error:", e);
            return false;
        }
    }
} 