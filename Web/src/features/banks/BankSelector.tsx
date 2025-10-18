import { useEffect, useState, useMemo } from "react"

import { Container, ContainerFixedContent, ContainerScrollContent } from "@componentsDeprecated/conteiners";
import SearchBar from "@componentsDeprecated/fields/SearchBar"
import BaseField from "@componentsDeprecated/fields/BaseField"
import Dialog from "@componentsDeprecated/visual/Dialog"
import Row from "@componentsDeprecated/visual/Row"
import BankInfo from "./BankInfo"

import { Bank, selectBank } from "@models"
import getRepositories from "@repositories";

interface BankSelectorParams {
  label?: string
  bank?: Bank
  onChange(bank: Bank): void
}

const BankSelector: React.FC<BankSelectorParams> = ({ label, bank, onChange }) => {

  let [isOpen, setIsOpen] = useState(false);
  let [banks, setBanks] = useState<Bank[]>([]);
  let [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const { banks } = getRepositories();
    setBanks(banks.getCache());
  }, []);

  function search(search: string = '') {
    setSearchValue(search)

    const { banks } = getRepositories();
    setBanks(banks.getFiltered(search));
  }

  function reset() {
    setIsOpen(false)
    search()
  }

  return <BaseField label={label ?? Lang.accounts.bank}>
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
