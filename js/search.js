
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search_button_msg");
    if (searchButton) {
        searchButton.addEventListener('click', search_message);
    }
});

function search_message() {
    let msg = "검색을 수행합니다 (1)";
    console.log(msg);
    alert(msg);
}

function search_message() {
    let msg = "검색을 수행합니다 (2)";
    console.log(msg);
    alert(msg);
}

function googleSearch() {
    const searchTerm = document.getElementById("search_input").value; // 검색어로 설정정
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
    window.open(googleSearchUrl, "_blank"); // 새로운 창에서 열기
    return false; 
}

function googleSearch() {
    const searchTerm = document.getElementById("search_input").value.trim(); 
    const bannedWords = ["바보", "멍청이", "새끼","죽어","개"]; // 비속어 목록 예시

    // 1. 공백 검사
    if (searchTerm.length === 0) {
        alert("검색어를 입력해주세요.");
        return false;
    }

    // 2. 비속어 검사
    for (let i = 0; i < bannedWords.length; i++) {
        if (searchTerm.includes(bannedWords[i])) {
            alert("비속어가 포함된 검색어는 사용할 수 없습니다.");
            return false;
        }
    }

    // 3. 정상 검색 처리
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
    window.open(googleSearchUrl, "_blank");
    return false;
}
