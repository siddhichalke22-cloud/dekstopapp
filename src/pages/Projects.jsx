import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Ellipsis, Plus, Search, X } from 'lucide-react';
import Button from '../components/Button.jsx';
import { api } from '../services/api.js';
import './Projects.css';

const statuses = ['All projects', 'In progress', 'In review', 'Planning', 'Completed'];
const statusValues = {
	'In progress': 'IN_PROGRESS',
	'In review': 'IN_REVIEW',
	Planning: 'PLANNING',
	Completed: 'COMPLETED',
};
function formatStatus(status) {
	return ({ IN_PROGRESS: 'In progress', IN_REVIEW: 'In review', PLANNING: 'Planning', COMPLETED: 'Completed' })[status] || status;
}

function formatDate(date) {
	if (!date) return 'No due date';
	return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ProjectDialog({ onClose, onCreate }) {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [dueDate, setDueDate] = useState('');
	const [skills, setSkills] = useState('');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	async function submit(event) {
		event.preventDefault();
		setSaving(true);
		setError('');
		try {
			await onCreate({
				name,
				description,
				dueDate: dueDate || null,
				status: 'PLANNING',
				requiredSkills: skills.split(',').map((item) => item.trim()).filter(Boolean).map((name) => ({ name, requiredLevel: 'BEGINNER' })),
			});
			onClose();
		} catch (createError) {
			setError(createError.message || 'Could not create project.');
			setSaving(false);
		}
	}

	return (
		<div className="projects-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
			<section className="projects-dialog" role="dialog" aria-modal="true" aria-labelledby="new-project-title">
				<header className="projects-dialog__header">
					<div><p className="projects-eyebrow">WORKSPACE</p><h2 id="new-project-title">Create a project</h2></div>
					<button className="projects-icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
				</header>
				<form onSubmit={submit} className="projects-dialog__form">
					<label>Project name<input autoFocus maxLength={120} onChange={(event) => setName(event.target.value)} placeholder="e.g. Spring campaign" required value={name} /></label>
					<label>Description<input maxLength={500} onChange={(event) => setDescription(event.target.value)} placeholder="What is this project about?" value={description} /></label>
					<label>Skills needed<input onChange={(event) => setSkills(event.target.value)} placeholder="React, Python, UI design" value={skills} /></label>
					<label>Due date<input onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} /></label>
					<p className="projects-form-error" role="alert">{error}</p>
					<div className="projects-dialog__actions"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={saving}>Create project</Button></div>
				</form>
			</section>
		</div>
	);
}

export default function Projects() {
	const [projects, setProjects] = useState([]);
	const [filter, setFilter] = useState('All projects');
	const [query, setQuery] = useState('');
	const [dialogOpen, setDialogOpen] = useState(false);
	const [apiConnected, setApiConnected] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const controller = new AbortController();
		api.getProjects({ signal: controller.signal })
			.then((data) => {
				if (Array.isArray(data)) setProjects(data);
				setApiConnected(true);
			})
			.catch((requestError) => {
				if (requestError.name !== 'AbortError') {
					setApiConnected(false);
					setError(requestError.message);
				}
			});
		return () => controller.abort();
	}, []);

	const visibleProjects = useMemo(() => projects.filter((project) => {
		const matchesStatus = filter === 'All projects' || project.status === statusValues[filter];
		const matchesQuery = `${project.name} ${project.description || ''}`.toLowerCase().includes(query.trim().toLowerCase());
		return matchesStatus && matchesQuery;
	}), [projects, filter, query]);

	async function createProject(project) {
		const result = await api.createProject(project);
		setProjects((current) => [result, ...current]);
		setApiConnected(true);
		setError('');
	}

	return (
		<div className="projects-page">
			<header className="projects-heading">
				<div><p className="projects-eyebrow">LEARN BY BUILDING</p><h1>Projects</h1><p>Create an idea or find a project that needs your skills.</p></div>
					<Button onClick={() => setDialogOpen(true)}><Plus size={15} /> Start a project</Button>
			</header>

			<div className="projects-toolbar">
				<div className="projects-filters" role="tablist" aria-label="Filter projects by status">
					{statuses.map((item) => <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? 'is-selected' : ''} onClick={() => setFilter(item)}>{item}{item === 'All projects' && <span>{projects.length}</span>}</button>)}
				</div>
				<label className="projects-search"><Search size={15} /><input aria-label="Search projects" onChange={(event) => setQuery(event.target.value)} placeholder="Find a project" value={query} /></label>
			</div>

			{error && <p className="projects-error" role="alert">{error}</p>}
			<section className="projects-table" aria-label="Projects list">
				<div className="projects-table__head"><span>PROJECT</span><span>STATUS</span><span>PROGRESS</span><span>DUE DATE</span><span /></div>
				{visibleProjects.map((project, index) => (
					<article className="projects-row" key={project.id}>
						<span className={`projects-mark projects-mark--${['green', 'blue', 'coral', 'lilac'][index % 4]}`} aria-hidden="true"><i /></span>
						<div className="projects-row__name"><strong>{project.name}</strong><small>{project.description || 'Project'}</small></div>
						<span className={`projects-status projects-status--${(project.status || 'PLANNING').toLowerCase()}`}>{formatStatus(project.status)}</span>
						<div className="projects-progress"><span><i style={{ width: `${Math.max(0, Math.min(100, project.progress || 0))}%` }} /></span><small>{project.progress || 0}%</small></div>
						<time><CalendarDays size={13} />{formatDate(project.dueDate)}</time>
						<button className="projects-icon-button" type="button" aria-label={`More options for ${project.name}`} title="Project actions are not configured"><Ellipsis size={18} /></button>
					</article>
				))}
				{visibleProjects.length === 0 && <div className="projects-empty">{query || filter !== 'All projects' ? 'No projects match this view.' : 'No projects yet. Start a project and invite collaborators.'}</div>}
				<footer className="projects-table__footer"><span>Showing {visibleProjects.length} of {projects.length} projects</span><span className={`projects-connection${apiConnected ? ' is-connected' : ''}`}><i />{apiConnected ? 'Connected to SkillBridge' : 'Could not connect to SkillBridge API'}</span></footer>
			</section>
			{dialogOpen && <ProjectDialog onClose={() => setDialogOpen(false)} onCreate={createProject} />}
		</div>
	);
}
