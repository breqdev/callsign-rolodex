import React, { useContext, useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";
import SORTS from "./sorts";
import { Contact } from "./contact";
import { generateJson, generateVCard, generateZip } from "./export";
import { importJson, importVCard, importZip } from "./import";
import THEMES, { Theme } from "./themes";
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
  theme: Theme;
  setTheme: (theme: string) => void;
}>({
  view: "grid",
  setView: () => {},
  sort: 0,
  setSort: () => {},
  referenceType: "morse",
  setReferenceType: () => {},
  exportFormat: "json",
  setExportFormat: () => {},
  theme: THEMES["light"],
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
  const [theme, setTheme] = useLocalStorageState<string>("theme", {
    defaultValue: "light",
  });

  useEffect(() => {
    document.body.classList.toggle("dark", THEMES[theme]?.dark);
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
        theme: THEMES[theme] ?? THEMES["light"],
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
  options: readonly {
    readonly name: string;
    readonly value: T;
    group?: string;
  }[];
  selected: T;
  setSelected: (value: T) => void;
}) {
  const groups = [
    ...new Set(
      options
        .filter((a) => a.group != null && a.group !== undefined)
        .map((a) => a.group)
    ),
  ].map((a) => ({
    name: a,
    options: options.filter((b) => b.group == a),
  }));

  return (
    <div className="flex flex-row md:flex-col justify-between items-center gap-1">
      <span>{label}</span>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value as T)}
        className="border-b-2 border-black dark:border-white text-xl py-1 bg-transparent"
      >
        {groups.length > 0
          ? groups.map((group) => (
              <optgroup label={group.name}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </optgroup>
            ))
          : options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
      </select>
    </div>
  );
}

export function SettingsComponent({
  createCard,
  expanded,
  selectMode,
  setSelectMode,
  selected,
}: {
  createCard: (c: Contact) => void;
  expanded: boolean;
  selectMode: boolean;
  setSelectMode: (b: boolean) => void;
  selected: Contact[];
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

  const buttonClass =
    "w-full bg-white dark:bg-black rounded-lg px-2 py-1 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors md:w-20";

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
            group: s[1].group,
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
          options={Object.entries(THEMES).map(([slug, theme]) => ({
            name: theme.label,
            value: slug,
          }))}
          selected={theme.name}
          setSelected={(s) => setTheme(s)}
        />

        <div className="flex flex-row gap-2 mt-1">
          {selectMode ? (
            <>
              <button
                className={
                  "w-full bg-red-200 dark:bg-red-800 rounded-lg px-2 py-1 hover:bg-red-300 dark:hover:bg-red-600 transition-colors md:w-20"
                }
                onClick={() => setSelectMode(false)}
              >
                Cancel
              </button>

              <button
                className={
                  "w-full bg-green-200 disabled:bg-white dark:bg-green-800 dark:disabled:bg-black rounded-lg px-2 py-1 hover:bg-green-300 dark:hover:bg-green-600 transition-colors md:w-20"
                }
                disabled={selected.length === 0}
                onClick={async () => {
                  if (selected.length === 0) {
                    return;
                  } else if (selected.length === 1) {
                    const contact: Contact = selected.values().next().value;
                    const exporter =
                      exportFormat === "vcf" ? generateVCard : generateJson;
                    const blob = await exporter(contact);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${contact.callsign}.${exportFormat}`;
                    a.click();
                  } else {
                    const exporter =
                      exportFormat === "vcf" ? generateVCard : generateJson;

                    const zip = await generateZip([...selected], exporter);
                    const url = URL.createObjectURL(zip);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "contacts.zip";
                    a.click();
                  }

                  setSelectMode(false);
                }}
              >
                Export {selected.length} card{selected.length === 1 ? "" : "s"}
              </button>
            </>
          ) : (
            <>
              <button
                className={buttonClass}
                onClick={() => setSelectMode(true)}
              >
                Export...
              </button>

              <button
                className={buttonClass}
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
            </>
          )}

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
