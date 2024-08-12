import {
  faCode,
  faHeart,
  faWalkieTalkie,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ATTRIBUTION = [
  { name: "K9BRQ", url: "https://breq.dev/" },
  { name: "KK7TTO", url: "https://juliaviolet.dev/" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-gray-200 text-black dark:bg-gray-800 dark:text-white mt-8">
      <div className="max-w-3xl w-full mx-auto px-4 py-16 flex flex-col gap-2 ">
        <h2 className="text-2xl font-mono">
          <span className="font-bold">rolodex.</span> made with{" "}
          <FontAwesomeIcon icon={faHeart} /> and{" "}
          <FontAwesomeIcon icon={faCode} /> for{" "}
          <FontAwesomeIcon icon={faWalkieTalkie} />.
        </h2>
        <p className="font-display">
          <span className="font-mono">rolodex</span> is written by{" "}
          {ATTRIBUTION.map((a) => (
            <>
              <a
                href={a.url}
                key={a.name}
                className="font-bold hover:underline font-mono"
              >
                {a.name}
              </a>
              {", "}
            </>
          ))}
          and their friends. its software is licensed under the{" "}
          <a
            href="https://github.com/outofambit/friends-and-lovers-license"
            className="hover:underline font-bold"
          >
            friends and lovers license
          </a>
          . for any questions, contact us on{" "}
          <a
            href="https://github.com/breqdev/callsign-rolodex/issues"
            className="hover:underline font-bold"
          >
            github
          </a>{" "}
          or at{" "}
          <a
            href="mailto:rolodex@breq.dev"
            className="hover:underline font-bold"
          >
            rolodex@breq.dev
          </a>
          . we hope you enjoy.
        </p>
      </div>
    </footer>
  );
}
