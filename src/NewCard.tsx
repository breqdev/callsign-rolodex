import { useState } from "react";
import { Contact } from "./contact";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function NewCard({
  onCreate,
}: {
  onCreate: (c: Contact) => void;
}) {
  const [callsign, setCallsign] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="border-2 border-black aspect-[85.60/53.98] rounded-[calc(100%*3/85.60)/calc(100%*3/53.98)] p-3 flex flex-col justify-between relative font-display flex-shrink-0 overflow-clip">
      <div>
        <input
          className="font-mono text-7xl w-full -my-3"
          value={callsign}
          onChange={(e) => setCallsign(e.target.value.toLocaleUpperCase())}
          placeholder="call"
        />
        <p className="font-morse text-lg select-none flex flex-row gap-2 -my-1 ml-0.5 z-10 h-7">
          {[...callsign].map((c) => (
            <span>{c}</span>
          ))}
        </p>
        <input
          className="text-3xl -my-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="name"
        />
      </div>
      {/* <div className="-mb-1 grid grid-cols-[2.1rem,1fr]">
        {dmr?.count ? <Field label="DMR">{dmr.results[0].id}</Field> : null}
        {contact.website && (
          <Field label="WEB">
            <a href={contact.website} target="_blank" rel="noopener noreferrer">
              {contact.website.replace(/https?:\/\//, "").replace(/\/$/, "")}
            </a>
          </Field>
        )}
      </div>
      {contact.star && (
        <FontAwesomeIcon
          icon={faStar}
          className="absolute top-3 right-3 text-yellow-500 text-3xl"
        />
      )} */}
      <button className="absolute bottom-3 right-3 border-black rounded border w-12 h-12 grid place-items-center">
        <FontAwesomeIcon
          icon={faPlus}
          className="text-3xl"
          onClick={() => {
            onCreate({ callsign, name });
            setCallsign("");
            setName("");
          }}
        />
      </button>
    </div>
  );
}
