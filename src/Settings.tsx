import React, { useContext } from "react";
import useLocalStorageState from "use-local-storage-state";
import SORTS from "./sorts";
import { Contact } from "./contact";
import { generateJson, generateVCard, generateZip } from "./export";
import { importJson, importVCard, importZip } from "./import";

const VIEWS = [
  {
    name: "Grid",
    value: "grid",
  },
  {
    name: "Column",
    value: "column",
  },
] as const;

export const SettingsContext = React.createContext<{
  view: "grid" | "column";
  setView: (view: "grid" | "column") => void;
  sort: number;
  setSort: (sort: number) => void;
  referenceType: "morse" | "nato";
  setReferenceType: (referenceType: "morse" | "nato") => void;
  exportFormat: "json" | "vcf";
  setExportFormat: (exportFormat: "json" | "vcf") => void;
}>({
  view: "grid",
  setView: () => {},
  sort: 0,
  setSort: () => {},
  referenceType: "morse",
  setReferenceType: () => {},
  exportFormat: "json",
  setExportFormat: () => {},
});

export default function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [view, setView] = useLocalStorageState<"grid" | "column">("view", {
    defaultValue: "grid",
  });
  const [sort, setSort] = useLocalStorageState("sort", { defaultValue: 0 });
  const [referenceType, setReferenceType] = useLocalStorageState<
    "morse" | "nato"
  >("referenceType", { defaultValue: "morse" });
  const [exportFormat, setExportFormat] = useLocalStorageState<"vcf" | "json">(
    "exportFormat",
    {
      defaultValue: "vcf",
    }
  );

  return (
    <SettingsContext.Provider
      value={{
        view,
        setView,
        sort,
        setSort,
        referenceType,
        setReferenceType,
        exportFormat,
        setExportFormat,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

function Dropdown<T extends string>({
  label,
  options,
  selected,
  setSelected,
}: {
  label: string;
  options: readonly { readonly name: string; readonly value: T }[];
  selected: T;
  setSelected: (value: T) => void;
}) {
  return (
    <div className="flex flex-row md:flex-col justify-between items-center gap-1">
      <span>{label}</span>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value as T)}
        className="border-b-2 border-black text-xl py-1"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SettingsComponent({
  cards,
  createCard,
  expanded,
}: {
  cards: Contact[] | null;
  createCard: (c: Contact) => void;
  expanded: boolean;
}) {
  const {
    view,
    setView,
    sort,
    setSort,
    referenceType,
    setReferenceType,
    exportFormat,
    setExportFormat,
  } = useContext(SettingsContext);

  return (
    <div className={"flex-col gap-2 md:flex " + (expanded ? "flex" : "hidden")}>
      <div className="flex flex-col md:flex-row w-full justify-between gap-2">
        <Dropdown
          label="View as"
          options={VIEWS}
          selected={view}
          setSelected={setView}
        />

        <Dropdown
          label="Hint mode"
          options={[
            { name: "Morse Code", value: "morse" },
            { name: "NATO Phonetics", value: "nato" },
          ]}
          selected={referenceType}
          setSelected={setReferenceType}
        />

        <Dropdown
          label="Sort by"
          options={SORTS.map((s, i) => ({ name: s.name, value: i.toString() }))}
          selected={sort.toString()}
          setSelected={(s) => setSort(parseInt(s))}
        />

        <Dropdown
          label="Export as"
          options={[
            { name: "vCard", value: "vcf" },
            { name: "JSON", value: "json" },
          ]}
          selected={exportFormat}
          setSelected={setExportFormat}
        />

        <button
          className="bg-white dark:bg-black rounded-lg px-2 py-1 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          onClick={async () => {
            if (cards === null) {
              return;
            }

            const exporter =
              exportFormat === "vcf" ? generateVCard : generateJson;

            const zip = await generateZip(cards, exporter);
            const url = URL.createObjectURL(zip);
            const a = document.createElement("a");
            a.href = url;
            a.download = "contacts.zip";
            a.click();
          }}
        >
          Export All
        </button>

        <button
          className="bg-white dark:bg-black rounded-lg px-2 py-1 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          onClick={async () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json,.vcf,.zip";

            input.addEventListener("change", async () => {
              if (input.files === null) {
                return;
              }

              const file = input.files[0];

              if (file.name.endsWith(".vcf")) {
                const contact = await importVCard(file);
                createCard(contact);
              } else if (file.name.endsWith(".json")) {
                const contact = await importJson(file);
                createCard(contact);
              } else if (file.name.endsWith(".zip")) {
                const contacts = await importZip(file);
                contacts.forEach(createCard);
              }
            });

            input.click();
          }}
        >
          Import...
        </button>
      </div>
    </div>
  );
}
