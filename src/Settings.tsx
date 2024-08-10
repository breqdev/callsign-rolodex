import React, { useContext, useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";
import SORTS from "./sorts";
import { Contact } from "./contact";
import { generateJson, generateVCard, generateZip } from "./export";
import { importJson, importVCard, importZip } from "./import";
import THEMES from "./themes";
import { FirebaseContext } from "./FirebaseWrapper";
import { signOut } from "firebase/auth";

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
  theme: number;
  setTheme: (theme: number) => void;
}>({
  view: "grid",
  setView: () => {},
  sort: 0,
  setSort: () => {},
  referenceType: "morse",
  setReferenceType: () => {},
  exportFormat: "json",
  setExportFormat: () => {},
  theme: 0,
  setTheme: () => {},
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
  const [theme, setTheme] = useLocalStorageState<number>("theme", {
    defaultValue: 0,
  });

  useEffect(() => {
    document.body.classList.toggle("dark", THEMES[theme].dark);
  }, [theme]);

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
        theme,
        setTheme,
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
  options: readonly { readonly name: string; readonly value: T; group?: string }[];
  selected: T;
  setSelected: (value: T) => void;
}) {
  const groups = [... new Set(options.filter(a => a.group != null && a.group !== undefined).map(a => a.group))].map(a => ({
    name: a,
    options: options.filter(b => b.group == a)
  }));

  return (
    <div className="flex flex-row md:flex-col justify-between items-center gap-1">
      <span>{label}</span>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value as T)}
        className="border-b-2 border-black dark:border-white text-xl py-1 bg-transparent"
      >
        { groups.length > 0 ? (
            groups.map((group) => (
              <optgroup label={group.name}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </optgroup>
            ))
        ) : (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.name}
            </option>
          ))
        )}
        
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
    theme,
    setTheme,
  } = useContext(SettingsContext);
  const { auth } = useContext(FirebaseContext);

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
            { name: "Morse", value: "morse" },
            { name: "NATO", value: "nato" },
          ]}
          selected={referenceType}
          setSelected={setReferenceType}
        />

        <Dropdown
          label="Sort by"
          options={Object.entries(SORTS).map((s, i) => ({ 
              name: s[0], 
              value: i.toString(),
              group: s[1].group
          }))}
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

        <Dropdown
          label="Theme"
          options={THEMES.map((t, i) => ({
            name: t.label,
            value: i.toString(),
          }))}
          selected={theme.toString()}
          setSelected={(s) => setTheme(parseInt(s))}
        />

        <div className="flex flex-row gap-2 mt-1">
          <button
            className="w-full bg-white dark:bg-black rounded-lg px-2 py-1 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
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
            className="w-full bg-white dark:bg-black rounded-lg px-2 py-1 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
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

          <button
            className="block md:hidden w-full bg-white dark:bg-black rounded-lg px-2 py-1 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            onClick={() => signOut(auth)}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
