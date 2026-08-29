import { Fragment } from "react";
import { Separator } from "../../../components/ui/separator";
import { Field } from "../../../components/ui/field";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "../../../components/ui/combobox";

export default function AppClientComboboxField({ label, description, options, selectedIds, onChange, error, placeholder, isDarkMode }) {
  const anchor = useComboboxAnchor();

  const stringifiedSelectedIds = selectedIds.map(id => String(id));
  
  const chipClassName = isDarkMode
    ? "rounded-md border border-[#f8d24e]/25 bg-[#f8d24e]/12 text-[#ffe28a]"
    : "rounded-md border border-[#7b0d15]/20 bg-[#7b0d15]/10 text-[#7b0d15]";
  
  const comboboxContainerClassName = `min-h-[2.625rem] rounded-md transition-[border-color,box-shadow,background-color] duration-200 ${
    error ? "border-red-400" : ""
  }`;
  
  const inputPlaceholderClassName = isDarkMode
    ? "placeholder:text-[#a58d95] text-[#f4eaea] bg-transparent outline-none flex-1 ml-1"
    : "placeholder:text-[#9b7d84] text-[#4a1921] bg-transparent outline-none flex-1 ml-1";
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col space-y-1 w-full mb-1">
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight uppercase text-foreground m-0 whitespace-nowrap">
          {label} <span className="text-red-500">*</span>
        </h3>
        <p className="m-0 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <Separator />
      <Field className="w-full">
        <Combobox
          multiple
          autoHighlight
          items={options}
          itemToString={(item) => (item ? item.label : "")}
          value={stringifiedSelectedIds}
          onValueChange={onChange}
        >
          <ComboboxChips ref={anchor} className={comboboxContainerClassName}>
            <ComboboxValue>
              {(values) => (
                <Fragment>
                  {values.map((val) => {
                    const opt = options.find(o => String(o.value ?? o.id) === String(val));
                    return <ComboboxChip key={val} className={chipClassName}>{opt ? opt.label : val}</ComboboxChip>;
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
        {error && <p className="!mt-0 text-xs text-red-500">{error}</p>}
      </Field>
    </div>
  );
}
