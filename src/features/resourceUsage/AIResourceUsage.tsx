import React from 'react';
import { AIUses } from 'src/data/repositories/useUtils';

interface AIResourceUsageProps {
  data?: AIUses;
}

const AIResourceUsage: React.FC<AIResourceUsageProps> = ({ data }) => {
  return (
    <div className="ai-resource-usage">
      {Object.entries(data || {} as AIUses).map(([name, stats]) => (
        <div key={name}>
              {name} → Requests: {stats.requests}, Tokens Input: {stats.input}, Output: {stats.output}
        </div>
      ))}
    </div>
  );
};

export default AIResourceUsage;
