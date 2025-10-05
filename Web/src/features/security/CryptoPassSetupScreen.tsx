import { FormEvent, useEffect, useMemo, useState } from 'react';

import { Loading } from '@components/Loading';

import { CryptoPassRepository } from '@repositories';
import { Progress } from '../../data/crypt/progress';

import './CryptoPassSetupScreen.css';
import { clearFirestore } from '@configs';

type Props = {
  uid: string;
  onCompleted: () => void;
};

export default function CryptoPassSetupScreen({ onCompleted, uid }: Props) {

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);

  const isMigrating = progress !== null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const repository = new CryptoPassRepository(uid);

    event.preventDefault();
    if (loading) return;

    if (!password || password.length < 8) {
      setError('Informe uma senha de pelo menos 8 caracteres para proteger seus dados.');
      return;
    }
    if (password !== confirmation) {
      setError('As senhas não coincidem.');
      return;
    }

    setError(null);
    setLoading(true);
    setProgress(null);

    try {
      await repository.initSession(password, {
        onProgress: (value) => setProgress(value),
      });
      onCompleted();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || err.name);
      } else {
        setError('Erro desconhecido.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="crypto-pass-screen">
      <div className="crypto-pass-card">
        {error && <div className="crypto-pass-error">{error}</div>}

        <div className="crypto-pass-status">
          <Loading show />
          {isMigrating ? 'Migrando dados existentes…' : 'Configurando criptografia…'}
        </div>

        {progress && (
          <div className="crypto-pass-progress">
            <strong>Processando {progress.filename}</strong>
            <div className="crypto-pass-progress-sub">
              {`${progress.current} / ${progress.max}`}
            </div>
            <progress value={progress.current} max={progress.max} />
            <div className="crypto-pass-progress-sub">
              { progress.sub
                ? `Criptografando ${progress.sub.current} / ${progress.sub.max}`
                : 'Carregando dados...'
              }
            </div>
            {progress.sub && <progress value={progress.sub.current || 0} max={progress.sub.max || 0} />}
          </div>
        )}
      </div>
    </div>
  }

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
            Certifique-se de anotá-la em um local seguro. Não será possível muda-la depois.
          </p>
        </div>

        <label className="crypto-pass-field">
          <span>Senha de criptografia</span>
          <input
            className="crypto-pass-input" autoFocus
            disabled={loading} type="password" value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError(null);
            }}
          />
        </label>

        <label className="crypto-pass-field">
          <span>Confirme a senha</span>
          <input
            className="crypto-pass-input"
            disabled={loading} type="password" value={confirmation}
            onChange={(event) => {
              setConfirmation(event.target.value);
              if (error) setError(null);
            }}
          />
        </label>

        <button type="submit" className="crypto-pass-submit" disabled={loading}>
          {loading ? 'Salvando…' : 'Salvar senha e continuar'}
        </button>

        <button onClick={clearFirestore}>Sair</button>

        {error && <div className="crypto-pass-error">{error}</div>}
      </form>
    </div>
  );
}
