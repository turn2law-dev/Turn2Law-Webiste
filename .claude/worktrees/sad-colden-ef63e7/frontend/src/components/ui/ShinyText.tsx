import React from "react";
import styles from "./ShinyText.module.css";

type ShinyTextProps = {
	text: string;
	disabled?: boolean;
	speed?: number; // seconds
	className?: string;
};

const ShinyText: React.FC<ShinyTextProps> = ({ text, disabled = false, speed = 5, className = "" }) => {
	const animationDuration = `${speed}s`;
	const classes = [
		styles.shinyText,
		disabled ? styles.disabled : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<span className={classes} style={{ animationDuration }}>
			{text}
		</span>
	);
};

export default ShinyText;


