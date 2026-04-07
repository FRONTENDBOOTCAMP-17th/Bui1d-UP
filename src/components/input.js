const rules = {
  username: {
    regex: /^[a-z0-9_]{4,20}$/,
    hint: "4~20자, 영문 소문자+숫자+밑줄(_)만 사용 가능합니다.",
    error: "형식이 맞지 않습니다. (4~20자, 영문 소문자+숫자+_)",
    ok: "사용 가능한 아이디입니다.",
  },
  nickname: {
    regex: /^[^\n]{1,10}$/,
    hint: "1~10자로 입력해야 합니다.",
    error: "1~10자로 입력해야 합니다.",
    ok: "사용 가능한 닉네임입니다.",
  },
  password: {
    regex: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,50}$/,
    hint: "8~50자, 영문 대문자+숫자+특수문자를 포함해야 합니다.",
    error: "형식이 맞지 않습니다. (8~50자, 영문 대문자+숫자+특수문자)",
    ok: "사용 가능한 비밀번호입니다.",
  },
};

function setupState(input, hint, type, text) {
  input.classList.remove("is-error", "is-success");
  input.classList.add(type === "error" ? "is-error" : "is-success");
  hint.textContent = text;
  hint.className = `text-hint ${type}`;
  hint.style.color = "";
}

function resetState(input, hint, defaultText) {
  input.classList.remove("is-error", "is-success");
  hint.textContent = defaultText;
  hint.className = "text-hint";
  hint.style.color = "";
}

function setupInput(id) {
  const input = document.getElementById(id);
  const clear = document.getElementById(`${id}-clear`);
  const hint = document.getElementById(`${id}-hint`);
  const rule = rules[id];

  input.addEventListener("input", () => {
    clear.classList.toggle("show", input.value.length > 0);
  });

  clear.addEventListener("click", () => {
    input.value = "";
    clear.classList.remove("show");
    resetState(input, hint, rule.hint);
    input.focus();
  });

  input.addEventListener("blur", () => {
    if (!input.value) {
      resetState(input, hint, rule.hint);
      return;
    }
    const isItOk = rule.regex.test(input.value);
    setupState(
      input,
      hint,
      isItOk ? "success" : "error",
      isItOk ? rule.ok : rule.error,
    );
  });

  input.addEventListener("focus", () => {
    if (input.classList.contains("is-error")) {
      resetState(input, hint, rule.hint);
    }
  });
}

function setupToggle(id) {
  const input = document.getElementById(id);
  const toggle = document.getElementById(`${id}-toggle`);
  const eyeOn = toggle.querySelector("svg:first-child");
  const eyeOff = toggle.querySelector("svg:last-child");

  toggle.addEventListener("click", () => {
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    toggle.setAttribute(
      "aria-label",
      hidden ? "비밀번호 숨기기" : "비밀번호 보기",
    );
    toggle.setAttribute("aria-pressed", hidden ? "true" : "false");
    eyeOn.style.display = hidden ? "none" : "";
    eyeOff.style.display = hidden ? "" : "none";
  });
}

export { setupInput, setupToggle };
