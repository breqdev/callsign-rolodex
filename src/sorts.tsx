import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { Contact } from "./contact";

function lastNameFirst(name: string) {
  const parts = name.split(" ");
  const last = parts.pop()!;
  return `${last}, ${parts}`;
}

type Sort = {
  name: string;
  impl: (a: Contact, b: Contact) => number;
  tag?: (current: Contact, last: Contact | null) => React.ReactNode | undefined;
};

const SORTS: Sort[] = [
  {
    name: "Starred",
    impl: (a, b) => {
      if (a.star && !b.star) return -1;
      if (!a.star && b.star) return 1;
      return lastNameFirst(a.name).localeCompare(lastNameFirst(b.name));
    },
    tag: (current, last) => {
      if (!last) {
        return <FontAwesomeIcon icon={faStar} />;
      }

      if (!current.star) {
        if (
          last.star ||
          lastNameFirst(current.name)[0] != lastNameFirst(last.name)[0]
        ) {
          return lastNameFirst(current.name)[0];
        }
      }
    },
  },
  {
    name: "Last Name",
    impl: (a, b) => {
      if (a.cardType == b.cardType && a.cardType == "person") {
        return lastNameFirst(a.name).localeCompare(lastNameFirst(b.name));
      } 
      else if (a.cardType == b.cardType) {
        // sort by location
        return SORTS[5].impl(a, b)
      }
      else {
        // person first
        return a.cardType.localeCompare(b.cardType);
      }
    },
    tag: (current, last) => {
      if (
        !last ||
        lastNameFirst(current.name)[0] != lastNameFirst(last.name)[0]
      ) {
        return lastNameFirst(current.name)[0];
      }
      return undefined;
    },
  },
  {
    name: "First Name",
    impl: (a, b) => {
      if (a.cardType == b.cardType && a.cardType == "person") {
        return a.name.localeCompare(b.name);
      }
      else if (a.cardType == b.cardType) {
        // sort by location
        return SORTS[5].impl(a, b)
      }
      else {
        return a.cardType.localeCompare(b.cardType);
      }
    },
    tag: (current, last) => {
      if (!last || current.name[0] != last.name[0]) {
        return current.name[0];
      }
      return undefined;
    },
  },
  {
    name: "Callsign",
    impl: (a, b) => a.callsign.localeCompare(b.callsign),
  },
  {
    name: "Type",
    impl: (a, b) => {
      if (a.cardType == b.cardType) {
        // sort by callsign 
        return SORTS[3].impl(a, b);
      }
      else {
        return a.cardType.localeCompare(b.cardType);
      }
    }
  },
  {
    name: "Location",
    impl: (a, b) => {
      if (a.cardType == b.cardType && a.cardType == "repeater") {
        return a.location?.localeCompare(b.location);
      }
      else if (a.cardType == b.cardType) {
        // sort by last name
        return SORTS[1].impl(a, b)
      }
      else {
        return b.cardType.localeCompare(a.cardType);
      }
    }
  },
  {
    name: "Frequency",
    impl: (a, b) => {
      if (a.cardType == b.cardType && a.cardType == "repeater" && a.frequency !== undefined && b.frequency !== undefined) {
        return (a.frequency - b.frequency)
      }
      else {
        return b.cardType.localeCompare(a.cardType);
      }
    }
  }
];

export default SORTS;
