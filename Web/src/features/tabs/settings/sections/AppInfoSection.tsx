import { ProjectStorage } from '@utils/ProjectStorage';
import { useAppUpdates } from '@components/AppUpdatesProvider';
import { SettingsSection } from './types';

let easterEggCounter = 0;
let easterEggTimeout: NodeJS.Timeout | null = null;
function triggerEasterEgg() {
  easterEggCounter++;
  if (easterEggCounter >= 8) {
    ProjectStorage.set('DEV', 'true');
    window.location.reload();
  }
  clearTimeout(easterEggTimeout!);
  easterEggTimeout = setTimeout(() => {
    easterEggCounter = 0;
  }, 2000);
}

const AppInfoContent = () => {
  const { version, updateAvailable, checkingForUpdate, offlineReady, checkForUpdates, applyUpdate } = useAppUpdates();

  return (
    <div className="AppVersionSection list">
      <div>
        <strong>{Lang.settings.appVersion}</strong>
        <span onClick={triggerEasterEgg}>{version}</span>
      </div>
      <div className="AppVersionSection__status">
        <span>
          {updateAvailable
            ? Lang.settings.newUpdateAvailable
            : offlineReady
              ? Lang.settings.offlineReady
              : Lang.settings.upToDate}
        </span>
        {updateAvailable && (
          <button type="button" onClick={applyUpdate}>
            {Lang.settings.installUpdate}
          </button>
        )}
      </div>
      <button
        type="button"
        className="AppVersionSection__check"
        disabled={checkingForUpdate}
        onClick={checkForUpdates}
      >
        {checkingForUpdate ? Lang.settings.checkingUpdates : Lang.settings.checkUpdates}
      </button>
    </div>
  );
};

const section: SettingsSection = {
  id: 'app-info',
  title: Lang.settings.appVersion,
  content: <AppInfoContent />,
};

export default section;

