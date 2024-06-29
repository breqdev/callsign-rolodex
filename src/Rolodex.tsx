import { useCallback, useContext, useEffect, useState } from "react";
import Card from "./Card";
import { Contact } from "./contact";
import useLocalStorageState from "use-local-storage-state";
import { FirebaseContext } from "./FirebaseWrapper";
import { signOut } from "firebase/auth";
import { addDoc, collection, doc, getDocs, setDoc } from "firebase/firestore";

function lastNameFirst(name: string) {
  const parts = name.split(" ");
  const last = parts.pop()!;
  return `${last}, ${parts}`;
}

type Sort = {
  name: string;
  impl: (a: Contact, b: Contact) => number;
};

const SORTS: Sort[] = [
  // {
  //   name: "Starred",
  //   impl: (a, b) => {
  //     if (a.star && !b.star) return -1;
  //     if (!a.star && b.star) return 1;
  //     return lastNameFirst(a.name).localeCompare(lastNameFirst(b.name));
  //   },
  // },
  {
    name: "Last Name",
    impl: (a, b) => lastNameFirst(a.name).localeCompare(lastNameFirst(b.name)),
  },
  {
    name: "First Name",
    impl: (a, b) => a.name.localeCompare(b.name),
  },
  {
    name: "Callsign",
    impl: (a, b) => a.callsign.localeCompare(b.callsign),
  },
];

function GridView({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,350px)] gap-4 p-4 justify-center">
      {children}
    </div>
  );
}

function ColumnView({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 py-4 w-[350px] mx-auto h-96 flex-grow min-h-0 overflow-y-scroll">
      {children}
    </div>
  );
}

const VIEWS = [
  {
    name: "Grid",
    value: "grid",
  },
  {
    name: "Column",
    value: "column",
  },
] as const;

const VIEW_COMPONENTS = {
  grid: GridView,
  column: ColumnView,
};

export default function Rolodex() {
  const { auth, user, db } = useContext(FirebaseContext);
  const [view, setView] = useLocalStorageState<"grid" | "column">("view", {
    defaultValue: "grid",
  });
  const [sort, setSort] = useLocalStorageState("sort", { defaultValue: 0 });

  const [cards, setCards] = useState<(Contact & { id: string })[]>([]);

  useEffect(() => {
    getDocs(collection(db, `users/${user?.uid}/contacts`)).then((snapshot) => {
      setCards(
        snapshot.docs.map((doc) => {
          const data = doc.data() as Contact;
          return {
            ...data,
            id: doc.id,
          };
        })
      );
    });
  }, [db, user]);

  const createCard = useCallback(
    (c: Contact) => {
      addDoc(collection(db, `users/${user?.uid}/contacts`), c)
        .then((doc) => {
          const card = { ...c, id: doc.id };
          setCards([...cards, card]);
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    },
    [cards, db, user]
  );

  const makeEditHandler = useCallback(
    (old_card: Contact & { id: string }) => (new_card: Contact) => {
      setDoc(doc(db, `users/${user?.uid}/contacts/${old_card.id}`), new_card)
        .then(() => {
          setCards(
            cards.map((card) => {
              if (card.id === old_card.id) {
                return { ...new_card, id: old_card.id };
              }
              return card;
            })
          );
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    },
    [cards, db, user]
  );

  const ViewComponent = VIEW_COMPONENTS[view] || GridView;

  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col h-full">
      <div className="mt-4 flex flex-col max-w-3xl mx-auto p-4 rounded-2xl bg-gray-200 font-display gap-2 w-full">
        <div className="flex flex-row w-full justify-between">
          <h1 className="font-mono text-3xl">rolodex</h1>
          <div className="flex flex-row gap-2 items-center">
            <span>{user?.email}</span>
            <button
              className="hover:underline focus-visible:underline text-gray-600"
              onClick={() => signOut(auth)}
            >
              logout
            </button>
          </div>
        </div>
        <div className="flex flex-row w-full justify-between">
          <div className="flex flex-row rounded-xl bg-white p-1">
            <span className="px-2 py-1">View as</span>
            {VIEWS.map((s) => (
              <button
                key={s.name}
                onClick={() => setView(s.value)}
                className={
                  view === s.value
                    ? "px-2 py-1 bg-blue-200 rounded-lg"
                    : "px-2 py-1 bg-white rounded-lg"
                }
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="flex flex-row rounded-xl bg-white p-1">
            <span className="px-2 py-1">Sort by</span>
            {SORTS.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setSort(i)}
                className={
                  sort === i
                    ? "px-2 py-1 bg-blue-200 rounded-lg"
                    : "px-2 py-1 bg-white rounded-lg"
                }
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <input
        className="max-w-xl w-full mx-auto text-7xl font-mono my-8 border-b-4 border-black"
        placeholder="search"
        value={query}
        onChange={(e) => setQuery(e.target.value.toLocaleUpperCase())}
      />

      <ViewComponent>
        {cards
          .sort(SORTS[sort].impl)
          .filter((c) => {
            if (query) {
              return c.callsign.includes(query) || c.name.includes(query);
            }
            return true;
          })
          .map((contact) => (
            <Card
              key={contact.callsign}
              contact={contact}
              onEdit={makeEditHandler(contact)}
            />
          ))}
        <Card
          createMode
          contact={{ name: "", callsign: "" }}
          onEdit={createCard}
        />
      </ViewComponent>
    </div>
  );
}
