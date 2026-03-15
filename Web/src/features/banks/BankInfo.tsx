import "./BankInfo.css"
import { Loading } from "@componentsDeprecated/Loading"
import { Bank } from "@models"
import { resolveBankResourceUrl } from "@lib/assetUrls"

interface BankInfoParams {
  bank: Bank
  balance?: number|true
  divider?: boolean
  onClick?(): void
}

const BankInfo = ({ bank, balance, divider, onClick }: BankInfoParams) => {
  return <div className={`BankInfo ${divider === false ? 'NoDivider' : ''}`} onClick={onClick}>
    <img className="IconBall" src={resolveBankResourceUrl(bank.logoUrl || 'carteira.jpg')} alt={bank.name + ' Logo'} />
    {bank.name}
    <div style={{flex: 1}} />
    <Loading show={balance === true} />
    {typeof balance == "number" && <span className="BankInfo-Balance">
      {balance.toLocaleString(CurrentLangInfo.short, {
        style: 'currency',
        currency: 'BRL'
      })}
    </span>}
  </div>
}
export default BankInfo
