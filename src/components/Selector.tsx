import React, { useState, useMemo } from "react";
import BaseField from "./fields/BaseField";
import Dialog from "./visual/Dialog";
import Row from "./visual/Row";
import SearchBar from "./fields/SearchBar";
import { Container, ContainerFixedContent, ContainerScrollContent } from "./conteiners";

interface OptionInfo {
  label: string;
  value: string;
}

interface SelectorProps<T> {
  label: string;
  value?: string;
  options: T[];
  getInfo: (option: T) => OptionInfo;
  onChange: (value: T) => void;
  renderOption: (item: T, selected: boolean) => React.ReactNode;
}

function Selector<T>({ 
  label, value, options, onChange, getInfo, renderOption
}: SelectorProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchValue) return options;
    return options.filter(opt => 
      getInfo(opt).label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue, getInfo]);

  const selected = options
    .find(opt => getInfo(opt).value === value);

  function reset() {
    setIsOpen(false);
    setSearchValue("");
  }

  return (
    <BaseField label={label}>
      <Row>
        <div
          role="button"
          aria-expanded={isOpen}
          tabIndex={0}
          style={{ cursor: "pointer", minHeight: 32, width: '100%' }}
          onClick={() => setIsOpen(true)}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              setIsOpen(true);
            }
          }}
        >
          {selected ? renderOption(selected, true) : (Lang.commons.selectOption(label))}
        </div>
      </Row>
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Container spaced>
          <ContainerFixedContent>
            <SearchBar value={searchValue} onSearchEach={setSearchValue} onClose={() => setIsOpen(false)} />
          </ContainerFixedContent>
          <ContainerScrollContent>
            <div role="listbox">
            {filteredOptions.map(opt => {
              const info = getInfo(opt);
              const isSelected = info.value === value;
              return <div
                key={info.value}
                aria-selected={isSelected} role="option" 
                onClick={() => { onChange(opt); reset(); }}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    onChange(opt);
                    reset();
                  }
                }}
              >
                {renderOption(opt, isSelected)}
              </div>;
            })}
            </div>
          </ContainerScrollContent>
        </Container>
      </Dialog>
    </BaseField>
  );
}

export default Selector;
