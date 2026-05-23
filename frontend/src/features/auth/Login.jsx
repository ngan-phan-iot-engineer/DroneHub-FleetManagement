import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmailPassword, requestPasswordReset } from "./authApi";
import { LANGUAGE_OPTIONS } from "./loginContent";
import { useTranslation } from "react-i18next";
import "./Login.css";

function Login() {
        const navigate = useNavigate();

        // ===============================
        // STATE GROUP 1: GENERAL VIEW STATE
        // i18n translates our content dynamically.
        // ===============================
        const { t, i18n } = useTranslation();
        const language = i18n.language; // Lấy ngôn ngữ hiện tại từ react-i18next


        // ===============================
        // STATE GROUP 2: LOGIN FORM DATA
        // email and password are controlled inputs:
        // input values are always read from and written to React state, not directly from the DOM.
        // ===============================
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");

        // showPassword controls only password visibility in the input field:
        // false -> type="password", true -> type="text".
        const [showPassword, setShowPassword] = useState(false);
        const [isForgotMode, setIsForgotMode] = useState(false);
        const [forgotEmail, setForgotEmail] = useState("");

        // ===============================
        // STATE GROUP 3: API REQUEST STATUS
        // isLoading disables submit while the request is in progress.
        // feedback stores message type/text for success and error notifications.
        // ===============================
        const [isLoading, setIsLoading] = useState(false);
        const [feedback, setFeedback] = useState({ type: "", text: "" });
        const [isResetLoading, setIsResetLoading] = useState(false);
        const [forgotFeedback, setForgotFeedback] = useState({ type: "", text: "" });

        // text is derived from the translation hook for the login section
        const text = t('login', { returnObjects: true }) || {};
	// 1) Prevent the browser default form reload.
	// 2) Turn loading on.
	// 3) Call the login API.
	// 4) Update feedback based on success or failure.
	// 5) Turn loading off in finally to guarantee cleanup.
	// ==================================================
	async function handleSubmit(event) {
		event.preventDefault();
		setForgotFeedback({ type: "", text: "" });
		setFeedback({ type: "", text: "" });
		setIsLoading(true);

		try {
			const response = await loginWithEmailPassword({ email, password });
			setFeedback({
				type: "success",
				text: `${text.loginSuccessPrefix} ${response?.message || "Authenticated"}`,
			});
			
			// Tự động điều hướng sang Dashboard mượt mà sau nửa giây
			setTimeout(() => {
				navigate("/app/dashboard");
			}, 600);
		} catch (error) {
			const serverMessage = error?.response?.data?.message;
			setFeedback({
				type: "error",
				text: `${text.loginFailedPrefix} ${serverMessage || error.message}`,
			});
		} finally {
			setIsLoading(false);
		}
	}

	// The forgot-password flow is not connected yet.
	// This handler is intentionally kept as a clear extension point for the next batch.
	function handleForgotPassword() {
		setIsForgotMode(true);
		setFeedback({ type: "", text: "" });
		setForgotFeedback({ type: "", text: "" });
	}

	function handleCancelForgotMode() {
		setIsForgotMode(false);
		setForgotEmail("");
		setForgotFeedback({ type: "", text: "" });
	}

	async function handleForgotSubmit() {
		setFeedback({ type: "", text: "" });
		setForgotFeedback({ type: "", text: "" });
		setIsResetLoading(true);

		try {
			const response = await requestPasswordReset({ email: forgotEmail });
			const temporaryPassword = response?.temporaryPassword || "";

			setEmail(forgotEmail);
			setPassword(temporaryPassword);
			setShowPassword(false);
			setForgotEmail("");
			setForgotFeedback({ type: "", text: "" });
			setIsForgotMode(false);

			setFeedback({
				type: "success",
				text: `${text.forgotSuccessPrefix} ${response?.message || "Reset complete"} ${temporaryPassword ? `(New password: ${temporaryPassword})` : ""}`.trim(),
			});
		} catch (error) {
			const serverMessage = error?.response?.data?.message;
			setForgotFeedback({
				type: "error",
				text: `${text.forgotFailedPrefix} ${serverMessage || error.message}`,
			});
		} finally {
			setIsResetLoading(false);
		}
	}

	function handleForgotEmailKeyDown(event) {
		if (event.key === "Enter") {
			event.preventDefault();
			handleForgotSubmit();
		}
	}

	return (
		// auth-login-page: full-screen background container.
		<section className="auth-login-page">
			{/* auth-login-shell: main frame that contains the left and right panels */}
			<div className="auth-login-shell">
				{/* LEFT PANEL: login form */}
				<aside className="auth-login-form-panel" aria-label="Login form panel">
					<form className="auth-login-form" onSubmit={handleSubmit}>
						{/* Temporary "mi" logo block. It is visual only and not part of form data flow. */}
						<div className="auth-login-logo" aria-hidden="true">
							mi
						</div>

						{/* Email field */}
						<div className="auth-field">
							<label className="auth-field-label" htmlFor="email-input">
								{text.emailLabel}
							</label>
							<div className="auth-input-wrap">
								<input
									id="email-input"
									className="auth-input"
									type="email"
									value={email}
									placeholder="demowebodm.mismart@gmail.com"
									onChange={(event) => setEmail(event.target.value)}
									required
									autoComplete="email"
								/>
							</div>
						</div>

						{/* Password field + Show/Hide toggle button */}
						<div className="auth-field">
							<label className="auth-field-label" htmlFor="password-input">
								{text.passwordLabel} *
							</label>
							<div className="auth-input-wrap">
								<input
									id="password-input"
									className="auth-input"
									type={showPassword ? "text" : "password"}
									value={password}
									placeholder="123456"
									onChange={(event) => setPassword(event.target.value)}
									required
									autoComplete="current-password"
								/>
								<button
									type="button"
									className="auth-password-toggle"
									// Toggle boolean state to switch between hidden and visible password.
									onClick={() => setShowPassword((previous) => !previous)}
									title={showPassword ? text.hidePassword : text.showPassword}
								>
									{showPassword ? (
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={text.hidePassword}>
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
											<circle cx="12" cy="12" r="3" />
										</svg>
									) : (
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={text.showPassword}>
											<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
											<line x1="1" y1="1" x2="23" y2="23" />
										</svg>
									)}
								</button>
							</div>
						</div>

						{!isForgotMode && (
							<button type="button" className="auth-forgot" onClick={handleForgotPassword}>
								{text.forgotPassword}
							</button>
						)}

						{isForgotMode && (
							<div className="auth-forgot-panel">
								<p className="auth-forgot-title">{text.forgotModeTitle}</p>
								<p className="auth-forgot-hint">{text.forgotModeHint}</p>

								<div className="auth-forgot-form" role="group" aria-label="Forgot password form">
									<div className="auth-field">
										<label className="auth-field-label" htmlFor="forgot-email-input">
											{text.forgotEmailLabel}
										</label>
										<div className="auth-input-wrap">
											<input
												id="forgot-email-input"
												className="auth-input"
												type="email"
												value={forgotEmail}
												placeholder="demowebodm.mismart@gmail.com"
												onChange={(event) => setForgotEmail(event.target.value)}
												onKeyDown={handleForgotEmailKeyDown}
												required
												autoComplete="email"
											/>
										</div>
									</div>

									<div className="auth-forgot-actions">
										<button
											type="button"
											className="auth-submit"
											disabled={isResetLoading}
											onClick={handleForgotSubmit}
										>
											{isResetLoading ? text.forgotSendingButton : text.forgotSendButton}
										</button>
										<button
											type="button"
											className="auth-forgot-cancel"
											onClick={handleCancelForgotMode}
										>
											{text.forgotCancelButton}
										</button>
									</div>

									{forgotFeedback.text && (
										<p className={`auth-message ${forgotFeedback.type}`} role="status">
											{forgotFeedback.text}
										</p>
									)}
								</div>
							</div>
						)}

						{/* Submit button for login */}
						{!isForgotMode && (
							<button type="submit" className="auth-submit" disabled={isLoading}>
								{isLoading ? text.loadingButton : text.loginButton}
							</button>
						)}

						{/* Login result message area. Render only when text is available. */}
						{feedback.text && (
							<p className={`auth-message ${feedback.type}`} role="status">
								{feedback.text}
							</p>
						)}
					</form>
				</aside>

				{/* RIGHT PANEL: welcome banner + language tabs */}
				<section className="auth-login-banner" aria-label="Welcome panel">
					{/* Main welcome text group */}
					<div className="auth-banner-text">
						<p className="auth-banner-line">{text.welcomeLine1}</p>
						<p className="auth-banner-line">{text.welcomeLine2}</p>
						<p className="auth-banner-brand">{text.welcomeBrand}</p>
					</div>

					{/* Language tabs: clicking a tab updates the language state */}
					<div className="auth-language-tabs" role="tablist" aria-label="Language selection">
						{LANGUAGE_OPTIONS.map((option, index) => (
							<div key={option.key} className="auth-lang-item">
								<button
									type="button"
									role="tab"
									aria-selected={language === option.key}
									className={`auth-lang-btn ${language === option.key ? "active" : ""}`}
									// Update currently selected language.
									onClick={() => i18n.changeLanguage(option.key)}
								>
									{option.label}
								</button>
								{index < LANGUAGE_OPTIONS.length - 1 && (
									<span className="auth-lang-divider" aria-hidden="true">
										|
									</span>
								)}
							</div>
						))}
					</div>
				</section>
			</div>
		</section>
	);
}

export default Login;
