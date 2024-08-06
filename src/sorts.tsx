import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faUser, faTowerBroadcast } from "@fortawesome/free-solid-svg-icons";
import { Contact } from "./contact";

function lastNameFirst(name: string) {
  const parts = name.split(" ");
  const last = parts.pop()!;
  return `${last}, ${parts}`;
}

type Sort = {
  impl: (a: Contact, b: Contact) => number;
  tag?: (current: Contact, last: Contact | null) => React.ReactNode | undefined;
  filter?: (a: Contact) => boolean;
  group: "Individual" | "Repeater" | "All"; 
};

const SORTS: Record<string, Sort> = {
  "Starred": {
    impl: (a, b) => {
      if (a.star == b.star) {
        return SORTS["Callsign"].impl(a, b);
      }
      return (b.star === true ? 1 : 0) - (a.star === true ? 1 : 0)
    },
    tag: (current, last) => {
      if (!last) {
        return <FontAwesomeIcon icon={faStar} />;
      }
      if (!current.star) {
        const a = SORTS["Callsign"];
        if (a.tag !== undefined) {
          return a.tag(current, last.star ? null : last);
        }
        return undefined;
      }
    },
    group: "All"
  },
  "Last Name": {
    impl: (a, b) => lastNameFirst(a.name).localeCompare(lastNameFirst(b.name)),
    tag: (current, last) => (!last || lastNameFirst(current.name)[0] != lastNameFirst(last.name)[0]) ? lastNameFirst(current.name)[0] : undefined,
    filter: (c) => c.cardType == "person",
    group: "Individual"
  },
  "First Name": {
    impl: (a, b) => a.name.localeCompare(b.name),
    tag: (current, last) => (!last || current.name[0] != last.name[0]) ? current.name[0] : undefined,
    filter: (c) => c.cardType == "person",
    group: "Individual"
  },
  "Location": {
    impl: (a, b) => a.location.localeCompare(b.location),
    tag: (current, last) => (!last || current.location[0] != last.location[0]) ? current.location[0] : undefined,
    filter: (c) => c.cardType == "repeater",
    group: "Repeater"
  },
  "Callsign": {
    impl: (a, b) => a.callsign.localeCompare(b.callsign), 
    tag: (current, last) => (!last || current.callsign[0] != last.callsign[0]) ? current.callsign[0] : undefined,
    group: "All"
  },
  "Type": {
    impl: (a, b) => (a.cardType == b.cardType) ? SORTS["Callsign"].impl(a, b) : a.cardType.localeCompare(b.cardType), 
    tag: (current, last) => {
      const getIcon = (card: Contact) => {
        return card.cardType == "person" 
          ? <FontAwesomeIcon icon={faUser}/> 
          : <FontAwesomeIcon icon={faTowerBroadcast}/>
      }
      return (!last || current.cardType != last.cardType) ? getIcon(current) : undefined;
    },
    group: "All"
  },
  "Frequency": {
    impl: (a, b) => (a.frequency ? a.frequency : 0) - (b.frequency ? b.frequency : 0), 
    tag: (current, last) => {
      // based on https://www.arrl.org/files/file/Regulatory/Band%20Chart/Band%20Chart%20-%2011X17%20Color.pdf

      const getBand = (card: Contact): any => {
        const US_BAND: Record<string, [number, number]> = {
          "23 cm": [1240, 1300],
          "33 cm": [902, 928],
          "70 cm": [420, 450],
          "1.25 m": [222, 225],
          "2 m": [144, 148],
          "6 m": [50, 54],
          "10 m": [28, 29.7],
          "20 m": [14, 14.35],        
        }
        
        if (card.frequency === undefined) {
          return undefined;
        }

        for (const key in US_BAND) {
          if (US_BAND[key][0] <= card.frequency && card.frequency <= US_BAND[key][1]) {
            return key;
          }
        }
      }  
      if (!last || getBand(current) != getBand(last)) {
        return getBand(current); 
      }
      return undefined;
    },
    filter: (c) => c.cardType == "repeater",
    group: "Repeater"
  }
};

export default SORTS;