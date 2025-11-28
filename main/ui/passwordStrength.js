export function initPasswordStrength() {
  const inlineStrengthText = document.getElementById("inlineStrengthText");
  const segmentEls = document.querySelectorAll(".inline-meter .seg");
  const critLength = document.getElementById("critLength");
  const critUpper = document.getElementById("critUpper");
  const critLower = document.getElementById("critLower");
  const critNumber = document.getElementById("critNumber");
  const critSpecial = document.getElementById("critSpecial");
  const regPassInput = document.getElementById("regPass");

  function evalPassword(pwd) {
    const checks = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  }

  function setCrit(el, ok) {
    if (!el) return;
    el.classList.toggle("ok", !!ok);
  }

  function updateStrengthUI() {
    const pwd = regPassInput?.value || "";
    const { checks, score } = evalPassword(pwd);

    let color = "#ef4444";
    let label = "Weak";
    if (score >= 5) {
      color = "#10b981";
      label = "Very strong";
    } else if (score === 4) {
      color = "#3b82f6";
      label = "Strong";
    } else if (score === 3) {
      color = "#f59e0b";
      label = "Medium";
    } else if (score === 2) {
      color = "#f97316";
      label = "Fair";
    }

    segmentEls.forEach((seg, i) => {
      seg.style.background = i < score ? color : "#e2e8f0";
    });

    inlineStrengthText.textContent = `Strength: ${pwd ? label : "—"}`;
    inlineStrengthText.style.color = pwd ? color : "#718096";

    setCrit(critLength, checks.length);
    setCrit(critUpper, checks.upper);
    setCrit(critLower, checks.lower);
    setCrit(critNumber, checks.number);
    setCrit(critSpecial, checks.special);
  }

  regPassInput?.addEventListener("input", updateStrengthUI);
}
