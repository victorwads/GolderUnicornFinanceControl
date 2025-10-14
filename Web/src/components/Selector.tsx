import React, { useState, useMemo, useRef, useEffect, KeyboardEvent } from "react";
import BaseField from "./fields/BaseField";
import Dialog from "./visual/Dialog";
import Row from "./visual/Row";
import SearchBar from "./fields/SearchBar";
import { Container, ContainerFixedContent, ContainerScrollContent } from "./conteiners";

const onSelect = (callBack: () => void): (e: KeyboardEvent) => void => {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      callBack();
    }
  }
}

export interface OptionInfo {
  label: string;
  value: string;
}

export interface SelectorSection<T> {
  section?: T;
  options: T[];
  selectable?: boolean;
}

export interface SelectorProps<T> {
  label: string;
  value?: string;
  sections: SelectorSection<T>[];
  getInfo: (option: T) => OptionInfo;
  onChange: (value: T) => void;
  renderOption: (item: T, selected: boolean) => React.ReactNode;
  renderSection?: (section: SelectorSection<T>, selected: boolean) => React.ReactNode;
}

function Selector<T>({
  label, value, sections, onChange, getInfo, renderOption, renderSection
}: SelectorProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const flatOptions = useMemo(() => {
    return sections.flatMap(section => {
      const all =[...section.options]
      section.section && all.push(section.section);
      return all;
    });
  }, [sections]);
  const selected = flatOptions.find(opt => getInfo(opt).value === value);

  const optionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (value && optionRefs.current[value]) {
      optionRefs.current[value]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isOpen, value]);

  function reset() {
    setIsOpen(false);
    setSearchValue("");
  }

  return <BaseField label={label}>
    <Row>
      <div
        style={{ cursor: "pointer", minHeight: 32 }}
        onClick={() => setIsOpen(true)}
        onKeyDown={onSelect(() => setIsOpen(true))}
      >
        {selected ? renderOption(selected, true) : (Lang.commons.selectOption(label))}
      </div>
    </Row>
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} size="full">
      <Container spaced>
        <ContainerFixedContent>
          <SearchBar value={searchValue} onSearchEach={setSearchValue} onClose={() => setIsOpen(false)} />
        </ContainerFixedContent>
        <ContainerScrollContent>{sections.map(section => {
          const sectionSelected = section.options.some(opt => getInfo(opt).value === value);
          const sectionInfo = section.section && getInfo(section.section);

          return <div key={sectionInfo?.value} style={{ marginBottom: 'var(--spacing-md)' }}>
            {renderSection && sectionInfo && <div
              ref={el => { optionRefs.current[sectionInfo.value] = el; }}
              style={{ cursor: section.selectable ? "pointer" : undefined }}
              onClick={section.selectable ? () => onChange(section.section!) : undefined}
              onKeyDown={section.selectable ? onSelect(() => {
                onChange(section.section!);
                reset();
              }) : undefined}
            >
              {renderSection(section, sectionSelected)}
            </div>}
            {section.options.map(opt => {
              const info = getInfo(opt);
              const isSelected = info.value === value;
              return <div
                key={String(info.value)}
                style={{ cursor: "pointer", marginLeft: sections.length > 0 ? 'var(--spacing-xl)' : 0 }}
                ref={el => { optionRefs.current[info.value] = el; }}
                onClick={() => { onChange(opt); reset(); }}
                onKeyDown={onSelect(() => {
                  onChange(opt);
                  reset();
                })}
              >{renderOption(opt, isSelected)}</div>;
            })}
          </div>;
        })}</ContainerScrollContent>
      </Container>
    </Dialog>
  </BaseField>;
}

export default Selector;
