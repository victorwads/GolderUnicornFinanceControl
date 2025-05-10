import { useEffect, useState, useMemo } from "react"

import { Container, ContainerFixedContent, ContainerScrollContent } from "../../components/conteiners";
import SearchBar from "../../components/fields/SearchBar"
import BaseField from "../../components/fields/BaseField"
import Dialog from "../../components/visual/Dialog"
import Row from "../../components/visual/Row"
import BankInfo from "./BankInfo"

import Bank, { selectBank } from "../../data/models/Bank"
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
			<BankInfo onClick={() => setIsOpen(true)} bank={bank || selectBank} />
		</Row>
		<Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
			<Container spaced>
				<ContainerFixedContent>
					<SearchBar value={searchValue} onSearchEach={search} onClose={() => setIsOpen(false)} />
				</ContainerFixedContent>
				<ContainerScrollContent>
					{banks?.map(bank => (
						<BankInfo bank={bank} key={bank.id} onClick={() => {
							onChange(bank)
							reset()
						}} />
					))}
				</ContainerScrollContent>
			</Container>
		</Dialog>
	</BaseField>
}

export default BankSelector