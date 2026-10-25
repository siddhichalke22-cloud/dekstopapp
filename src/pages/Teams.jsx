import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Plus, Search, Users, X } from 'lucide-react';
import Button from '../components/Button.jsx';
import { api } from '../services/api.js';
import './Teams.css';

const avatarTones = ['coral', 'blue', 'green', 'gold', 'lilac'];

function TeamDialog({ onClose, onCreate }) {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	async function submit(event) {
		event.preventDefault();
		setSaving(true);
		setError('');
		try {
			await onCreate({ name, description });
			onClose();
		} catch (createError) {
			setError(createError.message || 'Could not create team.');
			setSaving(false);
		}
	}

	return (
		<div className="teams-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
			<section className="teams-dialog" role="dialog" aria-modal="true" aria-labelledby="new-team-title">
				<header className="teams-dialog__header">
					<div><p className="teams-eyebrow">WORKSPACE</p><h2 id="new-team-title">Create a team</h2></div>
					<button className="teams-icon-button" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
				</header>
				<form className="teams-dialog__form" onSubmit={submit}>
					<label>Team name<input autoFocus maxLength={100} onChange={(event) => setName(event.target.value)} placeholder="e.g. Product team" required value={name} /></label>
					<label>Description<input maxLength={500} onChange={(event) => setDescription(event.target.value)} placeholder="What does this team focus on?" value={description} /></label>
					<p className="teams-form-error" role="alert">{error}</p>
					<div className="teams-dialog__actions"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={saving}>Create team</Button></div>
				</form>
			</section>
		</div>
	);
}

export default function Teams() {
	const [teams, setTeams] = useState([]);
	const [query, setQuery] = useState('');
	const [dialogOpen, setDialogOpen] = useState(false);
	const [apiConnected, setApiConnected] = useState(false);
	const [error, setError] = useState('');
	const [applicationState, setApplicationState] = useState({});

	useEffect(() => {
		const controller = new AbortController();
		api.getTeams({ signal: controller.signal })
			.then((data) => {
				if (Array.isArray(data)) setTeams(data);
				setApiConnected(true);
			})
			.catch((requestError) => {
				if (requestError.name !== 'AbortError') {
					setApiConnected(false);
					setError(requestError.message || 'Could not load teams from the server.');
			}
			});
		return () => controller.abort();
	}, []);

	const visibleTeams = useMemo(() => teams.filter((team) => (
		`${team.name} ${team.description || ''}`.toLowerCase().includes(query.trim().toLowerCase())
	)), [teams, query]);

	async function createTeam(team) {
		const result = await api.createTeam(team);
		setTeams((current) => [...current, result].sort((left, right) => left.name.localeCompare(right.name)));
		setApiConnected(true);
		setError('');
	}

	async function requestToJoin(teamId) {
		try {
			await api.applyToTeam(teamId, 'I would like to join this student collaboration team.');
			setApplicationState((current) => ({ ...current, [teamId]: 'Request sent' }));
			setError('');
		} catch (requestError) {
			setError(requestError.status === 401 ? 'Sign in before requesting to join a team.' : requestError.message);
		}
	}

	const memberCount = teams.reduce((total, team) => total + (team.members?.length || 0), 0);

	return (
		<div className="teams-page">
			<header className="teams-heading">
				<div><p className="teams-eyebrow">YOUR COLLABORATORS</p><h1>Teams</h1><p>Find your project groups and the skills they bring.</p></div>
				<Button onClick={() => setDialogOpen(true)}><Plus size={15} /> Create team</Button>
			</header>

			<section className="teams-summary">
				<span className="teams-summary__icon"><Users size={18} /></span>
				<p><strong>{teams.length} teams</strong><span> · {memberCount} member assignments</span></p>
				<div className="teams-summary__avatars" aria-label="Team members">
					{teams.flatMap((team) => team.members || []).slice(0, 4).map((member, index) => <span className={`teams-avatar teams-avatar--${avatarTones[index % avatarTones.length]}`} key={`${member.initials || member.user?.id || index}-${index}`}>{member.initials || member.user?.initials || 'TM'}</span>)}
					{memberCount > 4 && <span className="teams-summary__more">+{memberCount - 4}</span>}
				</div>
			</section>

			<div className="teams-toolbar">
				<p>All teams <span>{visibleTeams.length}</span></p>
				<label className="teams-search"><Search size={15} /><input aria-label="Search teams" onChange={(event) => setQuery(event.target.value)} placeholder="Find a team" value={query} /></label>
			</div>
			{error && <p className="teams-error" role="alert">{error}</p>}

			<section className="teams-grid" aria-label="Teams list">
				{visibleTeams.map((team, index) => {
					const members = team.members || [];
					const project = team.projects?.[0];
					return (
						<article className="teams-card" key={team.id}>
							<div className={`teams-card__art teams-card__art--${['green', 'blue', 'coral'][index % 3]}`}>
								<span className="teams-card__glyph" aria-hidden="true">✳</span>
								<span className="teams-card__category">{team.description?.trim() ? team.description : 'TEAM'}</span>
								<button className="teams-icon-button teams-card__open" type="button" title="Team details are not configured" aria-label={`Open ${team.name}`}><ArrowRight size={16} /></button>
							</div>
							<div className="teams-card__body">
								<h2>{team.name}</h2>
								<div className="teams-card__members">
									{members.slice(0, 4).map((member, memberIndex) => <span className={`teams-avatar teams-avatar--${avatarTones[memberIndex % avatarTones.length]}`} key={member.userId || member.user?.id || memberIndex}>{member.initials || member.user?.initials || 'TM'}</span>)}
									<span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
								</div>
								<div className="teams-card__focus"><span>FOCUS PROJECT</span><strong>{project?.name || 'No project assigned'}</strong><button type="button" onClick={() => requestToJoin(team.id)} disabled={Boolean(applicationState[team.id])}>{applicationState[team.id] || 'Request to join'} <ArrowRight size={13} /></button></div>
							</div>
						</article>
					);
				})}
				{visibleTeams.length === 0 && <div className="teams-empty">{query ? 'No teams match your search.' : 'No teams yet. Create a team to start finding collaborators.'}</div>}
			</section>

			<footer className="teams-connection"><i className={apiConnected ? 'is-connected' : ''} />{apiConnected ? 'Connected to SkillBridge' : 'Could not connect to SkillBridge API'}</footer>
			{dialogOpen && <TeamDialog onClose={() => setDialogOpen(false)} onCreate={createTeam} />}
		</div>
	);
}
