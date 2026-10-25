import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bookmark, Search, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getSessionUser } from '../services/api.js';
import './Discover.css';

const skillFilters = ['All skills', 'React', 'Python', 'Design', 'Data'];

export default function Discover() {
	const [projects, setProjects] = useState([]);
	const [students, setStudents] = useState([]);
	const [query, setQuery] = useState('');
	const [skill, setSkill] = useState('All skills');
	const [saved, setSaved] = useState([]);
	const [connected, setConnected] = useState(false);
	const [notice, setNotice] = useState('');

	useEffect(() => {
		const controller = new AbortController();
			Promise.all([api.getProjects({ signal: controller.signal }), api.getStudents({ signal: controller.signal })])
			.then(([items, studentItems]) => {
				if (Array.isArray(items)) {
					setProjects(items.map((project) => ({
						...project,
						requiredSkills: project.requiredSkills?.map((item) => ({ name: item.skill?.name || item.name, level: item.requiredLevel || item.level })) || [],
						owner: project.owner?.name || project.team?.name || 'Student project team',
						match: project.matchScore || null,
					})));
				}
				setStudents(Array.isArray(studentItems) ? studentItems : []);
				setConnected(true);
			})
			.catch((error) => { if (error.name !== 'AbortError') setConnected(false); });
		if (getSessionUser()) {
			api.getBookmarks({ signal: controller.signal }).then((items) => setSaved(items.map((item) => item.id))).catch(() => {});
		}
		return () => controller.abort();
	}, []);

	const visibleProjects = useMemo(() => projects.filter((project) => {
		const searchText = `${project.name} ${project.description || ''} ${(project.requiredSkills || []).map((item) => item.name).join(' ')}`.toLowerCase();
		const matchesSearch = searchText.includes(query.trim().toLowerCase());
		const matchesSkill = skill === 'All skills' || searchText.includes(skill.toLowerCase());
		return matchesSearch && matchesSkill;
	}), [projects, query, skill]);

	async function toggleSaved(projectId) {
		try {
			if (saved.includes(projectId)) {
				await api.removeBookmark(projectId);
				setSaved((current) => current.filter((id) => id !== projectId));
			} else {
				await api.saveBookmark(projectId);
				setSaved((current) => [...current, projectId]);
			}
			setNotice('Bookmark saved to your account.');
		} catch (error) {
			setNotice(error.status === 401 ? 'Sign in to save projects.' : error.message);
		}
	}

	async function applyToProject(projectId) {
		try {
			await api.applyToProject(projectId, 'I would like to collaborate on this project.');
			setNotice('Application submitted. You can track it from your projects.');
		} catch (error) {
			setNotice(error.status === 401 ? 'Sign in before applying to a project.' : error.message);
		}
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
								<div className="discover-project__footer"><span><Users size={13} /> {project.team?.members?.length || 0} teammates</span><button type="button" onClick={() => applyToProject(project.id)}>Apply to join <ArrowRight size={13} /></button></div>
							</div>
							<button className={`discover-save${saved.includes(project.id) ? ' is-saved' : ''}`} type="button" onClick={() => toggleSaved(project.id)} aria-label={saved.includes(project.id) ? 'Remove saved project' : 'Save project'} title={saved.includes(project.id) ? 'Saved' : 'Save project'}><Bookmark size={16} fill={saved.includes(project.id) ? 'currentColor' : 'none'} /></button>
						</article>)}
						{visibleProjects.length === 0 && <p className="discover-empty">{projects.length ? 'No projects match those filters. Try another skill.' : 'No projects are open yet. Create a project to invite collaborators.'}</p>}
					</div>
					<div className="discover-data-note"><i className={connected ? 'is-connected' : ''} />{connected ? 'Live projects and student profiles' : 'Could not connect to the server'}</div>
					{notice && <p className="discover-notice" role="status">{notice}</p>}
				</section>

				<aside className="discover-students">
					<header className="discover-section-heading"><div><p className="discover-eyebrow">PEOPLE LIKE YOU</p><h2>Potential teammates</h2></div></header>
					{students.map((student, index) => <article className="discover-student" key={student.id}>
						<div className={`discover-student__avatar discover-student__avatar--${['coral', 'blue', 'green'][index % 3]}`}>{student.initials}</div>
						<div className="discover-student__body"><h3>{student.name}</h3><p>{[student.major, student.university].filter(Boolean).join(' · ') || student.title}</p><div className="discover-student__skills">{(student.skills || []).map((item) => <span key={item.skill.id}>{item.skill.name} · {item.proficiency.toLowerCase()}</span>)}</div><p className="discover-student__goal">Learning: <strong>{(student.learningGoals || []).map((item) => item.skill.name).join(', ') || 'Open to learning'}</strong></p></div>
					</article>)}
					{students.length === 0 && <p className="discover-empty">No student profiles to show yet. Create your profile to join the directory.</p>}
					<Link className="discover-profile-link" to="/profile">Complete your skills profile <ArrowRight size={14} /></Link>
				</aside>
			</div>
		</div>
	);
}