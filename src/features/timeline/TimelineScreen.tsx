import './TimelineScreen.css'
import { useEffect, useState } from "react"

import Bank from '../../data/models/Bank';
import BanksRepository from '../../data/repositories/BanksRepository';

import BankInfo from '../banks/BankInfo';
import { SearchBarScreen } from '../components/SearchBar';

const TimelineScreen = () => {

    let [banks, setBanks] = useState<Bank[]>([]);
    let repository = new BanksRepository();
  
    useEffect(() => {
      (async () => {
        setBanks(await repository.getAll());
      })();
    }, []);
  
    return <div className="Screen">
        TimelineScreen
        <SearchBarScreen
      onSearchEach={(search) => {
        repository.getFiltered(search).then((result) => setBanks(result));
      }}
    >
      {banks?.map((bank) => (
        <BankInfo bank={bank} key={bank.id} />
      ))}
    </SearchBarScreen>
    </div>
}

export default TimelineScreen