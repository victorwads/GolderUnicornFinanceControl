import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScan(result: string): void;
  onClose?(): void;
}

const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, false);
    scanner.render((text) => {
      onScan(text);
      scanner.clear().then(() => onClose && onClose());
    });
    return () => { scanner.clear().catch(() => {}); };
  }, []);

  return <div id="reader" style={{ width: '300px' }} />;
};

export default BarcodeScanner;
