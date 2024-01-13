import Bank from "../../data/models/Bank";
import "./BankInfo.css";

let banksResourceUrl = 'https://goldenunicornfc.firebaseapp.com/resources/banks/'

interface BankInfoParams {
  bank: Bank;
  divider?: boolean
}

const BankInfo = ({ bank, divider }: BankInfoParams) => {
  return (
    <div className={`BankInfo ${divider===false?'NoDivider':''}`}>
      <img src={banksResourceUrl + bank.logoUrl} />
      {bank.name}
    </div>
  );
};

export default BankInfo;
