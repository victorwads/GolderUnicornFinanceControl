import "./BankInfo.css"
import { Loading } from "../../components/Loading"
import Bank from "../../data/models/Bank"

let banksResourceUrl = 'https://goldenunicornfc.firebaseapp.com/resources/banks/'
if (window.location.hostname === 'localhost') {
  banksResourceUrl = window.location.protocol + '//' + window.location.host + '/resources/banks/'
}

interface BankInfoParams {
  bank: Bank
  balance?: number|true
  divider?: boolean
  onClick?(): void
}

const BankInfo = ({ bank, balance, divider, onClick }: BankInfoParams) => {
  return <div className={`BankInfo ${divider === false ? 'NoDivider' : ''}`} onClick={onClick}>
    <img className="IconBall" src={banksResourceUrl + (bank.logoUrl || 'carteira.jpg')} alt={bank.name + ' Logo'} />
    {bank.name}
    <div style={{flex: 1}} />
    <Loading show={balance === true} />
    {typeof balance == "number" && <span className="BankInfo-Balance">
      {balance.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })}
    </span>}
  </div>
}
export default BankInfo
