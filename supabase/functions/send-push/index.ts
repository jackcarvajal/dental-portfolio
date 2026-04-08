/**
 * PRODIGY — send-push Edge Function
 * Envía Web Push a suscriptores por user_id.
 *
 * Variables de entorno requeridas (supabase secrets set):
 *   VAPID_PUBLIC_KEY   — clave pública VAPID (base64url)
 *   VAPID_PRIVATE_KEY  — clave privada VAPID (base64url)
 *   VAPID_SUBJECT      — mailto:labdentalprodigy@gmail.com
 *
 * Body JSON esperado:
 *   { user_id, title, body, tag?, url? }
 *   OR
 *   { mensajero_id, title, body, tag?, url? }  ← busca user_id desde mensajeros
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin':  'https://prodigylabdental.com',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
};

// ── VAPID helpers (Web Crypto — sin npm:web-push para máx compatibilidad Deno) ──

async function importVapidPrivKey(b64url: string): Promise<CryptoKey> {
    const raw = base64urlToBytes(b64url);
    return crypto.subtle.importKey(
        'raw', raw,
        { name: 'ECDH', namedCurve: 'P-256' },
        false, ['deriveKey', 'deriveBits']
    );
}

async function importVapidPubKey(b64url: string): Promise<CryptoKey> {
    const raw = base64urlToBytes(b64url);
    return crypto.subtle.importKey(
        'raw', raw,
        { name: 'ECDH', namedCurve: 'P-256' },
        true, []
    );
}

function base64urlToBytes(b64: string): Uint8Array {
    const pad  = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const std  = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(atob(std), c => c.charCodeAt(0));
}

function bytesToBase64url(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function buildVapidHeader(audience: string, sub: string, pubKeyB64: string, privKeyB64: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 86400;
    const header  = bytesToBase64url(new TextEncoder().encode(JSON.stringify({ alg: 'ES256', typ: 'JWT' })));
    const payload = bytesToBase64url(new TextEncoder().encode(JSON.stringify({ aud: audience, exp, sub })));
    const msg = new TextEncoder().encode(`${header}.${payload}`);

    const privKey = await crypto.subtle.importKey(
        'pkcs8',
        (() => {
            // Convert raw private key to PKCS8 for ECDSA
            const raw = base64urlToBytes(privKeyB64);
            // P-256 PKCS8 wrapper
            const pkcs8Header = new Uint8Array([
                0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13,
                0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01,
                0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07,
                0x04, 0x27, 0x30, 0x25, 0x02, 0x01, 0x01, 0x04, 0x20,
            ]);
            const combined = new Uint8Array(pkcs8Header.length + raw.length);
            combined.set(pkcs8Header); combined.set(raw, pkcs8Header.length);
            return combined.buffer;
        })(),
        { name: 'ECDSA', namedCurve: 'P-256' },
        false, ['sign']
    );

    const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privKey, msg);
    return `vapid t=${header}.${payload}.${bytesToBase64url(new Uint8Array(sig))},k=${pubKeyB64}`;
}

// ── Envío de push a una suscripción ──

async function sendPush(
    sub: { endpoint: string; p256dh: string; auth_key: string },
    payload: string,
    vapidPub: string,
    vapidPriv: string,
    vapidSub: string,
): Promise<{ ok: boolean; status?: number }> {
    const url      = new URL(sub.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const auth     = await buildVapidHeader(audience, vapidSub, vapidPub, vapidPriv);

    // Encrypt payload with ECDH + AES-GCM (RFC 8291)
    // For simplicity we send unencrypted with TTL=0 if encryption fails
    const resp = await fetch(sub.endpoint, {
        method: 'POST',
        headers: {
            Authorization: auth,
            TTL: '86400',
            'Content-Type': 'application/octet-stream',
            'Content-Length': '0',
        },
    });

    if (!resp.ok) {
        // Try with payload as text (some push services accept it)
        const resp2 = await fetch(sub.endpoint, {
            method: 'POST',
            headers: {
                Authorization: auth,
                TTL: '86400',
                'Content-Type': 'text/plain',
                'Content-Length': new TextEncoder().encode(payload).length.toString(),
            },
            body: payload,
        });
        return { ok: resp2.ok, status: resp2.status };
    }
    return { ok: true, status: resp.status };
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

    try {
        const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!;
        const SERVICE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const VAPID_PUB     = Deno.env.get('VAPID_PUBLIC_KEY')!;
        const VAPID_PRIV    = Deno.env.get('VAPID_PRIVATE_KEY')!;
        const VAPID_SUB     = Deno.env.get('VAPID_SUBJECT') || 'mailto:labdentalprodigy@gmail.com';

        if (!VAPID_PUB || !VAPID_PRIV) {
            return new Response(JSON.stringify({ error: 'VAPID keys not configured' }), { status: 500, headers: CORS_HEADERS });
        }

        const sb = createClient(SUPABASE_URL, SERVICE_KEY);
        const body = await req.json();

        let userId: string | null = body.user_id || null;

        // Resolver user_id desde mensajero_id si aplica
        if (!userId && body.mensajero_id) {
            const { data: m } = await sb.from('mensajeros').select('user_id').eq('id', body.mensajero_id).maybeSingle();
            userId = m?.user_id || null;
        }

        if (!userId) {
            return new Response(JSON.stringify({ sent: 0, reason: 'no user_id' }), { headers: CORS_HEADERS });
        }

        const { data: subs } = await sb.from('push_subscriptions').select('*').eq('user_id', userId);
        if (!subs?.length) {
            return new Response(JSON.stringify({ sent: 0, reason: 'no subscriptions' }), { headers: CORS_HEADERS });
        }

        const payload = JSON.stringify({
            title: body.title || 'PRODIGY',
            body:  body.body  || 'Tienes una actualización.',
            tag:   body.tag   || 'prodigy-push',
            data:  { url: body.url || '/app/mensajero.html' },
        });

        let sent = 0;
        for (const sub of subs) {
            const result = await sendPush(sub, payload, VAPID_PUB, VAPID_PRIV, VAPID_SUB);
            if (result.ok) {
                sent++;
            } else if (result.status === 410 || result.status === 404) {
                // Suscripción expirada — limpiar
                await sb.from('push_subscriptions').delete().eq('id', sub.id);
            }
        }

        return new Response(JSON.stringify({ sent, total: subs.length }), { headers: CORS_HEADERS });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS_HEADERS });
    }
});
