import './Card.css';

const accents = new Set(['green', 'blue', 'coral', 'gold']);

export default function Card({
	title,
	value,
	detail,
	accent = 'green',
	children,
	className = '',
}) {
	const safeAccent = accents.has(accent) ? accent : 'green';
	const isSummary = value !== undefined;
	const classes = [
		'ui-card',
		isSummary && 'ui-card--summary',
		`ui-card--${safeAccent}`,
		className,
	].filter(Boolean).join(' ');

	return (
		<article className={classes}>
			{title && (
				<div className="ui-card__header">
					<h2 className="ui-card__title">{title}</h2>
					{isSummary && <span className="ui-card__accent" aria-hidden="true" />}
				</div>
			)}
			{isSummary && <p className="ui-card__value">{value}</p>}
			{detail && <p className="ui-card__detail">{detail}</p>}
			{children && <div className="ui-card__content">{children}</div>}
		</article>
	);
}
