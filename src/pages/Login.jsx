import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, saveSession } from '../services/api.js';
import './Login.css';

export default function Login() {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [registering, setRegistering] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState('');

	async function handleSubmit(event) {
		event.preventDefault();
		setSubmitting(true);
		setMessage('');
		const formData = new FormData(event.currentTarget);
		const credentials = { email: formData.get('email'), password: formData.get('password') };
		try {
			const session = registering
				? await api.register({ ...credentials, name: formData.get('name'), university: formData.get('university'), major: formData.get('major') })
				: await api.login(credentials);
			saveSession(session);
			navigate('/', { replace: true });
		} catch (error) {
			setMessage(error.message || 'Unable to sign in right now.');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className="login-screen">
			<section className="login-showcase" aria-label="Orbit workspace">
				<a className="login-brand" href="#/" aria-label="Orbit home">
					<span className="login-brand__mark" aria-hidden="true">o</span>
					<span>SkillBridge<span>.</span></span>
				</a>
				<div className="login-showcase__copy">
					<p className="login-eyebrow">A LITTLE MORE IN FLOW</p>
					<h1>Find your people.<br />Build what’s next<span>.</span></h1>
					<p>Meet students with complementary skills, discover projects, and learn by making things together.</p>
				</div>
				<div className="login-orbit-art" aria-hidden="true">
					<div className="login-orbit-art__ring login-orbit-art__ring--outer" />
					<div className="login-orbit-art__ring login-orbit-art__ring--inner" />
					<div className="login-orbit-art__planet" />
					<span className="login-orbit-art__spark">✳</span>
				</div>
				<p className="login-showcase__footer">STUDENT PROJECTS <span>·</span> SHARED SKILLS</p>
			</section>

			<section className="login-form-side">
				<div className="login-form-wrap">
					<p className="login-eyebrow">WELCOME BACK</p>
					<h2>{registering ? <>Create your<br />student account.</> : <>Pick up where<br />you left off.</>}</h2>
					<p className="login-form-intro">{registering ? 'Join your campus community and find people to build with.' : 'Sign in to find collaborators and continue learning together.'}</p>

					<form className="login-form" onSubmit={handleSubmit}>
						{registering && <>
							<label htmlFor="login-name">Full name</label><input id="login-name" name="name" autoComplete="name" placeholder="Your name" required />
							<label htmlFor="login-university">University</label><input id="login-university" name="university" placeholder="Your university" />
							<label htmlFor="login-major">Major or program</label><input id="login-major" name="major" placeholder="e.g. Computer Science" />
						</>}
						<label htmlFor="login-email">Student email</label>
						<input
							id="login-email"
							autoComplete="username"
							name="email"
							placeholder="you@company.com"
							required
							type="email"
						/>

						{!registering && <div className="login-password-label">
							<label htmlFor="login-password">Password</label>
							<a href="mailto:support@example.com?subject=Password%20reset">Forgot password?</a>
						</div>}
						{registering && <label htmlFor="login-password">Password (at least 8 characters)</label>}
						<div className="login-password-input">
							<LockKeyhole size={15} aria-hidden="true" />
							<input
								id="login-password"
								autoComplete="current-password"
								name="password"
								placeholder="Enter your password"
								required
								type={showPassword ? 'text' : 'password'}
							/>
							<button
								className="login-password-toggle"
								type="button"
								aria-label={showPassword ? 'Hide password' : 'Show password'}
								aria-pressed={showPassword}
								onClick={() => setShowPassword((visible) => !visible)}
							>
								{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>

						{!registering && <label className="login-remember">
							<input type="checkbox" name="remember" />
							<span>Keep me signed in</span>
						</label>}

						<button className="login-submit" type="submit" disabled={submitting}>
							{submitting ? 'Please wait…' : registering ? 'Create account' : 'Sign in'} <ArrowRight size={16} aria-hidden="true" />
						</button>
						<p className="login-message" role="status" aria-live="polite">{message}</p>
					</form>

					<p className="login-signup">{registering ? 'Already have an account?' : 'New to SkillBridge?'} <button type="button" onClick={() => { setRegistering((value) => !value); setMessage(''); }}>{registering ? 'Sign in' : 'Create a student account'} <ArrowRight size={13} /></button></p>
					<p className="login-legal">By signing in, you agree to your organization’s workspace policies.</p>
				</div>
			</section>
		</main>
	);
}
