import React from "react";

/**
 * @deprecated Legacy metric component kept temporarily for compatibility.
 * Prefer visual-layer components for new UI work.
 */
export interface MetricProps {
  label: React.ReactNode;
  value?: number | string | null;
  className?: string;
}

/**
 * @deprecated Legacy metric component kept temporarily for compatibility.
 * Prefer visual-layer components for new UI work.
 */
const Metric: React.FC<MetricProps> = ({ label, value, className = "" }) => (
  <div className={"metric " + className}>
    <span className="metric-label">{label}</span>
    <span className="metric-value">{value == null ? "—" : value}</span>
  </div>
);

export default Metric;
