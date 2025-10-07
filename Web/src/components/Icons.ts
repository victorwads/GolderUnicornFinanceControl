import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import * as brands from '@fortawesome/free-brands-svg-icons'
import * as solid from '@fortawesome/free-solid-svg-icons'
import * as regular from '@fortawesome/free-regular-svg-icons'

export const Icons = { ...solid, ...brands, ...regular }
const Icon = FontAwesomeIcon;
Icon.all = Icons;
export default Icon;

export const iconNamesList: string[] = Object.values(Icons)
  .map(definition => definition.iconName);

export type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

type IconList = typeof solid | typeof brands | typeof regular;
export type IconKey = keyof IconList;

export function getIconByCaseInsensitiveName(name: string | IconDefinition): IconDefinition {
  if(typeof name !== 'string') return name;
  const normalizedName = ICON_NAME_PREFIX + name.trim().toLowerCase().replaceAll('-', '');
  const foundIcon = iconNames.find(iconName =>
    iconName.lowerCaseName === normalizedName
  )?.icon;  
  return foundIcon ? foundIcon : Icons.faQuestion;
}

interface IconSearchName {
  icon: IconDefinition;
  lowerCaseName: string;
}

const iconNames: IconSearchName[] = [
  ...mapIconPack(solid),
  ...mapIconPack(brands),
  ...mapIconPack(regular)
];
const ICON_NAME_PREFIX = "fa";

function mapIconPack(pack: IconList): IconSearchName[] {
  return Object.keys(pack).map((iconName: string) => ({
    icon: pack[iconName as IconKey] as IconDefinition,
    lowerCaseName: iconName.toLowerCase()
  }));
}
