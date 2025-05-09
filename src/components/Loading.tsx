import './Loading.css'

interface LoadingProps {
    show: boolean,
    type?: 'pulse' | 'wave' | 'rainbow'
}

export const Loading: React.FC<LoadingProps> = ({ show, type = 'pulse' }) => {
    return show && <div className={`loader ${type}`}></div>
}