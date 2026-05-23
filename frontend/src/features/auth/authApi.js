import { apiClient } from "../../utils/apiClient";

const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || "api";

const MOCK_USERS = [
	{
		email: "demowebodm.mismart@gmail.com",
		password: "123456",
		fullName: "Demo Operator",
		role: "admin",
	},
	{
		email: "pilot01@dronehub.local",
		password: "123456",
		fullName: "Pilot 01",
		role: "pilot",
	},
];

function wait(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function createTemporaryPassword() {
	const suffix = Math.random().toString(36).slice(-4).toUpperCase();
	return `NewPass@${suffix}`;
}

async function loginWithMockMode({ email, password }) {
	// Simulate network delay so loading state can be tested in UI demos.
	await wait(700);

	const matchedUser = MOCK_USERS.find(
		(user) => user.email.toLowerCase() === email.toLowerCase().trim(),
	);

	if (!matchedUser || matchedUser.password !== password) {
		// Keep Axios-like error shape so existing UI error handling remains unchanged.
		const error = new Error("Invalid email or password");
		error.response = {
			data: {
				message: "Invalid email or password",
			},
		};
		throw error;
	}

	return {
		message: "Authenticated (mock mode)",
		token: "mock-jwt-token",
		user: {
			email: matchedUser.email,
			fullName: matchedUser.fullName,
			role: matchedUser.role,
		},
	};
}

async function requestPasswordResetWithMockMode({ email }) {
	// Simulate network delay so reset flow can be tested with visible loading state.
	await wait(700);

	const matchedUser = MOCK_USERS.find(
		(user) => user.email.toLowerCase() === email.toLowerCase().trim(),
	);

	if (!matchedUser) {
		const error = new Error("Email is not registered in demo users");
		error.response = {
			data: {
				message: "Email is not registered in demo users",
			},
		};
		throw error;
	}

	const temporaryPassword = createTemporaryPassword();
	matchedUser.password = temporaryPassword;

	return {
		message: `Password reset successfully for ${matchedUser.email} (mock mode)`,
		temporaryPassword,
	};
}

export async function loginWithEmailPassword({ email, password }) {
	if (AUTH_MODE === "mock") {
		return loginWithMockMode({ email, password });
	}

	const response = await apiClient.post("/login", {
		email,
		password,
	});

	return response.data;
}

export async function requestPasswordReset({ email }) {
	if (AUTH_MODE === "mock") {
		return requestPasswordResetWithMockMode({ email });
	}

	const response = await apiClient.post("/forgot-password", {
		email,
	});

	return response.data;
}
