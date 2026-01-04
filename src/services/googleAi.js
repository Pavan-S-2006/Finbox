
import serviceAccount from './spartan-card-483210-r5-d7d3de109d48.json';

// --- Authentication Logic ---

const str2ab = (str) => {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

const importPrivateKey = async (pem) => {
    // Basic PEM cleanup to get the base64 body
    const binaryDerString = window.atob(
        pem.replace(/-----BEGIN PRIVATE KEY-----/, '')
            .replace(/-----END PRIVATE KEY-----/, '')
            .replace(/\s+/g, '')
    );
    const binaryDer = str2ab(binaryDerString);

    return await window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256",
        },
        false,
        ["sign"]
    );
};

const createJWT = async () => {
    const header = {
        alg: 'RS256',
        typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const claim = {
        iss: serviceAccount.client_email,
        scope: "https://www.googleapis.com/auth/cloud-platform",
        aud: serviceAccount.token_uri,
        exp: now + 3600,
        iat: now
    };

    const sHeader = JSON.stringify(header);
    const sClaim = JSON.stringify(claim);

    const partialToken = `${window.btoa(sHeader)}.${window.btoa(sClaim)}`;

    const privateKey = await importPrivateKey(serviceAccount.private_key);
    const signature = await window.crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        privateKey,
        str2ab(partialToken)
    );

    // Convert signature (ArrayBuffer) to Base64 Url Safe
    let base64Signature = window.btoa(String.fromCharCode(...new Uint8Array(signature)));
    // Make URL-safe: replace + with -, / with _, and remove padding =
    base64Signature = base64Signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return `${partialToken}.${base64Signature}`;
};

let cachedToken = null;
let tokenExpiry = 0;

const getAccessToken = async () => {
    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    try {
        const jwt = await createJWT();

        const response = await fetch(serviceAccount.token_uri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error_description || data.error);
        }

        cachedToken = data.access_token;
        // Expire slightly before actual expiry (usually 1 hour) to be safe
        tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;

        return cachedToken;
    } catch (error) {
        console.error("Auth Error:", error);
        throw error;
    }
};

// --- API Wrappers ---

export const transcribeAudio = async (audioBlob) => {
    // Convert blob to base64
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result.split(',')[1];

            try {
                const token = await getAccessToken();

                // Using Speech-to-Text V1
                const response = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        config: {
                            encoding: 'WEBM_OPUS',
                            sampleRateHertz: 48000,
                            languageCode: 'en-US',
                            model: 'default',
                            enableAutomaticPunctuation: true
                        },
                        audio: {
                            content: base64Audio,
                        },
                    }),
                });

                const data = await response.json();
                if (data.error) {
                    console.error('Google API Error:', data.error);
                    throw new Error(data.error.message);
                }

                const transcript = data.results
                    ?.map(result => result.alternatives[0].transcript)
                    .join('\n');

                resolve(transcript || '');
            } catch (error) {
                console.error('Error transcribing audio:', error);
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
    });
};

export const analyzeImage = async (imageFile) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.readAsDataURL(imageFile);
        reader.onloadend = async () => {
            const base64Image = reader.result.split(',')[1];

            try {
                const token = await getAccessToken();

                // Using Vision API V1
                const response = await fetch('https://vision.googleapis.com/v1/images:annotate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        requests: [
                            {
                                image: {
                                    content: base64Image,
                                },
                                features: [
                                    {
                                        type: 'DOCUMENT_TEXT_DETECTION',
                                    },
                                ],
                            },
                        ],
                    }),
                });

                const data = await response.json();
                if (data.error) {
                    console.error('Google API Error:', data.error);
                    throw new Error(data.error.message);
                }

                // Return full structured data for advanced parsing
                // responses[0] usually contains:
                // - fullTextAnnotation: { text, pages: [{ blocks: ... }] }
                // - textAnnotations: [ { description, boundingPoly: ... }, ... ]

                const responseData = data.responses[0];
                const fullText = responseData?.fullTextAnnotation?.text || '';
                const blocks = responseData?.fullTextAnnotation?.pages?.[0]?.blocks || [];
                const annotations = responseData?.textAnnotations || [];

                resolve({
                    text: fullText,
                    blocks: blocks,
                    annotations: annotations
                });
            } catch (error) {
                console.error('Error analyzing image:', error);
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
    });
};
