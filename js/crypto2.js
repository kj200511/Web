const encoder = new TextEncoder();
const decoder = new TextDecoder();

const passwordKeyRaw = encoder.encode("your-32-byte-secure-password-123!"); // 32바이트 키 (수정 가능)

async function getKeyMaterial() {
  return await crypto.subtle.importKey(
    "raw",
    passwordKeyRaw,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
}

async function getKey(keyMaterial, salt) {
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}
// crypto.js (또는 crypto2.js)

export async function encrypt_text_gcm(text) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const passwordKeyRaw = encoder.encode("your-32-byte-secure-password-123!");
  
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordKeyRaw,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoder.encode(text)
  );

  const encryptedArray = new Uint8Array([
    ...salt,
    ...iv,
    ...new Uint8Array(encryptedBuffer)
  ]);
  
  return btoa(String.fromCharCode(...encryptedArray));
}


export async function decrypt_text_gcm(base64Text) {
  const data = Uint8Array.from(atob(base64Text), c => c.charCodeAt(0));
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const ciphertext = data.slice(28);
  const keyMaterial = await getKeyMaterial();
  const key = await getKey(keyMaterial, salt);
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ciphertext
  );
  return decoder.decode(decryptedBuffer);
}
