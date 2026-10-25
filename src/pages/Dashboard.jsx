import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, Ellipsis, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import './Dashboard.css';

const sampleProjects = [
	{ id: 'website-refresh', name: 'Website refresh', category: 'Brand & digital', progress: 72, dueDate: 'Oct 28', tone: 'green', people: ['JD', 'MK', 'AL'] },
	{ id: 'fall-launch', name: 'Fall product launch', category: 'Campaign', progress: 48, dueDate: 'Nov 04', tone: 'blue', people: ['MK', 'SP', 'JD'] },
	{ id: 'customer-research', name: 'Customer research', category: 'Research', progress: 91, dueDate: 'Nov 12', tone: 'coral', people: ['AL', 'JD'] },
];

const activities = [
	{ initials: 'MK', name: 'Morgan Kim', action: 'moved', item: 'Homepage wireframes', note: 'to In review', time: '12 min ago', tone: 'blue' },
	{ initials: 'AL', name: 'Alex Lee', action: 'commented on', item: 'Customer interview guide', note: '“Added the final questions.”', time: '48 min ago', tone: 'green' },
	{ initials: 'SP', name: 'Sam Patel', action: 'completed', item: 'Launch moodboard', note: 'in Fall product launch', time: '2 hours ago', tone: 'gold' },
];

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api';

function initialsTone(initials) {
	return `dashboard-avatar--${({ JD: 'coral', MK: 'blue', AL: 'green', SP: 'gold' })[initials] || 'lilac'}`;
}

function ProjectPeople({ people }) {
	return <div className="dashboard-people" aria-label={`${people.length} project members`}>
		{people.map((person) => <span key={person} className={`dashboard-avatar ${initialsTone(person)}`} title={person}>{person}</span>)}
	</div>;
}

export default function Dashboard() {
	const [projects, setProjects] = useState(sampleProjects);
	const [apiConnected, setApiConnected] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		fetch(`${apiUrl}/projects`, { signal: controller.signal })
			.then((response) => {
				if (!response.ok) throw new Error('Projects request failed');
				return response.json();
			})
			.then((items) => {
				if (!Array.isArray(items)) return;
				setProjects(items.slice(0, 3).map((project, index) => ({
					id: project.id,
					name: project.name,
					category: project.description || 'Project',
					progress: project.progress ?? 0,
					dueDate: project.dueDate ? new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : 'No date',
					tone: ['green', 'blue', 'coral'][index % 3],
					people: (project.members || []).slice(0, 3).map((member) => member.initials || member.user?.initials).filter(Boolean),
				})));
				setApiConnected(true);
			})
			.catch((error) => {
				if (error.name !== 'AbortError') setApiConnected(false);
			});
		return () => controller.abort();
	}, []);

	return (
		<div className="dashboard-page">
			<section className="dashboard-heading">
				<div>
					<p className="dashboard-eyebrow">SATURDAY, OCTOBER 24</p>
					<h1>Good morning, Jamie<span>.</span></h1>
					<p className="dashboard-subtitle">Here’s what’s moving across your workspace today.</p>
				</div>
				<Button onClick={() => { window.location.hash = '#/projects'; }}><Plus size={15} /> New project</Button>
			</section>

			<section className="dashboard-summary" aria-label="Workspace summary">
				<Card title="Active projects" value="08" detail={<><span className="dashboard-trend"><ArrowUpRight size={13} /> 2</span> added this month</>} accent="green" />
				<Card title="Tasks completed" value="126" detail={<><span className="dashboard-trend"><ArrowUpRight size={13} /> 18%</span> vs. last month</>} accent="blue" />
				<Card title="Needs attention" value="03" detail="One fewer than last week" accent="coral" />
				<div className="dashboard-focus">
					<span className="dashboard-focus__spark" aria-hidden="true">✳</span>
					<p className="dashboard-eyebrow">TEAM FOCUS</p>
					<strong>Make room<br />for good work.</strong>
					<span>One thing at a time.</span>
				</div>
			</section>

			<div className="dashboard-columns">
				<section className="dashboard-section">
					<header className="dashboard-section__header">
						<div><p className="dashboard-eyebrow">IN MOTION</p><h2>Projects <span>08</span></h2></div>
						<Link to="/projects" className="dashboard-text-link">All projects <ArrowRight size={14} /></Link>
					</header>
					<div className="dashboard-project-list">
						{projects.map((project) => (
							<article className="dashboard-project" key={project.id}>
								<span className={`dashboard-project__mark dashboard-project__mark--${project.tone}`} aria-hidden="true"><i /></span>
								<div className="dashboard-project__name"><strong>{project.name}</strong><small>{project.category}</small></div>
								<div className="dashboard-project__progress"><span className="dashboard-progress"><i style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }} /></span><small>{project.progress}%</small></div>
								<ProjectPeople people={project.people?.length ? project.people : ['JD']} />
								<span className="dashboard-project__date"><CalendarDays size={12} />{project.dueDate}</span>
								<button className="dashboard-more" type="button" aria-label={`More options for ${project.name}`}><Ellipsis size={17} /></button>
							</article>
						))}
					</div>
					<Link className="dashboard-view-all" to="/projects"><span><Plus size={14} /></span>View all projects<ArrowRight size={14} /></Link>
					<div className="dashboard-sync"><i className={apiConnected ? 'is-connected' : ''} />{apiConnected ? 'Synced with workspace' : 'Showing workspace preview'}</div>
				</section>

				<section className="dashboard-section dashboard-activity">
					<header className="dashboard-section__header">
						<div><p className="dashboard-eyebrow">THE LATEST</p><h2>Activity</h2></div>
						<button className="dashboard-more" type="button" aria-label="Activity options"><Ellipsis size={18} /></button>
					</header>
					<div className="dashboard-activity__list">
						{activities.map((activity) => (
							<article className="dashboard-activity__item" key={activity.item}>
								<span className={`dashboard-avatar dashboard-avatar--${activity.tone}`}>{activity.initials}</span>
								<div><p><strong>{activity.name}</strong> {activity.action} <b>{activity.item}</b></p><span className="dashboard-activity__note">{activity.note}</span><time>{activity.time}</time></div>
							</article>
						))}
					</div>
					<button className="dashboard-text-link dashboard-activity__all" type="button">See all activity <ArrowRight size={14} /></button>
				</section>
			</div>
		</div>
	);
}
