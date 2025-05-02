import { useEffect, useState, useMemo } from "react"

import { SearchBarScreen } from "../components/fields/SearchBar"
import BaseField from "../components/fields/BaseField"
import Dialog from "../components/visual/Dialog"
import Row from "../components/visual/Row"
import BankInfo from "./BankInfo"

import Bank from "../../data/models/Bank"
import BanksRepository from "../../data/repositories/BanksRepository"

interface BankSelectorParams {
	label?: string
	bank?: Bank
	onChange(bank: Bank): void
}

const BankSelector: React.FC<BankSelectorParams> = ({ label, bank, onChange }) => {

	const repository = useMemo(() => new BanksRepository(), []);
	let [isOpen, setIsOpen] = useState(false);
	let [banks, setBanks] = useState<Bank[]>([]);
	let [searchValue, setSearchValue] = useState("");

	useEffect(() => {
		repository.waitInit().then(() => {
			repository.getAll().then(setBanks)
		});
	}, [repository]);

	function search(search: string = '') {
		setSearchValue(search)
		repository.getFiltered(search).then((result) => setBanks(result));
	}

	function reset() {
		setIsOpen(false)
		search()
	}

	return <BaseField label={label ?? "Banco"}>
		<Row>
			{bank ? <BankInfo bank={bank} /> : <div></div>}
			<a onClick={() => setIsOpen(true)}>Selecionar</a>
		</Row>
		<Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
			<SearchBarScreen value={searchValue} onSearchEach={search}>
				{banks?.map(bank => (
					<BankInfo bank={bank} key={bank.id} onClick={() => {
						onChange(bank)
						reset()
					}} />
				))}
			</SearchBarScreen>
		</Dialog>
	</BaseField>
}

export default BankSelector