import { encrypt_text, decrypt_text } from './crypto.js';        // CryptoJS AES-CBC
import { encrypt_text_gcm, decrypt_text_gcm } from './crypto2.js'; // Web Crypto API AES-GCM

export async function session_set() {
  const id = document.querySelector("#typeEmailX");
  const pass = document.querySelector("#typePasswordX");
  // if (!id || !pass) {
  //   alert("아이디 또는 비밀번호 입력란을 찾을 수 없습니다.");
  //   return;
  // }

  const random = new Date();
  const obj = {
    id: id.value,
    otp: random.toISOString()
  };

  if (!sessionStorage) {
    alert("세션 스토리지를 지원하지 않습니다.");
    return;
  }

  try {
    // 1) 기존 CryptoJS AES-CBC 방식 암호화
    const objString = JSON.stringify(obj);
    const encryptedPass = encrypt_text(pass.value); // 비밀번호 암호화

    sessionStorage.setItem("Session_Storage_id", id.value);
    sessionStorage.setItem("Session_Storage_pass", encryptedPass);
    sessionStorage.setItem("Session_Storage_object", objString);

    // 2) Web Crypto API AES-GCM 방식 암호화 (객체 전체 암호화)
    const encryptedGcm = await encrypt_text_gcm(objString);
    sessionStorage.setItem("Session_Storage_pass2", encryptedGcm);

    console.log("세션 저장 완료 - AES-CBC, AES-GCM 모두 저장됨");
  } catch (err) {
    console.error("세션 저장 중 오류:", err);
  }
}

export function session_set2(obj) { // 세션 저장(객체)
  if (sessionStorage) {
    const objString = JSON.stringify(obj); // 객체 -> JSON 문자열 변환
    // let en_text = encrypt_text(objString); // 암호화
    sessionStorage.setItem("Session_Storage_join", objString);
  } else {
    alert("세션 스토리지 지원 x");
  }
}

export function session_get() { // 세션 읽기
  if (sessionStorage) {
    return sessionStorage.getItem("Session_Storage_pass");
  } else {
    alert("세션 스토리지 지원 x");
  }
}

export async function session_get_decrypted() {
  if (!sessionStorage) {
    alert("세션 스토리지를 지원하지 않습니다.");
    return null;
  }

  const encryptedData = sessionStorage.getItem("Session_Storage_pass2");
  if (!encryptedData) {
    console.warn("복호화할 데이터가 없습니다.");
    return null;
  }

  try {
    const decrypted = await decrypt_text_gcm(encryptedData);
    console.log("복호화된 데이터:", decrypted);
    return decrypted;
  } catch (err) {
    console.error("복호화 실패:", err);
    return null;
  }
}

export function session_check() {
  const path = window.location.pathname;
  const isLoginPage = path.includes('index.html') || path.includes('login.html');
  if (!isLoginPage && sessionStorage.getItem("Session_Storage_id")) {
    alert("이미 로그인 되었습니다.");
    location.href = '../login/index_login.html';
  }
}

export function session_del() {
  if (sessionStorage) {
    sessionStorage.removeItem("Session_Storage_id");
    sessionStorage.removeItem("Session_Storage_pass");
    sessionStorage.removeItem("Session_Storage_object");
    sessionStorage.clear(); // 모든 세션 데이터 완전 삭제
    localStorage.removeItem("jwt_token"); // JWT 토큰 삭제
    console.log("세션과 토큰을 모두 삭제했습니다.");
  } else {
    alert("세션 스토리지 지원 x");
  }
}
