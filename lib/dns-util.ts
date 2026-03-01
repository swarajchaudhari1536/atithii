import dns from "dns";
import { promisify } from "util";

/**
 * This file uses Node.js native modules (dns, util).
 * It MUST ONLY be imported in Node.js environments.
 */

const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

export async function resolveMongoSrvManual(host: string) {
    try {
        // Set DNS servers to bypass potential SRV resolution issues
        try {
            dns.setServers(["8.8.8.8", "1.1.1.1"]);
        } catch (e) {
            console.warn("[DNS] Could not set servers:", e);
        }

        console.log(`[DNS] Manually resolving SRV for: ${host}`);
        const srvRecords = await resolveSrv(`_mongodb._tcp.${host}`);

        if (!srvRecords || srvRecords.length === 0) {
            return null;
        }

        const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(",");

        let txtOptions = "";
        try {
            const txt = await resolveTxt(host);
            if (txt && txt.length > 0) {
                txtOptions = txt.flat().join("&");
            }
        } catch {
            // TXT is optional
        }

        return { hosts, txtOptions };
    } catch (err: any) {
        console.warn("[DNS] Manual resolution failed:", err.message);
        return null;
    }
}
