import React, { useContext, useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";
import SORTS from "./sorts";
import { Contact } from "./contact";
import {
  generateCsvChirp,
  generateCsvGD77Channels,
  generateCsvGD77Contacts,
  generateCsvGD77Zip,
  generateJson,
  generateVCard,
  generateZip,
} from "./export";
import { importJson, importVCard, importZip } from "./import";
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
  filter: "person" | "repeater" | "starred" | "all";
  setFilter: (filter: "person" | "repeater" | "starred" | "all") => void;
  sort: number | null;
  setSort: (sort: number) => void;
  referenceType: "morse" | "nato";
  setReferenceType: (referenceType: "morse" | "nato") => void;
  exportFormat: "json" | "vcf" | "chirp" | "gd77";
  setExportFormat: (exportFormat: "json" | "vcf" | "chirp" | "gd77") => void;
  variant: "light" | "dark";
  setVariant: (variant: "light" | "dark") => void;
}>({
  view: "grid",
  setView: () => {},
  filter: "all",
  setFilter: () => {},
  sort: 0,
  setSort: () => {},
  referenceType: "morse",
  setReferenceType: () => {},
  exportFormat: "json",
  setExportFormat: () => {},
  variant: "light",
  setVariant: () => {},
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
  const [filter, setFilter] = useLocalStorageState<
    "person" | "repeater" | "starred" | "all"
  >("filter", {
    defaultValue: "all",
  });
  const [referenceType, setReferenceType] = useLocalStorageState<
    "morse" | "nato"
  >("referenceType", { defaultValue: "morse" });
  const [exportFormat, setExportFormat] = useLocalStorageState<
    "vcf" | "json" | "chirp" | "gd77"
  >("exportFormat", {
    defaultValue: "vcf",
  });
  const [variant, setVariant] = useLocalStorageState<"light" | "dark">(
    "variant",
    {
      defaultValue: "light",
    }
  );

  useEffect(() => {
    document.body.classList.toggle("dark", variant === "dark");
  }, [variant]);

  return (
    <SettingsContext.Provider
      value={{
        view,
        setView,
        filter,
        setFilter,
        sort,
        setSort,
        referenceType,
        setReferenceType,
        exportFormat,
        setExportFormat,
        variant: variant ?? "light",
        setVariant,
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
              <optgroup label={group.name} key={group.name}>
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
    filter,
    setFilter,
    sort,
    setSort,
    referenceType,
    setReferenceType,
    exportFormat,
    setExportFormat,
    variant,
    setVariant,
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
          label="Show"
          options={[
            { name: "Individuals", value: "person" },
            { name: "Repeaters", value: "repeater" },
            { name: "Starred", value: "starred" },
            { name: "All", value: "all" },
          ]}
          selected={filter}
          setSelected={setFilter}
        />

        <Dropdown
          label="Sort by"
          options={Object.entries(SORTS).map((s, i) => ({
            name: s[0],
            value: i.toString(),
            group: s[1].group,
          }))}
          selected={(sort ?? 0).toString()}
          setSelected={(s) => setSort(parseInt(s))}
        />

        <Dropdown
          label="Export as"
          options={[
            { name: "vCard", value: "vcf" },
            { name: "JSON", value: "json" },
            { name: "CHIRP", value: "chirp" },
            { name: "GD77", value: "gd77" },
          ]}
          selected={exportFormat}
          setSelected={setExportFormat}
        />

        <Dropdown
          label="Theme"
          options={[
            {
              name: "Light",
              value: "light",
            },
            {
              name: "Dark",
              value: "dark",
            },
          ]}
          selected={variant}
          setSelected={(s) => setVariant(s)}
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
                    const contact: Contact = selected.values().next().value!;

                    let exporter: (c: Contact) => Promise<Blob>;
                    if (exportFormat === "vcf") {
                      exporter = generateVCard;
                    } else if (exportFormat === "json") {
                      exporter = generateJson;
                    } else if (exportFormat === "chirp") {
                      exporter = (c) => generateCsvChirp([c]);
                    } else if (exportFormat === "gd77") {
                      if (selected[0].cardType === "person") {
                        exporter = (c) => generateCsvGD77Contacts([c]);
                      } else {
                        exporter = (c) => generateCsvGD77Channels([c]);
                      }
                    } else {
                      throw Error(`Unknown exporter ${exportFormat}`);
                    }

                    const blob = await exporter(contact);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    const extension =
                      exportFormat === "chirp" ? "csv" : exportFormat;
                    a.download = `${contact.callsign}.${extension}`;
                    a.click();
                  } else {
                    let exporter: (c: Contact[]) => Promise<Blob>;
                    let extension = "zip";

                    if (exportFormat === "vcf") {
                      exporter = (c) => generateZip([...c], generateVCard);
                    } else if (exportFormat === "json") {
                      exporter = (c) => generateZip([...c], generateJson);
                    } else if (exportFormat === "chirp") {
                      exporter = generateCsvChirp;
                      extension = "csv";
                    } else if (exportFormat === "gd77") {
                      if (
                        selected.every((card) => card.cardType === "person")
                      ) {
                        exporter = generateCsvGD77Contacts;
                        extension = "csv";
                      } else if (
                        selected.every((card) => card.cardType === "repeater")
                      ) {
                        exporter = generateCsvGD77Channels;
                        extension = "csv";
                      } else {
                        exporter = generateCsvGD77Zip;
                      }
                    } else {
                      throw Error(`Unknown exporter ${exportFormat}`);
                    }

                    const file = await exporter(selected);
                    const url = URL.createObjectURL(file);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `contacts.${extension}`;
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
                  input.accept = ".json,.vcf,.zip,.csv";

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
