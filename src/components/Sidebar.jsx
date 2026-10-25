import { FolderKanban, LayoutDashboard, Users, UserRound, ChevronDown, CircleHelp } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navigation = [
	{ label: 'Overview', to: '/', icon: LayoutDashboard, end: true },
	{ label: 'Projects', to: '/projects', icon: FolderKanban },
	{ label: 'Teams', to: '/teams', icon: Users },
];

export default function Sidebar() {
	return (
		<aside className="workspace-sidebar">
			<a className="workspace-sidebar__brand" href="#/" aria-label="Orbit workspace home">
				<span className="workspace-sidebar__brand-mark" aria-hidden="true">o</span>
				<span>orbit<span className="workspace-sidebar__brand-dot">.</span></span>
			</a>

			<button className="workspace-sidebar__workspace" type="button" aria-label="Workspace: Northstar Studio">
				<span className="workspace-sidebar__workspace-mark" aria-hidden="true">N</span>
				<span className="workspace-sidebar__workspace-copy">
					<strong>Northstar Studio</strong>
					<small>Free workspace</small>
				</span>
				<ChevronDown size={15} aria-hidden="true" />
			</button>

			<div className="workspace-sidebar__section-label">WORKSPACE</div>
			<nav className="workspace-sidebar__navigation" aria-label="Workspace navigation">
				{navigation.map(({ label, to, icon: Icon, end }) => (
					<NavLink
						key={to}
						to={to}
						end={end}
						className={({ isActive }) => `workspace-sidebar__link${isActive ? ' is-active' : ''}`}
					>
						<Icon size={17} strokeWidth={1.8} aria-hidden="true" />
						<span>{label}</span>
						{label === 'Projects' && <span className="workspace-sidebar__count">8</span>}
					</NavLink>
				))}
			</nav>

			<div className="workspace-sidebar__bottom">
				<a className="workspace-sidebar__link workspace-sidebar__help" href="mailto:support@example.com">
					<CircleHelp size={17} strokeWidth={1.8} aria-hidden="true" />
					<span>Help &amp; support</span>
				</a>
				<NavLink
					to="/profile"
					className={({ isActive }) => `workspace-sidebar__account${isActive ? ' is-active' : ''}`}
				>
					<span className="workspace-sidebar__avatar" aria-hidden="true">JD</span>
					<span className="workspace-sidebar__account-copy">
						<strong>Jamie Diaz</strong>
						<small>jamie@northstar.design</small>
					</span>
					<UserRound className="workspace-sidebar__account-icon" size={15} aria-hidden="true" />
				</NavLink>
			</div>
		</aside>
	);
}
