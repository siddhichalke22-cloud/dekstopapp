import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, Ellipsis, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import { api, getSessionUser } from '../services/api.js';
import './Dashboard.css';

function initialsTone(initials) {
	return `dashboard-avatar--${({ JD: 'coral', MK: 'blue', AL: 'green', SP: 'gold' })[initials] || 'lilac'}`;
}

function ProjectPeople({ people }) {
	return <div className="dashboard-people" aria-label={`${people.length} project members`}>
		{people.map((person) => <span key={person} className={`dashboard-avatar ${initialsTone(person)}`} title={person}>{person}</span>)}
	</div>;
}

export default function Dashboard() {
	const [projects, setProjects] = useState([]);
	const [students, setStudents] = useState([]);
	const [offers, setOffers] = useState([]);
	const [learningGoalCount, setLearningGoalCount] = useState(0);
	const [apiConnected, setApiConnected] = useState(false);
	const currentUser = getSessionUser();

	useEffect(() => {
		const controller = new AbortController();
		Promise.all([api.getProjects({ signal: controller.signal }), api.getStudents({ signal: controller.signal }), api.getSkillOffers({ signal: controller.signal })])
			.then(([items, studentItems, skillOffers]) => {
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
				setStudents(Array.isArray(studentItems) ? studentItems.filter((student) => student.id !== currentUser?.id) : []);
				setOffers(Array.isArray(skillOffers) ? skillOffers : []);
				setApiConnected(true);
			})
			.catch((error) => {
				if (error.name !== 'AbortError') setApiConnected(false);
			});
		return () => controller.abort();
	}, []);

	useEffect(() => {
		if (!currentUser) return;
		const controller = new AbortController();
		api.getMyProfile({ signal: controller.signal }).then((profile) => setLearningGoalCount(profile.learningGoals?.length || 0)).catch(() => {});
		// return () => controller.abort();
	}, []);

	const activities = [
		...offers.slice(0, 2).map((offer) => ({ initials: offer.user.initials, name: offer.user.name, action: 'offers to teach', item: offer.teachingSkill.name, note: `Wants to learn ${offer.wantedSkill.name}`, time: new Date(offer.createdAt).toLocaleDateString(), tone: 'green' })),
		...students.slice(0, 2).map((student) => ({ initials: student.initials, name: student.name, action: 'is studying', item: student.major || 'new skills', note: student.university || 'Student on SkillBridge', time: 'Student profile', tone: 'blue' })),
	].slice(0, 3);

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
				<Card title="Projects to join" value={String(projects.length).padStart(2, '0')} detail="Open in the student network" accent="green" />
				<Card title="Potential teammates" value={String(students.length).padStart(2, '0')} detail="Student profiles to explore" accent="blue" />
				<Card title="Learning goals" value={String(learningGoalCount).padStart(2, '0')} detail={currentUser ? 'Saved on your profile' : 'Sign in to track your goals'} accent="coral" />
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
						{projects.length === 0 && <p className="dashboard-activity__note">No projects yet. Start one to find collaborators.</p>}
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
						{activities.length === 0 && <p className="dashboard-activity__note">Student activity will appear here as projects and skill offers are added.</p>}
					</div>
					<button className="dashboard-text-link dashboard-activity__all" type="button">See all activity <ArrowRight size={14} /></button>
				</section>
			</div>
		</div>
	);
}
