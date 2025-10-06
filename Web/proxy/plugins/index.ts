import { __dirname, fs, path } from '../commons';

const pluginsDir = path.join(__dirname, 'plugins');
const files = fs.readdirSync(pluginsDir).filter(f => !f.startsWith('index.'));

const plugins = await Promise.all(
  files.map(file => import(path.join(pluginsDir, file)))
);

export default plugins;
