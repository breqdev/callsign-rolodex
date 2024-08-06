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
        if (card.frequency === undefined) {
          return undefined;
        }
        if (420 <= card.frequency && card.frequency <= 450) {
          return "70 cm"
        }
        if (222 <= card.frequency && card.frequency <= 225) {
          return "1.25 m"
        }
        if (144 <= card.frequency && card.frequency <= 148) {
          return "2 m"
        }
        if (50 <= card.frequency && card.frequency <= 54) {
          return "6 m"
        }
        if (28 <= card.frequency && card.frequency <= 29.7) {
          return "10 m"
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