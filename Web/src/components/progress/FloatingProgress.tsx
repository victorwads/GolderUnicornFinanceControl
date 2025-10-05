import './FloatingProgress.css'
import { Progress } from 'src/data/crypt/progress';

type FloatingProgressProps = {
  progress?: Progress | null
}

export const FloatingProgress = ({ progress }: FloatingProgressProps) => {
  if (!progress) return null;

  return <div className="floating-progress">
    <div>
        <span>Criptografando...</span>
        <span>{`seção ${progress.current} de ${progress.max}`}</span>
    </div>
    <progress value={progress.current} max={progress.max} />
    <progress value={progress?.sub?.current || 0} max={progress?.sub?.max || 0} />
    { progress.sub
        ? <>Registro {progress.sub.current} de {progress.sub.max} de {progress.filename}</>
        : <>Baixando dados de {progress.filename}</>
    }
 </div>
}