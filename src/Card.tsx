import {
  faCheck,
  faDownload,
  faPencilAlt,
  faPlus,
  faStar as faStarSolid,
  faTrashAlt,
  faTowerBroadcast,
  faPerson,
  faArrowUp,
  faArrowDown
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
  const [draftCardType, setDraftCardType] = useState("person");
  const [draftCallsign, setDraftCallsign] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftWebsite, setDraftWebsite] = useState("");
  const [draftStar, setDraftStar] = useState(false);

  const [draftLocation, setDraftLocation] = useState("");
  const [draftFrequency, setDraftFrequency] = useState("");
  const [draftOffset, setDraftOffset] = useState("");
  const [draftToneUp, setDraftToneUp] = useState("");
  const [draftToneDown, setDraftToneDown] = useState("");

  const enterEditMode = useCallback(() => {
    setEditMode(true);
    setDraftCardType(contact?.cardType || "person");
    setDraftCallsign(contact?.callsign || "");
    setDraftName(contact?.name || "");
    setDraftWebsite(contact?.website || "");
    setDraftLocation(contact?.location || "");
    setDraftFrequency(contact?.frequency?.toString() || "");
    setDraftOffset(contact?.offset?.toString() || "");
    setDraftToneUp(contact.toneUp?.toString() || "");
    setDraftToneDown(contact.toneDown?.toString() || "");
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

    if (draftCardType == "person") {
      onEdit({
        cardType: "person",
        callsign: draftCallsign,
        name: draftName,
        website,
        star: draftStar,
        location: draftLocation,
      });
    }
    else {
      onEdit({
        cardType: "repeater",
        callsign: draftCallsign,
        name: draftName,
        website,
        star: draftStar,
        location: draftLocation,
        frequency: draftFrequency != "" ? parseFloat(draftFrequency) : undefined,
        offset: draftOffset != "" ? parseFloat(draftOffset) : undefined,
        toneUp: draftToneUp != "" ? parseFloat(draftToneUp) : undefined,
        toneDown: draftToneDown != "" ? parseFloat(draftToneDown) : undefined,
      });
    }

  }, [draftCardType, draftCallsign, draftName, draftWebsite, draftStar, draftLocation, draftFrequency, draftOffset, draftToneUp, draftToneDown, onEdit]);

  const handleCreate = useCallback(() => {

    if (draftCardType == "person") {
      onEdit({
        cardType: "person",
        callsign: draftCallsign,
        name: draftName,
        website: draftWebsite || undefined,
        star: draftStar,
        location: draftLocation,
      });
    }
    else {
      onEdit({
        cardType: "repeater",
        callsign: draftCallsign,
        name: draftName,
        website: draftWebsite || undefined,
        star: draftStar,
        location: draftLocation,
        frequency: draftFrequency != "" ? parseFloat(draftFrequency) : undefined,
        offset: draftOffset != "" ? parseFloat(draftOffset) : undefined,
        toneUp: draftToneUp != "" ? parseFloat(draftToneUp) : undefined,
        toneDown: draftToneDown != "" ? parseFloat(draftToneDown) : undefined,
      });
    }

    setDraftCallsign("");
    setDraftName("");
    setDraftWebsite("");
    setDraftLocation("");
    setDraftFrequency("");
    setDraftOffset("");
    setDraftToneUp("");
    setDraftToneDown("");

  }, [draftCardType, draftCallsign, draftName, draftWebsite, draftStar, draftLocation, draftFrequency, draftOffset, draftToneUp, draftToneDown, onEdit]);

  const displayCallsign = editMode ? draftCallsign : contact.callsign;
  const displayName = editMode ? draftName : contact.name;
  const displayLocation = editMode ? draftLocation : contact.location;

  const firstInput = useRef<HTMLInputElement>(null);

  const displayFreq = editMode ? draftFrequency : !Number.isNaN(contact.frequency) && contact.frequency !== undefined ? contact.frequency.toFixed(4).toString() + " MHz" : "";
  const displayOffset = editMode ? draftOffset : !Number.isNaN(contact.offset) && contact.offset !== undefined ? Math.sign(contact.offset) == -1 ? "-" : "+" + contact.offset.toFixed(2).toString() + " MHz" : "";
  const displayToneUp = editMode ? draftToneUp : !Number.isNaN(contact.toneUp) && contact.toneUp !== undefined ? contact.toneUp.toFixed(2).toString() + " Hz" : "";
  const displayToneDown = editMode ? draftToneDown : !Number.isNaN(contact.toneDown) && contact.toneDown !== undefined ? contact.toneDown.toFixed(2).toString() + " Hz": ""

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

  // TODO: fix aspect ratio
  // TODO: add animation to person/repeater slider
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
          <div className="flex">
            <div>
              <Input
                className="font-mono text-7xl"
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
            </div>
            <div className="flex flex-col items-center">
              <div>
                {(contact.star || editMode) && (
                  <button
                    className="text-3xl"
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

              </div>
              {editMode ? (
                <div 
                  className="rounded-full border-2 grid grid-rows-2 transition float-right"
                  style={{
                    background: THEMES[theme].color,
                    borderColor: THEMES[theme].color,
                  }}
                >
                  <button 
                    className="p-1 px-2 rounded-full"
                    style={draftCardType == "person" ? {
                      background: THEMES[theme].background,
                      color: THEMES[theme].color
                    } : {
                      background: "none",
                      color: THEMES[theme].background
                    }}
                    onClick={() => setDraftCardType("person")}
                  >
                    <FontAwesomeIcon icon={faPerson}/>
                  </button>
                  <button 
                    className="p-1 px-2 rounded-full"
                    style={draftCardType == "repeater" ? {
                      background: THEMES[theme].background,
                      color: THEMES[theme].color
                    } : {
                      background: "none",
                      color: THEMES[theme].background
                    }}
                    onClick={() => setDraftCardType("repeater")}
                  >
                    <FontAwesomeIcon icon={faTowerBroadcast}/>
                  </button>
                </div>
              ) : (
                contact.cardType == "person" ? (
                  <FontAwesomeIcon icon={faPerson} className="text-3xl"/>
                ) : (
                  <FontAwesomeIcon icon={faTowerBroadcast} className="text-3xl"/>
                )
              )}
            
            </div>
          </div>
          {draftCardType == "person" ? (
            <Input
              className="text-3xl -my-1"
              value={displayName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="name"
              disabled={!editMode}
            />
          ) : (
            <Input
              className="text-3xl -my1"
              value={displayLocation}
              onChange={(e) => setDraftLocation(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="location"
              disabled={!editMode}
            />     
          )}

        </div>
        {draftCardType == "repeater" ? (
          <div className="z-10 text-sm w-52">
            <div className="grid grid-cols-2 gap-0">
              <Input
                className=""
                value={displayFreq}
                onChange={(e) => {setDraftFrequency(e.target.value)}}
                onKeyDown={handleInputKeyDown}
                placeholder="frequency"
                disabled={!editMode}
              />
      
              <Input
                className=""
                value={displayOffset}
                onChange={(e) => {setDraftOffset(e.target.value)}}
                onKeyDown={handleInputKeyDown}
                placeholder="offset"
                disabled={!editMode}
              />
              {editMode || contact.toneUp ? (
                <div className="flex items-center">
                  { contact.toneDown || editMode ? (
                    <FontAwesomeIcon icon={faArrowUp} className="text-sm px-1" /> 
                  ) : null}
                  <Input
                    className=""
                    value={displayToneUp}
                    onChange={(e) => {setDraftToneUp(e.target.value)}}
                    onKeyDown={handleInputKeyDown}
                    placeholder="tone up"
                    disabled={!editMode}
                  />
                </div>
              ) : null}
              {editMode || contact.toneDown ? (
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faArrowDown} className="text-sm px-1" />
                  <Input
                    className=""
                    value={displayToneDown}
                    onChange={(e) => {setDraftToneDown(e.target.value)}}
                    onKeyDown={handleInputKeyDown}
                    placeholder="tone down"
                    disabled={!editMode}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : (
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
          </div>
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
