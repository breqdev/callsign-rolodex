import {
  faCheck,
  faPencilAlt,
  faPlus,
  faStar as faStarSolid,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons";
import { Contact } from "./contact";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useSWR from "swr";
import { useCallback, useEffect, useRef, useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <span className="font-mono text-gray-400">{label}</span>
      <span className="font-mono">{children}</span>
    </>
  );
}

const NATO_ALPHABET: Record<string, string> = {
  "0": "Zero",
  "1": "One",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Niner",
  A: "Alfa",
  B: "Bravo",
  C: "Charlie",
  D: "Delta",
  E: "Echo",
  F: "Foxtrot",
  G: "Golf",
  H: "Hotel",
  I: "India",
  J: "Juliett",
  K: "Kilo",
  L: "Lima",
  M: "Mike",
  N: "November",
  O: "Oscar",
  P: "Papa",
  Q: "Quebec",
  R: "Romeo",
  S: "Sierra",
  T: "Tango",
  U: "Uniform",
  V: "Victor",
  W: "Whiskey",
  X: "Xray",
  Y: "Yankee",
  Z: "Zulu",
};

export default function Card({
  contact,
  onEdit,
  onDelete,
  createMode = false,
  referenceType,
  tab,
}: {
  contact: Contact;
  onEdit: (c: Contact) => void;
  onDelete: () => void;
  createMode?: boolean;
  referenceType: "morse" | "nato";
  tab?: React.ReactNode;
}) {
  const { data: dmr } = useSWR(
    contact
      ? `https://radioid.net/api/dmr/user/?callsign=${contact.callsign}`
      : null,
    fetcher
  );

  const [editMode, setEditMode] = useState(createMode);
  const [draftCallsign, setDraftCallsign] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftWebsite, setDraftWebsite] = useState("");
  const [draftStar, setDraftStar] = useState(false);

  const enterEditMode = useCallback(() => {
    setEditMode(true);
    setDraftCallsign(contact?.callsign || "");
    setDraftName(contact?.name || "");
    setDraftWebsite(contact?.website || "");
    setDraftStar(contact?.star || false);
  }, [contact]);

  const exitEditMode = useCallback(() => {
    setEditMode(false);

    let website: string | undefined = draftWebsite;
    if (website.length === 0) {
      website = undefined;
    }
    if (website && !website.match(/^https?:\/\//)) {
      website = "https://" + website;
    }

    onEdit({
      callsign: draftCallsign,
      name: draftName,
      website,
      star: draftStar,
    });
  }, [draftCallsign, draftName, draftWebsite, draftStar, onEdit]);

  const handleCreate = useCallback(() => {
    onEdit({
      callsign: draftCallsign,
      name: draftName,
      website: draftWebsite || undefined,
      star: draftStar,
    });
    setDraftCallsign("");
    setDraftName("");
    setDraftWebsite("");
  }, [draftCallsign, draftName, draftWebsite, draftStar, onEdit]);

  const displayCallsign = editMode ? draftCallsign : contact.callsign;
  const displayName = editMode ? draftName : contact.name;

  const firstInput = useRef<HTMLInputElement>(null);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (createMode) {
          handleCreate();
          firstInput.current?.focus();
        } else {
          exitEditMode();
        }
      }
    },
    [createMode, handleCreate, exitEditMode]
  );

  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDark(true);
    }

    const listener = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setDark(true);
      } else {
        setDark(false);
      }
    };

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", listener);

    return () =>
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", listener);
  }, []);

  return (
    <div className="aspect-[85.60/53.98] relative flex-shrink-0 border-2 border-black dark:border-white rounded-[calc(100%*3/85.60)/calc(100%*3/53.98)]">
      <div
        className="overflow-clip relative rounded-[calc(100%*3/85.60)/calc(100%*3/53.98)] w-full h-full p-3 flex flex-col justify-between font-display z-10"
        style={{
          background: dark
            ? "gray repeating-linear-gradient(-45deg, transparent, transparent 2px, #000 2px, #000 6px)"
            : "gray repeating-linear-gradient(-45deg, transparent, transparent 2px, #fff 2px, #fff 6px)",
        }}
      >
        <div className="z-10">
          <div className="relative">
            <input
              className="font-mono text-7xl w-full -my-3 bg-transparent outline-none peer"
              value={displayCallsign}
              onChange={(e) =>
                setDraftCallsign(e.target.value.toLocaleUpperCase())
              }
              onKeyDown={handleInputKeyDown}
              placeholder="call"
              disabled={!editMode}
              ref={firstInput}
            />
            <div className="absolute bottom-0 left-0 right-0 border-b-2 transition-colors border-transparent peer-enabled:peer-hover:border-gray-400 peer-enabled:peer-focus-visible:border-black dark:peer-enabled:peer-focus-visible:border-white z-20" />
          </div>
          {referenceType == "morse" && (
            <p className="font-morse text-lg select-none flex flex-row gap-2 -my-1 ml-0.5 z-10 h-7">
              {[...displayCallsign].map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </p>
          )}
          {referenceType == "nato" && (
            <p className="italic lowercase text-sm select-none flex flex-row gap-2 -my-1 ml-0.5 z-10 h-7">
              {[...displayCallsign].map((c, i) => (
                <span key={i}>{NATO_ALPHABET[c.toLocaleUpperCase()]}</span>
              ))}
            </p>
          )}
          <div className="relative">
            <input
              className="text-3xl -my-1 bg-transparent peer outline-none ml-0.5"
              value={displayName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="name"
              disabled={!editMode}
            />
            <div className="absolute bottom-0 left-0 right-0 border-b-2 transition-colors border-transparent peer-enabled:peer-hover:border-gray-400 peer-enabled:peer-focus-visible:border-black dark:peer-enabled:peer-focus-visible:border-white z-20" />
          </div>
        </div>
        <div className="-mb-1 grid grid-cols-[2.1rem,1fr] z-10">
          {dmr?.count ? (
            <Field label="DMR">
              <a
                href={`https://radioid.net/database/view?id=${dmr.results[0].id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {dmr.results[0].id}
              </a>
            </Field>
          ) : null}
          {(contact.website || editMode) && (
            <Field label="WEB">
              {createMode || editMode ? (
                <div className="relative w-36">
                  <input
                    className="peer bg-transparent outline-none w-full"
                    value={draftWebsite}
                    onChange={(e) => setDraftWebsite(e.target.value)}
                  />
                  <div className="absolute bottom-1 left-0 right-0 border-b transition-colors border-transparent peer-enabled:peer-hover:border-gray-400 peer-enabled:peer-focus-visible:border-black dark:peer-enabled:peer-focus-visible:border-white z-20" />
                </div>
              ) : (
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contact.website
                    ?.replace(/https?:\/\//, "")
                    .replace(/\/$/, "")}
                </a>
              )}
            </Field>
          )}
        </div>
        {(contact.star || editMode) && (
          <button
            className="absolute top-4 right-4 text-yellow-500 dark:text-yellow-300 text-3xl z-10"
            onClick={() => setDraftStar(!draftStar)}
            disabled={!editMode}
          >
            <FontAwesomeIcon
              icon={
                (!editMode && contact.star) || (editMode && draftStar)
                  ? faStarSolid
                  : faStarOutline
              }
            />
          </button>
        )}
        {createMode ? (
          <button
            className="absolute bottom-3 right-3 border-black dark:border-white rounded border w-12 h-12 grid place-items-center z-10"
            onClick={handleCreate}
          >
            <FontAwesomeIcon icon={faPlus} className="text-3xl" />
          </button>
        ) : editMode ? (
          <div className="absolute bottom-3 right-3 flex flex-row gap-2 z-10">
            <button
              className="border-black dark:border-white rounded border w-12 h-12 grid place-items-center"
              onClick={onDelete}
            >
              <FontAwesomeIcon icon={faTrashAlt} className="text-3xl" />
            </button>
            <button
              className="border-black dark:border-white rounded border w-12 h-12 grid place-items-center"
              onClick={exitEditMode}
            >
              <FontAwesomeIcon icon={faCheck} className="text-3xl" />
            </button>
          </div>
        ) : (
          <button
            className="absolute bottom-3 right-3 border-black dark:border-white rounded border w-12 h-12 grid place-items-center z-10"
            onClick={enterEditMode}
          >
            <FontAwesomeIcon icon={faPencilAlt} className="text-3xl" />
          </button>
        )}
        <div
          className={
            "absolute bg-white dark:bg-black transition-all " +
            (editMode || createMode
              ? "inset-2 rounded-[calc(100%*3/85.60)/calc(100%*3/53.98)]"
              : "inset-0 rounded-none")
          }
        />
      </div>
      {tab && (
        <div className="absolute top-0 left-0 -mt-8 h-16 w-24 bg-blue-200 dark:bg-blue-800 -z-10 rounded-t-2xl flex justify-center items-start">
          <span className="text-xl mt-px">{tab}</span>
        </div>
      )}
    </div>
  );
}
