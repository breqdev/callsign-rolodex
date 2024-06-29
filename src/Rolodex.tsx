import { useCallback, useContext, useEffect, useState } from "react";
import Card from "./Card";
import { Contact } from "./contact";
import useLocalStorageState from "use-local-storage-state";
import { FirebaseContext } from "./FirebaseWrapper";
import { signOut } from "firebase/auth";
import { addDoc, collection, getDocs } from "firebase/firestore";
import NewCard from "./NewCard";

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
  {
    name: "Starred",
    impl: (a, b) => {
      if (a.star && !b.star) return -1;
      if (!a.star && b.star) return 1;
      return lastNameFirst(a.name).localeCompare(lastNameFirst(b.name));
    },
  },
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

function GridView({
  cards,
  newCard,
}: {
  cards: Contact[];
  newCard: (c: Contact) => void;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,350px)] gap-4 p-4 justify-center">
      {cards.map((contact) => (
        <Card key={contact.callsign} contact={contact} />
      ))}
      <NewCard onCreate={newCard} />
    </div>
  );
}

function ColumnView({
  cards,
  newCard,
}: {
  cards: Contact[];
  newCard: (c: Contact) => void;
}) {
  return (
    <div className="flex flex-col gap-4 py-4 w-[350px] mx-auto h-96 flex-grow min-h-0 overflow-y-scroll">
      {cards.map((contact) => (
        <Card key={contact.callsign} contact={contact} />
      ))}
      <NewCard onCreate={newCard} />
    </div>
  );
}

function SearchView({
  cards,
  newCard,
}: {
  cards: Contact[];
  newCard: (c: Contact) => void;
}) {
  const [query, setQuery] = useState("");

  return (
    <>
      <input
        className="max-w-xl w-full mx-auto text-7xl font-mono my-8 border-b-4 border-black"
        placeholder="callsign"
        value={query}
        onChange={(e) => setQuery(e.target.value.toLocaleUpperCase())}
      />
      <div className="grid grid-cols-[repeat(auto-fit,350px)] gap-4 p-4 justify-center">
        {cards
          .filter((c) => c.callsign.startsWith(query))
          .map((contact) => (
            <Card key={contact.callsign} contact={contact} />
          ))}
        <NewCard onCreate={newCard} />
      </div>
    </>
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
  {
    name: "Search",
    value: "search",
  },
] as const;

export default function Rolodex() {
  const { auth, user, db } = useContext(FirebaseContext);
  const [view, setView] = useLocalStorageState<"grid" | "column" | "search">(
    "view",
    {
      defaultValue: "grid",
    }
  );
  const [sort, setSort] = useLocalStorageState("sort", { defaultValue: 0 });

  const [cards, setCards] = useState<Contact[]>([]);

  useEffect(() => {
    getDocs(collection(db, `users/${user?.uid}/contacts`)).then((snapshot) => {
      setCards(snapshot.docs.map((doc) => doc.data() as Contact));
    });
  }, [db, user]);

  const createCard = useCallback(
    (c: Contact) => {
      addDoc(collection(db, `users/${user?.uid}/contacts`), c)
        .then(() => {
          setCards([...cards, c]);
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    },
    [cards, db, user]
  );

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
      {view === "grid" && (
        <GridView cards={cards.sort(SORTS[sort].impl)} newCard={createCard} />
      )}
      {view === "column" && (
        <ColumnView cards={cards.sort(SORTS[sort].impl)} newCard={createCard} />
      )}
      {view === "search" && (
        <SearchView cards={cards.sort(SORTS[sort].impl)} newCard={createCard} />
      )}
    </div>
  );
}
