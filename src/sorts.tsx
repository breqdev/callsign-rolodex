import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faPerson, faTowerBroadcast } from "@fortawesome/free-solid-svg-icons";
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
  filter?: (a: Contact) => boolean;
};

// O(n) basic lookup
function sort(name: string): Sort {
  for (let i = 0; i < SORTS.length; i++) {
    if (SORTS[i].name == name) {
      return SORTS[i];
    }
  }
  return {
    name: "",
    impl: (_a, _b) => 0
  }
}

const SORTS: Sort[] = [
  {
    name: "Starred",
    impl: (a, b) => {
      if (a.star == b.star) {
        return sort("Last Name").impl(a, b)
      }
      
      return (b.star === true ? 1 : 0) - (a.star === true ? 1 : 0)
    },
    tag: (current, last) => {
      if (!last) {
        return <FontAwesomeIcon icon={faStar} />;
      }
      
      if (!current.star) {
        const a = sort("Last Name")
        if (a.tag !== undefined) {
          return a.tag(current, last);
        }
        return undefined;
      }
    },
  },
  {
    name: "Last Name",
    impl: (a, b) => {
      return lastNameFirst(a.name).localeCompare(lastNameFirst(b.name));
    },
    tag: (current, last) => {
      return (!last || lastNameFirst(current.name)[0] != lastNameFirst(last.name)[0]) ? lastNameFirst(current.name)[0] : undefined; 
    },
    filter: (c) => {
      return c.cardType == "person"
    }
  },
  {
    name: "First Name",
    impl: (a, b) => {
      return a.name.localeCompare(b.name);
    },
    tag: (current, last) => {
      return (!last || current.name[0] != last.name[0]) ? current.name[0] : undefined; 
    },
    filter: (c) => {
      return c.cardType == "person"
    }
  },
  {
    name: "Location",
    impl: (a, b) => {
      return a.location.localeCompare(b.location);
    }, 
    tag: (current, last) => {
      return (!last || current.location[0] != last.location[0]) ? current.location[0] : undefined;
    },
    filter: (c) => {
      return c.cardType == "repeater"
    }
  },
  {
    name: "Callsign",
    impl: (a, b) => {
      return a.callsign.localeCompare(b.callsign);
    }, 
    tag: (current, last) => {
      return (!last || current.callsign[0] != last.callsign[0]) ? current.callsign[0] : undefined;
    },
  },
  {
    name: "Type",
    impl: (a, b) => {
      // the sort("Callsign") here is tbd and is mainly a placeholder
      return (a.cardType == b.cardType) ? sort("Callsign").impl(a, b) : a.cardType.localeCompare(b.cardType)
    }, 
    tag: (current, last) => {
      const getIcon = (card: Contact) => {
        return card.cardType == "person" 
          ? <FontAwesomeIcon icon={faPerson}/> 
          : <FontAwesomeIcon icon={faTowerBroadcast}/>
      }

      return (!last || current.cardType != last.cardType) ? getIcon(current) : undefined;
    },
  },
  {
    name: "Frequency",
    impl: (a, b) => {
      return (a.frequency ? a.frequency : 0) - (b.frequency ? b.frequency : 0);
    }, 
    tag: (current, last) => {
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
    filter: (c) => {
      return c.cardType == "repeater"
    }
  }
];

export default SORTS;
