// @param {string} message - 표시할 메시지
// @param {"success"|"error"} type - 토스트 종류 (기본값: "success")
// @param {number} duration - 표시 시간(ms) (기본값: 2000)

export function showToast(message, type = "success", duration = 2000) {
  // 컨테이너 : 토스트 영역이 있을 시 재사용, 없다면 동적으로 생성
  let container = document.getElementById("toast-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";

    // 스크린 리더 이용자를 위한 상태 변화 설정
    container.setAttribute("role", "status");
    container.setAttribute("aria-atomic", "true");

    // 기본 컨테이너 레이아웃 설정
    Object.assign(container.style, {
      position: "fixed",
      display: "flex",
      flexDirection: "column",
      bottom: "1.5rem",
      transform: "translateX(-50%)",
      left: "50%",
      zIndex: "2000",
      gap: "0.5rem",
      alignItems: "center",
    });
    document.body.appendChild(container);
  }

  // 최대 3개 초과 시 가장 오래된 토스트 제거
  if (container.children.length >= 3) {
    container.firstElementChild.remove();
  }

  const toast = document.createElement("div");
  // 에러일 때는 즉시, 성공일 때는 현재 작업 종료 후 읽어줌
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.textContent = message;
  // Tailwind를 위한 인라인 스타일 처리
  Object.assign(toast.style, {
    backgroundColor:
      type === "success"
        ? "var(--color-success, #16a34a)"
        : "var(--color-error, #dc2626)",
    color: "var(--text-primary, #ffffff)",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    whiteSpace: "nowrap",
    opacity: "0",
    transition: "opacity 300ms",
    cursor: "pointer",
  });
  container.appendChild(toast);

  // 브라우저가 opacity:0 을 먼저 렌더링한 뒤 트랜지션 시작
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
    });
  });

  // 중복 호출 방지
  let removed = false;

  const removeToast = () => {
    if (removed) return;
    removed = true;
    toast.style.opacity = "0";
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  };

  // 클릭 시 즉시 제거, duration 경과 후 자동 제거
  toast.addEventListener("click", removeToast);
  setTimeout(removeToast, duration);
}
