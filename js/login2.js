import { session_set, session_get, session_check } from './session.js';
import { encrypt_text, decrypt_text } from './crypto.js';
import { generateJWT, checkAuth } from './jwt_token.js';
import { encrypt_text_gcm, decrypt_text_gcm } from './crypto2.js';

function init() { // 로그인 폼에 쿠키에서 가져온 아이디 입력
    const emailInput = document.getElementById('typeEmailX');
    const idsave_check = document.getElementById('idSaveCheck');
    let get_id = getCookie("id");
    if (get_id) {
        emailInput.value = decodeURIComponent(get_id);
        idsave_check.checked = true;
    }
    session_check(); // 세션 유무 검사
}

function init_logined() {
    if (sessionStorage) {
        decrypt_text(); // 복호화 함수 호출
    } else {
        alert("세션 스토리지 지원하지 않는 브라우저입니다.");
    }
}

const check_xss = (input) => {
    // DOMPurify 라이브러리 사용한다고 가정 (CDN으로 로드 필요)
    const DOMPurify = window.DOMPurify;
    if (!DOMPurify) {
        alert('DOMPurify 라이브러리가 로드되지 않았습니다.');
        return false;
    }
    const sanitizedInput = DOMPurify.sanitize(input);
    if (sanitizedInput !== input) {
        alert('XSS 공격 가능성이 있는 입력값을 발견했습니다.');
        return false;
    }
    return sanitizedInput;
};

function setCookie(name, value, expiredays) {
    const date = new Date();
    date.setDate(date.getDate() + expiredays);
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + "; expires=" + date.toUTCString() + "; path=/; SameSite=None; Secure";
}

function getCookie(name) {
    const cookie = document.cookie;
    if (cookie !== "") {
        const cookie_array = cookie.split("; ");
        for (const cookie_item of cookie_array) {
            const [cookie_name, cookie_value] = cookie_item.split("=");
            if (decodeURIComponent(cookie_name) === name) {
                return cookie_value;
            }
        }
    }
    return null;
}

const check_input = () => {
    const loginForm = document.getElementById('login_form');
    const emailInput = document.getElementById('typeEmailX');
    const passwordInput = document.getElementById('typePasswordX');
    const idsave_check = document.getElementById('idSaveCheck');

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    // 유효성 검사
    if (emailValue === '') {
        alert('이메일을 입력하세요.');
        emailInput.focus();
        return false;
    }
    if (passwordValue === '') {
        alert('비밀번호를 입력하세요.');
        passwordInput.focus();
        return false;
    }
    if (emailValue.length < 5) {
        alert('아이디는 최소 5글자 이상 입력해야 합니다.');
        emailInput.focus();
        return false;
    }
    if (passwordValue.length < 12) {
        alert('비밀번호는 반드시 12글자 이상 입력해야 합니다.');
        passwordInput.focus();
        return false;
    }
    if (!/[!,@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(passwordValue)) {
        alert('패스워드는 특수문자를 1개 이상 포함해야 합니다.');
        passwordInput.focus();
        return false;
    }
    if (!(/[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue))) {
        alert('패스워드는 대소문자를 1개 이상 포함해야 합니다.');
        passwordInput.focus();
        return false;
    }

    // XSS 검사
    const sanitizedEmail = check_xss(emailValue);
    const sanitizedPassword = check_xss(passwordValue);
    if (!sanitizedEmail || !sanitizedPassword) {
        return false;
    }

    // JWT payload 생성 및 토큰 생성
    const payload = {
        id: sanitizedEmail,
        exp: Math.floor(Date.now() / 1000) + 3600 // 1시간 만료
    };
    const jwtToken = generateJWT(payload);

    // 아이디 저장 쿠키 설정 or 삭제
    if (idsave_check.checked) {
        setCookie("id", sanitizedEmail, 1); // 1일 저장
        alert("쿠키를 저장했습니다: " + sanitizedEmail);
    } else {
        setCookie("id", "", 0); // 쿠키 삭제
    }

    console.log('이메일:', sanitizedEmail);
    console.log('비밀번호:', sanitizedPassword);

    session_set(); // 세션 생성
    localStorage.setItem('jwt_token', jwtToken);

    loginForm.submit();
};

document.addEventListener('DOMContentLoaded',  () => {
    const isAuth =  checkAuth();  // async 함수 await 처리
    if (isAuth) {
        alert("이미 로그인 되어있습니다.");
        location.href = '../login/index_login.html'; 
        return;
    }
    init();
    init_logined();
});