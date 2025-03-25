import crypto, { CipherGCM, DecipherGCM } from "crypto";
import { encrypted } from "./models";
import { Secret, enc_salt_rounds, max_age } from "../env";

export class SecureEncryption {
    private readonly secretKey: Buffer;
    private readonly algo: string;

    constructor() {
        // creates Secret from string to buffer because scryptSync does not take string
        const keyBuffer = Buffer.isBuffer(Secret)
            ? Secret
            : Buffer.from(Secret);

        this.secretKey = crypto.scryptSync(keyBuffer, "salt", enc_salt_rounds);
        this.algo = "aes-256-gcm";
    }

    public encrypt(userObject: Object) {
        try {
            const nonce: Buffer = crypto.randomBytes(12);
            const timestamp: number = Date.now();

            const cipher = crypto.createCipheriv(
                this.algo,
                this.secretKey,
                nonce,
            ) as CipherGCM;

            const data = {
                ...userObject,
                timestamp,
                nonce: nonce.toString("hex"),
            };

            let encrypt_data = cipher.update(
                JSON.stringify(data),
                "utf-8",
                "hex",
            );
            encrypt_data += cipher.final("hex");

            const authTag = cipher.getAuthTag();

            return {
                encrypt_data,
                nonce: nonce.toString("hex"),
                authTag: authTag.toString("hex"),
            };
        } catch (err) {
            throw new Error(`Encryption Failed :::: ${err as Error}.message`);
        }
    }

    public decrypt(encrypted: encrypted) {
        try {
            const { encrypt_data, nonce, authTag } = encrypted;
            const currentTime = Date.now();

            const nonceBuffer: Buffer = Buffer.from(nonce, "hex");

            const decipher = crypto.createDecipheriv(
                this.algo,
                this.secretKey,
                nonceBuffer,
            ) as DecipherGCM;

            const authTagBuffer = Buffer.from(authTag, "hex");

            decipher.setAuthTag(authTagBuffer);

            let decrypt_string = decipher.update(encrypt_data, "hex", "utf-8");
            decrypt_string += decipher.final("utf-8");

            const decrypt_data = JSON.parse(decrypt_string);

            const timestamp = decrypt_data.timestamp;
            const real_nonce = decrypt_data.nonce;
            if (currentTime - timestamp > max_age || real_nonce != nonce) {
                return "Request Expired";
            }

            return decrypt_data;
        } catch (err) {
            throw new Error(`Decipher failed ::: ${err as Error}.message`);
        }
    }
}
