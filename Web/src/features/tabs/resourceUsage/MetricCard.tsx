import React from "react";
import Metric from "./Metric";

export type MetricValues = Record<string, number | null | undefined>;

export interface MetricCardProps {
  label: string;
  metrics: MetricValues;
  type: "DB" | "IA";
}

const MetricCard: React.FC<MetricCardProps> = ({ label, metrics, type }) => (
  <div className="card">
    <div className="card-header">
      <span className="card-title">{label}</span>
      <span className="badge">{type}</span>
    </div>
    <div className="metrics">
      {Object.entries(metrics).map(([key, value]) => (
        <Metric key={key} label={key} value={value} />
      ))}
    </div>
  </div>
);

export default MetricCard;
