import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bookmark, Search, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import './Discover.css';

const sampleProjects = [
	{ id: 'd1', name: 'Campus accessibility map', description: 'Build a community-sourced map of accessible routes and spaces around campus.', status: 'IN_PROGRESS', progress: 28, requiredSkills: [{ name: 'React', level: 'INTERMEDIATE' }, { name: 'GIS', level: 'BEGINNER' }], team: { name: 'Open Campus Lab' }, owner: 'Priya Shah', match: 92 },
	{ id: 'd2', name: 'Study buddy matching', description: 'A small web app that helps students find study partners by course and schedule.', status: 'PLANNING', progress: 0, requiredSkills: [{ name: 'Python', level: 'BEGINNER' }, { name: 'UI design', level: 'BEGINNER' }], team: { name: 'BuildTogether' }, owner: 'Noah Kim', match: 86 },
	{ id: 'd3', name: 'Food waste tracker', description: 'Prototype a data dashboard for tracking food waste in student housing.', status: 'IN_PROGRESS', progress: 54, requiredSkills: [{ name: 'Data visualization', level: 'INTERMEDIATE' }, { name: 'Figma', level: 'BEGINNER' }], team: { name: 'Green Bytes' }, owner: 'Amara Okafor', match: 78 },
];

const sampleStudents = [
	{ id: 's1', name: 'Priya Shah', initials: 'PS', major: 'Computer Science · 3rd year', skills: ['React', 'TypeScript', 'Accessibility'], learning: 'Product design', seeking: 'Frontend teammate', tone: 'coral' },
	{ id: 's2', name: 'Noah Kim', initials: 'NK', major: 'Information Systems · 2nd year', skills: ['Python', 'SQL', 'Research'], learning: 'Machine learning', seeking: 'Hackathon team', tone: 'blue' },
	{ id: 's3', name: 'Amara Okafor', initials: 'AO', major: 'Data Science · 4th year', skills: ['Python', 'Data viz', 'Figma'], learning: 'React', seeking: 'Open to collaborate', tone: 'green' },
];

const skillFilters = ['All skills', 'React', 'Python', 'Design', 'Data'];

export default function Discover() {
	const [projects, setProjects] = useState(sampleProjects);
	const [query, setQuery] = useState('');
	const [skill, setSkill] = useState('All skills');
	const [saved, setSaved] = useState([]);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		api.getProjects({ signal: controller.signal })
			.then((items) => {
				if (Array.isArray(items) && items.length) {
					setProjects(items.map((project) => ({
						...project,
						requiredSkills: project.requiredSkills?.map((item) => ({ name: item.skill?.name || item.name, level: item.requiredLevel || item.level })) || [],
						owner: project.owner?.name || project.team?.name || 'Student project team',
						match: project.matchScore || null,
					})));
				}
				setConnected(true);
			})
			.catch((error) => { if (error.name !== 'AbortError') setConnected(false); });
		return () => controller.abort();
	}, []);

	const visibleProjects = useMemo(() => projects.filter((project) => {
		const searchText = `${project.name} ${project.description || ''} ${(project.requiredSkills || []).map((item) => item.name).join(' ')}`.toLowerCase();
		const matchesSearch = searchText.includes(query.trim().toLowerCase());
		const matchesSkill = skill === 'All skills' || searchText.includes(skill.toLowerCase());
		return matchesSearch && matchesSkill;
	}), [projects, query, skill]);

	function toggleSaved(projectId) {
		setSaved((current) => current.includes(projectId) ? current.filter((id) => id !== projectId) : [...current, projectId]);
	}

	return (
		<div className="discover-page">
			<header className="discover-heading">
				<div><p className="discover-eyebrow">FIND YOUR NEXT COLLABORATION</p><h1>Discover<span>.</span></h1><p>Find projects and people that fit what you know and what you want to learn.</p></div>
				<div className="discover-match-note"><Sparkles size={16} /><span>Matches improve as you add skills to your <Link to="/profile">profile</Link>.</span></div>
			</header>

			<section className="discover-search-row">
				<label className="discover-search"><Search size={17} /><input aria-label="Search projects and skills" onChange={(event) => setQuery(event.target.value)} placeholder="Try a skill, project topic, or technology" value={query} /></label>
				<div className="discover-skill-filters" aria-label="Filter by skill">
					{skillFilters.map((item) => <button className={skill === item ? 'is-selected' : ''} key={item} onClick={() => setSkill(item)} type="button">{item}</button>)}
				</div>
			</section>

			<div className="discover-content">
				<section className="discover-projects">
					<header className="discover-section-heading"><div><p className="discover-eyebrow">PROJECTS LOOKING FOR PEOPLE</p><h2>Good work, open seats</h2></div><span>{visibleProjects.length} opportunities</span></header>
					<div className="discover-project-list">
						{visibleProjects.map((project, index) => <article className="discover-project" key={project.id}>
							<div className={`discover-project__symbol discover-project__symbol--${['lime', 'blue', 'coral'][index % 3]}`} aria-hidden="true">{['⌘', '◒', '✳'][index % 3]}</div>
							<div className="discover-project__body">
								<div className="discover-project__meta"><span>{project.team?.name || project.owner}</span>{project.match && <span className="discover-match"><Sparkles size={12} />{project.match}% match</span>}</div>
								<h3>{project.name}</h3>
								<p>{project.description || 'Student-led project seeking collaborators.'}</p>
								<div className="discover-skills">{(project.requiredSkills || []).length ? project.requiredSkills.map((item) => <span key={item.name}>{item.name}<small>{(item.level || 'BEGINNER').toLowerCase()}</small></span>) : <span>Skills open</span>}</div>
								<div className="discover-project__footer"><span><Users size={13} /> {project.team?.members?.length || 2} teammates</span><Link to="/projects">View project <ArrowRight size={13} /></Link></div>
							</div>
							<button className={`discover-save${saved.includes(project.id) ? ' is-saved' : ''}`} type="button" onClick={() => toggleSaved(project.id)} aria-label={saved.includes(project.id) ? 'Remove saved project' : 'Save project'} title={saved.includes(project.id) ? 'Saved' : 'Save project'}><Bookmark size={16} fill={saved.includes(project.id) ? 'currentColor' : 'none'} /></button>
						</article>)}
						{visibleProjects.length === 0 && <p className="discover-empty">No projects match those filters. Try another skill.</p>}
					</div>
					<div className="discover-data-note"><i className={connected ? 'is-connected' : ''} />{connected ? 'Project listings synced' : 'Preview listings shown until the API is available'}</div>
				</section>

				<aside className="discover-students">
					<header className="discover-section-heading"><div><p className="discover-eyebrow">PEOPLE LIKE YOU</p><h2>Potential teammates</h2></div></header>
					{sampleStudents.map((student) => <article className="discover-student" key={student.id}>
						<div className={`discover-student__avatar discover-student__avatar--${student.tone}`}>{student.initials}</div>
						<div className="discover-student__body"><h3>{student.name}</h3><p>{student.major}</p><div className="discover-student__skills">{student.skills.map((item) => <span key={item}>{item}</span>)}</div><p className="discover-student__goal">Learning: <strong>{student.learning}</strong></p><span className="discover-student__seeking">{student.seeking}</span></div>
					</article>)}
					<Link className="discover-profile-link" to="/profile">Complete your skills profile <ArrowRight size={14} /></Link>
				</aside>
			</div>
		</div>
	);
}