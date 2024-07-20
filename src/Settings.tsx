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

export function SettingsComponent({
  cards,
  createCard,
}: {
  cards: Contact[] | null;
  createCard: (c: Contact) => void;
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
    <div className="flex flex-col gap-2">
      <div className="flex flex-col md:flex-row w-full justify-between gap-2">
        <div className="flex flex-row rounded-xl bg-white dark:bg-black p-1">
          <span className="px-2 py-1">View as</span>
          {VIEWS.map((s) => (
            <button
              key={s.name}
              onClick={() => setView(s.value)}
              className={
                view === s.value
                  ? "px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded-lg"
                  : "px-2 py-1 bg-white dark:bg-black rounded-lg"
              }
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="flex flex-row rounded-xl bg-white dark:bg-black p-1">
          <span className="px-2 py-1">Hint mode</span>
          <button
            onClick={() => setReferenceType("morse")}
            className={
              referenceType === "morse"
                ? "px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded-lg"
                : "px-2 py-1 bg-white dark:bg-black rounded-lg"
            }
          >
            Morse Code
          </button>
          <button
            onClick={() => setReferenceType("nato")}
            className={
              referenceType === "nato"
                ? "px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded-lg"
                : "px-2 py-1 bg-white dark:bg-black rounded-lg"
            }
          >
            NATO Phonetics
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-full justify-between gap-2">
        <div className="flex flex-row rounded-xl bg-white dark:bg-black p-1 md:self-start">
          <span className="px-2 py-1">Sort by</span>
          {SORTS.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setSort(i)}
              className={
                sort === i
                  ? "px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded-lg"
                  : "px-2 py-1 bg-white dark:bg-black rounded-lg"
              }
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="flex flex-row gap-2">
          <div className="flex flex-row rounded-xl bg-white dark:bg-black p-1 md:self-start">
            <span className="px-2 py-1">Export as</span>
            <button
              onClick={() => setExportFormat("vcf")}
              className={
                exportFormat === "vcf"
                  ? "px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded-lg"
                  : "px-2 py-1 bg-white dark:bg-black rounded-lg"
              }
            >
              vCard
            </button>
            <button
              onClick={() => setExportFormat("json")}
              className={
                exportFormat === "json"
                  ? "px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded-lg"
                  : "px-2 py-1 bg-white dark:bg-black rounded-lg"
              }
            >
              JSON
            </button>
          </div>

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
    </div>
  );
}
