import {
  faCheck,
  faDownload,
  faPencilAlt,
  faPlus,
  faStar as faStarSolid,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons";
import { Contact } from "./contact";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useSWR from "swr";
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { generateJson, generateVCard } from "./export";
import { SettingsContext } from "./Settings";
import THEMES from "./themes";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { theme } = useContext(SettingsContext);

  return (
    <>
      <span className="font-mono" style={{ color: THEMES[theme].secondary }}>
        {label}
      </span>
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

const Input = forwardRef<
  HTMLInputElement,
  {
    value: string;
    className: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder: string;
    disabled: boolean;
  }
>(
  (
    { value, className, onChange, onKeyDown, placeholder, disabled },
    outerRef
  ) => {
    const { theme } = useContext(SettingsContext);

    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(outerRef, () => innerRef.current!, []);

    const [hover, setHover] = useState(false);
    const [focus, setFocus] = useState(false);

    useEffect(() => {
      const handleFocus = () => setFocus(true);
      const handleBlur = () => setFocus(false);
      const handleMouseEnter = () => setHover(true);
      const handleMouseLeave = () => setHover(false);

      const inner = innerRef.current;

      inner?.addEventListener("focus", handleFocus);
      inner?.addEventListener("blur", handleBlur);
      inner?.addEventListener("mouseenter", handleMouseEnter);
      inner?.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        inner?.removeEventListener("focus", handleFocus);
        inner?.removeEventListener("blur", handleBlur);
        inner?.removeEventListener("mouseenter", handleMouseEnter);
        inner?.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, []);

    return (
      <div className="relative">
        <input
          className={className + " bg-transparent outline-none peer w-full"}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          ref={innerRef}
        />
        <div
          style={{
            borderColor: disabled
              ? "transparent"
              : focus
              ? THEMES[theme].color
              : hover
              ? THEMES[theme].secondary
              : "transparent",
          }}
          className="absolute bottom-0 left-0 right-0 border-b-2 transition-colors z-20"
        />
      </div>
    );
  }
);

export default function Card({
  contact,
  onEdit,
  onDelete,
  createMode = false,
  referenceType,
  tab,
  exportFormat,
}: {
  contact: Contact;
  onEdit: (c: Contact) => void;
  onDelete: () => void;
  createMode?: boolean;
  referenceType: "morse" | "nato";
  tab?: React.ReactNode;
  exportFormat: "vcf" | "json";
}) {
  const { theme } = useContext(SettingsContext);

  const { data: dmr } = useSWR(
    contact
      ? `https://radioid.net/api/dmr/user/?callsign=${contact.callsign}`
      : null,
    fetcher
  );

  const [editMode, setEditMode] = useState(createMode);
  const [draftCallsign, setDraftCallsign] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftTags, setDraftTags] = useState([""]);
  const [draftWebsite, setDraftWebsite] = useState("");
  const [draftStar, setDraftStar] = useState(false);

  const enterEditMode = useCallback(() => {
    setEditMode(true);
    setDraftCallsign(contact?.callsign || "");
    setDraftName(contact?.name || "");
    setDraftTags(contact?.tags || []);
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
      tags: draftTags,
      website,
      star: draftStar,
    });
  }, [draftCallsign, draftName, draftTags, draftWebsite, draftStar, onEdit]);

  const handleCreate = useCallback(() => {
    onEdit({
      callsign: draftCallsign,
      name: draftName,
      tags: draftTags,
      website: draftWebsite || undefined,
      star: draftStar,
    });
    setDraftCallsign("");
    setDraftName("");
    setDraftTags([]);
    setDraftWebsite("");
  }, [draftCallsign, draftName, draftWebsite, draftTags, draftStar, onEdit]);

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


  // useEffect(() => {
  //   if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  //     setDark(true);
  //   }

  //   const listener = (e: MediaQueryListEvent) => {
  //     if (e.matches) {
  //       setDark(true);
  //     } else {
  //       setDark(false);
  //     }
  //   };

  //   window
  //     .matchMedia("(prefers-color-scheme: dark)")
  //     .addEventListener("change", listener);

  //   return () =>
  //     window
  //       .matchMedia("(prefers-color-scheme: dark)")
  //       .removeEventListener("change", listener);
  // }, []);

  // [TODO] The `aspect-[85.60/53.98]` can cause issues if there are too many tags for a single row... maybe s
  return (
    <div
      className="aspect-[85.60/53.98] relative flex-shrink-0 border-2 rounded-[calc(100%*3/85.60)/calc(100%*3/53.98)] transition-colors duration-300"
      style={{
        background: THEMES[theme].gradient ?? THEMES[theme].background,
        borderColor: THEMES[theme].color,
        color: THEMES[theme].color,
      }}
    >
      <div
        className="overflow-clip relative rounded-[calc(100%*3/85.60)/calc(100%*3/53.98)] w-full h-full p-3 flex flex-col justify-between font-display z-10"
        style={{
          background: `${THEMES[theme].color} repeating-linear-gradient(-45deg, transparent, transparent 2px, ${THEMES[theme].background} 2px, ${THEMES[theme].background} 6px)`,
        }}
      >
        <div className="z-10">
          <Input
            className="font-mono text-7xl w-full -my-3"
            value={displayCallsign}
            onChange={(e) =>
              setDraftCallsign(e.target.value.toLocaleUpperCase())
            }
            onKeyDown={handleInputKeyDown}
            placeholder="call"
            disabled={!editMode}
            ref={firstInput}
          />

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
          <Input
            className="text-3xl -my-1"
            value={displayName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="name"
            disabled={!editMode}
          />
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
                <div className="w-36">
                  <Input
                    className="text-lg"
                    value={draftWebsite}
                    onChange={(e) => setDraftWebsite(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder=""
                    disabled={!editMode}
                  />
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
          {contact.tags?.length > 0 || editMode ? (
            <Field label="TAGS">
              {(contact.tags || editMode) && (
                <Tags createMode={createMode} editMode={editMode} draftTags={draftTags} setDraftTags={setDraftTags}/>
              )}
            </Field>
          ) : null}
        </div>


        {(contact.star || editMode) && (
          <button
            className="absolute top-4 right-4 text-3xl z-10"
            style={{ color: THEMES[theme].star }}
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
          <div className="absolute bottom-3 right-3 flex flex-row gap-2 z-10">
            <button
              className="rounded border w-12 h-12 grid place-items-center"
              style={{ borderColor: THEMES[theme].color }}
              onClick={handleCreate}
            >
              <FontAwesomeIcon icon={faPlus} className="text-3xl" />
            </button>
          </div>
        ) : editMode ? (
          <div className="absolute bottom-3 right-3 flex flex-row gap-2 z-10">
            <button
              className="rounded border w-12 h-12 grid place-items-center"
              style={{ borderColor: THEMES[theme].color }}
              onClick={exitEditMode}
            >
              <FontAwesomeIcon icon={faCheck} className="text-3xl" />
            </button>
            <button
              className="rounded border w-12 h-12 grid place-items-center"
              style={{ borderColor: THEMES[theme].color }}
              onClick={onDelete}
            >
              <FontAwesomeIcon icon={faTrashAlt} className="text-3xl" />
            </button>
          </div>
        ) : (
          <div className="absolute bottom-3 right-3 flex flex-row gap-2 z-10">
            <button
              className="rounded border w-12 h-12 grid place-items-center"
              style={{ borderColor: THEMES[theme].color }}
              onClick={enterEditMode}
            >
              <FontAwesomeIcon icon={faPencilAlt} className="text-3xl" />
            </button>
            <button
              className="rounded border w-12 h-12 grid place-items-center"
              style={{ borderColor: THEMES[theme].color }}
              onClick={async () => {
                const exporter =
                  exportFormat === "vcf" ? generateVCard : generateJson;
                const blob = await exporter(contact);
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${contact.callsign}.${exportFormat}`;
                a.click();
              }}
            >
              <FontAwesomeIcon icon={faDownload} className="text-3xl" />
            </button>
          </div>
        )}
        <div
          className={
            "absolute transition-all " +
            (editMode || createMode
              ? "inset-2 rounded-[calc(100%*3/85.60)/calc(100%*3/53.98)]"
              : "inset-0 rounded-none")
          }
          style={{
            background: THEMES[theme].gradient ?? THEMES[theme].background,
          }}
        />
      </div>
      {tab && (
        <div
          className="absolute top-0 left-0 -mt-8 h-16 w-24  -z-10 rounded-t-2xl flex justify-center items-start"
          style={{
            backgroundColor: THEMES[theme].tab,
            color: THEMES[theme].tabLabel,
          }}
        >
          <span className="text-xl mt-px">{tab}</span>
        </div>
      )}
    </div>
  );
}

function Tags({createMode, editMode, draftTags, setDraftTags}: {
  createMode: boolean,
  editMode: boolean,
  draftTags: string[],
  setDraftTags: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const [draftTag, setDraftTag] = useState("");

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        setDraftTags([...draftTags, draftTag]);
        setDraftTag("");
      }
    },
    [draftTags, draftTag, setDraftTags]
  );

  return <>
  <div className="flex w-50 flex-nowrap overflow-x-auto">
    {createMode || editMode ? (
        <>
            <Input
              className="text-lg font-mono"
              value={draftTag}
              onChange={(e) => setDraftTag(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder=""
              disabled={!editMode}       
            />
            {draftTags.map((x, index) => {
              return <Tag draftTags={draftTags} setDraftTags={setDraftTags} index={index}/>
            })}  


        </>
      ) : (
        draftTags.map((_, index) => {
          return <Tag draftTags={draftTags} setDraftTags={setDraftTags} index={index}/>
        })
      )
    }
    </div>
  </>
}

function Tag({draftTags, setDraftTags, index}: {
  draftTags: string[],
  setDraftTags: React.Dispatch<React.SetStateAction<string[]>>,
  index: number
}) {
  return <>
    <div className="mx-1">
      {draftTags[index]}
    </div>
  </>
}