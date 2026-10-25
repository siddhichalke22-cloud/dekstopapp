import { useEffect, useState } from 'react';
import { ArrowUpRight, Camera, Check, CircleUserRound, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import './Profile.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api';
const defaultProfile = {
	name: 'Jamie Diaz',
	email: 'jamie@northstar.design',
	title: 'Product designer',
	initials: 'JD',
};

export default function Profile() {
	const navigate = useNavigate();
	const [profile, setProfile] = useState(defaultProfile);
	const [profileId, setProfileId] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('');

	useEffect(() => {
		const controller = new AbortController();
		fetch(`${apiUrl}/profile`, { signal: controller.signal })
			.then(async (response) => {
				if (!response.ok) throw new Error('Profile API unavailable');
				return response.json();
			})
			.then((data) => {
				setProfile({
					name: data.name || defaultProfile.name,
					email: data.email || defaultProfile.email,
					title: data.title || defaultProfile.title,
					initials: data.initials || defaultProfile.initials,
				});
				if (data.id) setProfileId(data.id);
			})
			.catch((error) => {
				if (error.name !== 'AbortError') {
					setMessage('Showing sample profile details. Connect the API and create a user record to save changes.');
					setMessageType('info');
				}
			})
			.finally(() => setLoading(false));
		return () => controller.abort();
	}, []);

	function updateField(event) {
		const { name, value } = event.target;
		setProfile((current) => ({ ...current, [name]: value }));
		setMessage('');
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setMessage('');
		if (!profileId) {
			setMessage('No saved user profile was returned by the API, so these changes are only local.');
			setMessageType('info');
			return;
		}

		setSaving(true);
		try {
			const response = await fetch(`${apiUrl}/profile/${encodeURIComponent(profileId)}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(profile),
			});
			if (!response.ok) {
				const result = await response.json().catch(() => ({}));
				throw new Error(result.error || 'Unable to save profile');
			}
			const updatedProfile = await response.json();
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
						</div>
						<p className={`profile-message profile-message--${messageType}`} role="status" aria-live="polite">{loading ? 'Loading profile…' : message}</p>
					</form>

					<section className="profile-preferences">
						<h2><CircleUserRound size={16} /> Preferences</h2>
						<label className="profile-preference-row">
							<span><strong>Project updates</strong><small>Mentions, assignments, and status changes</small></span>
							<input type="checkbox" defaultChecked />
						</label>
						<label className="profile-preference-row">
							<span><strong>Weekly digest</strong><small>A summary of your team’s progress</small></span>
							<input type="checkbox" defaultChecked />
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
					<button className="profile-aside-link profile-aside-link--signout" type="button" onClick={() => navigate('/login')}>
						<LogOut size={17} />
						<span><strong>Sign out</strong><small>Return to the login screen</small></span>
						<ArrowUpRight size={15} />
					</button>
				</aside>
			</div>
		</div>
	);
}
