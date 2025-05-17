import { createCA, createCert } from 'mkcert';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

import { fileURLToPath } from 'url';

// Get the equivalent of __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = new Set();
  for (const net of Object.values(interfaces)) {
    for (const i of net || []) {
      if (i.family === 'IPv4' && !i.internal) {
        ips.add(i.address);
      }
    }
  }
  return [...ips];
}

const CERT_DEFAULT_DIR = path.join(__dirname, 'certs');
const CERT_DEFAULT_NAME = 'localhost.pem';
const CERT_DEFAULT_KEY_NAME = 'localhost-key.pem';

async function ensureCert(domains, certDir) {
  let certPath = path.join(certDir, CERT_DEFAULT_NAME);
  let keyPath = path.join(certDir, CERT_DEFAULT_KEY_NAME);
  if (!fs.existsSync(certDir)) {
    console.log(`⚠️ Cert directory ${certDir} does not exist. Creating...`);
    fs.mkdirSync(certDir, { recursive: true });
  }

  const caKeyPath = path.join(certDir, 'rootCA-key.pem');
  const caCertPath = path.join(certDir, 'rootCA.pem');

  let ca = {};
  if (fs.existsSync(caKeyPath) && fs.existsSync(caCertPath)) {
    ca.key = fs.readFileSync(caKeyPath, 'utf-8');
    ca.cert = fs.readFileSync(caCertPath, 'utf-8');
    console.log('🔐 CA existente carregada.');
  } else {
    ca = await createCA({
      organization: 'Local Proxy Dev CA',
      countryCode: 'BR',
      state: 'Dev',
      locality: 'Localhost',
      validity: 3650,
    });
    fs.writeFileSync(caKeyPath, ca.key);
    fs.writeFileSync(caCertPath, ca.cert);
    console.log('🔐🆕 Nova CA criada.');
  }

  let regenerate = true;
  if (fs.existsSync(certPath)) {
    try {
      const output = execSync(`openssl x509 -in ${certPath} -noout -text`).toString();
      const missing = domains.filter(d => !output.includes(d));
      regenerate = missing.length > 0;
    } catch (e) {
      console.warn('⚠️ Falha ao verificar certificado existente, irá regenerar.');
    }
  }

  if (regenerate) {
    const cert = await createCert({
      ca,
      domains,
      validity: 365,
    });
    fs.writeFileSync(certPath, cert.cert);
    fs.writeFileSync(keyPath, cert.key);
    console.log('📄 Novo certificado gerado para domínios:');
    domains.forEach(d => console.log(` - ${d}`));
  } else {
    console.log('✅ Certificado já cobre todos os domínios.');
  }

  return { certPath, keyPath };
}

const FIREBASE_FILENAME = 'firebase.json';

function getFirebaseConfig(fileName) {

  let tryes = 4;
  let folder = __dirname;

  while (tryes > 0) {
    if (fs.existsSync(fileName)) {
      console.log(`✅ firebase.json found in ${fileName}`);
      return JSON.parse(fs.readFileSync(fileName, 'utf8'));
    }
    fileName = path.join(folder, FIREBASE_FILENAME);
    folder = path.join(folder, '..');
    tryes--;
  }

  throw new Error('⚠️ firebase.json not found in the current directory or any parent directories.');
}

export async function getCerts(domains, certDir, certPath, keyPath) {
  const localIPs = getLocalIPs();
  domains = ['localhost', '127.0.0.1', ...localIPs, ...domains].filter(domain => domain.trim() !== '');

  if (certPath || keyPath) {
    let error = '';
    if (!certPath || !keyPath) {
      error += '⚠️ Cert and key path must be provided to together.\n';
    } else {
      certPath = path.resolve(certPath);
      keyPath = path.resolve(keyPath);
      if (fs.existsSync(certPath)) error += (`⚠️ Cert ${certPath} does not exist.\n`);
      if (fs.existsSync(keyPath)) error += (`⚠️ Key ${keyPath} does not exist.\n`);
    }

    if (error) {
      console.error(error);
      process.exit(1);
    }
  } else {
    certDir = certDir ? path.resolve(certDir) : CERT_DEFAULT_DIR;
    const cert = await ensureCert(domains, certDir);
    certPath = cert.certPath;
    keyPath = cert.keyPath;
  }

  let cert = fs.readFileSync(certPath);
  let key = fs.readFileSync(keyPath);

  return { cert, key };
}

export function getRouterFromFirebaseConfig(fileName) {
  const firebaseConfig = getFirebaseConfig(fileName);
  const routeTable = {};

  const emulators = firebaseConfig.emulators || {};

  for (const [key, value] of Object.entries(emulators)) {
    if (value.port) {
      routeTable[key] = `http://localhost:${value.port}`;
    }
  }

  return routeTable;
}