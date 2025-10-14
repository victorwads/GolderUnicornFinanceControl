import { FormEvent, useState } from 'react';

import './CryptoPassSetupScreen.css';
import { Loading } from '@components/Loading';
import Button from '@components/ui/Button';

import { clearSession } from '@utils/clearSession';
import { CryptoPassRepository, User } from '@repositories';
import { Progress } from '../../data/crypt/progress';

type Props = {
  user: User;
  onCompleted: () => void;
  onProgress?: (progress: Progress | null) => void;
};

const initPassword = window.isDevelopment ? '12345678' : '';

export default function CryptoPassSetupScreen({ onCompleted, user, onProgress }: Props) {

  const [password, setPassword] = useState(initPassword);
  const [confirmation, setConfirmation] = useState(initPassword);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const repository = new CryptoPassRepository(user.id, onProgress);

    event.preventDefault();
    if (loading) return;

    if (!password || password.length < 8) {
      setError('Informe uma senha de pelo menos 8 caracteres para proteger seus dados.');
      return;
    }
    if (password !== confirmation && !user.privateHash) {
      setError('As senhas não coincidem.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await repository.initSession(password);
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
        <Loading show />
      </div>
    </div>
  }

  return (
    <div className="crypto-pass-screen">
      <form onSubmit={handleSubmit} className="crypto-pass-card">
        {user.privateHash
        ? <div>
          <h1>Insira sua senha de criptografia</h1>
        </div>
        : <div>
          <h1>Proteja seus dados</h1>
          <p>
            Defina uma senha para criptografar seus dados antes de abrir o aplicativo.
            Você usará essa senha para descriptografar as informações localmente.
          </p>
          <p>
            <strong>Atenção:</strong> Não há como recuperar essa senha se você esquecê-la.
            Certifique-se de anotá-la em um local seguro. Não será possível muda-la depois.
          </p>
        </div>}

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

        {!user.privateHash && <label className="crypto-pass-field">
          <span>Confirme a senha</span>
          <input
            className="crypto-pass-input"
            disabled={loading} type="password" value={confirmation}
            onChange={(event) => {
              setConfirmation(event.target.value);
              if (error) setError(null);
            }}
          />
        </label>}

        <div className='crypto-pass-buttons'>
          <Button
            type='reset'
            variant='secondary'
            onClick={() => clearSession()}
          >
            Sair
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando…' : 'Entrar'}
          </Button>
        </div>

        {error && <div className="crypto-pass-error">{error}</div>}
      </form>
    </div>
  );
}
