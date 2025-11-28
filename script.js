import { initTabs } from "./ui/tabs.js";
import { initPasswordStrength } from "./ui/passwordStrength.js";
import { initPasswordToggle } from "./ui/passwordToggle.js";

import { initLogin } from "./auth/login.js";
import { initRegister } from "./auth/register.js";
import { initGoogleLogin } from "./auth/google.js";

initTabs();
initPasswordStrength();
initPasswordToggle();

initLogin();
initRegister();
initGoogleLogin();
