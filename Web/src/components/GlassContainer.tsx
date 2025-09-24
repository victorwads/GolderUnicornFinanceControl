import React from 'react';
import './GlassContainer.css';

interface GlassContainerProps {
	children: React.ReactNode;
	className?: string;
	contentStyle?: React.CSSProperties;
}

const GlassContainer: React.FC<GlassContainerProps> = ({ children, className = '', contentStyle }) => {
	return (
		<div className={`glass-container ${className}`}>
			<div className="glass-filter"></div>
			<div className="glass-overlay"></div>
			<div className="glass-specular"></div>
			<div className="glass-content" style={contentStyle}>
				{children}
			</div>
		</div>
	);
};

export default GlassContainer;


