import React from 'react';
import './GlassContainer.css';

interface GlassContainerProps {
	children: React.ReactNode;
	className?: string;
	contentStyle?: React.CSSProperties;
}

const GlassContainer: React.FC<GlassContainerProps> = ({ children, className = '', contentStyle }) => {
	return (
		<div className={`glass-container glass-content ${className}`} style={contentStyle}>
			{children}
		</div>
	);
};

export default GlassContainer;


