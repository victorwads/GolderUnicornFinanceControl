import Bank from "../../data/models/Bank"
import "./BankInfo.css"

let banksResourceUrl = 'https://goldenunicornfc.firebaseapp.com/resources/banks/'
if (window.location.hostname === 'localhost') {
  banksResourceUrl = window.location.protocol + '//' + window.location.host + '/resources/banks/'
}

interface BankInfoParams {
  bank: Bank
  balance?: number
  divider?: boolean
  onClick?(): void
}

const BankInfo = ({ bank, balance, divider, onClick }: BankInfoParams) => {
  return <div className={`BankInfo ${divider === false ? 'NoDivider' : ''}`} onClick={onClick}>
    <img src={banksResourceUrl + (bank.logoUrl || 'carteira.jpg')} alt={bank.name + ' Logo'} />
    {bank.name}
    <div style={{flex: 1}} />
    {balance !== undefined && <span className="BankInfo-Balance">
      {balance.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })}
    </span>}
  </div>
}
export default BankInfo
