// Shared Google authentication helper for edge functions
// Supports domain-wide delegation for impersonating workspace users

// Helper: Base64URL encode (handles UTF-8 characters)
export function base64url(str: string): string {
  // Encode string to UTF-8 bytes first, then base64
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Get Google access token using service account with optional impersonation
export async function getGoogleAccessToken(
  serviceAccount: { client_email: string; private_key: string },
  scopes: string[],
  impersonateEmail?: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader = { alg: 'RS256', typ: 'JWT' };
  
  const jwtClaim: Record<string, any> = {
    iss: serviceAccount.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  // Add impersonation subject for domain-wide delegation
  if (impersonateEmail) {
    jwtClaim.sub = impersonateEmail;
  }

  const encodedHeader = base64url(JSON.stringify(jwtHeader));
  const encodedClaim = base64url(JSON.stringify(jwtClaim));
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  // Import and sign with private key
  const privateKeyPem = serviceAccount.private_key;
  const pemContents = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = base64url(
    String.fromCharCode(...new Uint8Array(signature))
  );

  const jwt = `${signatureInput}.${encodedSignature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    console.error('Google token exchange failed:', error);
    throw new Error(`Failed to authenticate with Google: ${error}`);
  }

  const { access_token } = await tokenResponse.json();
  return access_token;
}
