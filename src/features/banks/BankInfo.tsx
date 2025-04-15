import Bank from "../../data/models/Bank"
import "./BankInfo.css"

let banksResourceUrl = 'https://goldenunicornfc.firebaseapp.com/resources/banks/'
if (window.location.hostname === 'localhost') {
  banksResourceUrl = window.location.protocol + '//' + window.location.host + '/resources/banks/'
}

interface BankInfoParams {
  bank: Bank
  divider?: boolean
  onClick?(): void
}

const BankInfo = ({ bank, divider, onClick }: BankInfoParams) => {
  return <div className={`BankInfo ${divider === false ? 'NoDivider' : ''}`} onClick={onClick}>
    <img src={banksResourceUrl + (bank.logoUrl || 'carteira.jpg')} alt={bank.name + ' Logo'} />
    {bank.name}
  </div>
}

export default BankInfo
