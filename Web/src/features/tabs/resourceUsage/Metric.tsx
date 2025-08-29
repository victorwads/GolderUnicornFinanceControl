import React from "react";

export interface MetricProps {
  label: React.ReactNode;
  value?: number | string | null;
  className?: string;
}

const Metric: React.FC<MetricProps> = ({ label, value, className = "" }) => (
  <div className={"metric " + className}>
    <span className="metric-label">{label}</span>
    <span className="metric-value">{value == null ? "—" : value}</span>
  </div>
);

export default Metric;
