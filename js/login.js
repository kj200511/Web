import { session_set, session_get, session_check, session_del } from './session.js';
import { encrypt_text_gcm, decrypt_text_gcm } from './crypto2.js';
import { encrypt_text, decrypt_text} from './crypto.js'
import { generateJWT, checkAuth } from './jwt_token.js';


function session_set_gcm() {
  let session_pass = document.querySelector("#typePasswordX");
  if (sessionStorage && session_pass) {
    const en_text2 = encrypt_text_gcm(session_pass.value);
    sessionStorage.setItem("Session_Storage_pass2", en_text2);
  } else {
    alert("세션 스토리지를 지원하지 않거나 패스워드 요소가 없습니다.");
  }
}
// 쿠키 설정 및 가져오기 함수
function setCookie(name, value, expiredays) {
  const date = new Date();
  if (expiredays === 0) {
    date.setTime(date.getTime() - 1); // 쿠키 삭제
  } else {
    date.setDate(date.getDate() + expiredays);
  }
  document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + "; expires=" + date.toUTCString() + "; path=/; SameSite=None; Secure";
}

function getCookie(name) {
  const cookie = document.cookie;
  if (cookie !== "") {
    const cookie_array = cookie.split("; ");
    for (const item of cookie_array) {
      const [cookieName, cookieValue] = item.split("=");
      if (decodeURIComponent(cookieName) === name) {
        return decodeURIComponent(cookieValue);
      }
    }
  }
  return null;
}

// 로그인/로그아웃 횟수 기록
export function login_count() {
  let count = parseInt(getCookie("login_cnt")) || 0;
  count += 1;
  setCookie("login_cnt", count, 7);
  console.log("로그인 횟수:", count);
}

export function logout_count() {
  let count = parseInt(getCookie("logout_cnt")) || 0;
  count += 1;
  setCookie("logout_cnt", count, 7);
  console.log("로그아웃 횟수:", count);
}

// 로그아웃 함수
export function logout() {
  sessionStorage.clear();
  localStorage.removeItem('jwt_token');
  logout_count();
  alert('로그아웃 되었습니다.');
  location.href = '../index.html';
}

// XSS 검사 함수
const check_xss = (input) => {
  const DOMPurify = window.DOMPurify;
  const sanitizedInput = DOMPurify.sanitize(input);
  if (sanitizedInput !== input) {
    alert('XSS 공격 가능성이 있는 입력값을 발견했습니다.');
    return false;
  }
  return sanitizedInput;
};

// 로그인 유효성 검사 및 처리
function check_input() {
  const loginForm = document.getElementById('login_form');
  const emailInput = document.getElementById('typeEmailX');
  const passwordInput = document.getElementById('typePasswordX');
  const idsave_check = document.getElementById('idSaveCheck');

  if (!emailInput || !passwordInput || !idsave_check || !loginForm) {
    alert('필수 폼 요소가 존재하지 않습니다.');
    return false;
  }

  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value.trim();
  const failCount = parseInt(getCookie("login_fail_cnt")) || 0;
  const lockUntil = parseInt(getCookie("login_lock_time")) || 0;
  const now = Date.now();

  if (failCount >= 3 && lockUntil > now) {
    const remainSec = Math.ceil((lockUntil - now) / 1000);
    const failMessage = document.getElementById("fail_message");
    if (failMessage) {
      failMessage.innerText = `로그인 가능 횟수를 초과하였습니다. ${Math.floor(remainSec / 60)}분 ${remainSec % 60}초 후에 다시 시도하세요.`;
    }
    alert("로그인 가능 횟수를 초과하였습니다. 4분간 로그인할 수 없습니다.");
    return false;
  }


  if (emailValue === '') {
    alert('이메일을 입력하세요.');
    login_failed();
    return false;
  }
  if (passwordValue === '') {
    alert('비밀번호를 입력하세요.');
    login_failed();
    return false;
  }
  if (emailValue.length < 5) {
    alert('아이디는 최소 5글자 이상 입력해야 합니다.');
    login_failed();
    return false;
  }
  if (passwordValue.length < 12) {
    alert('비밀번호는 반드시 12글자 이상 입력해야 합니다.');
    login_failed();
    return false;
  }
  if (!/[!,@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(passwordValue)) {
    alert('패스워드는 특수문자를 1개 이상 포함해야 합니다.');
    login_failed();
    return false;
  }
  if (!/[A-Z]/.test(passwordValue) || !/[a-z]/.test(passwordValue)) {
    alert('패스워드는 대소문자를 1개 이상 포함해야 합니다.');
    login_failed();
    return false;
  }

  const sanitizedEmail = check_xss(emailValue);
  const sanitizedPassword = check_xss(passwordValue);
  if (!sanitizedEmail || !sanitizedPassword) return false;

  // 쿠키 저장
  if (idsave_check.checked) {
    setCookie("id", sanitizedEmail, 1);
  } else {
    setCookie("id", "", 0);
  }

  // JWT 저장 및 세션 저장
  const payload = {
    id: sanitizedEmail,
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  const jwtToken = generateJWT(payload);
  localStorage.setItem('jwt_token', jwtToken);
  sessionStorage.setItem('user_email', sanitizedEmail);

  // 로그인 실패 카운트 및 제한시간 초기화
  setCookie("login_fail_cnt", 0, 0); // 0일 = 즉시 삭제
  setCookie("login_lock_time", "", 0); // 빈 값 + 0일 = 즉시 삭제
  login_count();
  alert('로그인 성공하였습니다.');
  session_set();
  loginForm.submit();
}

// 쿠키에서 저장된 ID 불러오기
function init() {
  const emailInput = document.getElementById('typeEmailX');
  const idsave_check = document.getElementById('idSaveCheck');
  const savedId = getCookie("id");
  if (savedId && emailInput && idsave_check) {
    emailInput.value = savedId;
    idsave_check.checked = true;
  }
  session_check();
}

// 로그인 후 세션 복호화
function init_logined() {
  if (sessionStorage) {
    decrypt_text();
     try {
      const decrypted = decrypt_text_gcm(sessionStorage.getItem('Session_Storage_pass2'));
      console.log('복호화된 패스워드:', decrypted);
    } catch (e) {
      console.error("복호화 실패", e);
    }
  } else {
    alert("세션 스토리지를 지원하지 않습니다.");
  }
}

export function login_failed() {
  let failCount = parseInt(getCookie("login_fail_cnt")) || 0;
  failCount += 1;

  setCookie("login_fail_cnt", failCount, 1);

  // 3회 이상 실패 시 제한 시간 저장 (쿠키로 저장, 만료까지 기다림)
  if (failCount === 3) {
    const lockUntil = Date.now() + 4 * 60 * 1000; // 현재 시간 + 4분
    setCookie("login_lock_time", lockUntil, 1);
  }

  const failMessage = document.getElementById("fail_message");
  if (failMessage) {
    if (failCount >= 3) {
      const lockUntil = parseInt(getCookie("login_lock_time"));
      const remainSec = Math.ceil((lockUntil - Date.now()) / 1000);
      failMessage.innerText = `로그인 가능 횟수를 초과하였습니다. ${Math.floor(remainSec / 60)}분 ${remainSec % 60}초 후에 다시 시도하세요.`;
    } else {
      failMessage.innerText = `로그인 실패 횟수: ${failCount}회`;
    }
  }

  console.log(`로그인 실패 횟수: ${failCount}`);
}


// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  init_logined();
  init();


  const loginBtn = document.getElementById('login_btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      check_input();
    });
  }

  const logoutBtn = document.getElementById('logout_btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
});
