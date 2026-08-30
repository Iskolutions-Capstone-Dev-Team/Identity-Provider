import { Fragment } from "react";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "@/components/ui/combobox";

export default function AppClientComboboxField({ options, selectedIds, onChange, placeholder, isDarkMode, lockedSelectedValues = [] }) {
  const anchor = useComboboxAnchor();
  const stringifiedSelectedIds = selectedIds.map(id => String(id));
  
  const chipClassName = isDarkMode
    ? "rounded-md border border-[#f8d24e]/25 bg-[#f8d24e]/12 text-[#ffe28a]"
    : "rounded-md border border-[#7b0d15]/20 bg-[#7b0d15]/10 text-[#7b0d15]";
  
  const comboboxContainerClassName = `min-h-[2.625rem] rounded-md transition-[border-color,box-shadow,background-color] duration-200`;
  
  const inputPlaceholderClassName = isDarkMode
    ? "placeholder:text-[#a58d95] text-[#f4eaea] bg-transparent outline-none flex-1 ml-1"
    : "placeholder:text-[#9b7d84] text-[#4a1921] bg-transparent outline-none flex-1 ml-1";
  
  return (
    <Combobox multiple autoHighlight items={options} itemToString={(item) => (item ? item.label : "")} value={stringifiedSelectedIds} onValueChange={onChange}>
      <ComboboxChips ref={anchor} className={comboboxContainerClassName}>
        <ComboboxValue>
          {(values) => (
            <Fragment>
              {values.map((val) => {
                const opt = options.find(o => String(o.value ?? o.id) === String(val));
                const isLocked = lockedSelectedValues.includes(val) || lockedSelectedValues.includes(Number(val));
                return (
                  <ComboboxChip key={val} className={chipClassName} showRemove={!isLocked}>
                    {opt ? opt.label : val}
                  </ComboboxChip>
                );
              })}
              <ComboboxChipsInput placeholder={placeholder} className={inputPlaceholderClassName} />
            </Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No client found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => {
            const optValue = String(item.value ?? item.id);
            return (
              <ComboboxItem key={optValue} value={optValue}>
                {item.label}
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
