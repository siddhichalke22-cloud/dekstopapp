import { useEffect, useState } from 'react';
import { ArrowUpRight, Camera, Check, CircleUserRound, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import { api, clearSession } from '../services/api.js';
import './Profile.css';

const defaultProfile = {
	name: 'Jamie Diaz',
	email: 'jamie@northstar.design',
	title: 'Product designer',
	initials: 'JD',
	projectUpdates: true,
	weeklyDigest: true,
};

export default function Profile() {
	const navigate = useNavigate();
	const [profile, setProfile] = useState(defaultProfile);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('');
	const [skillsText, setSkillsText] = useState('');
	const [goalsText, setGoalsText] = useState('');

	useEffect(() => {
		const controller = new AbortController();
		api.getMyProfile({ signal: controller.signal })
			.then((data) => {
				setProfile({
					...defaultProfile,
					name: data.name || defaultProfile.name,
					email: data.email || defaultProfile.email,
					title: data.title || defaultProfile.title,
					initials: data.initials || defaultProfile.initials,
					bio: data.bio || '',
					university: data.university || '',
					major: data.major || '',
					projectUpdates: data.projectUpdates ?? true,
					weeklyDigest: data.weeklyDigest ?? true,
				});
				setSkillsText((data.skills || []).map((item) => `${item.skill.name} (${item.proficiency.toLowerCase()})`).join(', '));
				setGoalsText((data.learningGoals || []).map((item) => item.skill.name).join(', '));
			})
			.catch((error) => {
				if (error.name !== 'AbortError') {
					setMessage(error.status === 401 ? 'Sign in to load and save your student profile.' : 'Could not load your profile from the server.');
					setMessageType('info');
				}
			})
			.finally(() => setLoading(false));
		return () => controller.abort();
	}, []);

	function updateField(event) {
		const { name, value, checked, type } = event.target;
		setProfile((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
		setMessage('');
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setMessage('');
		setSaving(true);
		try {
			const updatedProfile = await api.updateMyProfile(profile);
			await api.updateMySkills({
				skills: skillsText.split(',').map((entry) => entry.trim()).filter(Boolean).map((entry) => {
					const match = entry.match(/^(.*?)(?:\s*\((beginner|intermediate|advanced|expert)\))?$/i);
					return { name: match[1].trim(), proficiency: (match[2] || 'BEGINNER').toUpperCase() };
				}),
				learningGoals: goalsText.split(',').map((name) => name.trim()).filter(Boolean).map((name) => ({ name, targetLevel: 'INTERMEDIATE' })),
			});
			setProfile((current) => ({ ...current, ...updatedProfile }));
			setMessage('Profile changes saved.');
			setMessageType('success');
		} catch (error) {
			setMessage(error.message || 'Could not save your profile. Try again.');
			setMessageType('error');
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="profile-page">
			<header className="profile-page__heading">
				<div>
					<p className="profile-eyebrow">YOUR ACCOUNT</p>
					<h1>My profile</h1>
					<p className="profile-subtitle">Your details and preferences, all in one place.</p>
				</div>
				<Button type="submit" form="profile-form" loading={saving}>
					{!saving && <Check size={15} />}
					{saving ? 'Saving…' : 'Save changes'}
				</Button>
			</header>

			<div className="profile-layout">
				<section className="profile-main">
					<div className="profile-identity">
						<div className="profile-avatar-wrap">
							<span className="profile-avatar" aria-label={`Avatar initials ${profile.initials || 'JD'}`}>{profile.initials || 'JD'}</span>
							<button type="button" aria-label="Change profile photo" title="Photo upload is not configured">
								<Camera size={14} />
							</button>
						</div>
						<div className="profile-identity__copy">
							<h2>{profile.name || 'Your name'}</h2>
							<p>{profile.title || 'Team member'} · Northstar Studio</p>
							<span>MEMBER SINCE JAN 2024</span>
						</div>
					</div>

					<form id="profile-form" className="profile-form" onSubmit={handleSubmit}>
						<h2 className="profile-form__title">Personal information</h2>
						<div className="profile-form__grid">
							<label>Full name<input autoComplete="name" name="name" onChange={updateField} required value={profile.name} /></label>
							<label>Job title<input name="title" onChange={updateField} required value={profile.title} /></label>
							<label>Email address<input autoComplete="email" name="email" onChange={updateField} required type="email" value={profile.email} /></label>
							<label>Avatar initials<input maxLength={4} name="initials" onChange={updateField} required value={profile.initials} /></label>
							<label>University<input name="university" onChange={updateField} value={profile.university || ''} /></label>
							<label>Major or program<input name="major" onChange={updateField} value={profile.major || ''} /></label>
							<label className="profile-form__wide">Skills and proficiency<input onChange={(event) => setSkillsText(event.target.value)} placeholder="React (intermediate), Python (beginner)" value={skillsText} /></label>
							<label className="profile-form__wide">Learning goals<input onChange={(event) => setGoalsText(event.target.value)} placeholder="Machine learning, UI design" value={goalsText} /></label>
						</div>
						<p className={`profile-message profile-message--${messageType}`} role="status" aria-live="polite">{loading ? 'Loading profile…' : message}</p>
					</form>

					<section className="profile-preferences">
						<h2><CircleUserRound size={16} /> Preferences</h2>
						<label className="profile-preference-row">
							<span><strong>Project updates</strong><small>Mentions, assignments, and status changes</small></span>
							<input checked={profile.projectUpdates ?? true} name="projectUpdates" onChange={updateField} type="checkbox" />
						</label>
						<label className="profile-preference-row">
							<span><strong>Weekly digest</strong><small>A summary of your team’s progress</small></span>
							<input checked={profile.weeklyDigest ?? true} name="weeklyDigest" onChange={updateField} type="checkbox" />
						</label>
					</section>
				</section>

				<aside className="profile-aside">
					<section className="profile-plan">
						<p className="profile-eyebrow">WORKSPACE PLAN</p>
						<h2>Studio <span>FREE</span></h2>
						<p>Your team is making good things. Keep it going.</p>
						<a href="mailto:support@example.com?subject=Workspace%20plans">Explore plans <ArrowUpRight size={14} /></a>
						<div className="profile-plan__rule" />
						<div className="profile-plan__seats"><span>Members</span><strong>9 <small>/ 10</small></strong></div>
						<div className="profile-plan__meter"><i /></div>
						<small className="profile-plan__footnote">1 seat available</small>
					</section>
					<button className="profile-aside-link" type="button" onClick={() => setMessage('Security settings are not connected yet.')}>
						<ShieldCheck size={17} />
						<span><strong>Security &amp; access</strong><small>Manage connected devices</small></span>
						<ArrowUpRight size={15} />
					</button>
					<button className="profile-aside-link profile-aside-link--signout" type="button" onClick={() => { clearSession(); navigate('/login'); }}>
						<LogOut size={17} />
						<span><strong>Sign out</strong><small>Return to the login screen</small></span>
						<ArrowUpRight size={15} />
					</button>
				</aside>
			</div>
		</div>
	);
}
