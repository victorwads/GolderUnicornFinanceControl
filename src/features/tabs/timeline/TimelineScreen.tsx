import "./TimelineScreen.css";
import { useEffect, useState } from "react";

import AccountsRegistry from "../../../data/models/AccountRegistry";
import AccountRegistriesRepository from "../../../data/repositories/AccountRegistryRepository";

const TimelineScreen = () => {
  const [registries, setRegistries] = useState<AccountsRegistry[]>([]);

  useEffect(() => {
    const repository = new AccountRegistriesRepository();

    repository.getAll().then((data) => {
      // Ordena os registros por data (mais recentes primeiro)
      const sortedData = data.sort((a, b) => b.date.getTime() - a.date.getTime());
      setRegistries(sortedData);
    });
  }, []);

  return (
    <div className="Screen">
      <h1>Timeline</h1>
      <div className="TimelineList">
        {registries.map((registry) => (
          <div key={registry.id} className="TimelineItem">
            <div className="TimelineDate">{registry.date.toLocaleDateString()}</div>
            <div className="TimelineDescription">{registry.description}</div>
            <div className="TimelineValue">{registry.value.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineScreen;

