import React from 'react';
import './GlassContainer.css';

interface GlassContainerProps {
	children: React.ReactNode;
	className?: string;
	contentStyle?: React.CSSProperties;
}

const GlassContainer: React.FC<GlassContainerProps> = ({ children, className = '', contentStyle }) => {
	return (
		<div className={`${className} ${contentStyle}`}>
			{children}
		</div>
	);
};

export default GlassContainer;


