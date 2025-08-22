import { Link } from 'react-router-dom';
import { Progress } from './types';

interface Props {
  progress: Progress | null;
  onExport: () => void;
}

export const PrivacySection = ({ progress, onExport }: Props) => <>
  <ul>
    <li onClick={onExport}>{Lang.settings.exportData}</li>
    <li><Link to="/main/resource-usage">Ver uso de recursos</Link></li>
  </ul>
  {progress && <div className="progress-box">
    <div className="progress-label">
      {progress.type === 'resave'
        ? Lang.settings.resavingWithEncryption(progress.filename, progress.current.toString(), progress.max.toString())
        : Lang.settings.exportingData(progress.filename, progress.current.toString(), progress.max.toString())}
    </div>
    <progress value={progress.current} max={progress.max} />
    {progress.sub && <>
      <div className="progress-sub">{progress.sub.current}/{progress.sub.max}</div>
      <progress value={progress.sub.current} max={progress.sub.max} />
    </>}
  </div>}
</>;
