// JWT 비밀 키 (실제 운영 환경에서는 복잡한 키 사용 필수)
const JWT_SECRET = "your_secret_key_here";

export function generateJWT(payload) {
    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = CryptoJS.HmacSHA256(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);
    const encodedSignature = CryptoJS.enc.Base64.stringify(signature);
    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

function verifyJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const [encodedHeader, encodedPayload, encodedSignature] = parts;
        const signature = CryptoJS.HmacSHA256(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);
        const calculatedSignature = CryptoJS.enc.Base64.stringify(signature);
        if (calculatedSignature !== encodedSignature) return null;
        const payload = JSON.parse(atob(encodedPayload));
        if (payload.exp < Math.floor(Date.now() / 1000)) {
            console.log('보안 토큰이 만료되었습니다');
            return null;
        }
        return payload;
    } catch (error) {
        return null;
    }
}

function isAuthenticated() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;
    const payload = verifyJWT(token);
    console.log(payload);
    return !!payload;
}

export function checkAuth() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        return false;
    }
    try {
        const payload = verifyJWT(token);
        console.log('토큰 payload:', payload);
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
            localStorage.removeItem('jwt_token');
            alert('토큰이 만료되었습니다.');
            window.location.href = '../login/login.html';
            return false;
        }
        alert('정상적으로 토큰이 검증되었습니다.');
        return true;
    } catch (e) {
        console.error('토큰 검증 오류:', e);
        localStorage.removeItem('jwt_token');
        alert('토큰 검증 중 오류가 발생했습니다.');
        window.location.href = '../login/login.html';
        return false;
    }
}

// 로그아웃 함수 추가
export function logout() {
    localStorage.removeItem('jwt_token');
    alert('로그아웃 되었습니다.');
    window.location.href = '../login/login.html';
}
