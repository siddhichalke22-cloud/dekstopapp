import { Bell, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const pageTitles = {
	'/': 'Overview',
	'/projects': 'Projects',
	'/teams': 'Teams',
	'/profile': 'Profile',
};

export default function Navbar() {
	const { pathname } = useLocation();
	const pageTitle = pageTitles[pathname] || 'Workspace';

	return (
		<header className="workspace-navbar">
			<div className="workspace-navbar__breadcrumb" aria-label="Current page">
				<span>Workspace</span>
				<span className="workspace-navbar__separator" aria-hidden="true">/</span>
				<strong>{pageTitle}</strong>
			</div>

			<div className="workspace-navbar__tools">
				<label className="workspace-navbar__search">
					<Search size={15} aria-hidden="true" />
					<input type="search" placeholder="Search workspace" aria-label="Search workspace" />
					<kbd aria-hidden="true">⌘ K</kbd>
				</label>
				<button className="workspace-navbar__icon-button" type="button" aria-label="Notifications">
					<Bell size={17} aria-hidden="true" />
					<span className="workspace-navbar__notification-dot" aria-hidden="true" />
				</button>
				<Link className="workspace-navbar__profile" to="/profile" aria-label="Open profile for Jamie Diaz">
					JD
				</Link>
			</div>
		</header>
	);
}
