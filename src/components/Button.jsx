import './Button.css';

const variants = new Set(['primary', 'secondary', 'ghost', 'danger']);
const sizes = new Set(['small', 'medium', 'large']);

export default function Button({
	children,
	variant = 'primary',
	size = 'medium',
	type = 'button',
	className = '',
	loading = false,
	disabled = false,
	...props
}) {
	const safeVariant = variants.has(variant) ? variant : 'primary';
	const safeSize = sizes.has(size) ? size : 'medium';
	const classes = [
		'ui-button',
		`ui-button--${safeVariant}`,
		`ui-button--${safeSize}`,
		loading && 'ui-button--loading',
		className,
	].filter(Boolean).join(' ');

	return (
		<button
			{...props}
			className={classes}
			type={type}
			disabled={disabled || loading}
			aria-busy={loading || undefined}
		>
			{loading && <span className="ui-button__spinner" aria-hidden="true" />}
			{children}
		</button>
	);
}
