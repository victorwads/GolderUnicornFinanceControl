import React, { useState, useMemo } from "react";
import BaseField from "./fields/BaseField";
import Dialog from "./visual/Dialog";
import Row from "./visual/Row";
import SearchBar from "./fields/SearchBar";
import { Container, ContainerFixedContent, ContainerScrollContent } from "./conteiners";

interface SelectorOption<T> {
  value: T;
  label: string;
}

interface SelectorProps<T> {
  label: string;
  value?: T;
  onChange: (value: T) => void;
  options: SelectorOption<T>[];
  renderOption: (option: SelectorOption<T>, selected: boolean) => React.ReactNode;
}

function Selector<T extends string | number>({ label, value, onChange, options, renderOption }: SelectorProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchValue) return options;
    return options.filter(opt => opt.label.toLowerCase().includes(searchValue.toLowerCase()));
  }, [options, searchValue]);

  const selected = options.find(opt => opt.value === value);

  function reset() {
    setIsOpen(false);
    setSearchValue("");
  }

  return (
    <BaseField label={label}>
      <Row>
        <div onClick={() => setIsOpen(true)} style={{ cursor: "pointer", minHeight: 32, width: '100%' }}>
          {selected ? renderOption(selected, true) : (Lang.commons.selectOption(label))}
        </div>
      </Row>
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Container spaced>
          <ContainerFixedContent>
            <SearchBar value={searchValue} onSearchEach={setSearchValue} onClose={() => setIsOpen(false)} />
          </ContainerFixedContent>
          <ContainerScrollContent>
            {filteredOptions.map(opt => (
              <div key={String(opt.value)} style={{ cursor: "pointer" }} onClick={() => { onChange(opt.value); reset(); }}>
                {renderOption(opt, false)}
              </div>
            ))}
          </ContainerScrollContent>
        </Container>
      </Dialog>
    </BaseField>
  );
}

export default Selector;
