import './Button.css'

interface ButtonParams {
    text: string
    disabled?: boolean
    onClick?(): void
}

const Button = ({text, disabled, onClick}: ButtonParams) => 
    <button className={'Button'} disabled={disabled} onClick={() => {
        if(onClick) onClick()
    }} >{text}</button>

export default Button