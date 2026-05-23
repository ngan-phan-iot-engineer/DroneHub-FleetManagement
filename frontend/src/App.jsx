import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import Login from "./features/auth/Login";
import Telemetry from "./features/dashboard/Telemetry";
import "./App.css";

const pageVariants = {
	initial: { opacity: 0, x: 40 },
	in: { opacity: 1, x: 0 },
	out: { opacity: 0, x: -40 }
};

const pageTransition = {
	type: "tween",
	ease: "easeInOut",
	duration: 0.35
};

// AnimatedRoutes must be wrapped inside BrowserRouter to use useLocation
function AnimatedRoutes() {
	const location = useLocation();
	
	return (
		<AnimatePresence mode="wait">
			<Routes location={location} key={location.pathname}>
				<Route 
					path="/login" 
					element={
						<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} style={{ height: "100%", width: "100%" }}>
							<Login />
						</motion.div>
					} 
				/>
				<Route 
					path="/app/dashboard" 
					element={
						<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} style={{ height: "100%", width: "100%" }}>
							<Telemetry />
						</motion.div>
					} 
				/>
				{/* Redirect any unknown route to login */}
				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
		</AnimatePresence>
	);
}

function App() {
	return (
		<BrowserRouter>
			<div className="app-shell" style={{ overflow: "hidden", height: "100vh", width: "100vw", position: "relative" }}>
				<AnimatedRoutes />
			</div>
		</BrowserRouter>
	);
}

export default App;
