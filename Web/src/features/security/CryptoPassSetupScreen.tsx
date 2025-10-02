import { FormEvent, useEffect, useMemo, useState } from 'react';

import { Loading } from '@components/Loading';

import { CryptoPassRepository } from '@repositories';
import { Progress } from '../../data/crypt/progress';

import './CryptoPassSetupScreen.css';

type Props = {
  onCompleted: (password: string) => void;
  initialError?: string | null;
};

export default function CryptoPassSetupScreen({ onCompleted, initialError }: Props) {
  const repository = useMemo(() => new CryptoPassRepository(), []);

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    if (initialError) setError(initialError);
  }, [initialError]);

  const isMigrating = progress !== null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    if (!password) {
      setError('Informe uma senha para proteger seus dados.');
      return;
    }
    if (password !== confirmation) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await repository.save(password, {
        onProgress: (value) => setProgress(value),
      });
      setProgress(null);
      onCompleted(password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível salvar a senha.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crypto-pass-screen">
      <form onSubmit={handleSubmit} className="crypto-pass-card">
        <div>
          <h1>Proteja seus dados</h1>
          <p>
            Defina uma senha para criptografar seus dados antes de abrir o aplicativo.
            Você usará essa senha para descriptografar as informações localmente.
          </p>
          <p>
            <strong>Atenção:</strong> Não há como recuperar essa senha se você esquecê-la.
            Certifique-se de anotá-la em um local seguro.
          </p>
        </div>

        <label className="crypto-pass-field">
          <span>Senha de criptografia</span>
          <input
            className="crypto-pass-input"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError(null);
            }}
            disabled={loading}
            autoFocus
          />
        </label>

        <label className="crypto-pass-field">
          <span>Confirme a senha</span>
          <input
            className="crypto-pass-input"
            type="password"
            value={confirmation}
            onChange={(event) => {
              setConfirmation(event.target.value);
              if (error) setError(null);
            }}
            disabled={loading}
          />
        </label>

        <button type="submit" className="crypto-pass-submit" disabled={loading}>
          {loading ? 'Salvando…' : 'Salvar senha e continuar'}
        </button>

        {error && <div className="crypto-pass-error">{error}</div>}

        {(loading || isMigrating) && (
          <div className="crypto-pass-status">
            <Loading show />
            {isMigrating ? 'Migrando dados existentes…' : 'Configurando criptografia…'}
          </div>
        )}

        {progress && (
          <div className="crypto-pass-progress">
            <strong>{progress.filename}</strong>
            <progress value={progress.current} max={progress.max} />
            {progress.sub && (
              <>
                <div className="crypto-pass-progress-sub">
                  {progress.sub.current}/{progress.sub.max}
                </div>
                <progress value={progress.sub.current} max={progress.sub.max} />
              </>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
