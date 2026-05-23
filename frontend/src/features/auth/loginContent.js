// LANGUAGE_OPTIONS defines the language tabs shown in the banner area.
// key is stored in component state, label is the text shown to users.
export const LANGUAGE_OPTIONS = [
  { key: "en", label: "EN" },
  { key: "vi", label: "VN" },
];


// Login.jsx reads labels with this pattern: LOGIN_TEXT[language].fieldName
// Example: when language = "vn", text.passwordLabel becomes "Mật khẩu".
export const LOGIN_TEXT = {
  // English text group.
  en: {
    emailLabel: "Email",
    passwordLabel: "Password",
    forgotPassword: "Forgot password?",
    loginButton: "Login",
    loadingButton: "Signing in...",
    showPassword: "Show",
    hidePassword: "Hide",
    welcomeLine1: "Welcome",
    welcomeLine2: "to Mismart!",
    welcomeBrand: "DRONE HUB",
    loginSuccessPrefix: "Login success:",
    loginFailedPrefix: "Login failed:",
    forgotModeTitle: "Reset password",
    forgotModeHint: "Enter your email to receive a reset link.",
    forgotEmailLabel: "Recovery email",
    forgotSendButton: "Send reset link",
    forgotSendingButton: "Sending...",
    forgotCancelButton: "Cancel",
    forgotSuccessPrefix: "Reset request success:",
    forgotFailedPrefix: "Reset request failed:",
  },

  // Vietnamese text group with full diacritics.
  // You can edit labels, buttons, and messages here without changing React logic.
  vn: {
    emailLabel: "Email",
    passwordLabel: "Mật khẩu",
    forgotPassword: "Quên mật khẩu?",
    loginButton: "Đăng nhập",
    loadingButton: "Đang xử lý...",
    showPassword: "Hiện",
    hidePassword: "Ẩn",
    welcomeLine1: "Chào mừng",
    welcomeLine2: "đến với Mismart!",
    welcomeBrand: "DRONE HUB",
    loginSuccessPrefix: "Đăng nhập thành công:",
    loginFailedPrefix: "Đăng nhập thất bại:",
    forgotModeTitle: "Khôi phục mật khẩu",
    forgotModeHint: "Nhập email để nhận liên kết đặt lại mật khẩu.",
    forgotEmailLabel: "Email khôi phục",
    forgotSendButton: "Gửi liên kết đặt lại",
    forgotSendingButton: "Đang gửi...",
    forgotCancelButton: "Hủy",
    forgotSuccessPrefix: "Yêu cầu thành công:",
    forgotFailedPrefix: "Yêu cầu thất bại:",
  },
};

