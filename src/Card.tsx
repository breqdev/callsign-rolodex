import { faStar } from "@fortawesome/free-solid-svg-icons";
import { Contact } from "./contact";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useSWR from "swr";

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

export default function Card({ contact }: { contact: Contact }) {
  const { data: dmr } = useSWR(
    `https://radioid.net/api/dmr/user/?callsign=${contact.callsign}`,
    fetcher
  );

  // const color = [
  //   "bg-red-400",
  //   "bg-orange-400",
  //   "bg-yellow-400",
  //   "bg-green-400",
  //   "bg-blue-400",
  //   "bg-indigo-400",
  //   "bg-purple-400",
  //   "bg-pink-400",
  // ][Math.floor(Math.random() * 8)];

  return (
    <div className="border-2 border-black aspect-[85.60/53.98] rounded-[calc(100%*3/85.60)/calc(100%*3/53.98)] p-3 flex flex-col justify-between relative font-display flex-shrink-0 overflow-clip">
      <div>
        <h2 className="font-mono text-7xl">{contact.callsign}</h2>
        <p className="font-morse text-lg select-none flex flex-row gap-2 -my-1 ml-0.5">
          {[...contact.callsign].map((c) => (
            <span>{c}</span>
          ))}
        </p>
        <p className="text-3xl">{contact.name}</p>
      </div>
      <div className="-mb-1 grid grid-cols-[2.1rem,1fr]">
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
      )}
      {/* <div
        className={"absolute bottom-0 right-0 w-14 h-14 " + color}
        style={{ clipPath: "polygon(0% 100%, 100% 0%, 100% 100%)" }}
      ></div> */}
    </div>
  );
}
