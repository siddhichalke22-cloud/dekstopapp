import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Discover from './pages/Discover.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import Projects from './pages/Projects.jsx';
import SkillExchange from './pages/SkillExchange.jsx';
import Teams from './pages/Teams.jsx';
import './App.css';

function WorkspaceLayout() {
	return (
		<div className="app-layout">
			<Sidebar />
			<div className="app-layout__main">
				<Navbar />
				<main className="app-layout__content">
					<Routes>
						<Route path="/" element={<Dashboard />} />
						<Route path="/discover" element={<Discover />} />
						<Route path="/projects" element={<Projects />} />
						<Route path="/teams" element={<Teams />} />
						<Route path="/skill-exchange" element={<SkillExchange />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</main>
			</div>
		</div>
	);
}

export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/*" element={<WorkspaceLayout />} />
		</Routes>
	);
}
