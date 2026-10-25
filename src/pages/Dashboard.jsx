import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, Ellipsis, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import './Dashboard.css';

const sampleProjects = [
	{ id: 'campus-map', name: 'Campus accessibility map', category: 'Open to frontend + GIS', progress: 28, dueDate: 'Nov 08', tone: 'green', people: ['JD', 'PS', 'NK'] },
	{ id: 'study-buddy', name: 'Study buddy matching', category: 'Looking for a Python learner', progress: 42, dueDate: 'Nov 14', tone: 'blue', people: ['MK', 'SP'] },
	{ id: 'food-waste', name: 'Food waste tracker', category: 'Data + design collaboration', progress: 64, dueDate: 'Nov 21', tone: 'coral', people: ['AL', 'JD'] },
];

const activities = [
	{ initials: 'PS', name: 'Priya Shah', action: 'is looking for', item: 'a React teammate', note: 'Campus accessibility map', time: '12 min ago', tone: 'blue' },
	{ initials: 'AO', name: 'Amara Okafor', action: 'offered to teach', item: 'data visualization', note: 'in exchange for TypeScript practice', time: '48 min ago', tone: 'green' },
	{ initials: 'NK', name: 'Noah Kim', action: 'started a', item: 'study buddy project', note: 'Looking for two collaborators', time: '2 hours ago', tone: 'gold' },
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
					<p className="dashboard-eyebrow">YOUR STUDENT NETWORK</p>
					<h1>Build something together<span>.</span></h1>
					<p className="dashboard-subtitle">Find a project, meet your next teammate, or share a skill.</p>
				</div>
				<Button onClick={() => { window.location.hash = '#/projects'; }}><Plus size={15} /> New project</Button>
			</section>

			<section className="dashboard-summary" aria-label="Workspace summary">
				<Card title="Projects to join" value="08" detail={<><span className="dashboard-trend"><ArrowUpRight size={13} /> 3</span> match your skills</>} accent="green" />
				<Card title="Potential teammates" value="12" detail="With complementary skills" accent="blue" />
				<Card title="Learning goals" value="03" detail="In progress this term" accent="coral" />
				<div className="dashboard-focus">
					<span className="dashboard-focus__spark" aria-hidden="true">✳</span>
					<p className="dashboard-eyebrow">THIS WEEK</p>
					<strong>Learn by<br />building together.</strong>
					<span>Share what you know.</span>
				</div>
			</section>

			<div className="dashboard-columns">
				<section className="dashboard-section">
					<header className="dashboard-section__header">
						<div><p className="dashboard-eyebrow">OPEN OPPORTUNITIES</p><h2>Projects looking for you</h2></div>
						<Link to="/discover" className="dashboard-text-link">Discover projects <ArrowRight size={14} /></Link>
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
					<Link className="dashboard-view-all" to="/skill-exchange"><span><Plus size={14} /></span>Explore skill exchange<ArrowRight size={14} /></Link>
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
