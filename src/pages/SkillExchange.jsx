import { useState } from 'react';
import { ArrowLeftRight, ArrowRight, Check, Plus, Sparkles } from 'lucide-react';
import Button from '../components/Button.jsx';
import './SkillExchange.css';

const initialOffers = [
	{ id: 'ex1', person: 'Priya Shah', initials: 'PS', teaches: 'React fundamentals', wants: 'Figma prototyping', detail: 'Can help you build your first component and understand state.', mode: 'Video call or campus', tone: 'coral' },
	{ id: 'ex2', person: 'Noah Kim', initials: 'NK', teaches: 'Python for data', wants: 'UI design basics', detail: 'Happy to work through a small dataset together.', mode: 'Pair programming', tone: 'blue' },
	{ id: 'ex3', person: 'Amara Okafor', initials: 'AO', teaches: 'Data visualization', wants: 'TypeScript', detail: 'Let’s trade a chart review for a TypeScript walkthrough.', mode: 'Flexible', tone: 'green' },
];

export default function SkillExchange() {
	const [offers, setOffers] = useState(initialOffers);
	const [showForm, setShowForm] = useState(false);
	const [sent, setSent] = useState([]);
	const [form, setForm] = useState({ teaches: '', wants: '', detail: '' });

	function publishOffer(event) {
		event.preventDefault();
		setOffers((current) => [{ id: `local-${Date.now()}`, person: 'You', initials: 'JD', ...form, mode: 'Flexible', tone: 'gold' }, ...current]);
		setForm({ teaches: '', wants: '', detail: '' });
		setShowForm(false);
	}

	function requestExchange(id) {
		setSent((current) => current.includes(id) ? current : [...current, id]);
	}

	return (
		<div className="exchange-page">
			<header className="exchange-heading">
				<div><p className="exchange-eyebrow">LEARN TOGETHER</p><h1>Skill exchange<span>.</span></h1><p>Teach something you know. Learn something you don’t.</p></div>
				<Button onClick={() => setShowForm((open) => !open)}><Plus size={15} /> Offer a skill</Button>
			</header>

			<section className="exchange-intro">
				<div className="exchange-intro__symbol"><ArrowLeftRight size={20} /></div>
				<div><strong>Trade knowledge, not money.</strong><p>Set up a peer-to-peer session around two skills. Keep it casual, focused, and useful for both of you.</p></div>
				<span><Sparkles size={14} /> Peer learning</span>
			</section>

			{showForm && <form className="exchange-form" onSubmit={publishOffer}>
				<div className="exchange-form__heading"><div><p className="exchange-eyebrow">START A SWAP</p><h2>What can you share?</h2></div><button type="button" onClick={() => setShowForm(false)} aria-label="Cancel offer">×</button></div>
				<div className="exchange-form__fields">
					<label>I can teach<input maxLength={80} onChange={(event) => setForm({ ...form, teaches: event.target.value })} placeholder="e.g. Intro to Figma" required value={form.teaches} /></label>
					<label>I want to learn<input maxLength={80} onChange={(event) => setForm({ ...form, wants: event.target.value })} placeholder="e.g. React hooks" required value={form.wants} /></label>
				</div>
				<label className="exchange-form__detail">A little more about it<textarea maxLength={240} onChange={(event) => setForm({ ...form, detail: event.target.value })} placeholder="What would a session look like?" rows="2" value={form.detail} /></label>
				<div className="exchange-form__actions"><span>Preview offer only until your student account is connected.</span><Button type="submit">Publish offer</Button></div>
			</form>}

			<div className="exchange-list-heading"><div><p className="exchange-eyebrow">OPEN OFFERS</p><h2>Find a good trade</h2></div><span>{offers.length} students sharing</span></div>
			<section className="exchange-grid">
				{offers.map((offer) => <article className="exchange-card" key={offer.id}>
					<header className="exchange-card__person"><span className={`exchange-avatar exchange-avatar--${offer.tone}`}>{offer.initials}</span><div><strong>{offer.person}</strong><small>Student · available to connect</small></div><span className="exchange-open">OPEN</span></header>
					<div className="exchange-trade"><div><span>I CAN TEACH</span><strong>{offer.teaches}</strong></div><ArrowLeftRight size={17} /><div><span>I WANT TO LEARN</span><strong>{offer.wants}</strong></div></div>
					<p className="exchange-card__detail">{offer.detail || 'Open to a friendly peer-learning session.'}</p>
					<div className="exchange-card__footer"><span>{offer.mode}</span><button type="button" onClick={() => requestExchange(offer.id)} disabled={sent.includes(offer.id)}>{sent.includes(offer.id) ? <><Check size={14} /> Request sent</> : <>Request exchange <ArrowRight size={13} /></>}</button></div>
				</article>)}
			</section>
			<p className="exchange-notice">Exchange requests are shown locally in this preview. Sign-in and request tracking can be connected to the student account API.</p>
		</div>
	);
}