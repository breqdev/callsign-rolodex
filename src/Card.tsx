import {
  faCheck,
  faPencilAlt,
  faPlus,
  faStar,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Contact } from "./contact";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useSWR from "swr";
import { useCallback, useRef, useState } from "react";

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

export default function Card({
  contact,
  onEdit,
  onDelete,
  createMode = false,
}: {
  contact: Contact;
  onEdit: (c: Contact) => void;
  onDelete: () => void;
  createMode?: boolean;
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

  const enterEditMode = useCallback(() => {
    setEditMode(true);
    setDraftCallsign(contact?.callsign || "");
    setDraftName(contact?.name || "");
    setDraftWebsite(contact?.website || "");
  }, [contact]);

  const exitEditMode = useCallback(() => {
    setEditMode(false);
    onEdit({
      callsign: draftCallsign,
      name: draftName,
      website: draftWebsite || undefined,
    });
  }, [draftCallsign, draftName, draftWebsite, onEdit]);

  const handleCreate = useCallback(() => {
    onEdit({
      callsign: draftCallsign,
      name: draftName,
      website: draftWebsite || undefined,
    });
    setDraftCallsign("");
    setDraftName("");
    setDraftWebsite("");
  }, [draftCallsign, draftName, draftWebsite, onEdit]);

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

  return (
    <div
      className="border-2 border-black aspect-[85.60/53.98] rounded-[calc(100%*3/85.60)/calc(100%*3/53.98)] p-3 flex flex-col justify-between relative font-display flex-shrink-0 overflow-clip"
      style={{
        background:
          "gray repeating-linear-gradient(-45deg, transparent, transparent 2px, #fff 2px, #fff 6px)",
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
          <div className="absolute bottom-0 left-0 right-0 border-b-2 transition-colors border-transparent peer-enabled:peer-hover:border-gray-400 peer-enabled:peer-focus-visible:border-black z-20" />
        </div>
        <p className="font-morse text-lg select-none flex flex-row gap-2 -my-1 ml-0.5 z-10 h-7">
          {[...displayCallsign].map((c) => (
            <span>{c}</span>
          ))}
        </p>
        <div className="relative">
          <input
            className="text-3xl -my-1 bg-transparent peer outline-none ml-0.5"
            value={displayName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="name"
            disabled={!editMode}
          />
          <div className="absolute bottom-0 left-0 right-0 border-b-2 transition-colors border-transparent peer-enabled:peer-hover:border-gray-400 peer-enabled:peer-focus-visible:border-black z-20" />
        </div>
      </div>
      <div className="-mb-1 grid grid-cols-[2.1rem,1fr] z-10">
        {dmr?.count ? <Field label="DMR">{dmr.results[0].id}</Field> : null}
        {(contact.website || createMode || editMode) && (
          <Field label="WEB">
            {createMode || editMode ? (
              <div className="relative w-36">
                <input
                  className="peer bg-transparent outline-none w-full"
                  value={draftWebsite}
                  onChange={(e) => setDraftWebsite(e.target.value)}
                />
                <div className="absolute bottom-1 left-0 right-0 border-b transition-colors border-transparent peer-enabled:peer-hover:border-gray-400 peer-enabled:peer-focus-visible:border-black z-20" />
              </div>
            ) : (
              <a
                href={contact.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contact.website?.replace(/https?:\/\//, "").replace(/\/$/, "")}
              </a>
            )}
          </Field>
        )}
      </div>
      {contact.star && (
        <FontAwesomeIcon
          icon={faStar}
          className="absolute top-3 right-3 text-yellow-500 text-3xl z-10"
        />
      )}
      {createMode ? (
        <button className="absolute bottom-3 right-3 border-black rounded border w-12 h-12 grid place-items-center z-10">
          <FontAwesomeIcon
            icon={faPlus}
            className="text-3xl"
            onClick={handleCreate}
          />
        </button>
      ) : editMode ? (
        <div className="absolute bottom-3 right-3 flex flex-row gap-2 z-10">
          <button
            className="border-black rounded border w-12 h-12 grid place-items-center"
            onClick={onDelete}
          >
            <FontAwesomeIcon icon={faTrashAlt} className="text-3xl" />
          </button>
          <button
            className="border-black rounded border w-12 h-12 grid place-items-center"
            onClick={exitEditMode}
          >
            <FontAwesomeIcon icon={faCheck} className="text-3xl" />
          </button>
        </div>
      ) : (
        <button
          className="absolute bottom-3 right-3 border-black rounded border w-12 h-12 grid place-items-center z-10"
          onClick={enterEditMode}
        >
          <FontAwesomeIcon icon={faPencilAlt} className="text-3xl" />
        </button>
      )}
      <div
        className={
          "absolute bg-white transition-all " +
          (editMode || createMode
            ? "inset-2 rounded-[calc(100%*3/85.60)/calc(100%*3/53.98)]"
            : "inset-0 rounded-none")
        }
      />
    </div>
  );
}
