import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import './Login.css';

export default function Login() {
	const [showPassword, setShowPassword] = useState(false);
	const [message, setMessage] = useState('');

	function handleSubmit(event) {
		event.preventDefault();
		setMessage('Sign-in is not connected yet. Add your authentication API to continue.');
	}

	return (
		<main className="login-screen">
			<section className="login-showcase" aria-label="Orbit workspace">
				<a className="login-brand" href="#/" aria-label="Orbit home">
					<span className="login-brand__mark" aria-hidden="true">o</span>
					<span>orbit<span>.</span></span>
				</a>
				<div className="login-showcase__copy">
					<p className="login-eyebrow">A LITTLE MORE IN FLOW</p>
					<h1>Good work<br />finds its orbit<span>.</span></h1>
					<p>Bring the people, projects, and small details together. Then make something you’re proud of.</p>
				</div>
				<div className="login-orbit-art" aria-hidden="true">
					<div className="login-orbit-art__ring login-orbit-art__ring--outer" />
					<div className="login-orbit-art__ring login-orbit-art__ring--inner" />
					<div className="login-orbit-art__planet" />
					<span className="login-orbit-art__spark">✳</span>
				</div>
				<p className="login-showcase__footer">NORTHSTAR STUDIO <span>·</span> TEAM WORKSPACE</p>
			</section>

			<section className="login-form-side">
				<div className="login-form-wrap">
					<p className="login-eyebrow">WELCOME BACK</p>
					<h2>Pick up where<br />you left off.</h2>
					<p className="login-form-intro">Sign in to your workspace to keep things moving.</p>

					<form className="login-form" onSubmit={handleSubmit}>
						<label htmlFor="login-email">Work email</label>
						<input
							id="login-email"
							autoComplete="username"
							name="email"
							placeholder="you@company.com"
							required
							type="email"
						/>

						<div className="login-password-label">
							<label htmlFor="login-password">Password</label>
							<a href="mailto:support@example.com?subject=Password%20reset">Forgot password?</a>
						</div>
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

						<label className="login-remember">
							<input type="checkbox" name="remember" />
							<span>Keep me signed in</span>
						</label>

						<button className="login-submit" type="submit">
							Sign in <ArrowRight size={16} aria-hidden="true" />
						</button>
						<p className="login-message" role="status" aria-live="polite">{message}</p>
					</form>

					<p className="login-signup">New to Orbit? <a href="mailto:support@example.com?subject=Create%20an%20account">Ask your workspace admin <ArrowRight size={13} /></a></p>
					<p className="login-legal">By signing in, you agree to your organization’s workspace policies.</p>
				</div>
			</section>
		</main>
	);
}
