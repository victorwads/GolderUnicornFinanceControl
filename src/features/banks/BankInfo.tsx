import Bank from "../../data/models/Bank"
import "./BankInfo.css"

let banksResourceUrl = 'https://goldenunicornfc.firebaseapp.com/resources/banks/'

interface BankInfoParams {
  bank: Bank
  divider?: boolean
  onClick?(): void
}

const BankInfo = ({ bank, divider, onClick }: BankInfoParams) => {
  return <div className={`BankInfo ${divider === false ? 'NoDivider' : ''}`} onClick={onClick}>
    <img src={banksResourceUrl + bank.logoUrl} />
    {bank.name}
  </div>
}

export default BankInfo
