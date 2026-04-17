function modalStyles() {
  if (document.getElementById("modal-styles")) return;
  const style = document.createElement("style");
  style.id = "modal-styles";
  style.textContent = `
    @keyframes modalIn {
      from { transform: scale(0.95); opacity: 0; }
      to   { transform: scale(1);    opacity: 1; }
    }
    .modalOverlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3000;
    }
    .modalDialog {
      background: var(--text-primary, #ffffff);
      color: var(--background-base, #171717);
      border-radius: 16px;
      padding: 26px 24px;
      min-width: 280px;
      max-width: 360px;
      width: 90%;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
      text-align: center;
      transform: scale(0.95);
      opacity: 0;
      animation: modalIn 0.2s ease forwards;
    }
    .modalIcon {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .modalMessage {
      font-size: 17px;
      font-weight: 600;
      line-height: 1.5;
      margin: 0 0 22px;
    }
    .modalBtnRow {
      display: flex;
      gap: 10px;
      width: 100%;
    }
    .modalBtn {
      flex: 1;
      padding: 10px 0;
      border-radius: 8px;
      cursor: pointer;
      font-size: inherit;
    }
    .modalBtnCancel {
      background: transparent;
      border: 1px solid var(--text-tertiary, #d4d4d4);
      color: var(--text-secondary, #737373);
    }
    .modalBtnCancel:hover {
      background: #f4f4f5;
      color: #3f3f46;
    }
    .modalBtnConfirm {
      background: var(--color-primary, #dc2626);
      color: var(--text-primary, #ffffff);
      border: none;
    }
    .modalBtnConfirm:hover {
      background: var(--color-primary-hover, #fb2c36);
    }
  `;
  document.head.appendChild(style);
}

export function showModal(message, confirmText = "확인", cancelText = "취소") {
  return new Promise((resolve) => {
    // 이미 열려 있다면 바로 종료
    if (document.querySelector(".modalOverlay")) {
      resolve(false);
      return;
    }

    modalStyles();

    const previousActiveElement = document.activeElement;

    const icon = document.createElement("span");
    icon.className = "modalIcon";
    icon.textContent = "⚠️";

    // aria-labelledby로 스크린 리더가 모달 제목으로 읽음
    const msg = document.createElement("p");
    msg.id = "modal-message";
    msg.className = "modalMessage";
    msg.textContent = message;

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "modalBtn modalBtnCancel";
    cancelBtn.textContent = cancelText;

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "modalBtn modalBtnConfirm";
    confirmBtn.textContent = confirmText;

    const btnRow = document.createElement("div");
    btnRow.className = "modalBtnRow";
    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);

    const dialog = document.createElement("div");
    dialog.className = "modalDialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "modal-message");
    dialog.appendChild(icon);
    dialog.appendChild(msg);
    dialog.appendChild(btnRow);

    const overlay = document.createElement("div");
    overlay.className = "modalOverlay";
    overlay.appendChild(dialog);

    // ESC 핸들러
    const onKeydown = (e) => {
      if (e.key === "Escape") close(false);
    };

    // 모달 닫기 — 이벤트 정리, 스크롤·포커스 복구 후 결과 resolve
    const close = (result) => {
      document.removeEventListener("keydown", onKeydown);
      document.body.style.overflow = "";
      overlay.remove();
      previousActiveElement?.focus();
      resolve(result);
    };

    cancelBtn.addEventListener("click", () => close(false));
    confirmBtn.addEventListener("click", () => close(true));

    // 오버레이 클릭 시 취소
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(false);
    });
    // ESC 누르면 close(false) 호출
    document.addEventListener("keydown", onKeydown);

    // 모달이 열린 동안 배경 스크롤 잠금
    document.body.style.overflow = "hidden";
    document.body.appendChild(overlay);
  });
}
