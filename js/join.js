import { encrypt_text, decrypt_text } from './crypto.js';
import { session_set, session_get,session_set2 } from './session.js';

// 회원가입 시 객체 암호화하여 세션에 저장
export function saveSignupSession(userObj) {
  const userInfo = JSON.stringify(userObj.getUserInfo());
  const encrypted = encrypt_text(userInfo);
  sessionStorage.setItem('signup_info', encrypted);
}

// 회원가입 세션 복호화 출력
export function printSignupSession() {
  const encrypted = sessionStorage.getItem('signup_info');
  if (!encrypted) {
    console.log("회원가입 세션 정보가 없습니다.");
    return;
  }
  const decrypted = decrypt_text(encrypted);
  if (decrypted) {
    const userInfo = JSON.parse(decrypted);
    console.log("복호화된 회원가입 정보:", userInfo);
  } else {
    console.log("복호화 실패");
  }
}

const nameRegex = /^[가-힣]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

function join() { // 회원가입 기능
    let form = document.querySelector("#join_form");
    let name = document.querySelector("#form3Example1c");
    let email = document.querySelector("#form3Example3c");
    let password = document.querySelector("#form3Example4c");
    let re_password = document.querySelector("#form3Example4cd");
    let agree = document.querySelector("#form2Example3c");

    // 빈 칸 체크
    if(name.value.length === 0 || email.value.length === 0 || password.value.length === 0 || re_password.value.length === 0){
        alert("회원가입 폼에 모든 정보를 입력해주세요.");
        return;
    }

    // 유효성 검사
    if (!nameRegex.test(name.value)) {
        alert("이름은 한글만 입력 가능합니다.");
        name.focus();
        return;
    }

    if (!emailRegex.test(email.value)) {
        alert("이메일 형식이 올바르지 않습니다.");
        email.focus();
        return;
    }

    if (!pwRegex.test(password.value)) {
        alert("비밀번호는 8자 이상이며 대소문자, 숫자, 특수문자를 모두 포함해야 합니다.");
        password.focus();
        return;
    }

    if (password.value !== re_password.value) {
        alert("비밀번호가 일치하지 않습니다.");
        re_password.focus();
        return;
    }

    if (!agree.checked) {
        alert("약관에 동의하셔야 가입이 가능합니다.");
        return;
    }

    // 회원가입 정보 객체 생성 및 세션 저장
  const newSignUp = new SignUp(name.value, email.value, password.value, re_password.value);

saveSignupSession(newSignUp);
  printSignupSession();

  form.action = "../index.html";
  form.method = "get";
  form.submit();
}

class SignUp {
    constructor(name, email, password, re_password) {
        this._name = name;
        this._email = email;
        this._password = password;
        this._re_password = re_password;
    }

    setUserInfo(name, email, password, re_password) {
        this._name = name;
        this._email = email;
        this._password = password;
        this._re_password = re_password;
    }

    getUserInfo() {
        return {
            name: this._name,
            email: this._email,
            password: this._password,
            re_password: this._re_password
        };
    }
}

document.getElementById("join_btn").addEventListener('click', join);
