import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Card from "./Card";
import { Contact } from "./contact";
import useLocalStorageState from "use-local-storage-state";
import { FirebaseContext } from "./FirebaseWrapper";
import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";

function lastNameFirst(name: string) {
  const parts = name.split(" ");
  const last = parts.pop()!;
  return `${last}, ${parts}`;
}

type Sort = {
  name: string;
  impl: (a: Contact, b: Contact) => number;
  tag?: (current: Contact, last: Contact | null) => string | undefined;
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
    impl: (a, b) => a.name.localeCompare(b.name),
  },
  {
    name: "Callsign",
    impl: (a, b) => a.callsign.localeCompare(b.callsign),
  },
];

function GridView({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,350px)] gap-4 py-4 justify-center">
      {children}
    </div>
  );
}

function ColumnView({ children }: { children: Iterable<React.ReactNode> }) {
  const container = useRef<HTMLDivElement>(null);
  const topPadding = useRef<HTMLDivElement>(null);
  const bottomPadding = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = container.current;

    const handleScroll = () => {
      if (c) {
        const cards = container.current.children;

        const rect = container.current.getBoundingClientRect();
        const top = rect.top;
        const bottom = rect.bottom;

        const maxDelta = (bottom - top) / 2;
        const cardHeight = (350 * 53.98) / 85.6;
        topPadding.current!.style.height = `${
          maxDelta - cardHeight / 2 - 16
        }px`;
        bottomPadding.current!.style.height = `${
          maxDelta - cardHeight / 2 - 16
        }px`;

        const center = (top + bottom) / 2;

        for (let i = 0; i < cards.length; i++) {
          const card = cards[i] as HTMLElement;
          const cardRect = card.getBoundingClientRect();
          const cardTop = cardRect.top;
          const cardBottom = cardRect.bottom;
          const cardCenter = (cardTop + cardBottom) / 2;

          // at the extremes, the card should be rotated to the max (+/-90)
          // between 1/3 and 2/3 of the way, it should be rotated to 0

          const delta = (cardCenter - center) / maxDelta;
          const child = card.children[0] as HTMLElement;

          if (!child) {
            continue;
          }

          if (delta < -1 / 2) {
            const rotation = -50 * Math.max(delta - -1 / 2, -1);
            const translateZ = 200 * (delta - -1 / 2);
            const translateY = -250 * (delta - -1 / 2);
            child.style.transform = `translateZ(${translateZ}px) translateY(${translateY}px) rotateX(${rotation}deg) `;
          } else if (delta > 1 / 2) {
            const rotation = -90 * (delta - 1 / 2);
            child.style.transform = `rotateX(${rotation}deg)`;
          } else {
            child.style.transform = `rotateX(0deg)`;
          }
        }
      }
    };

    handleScroll();

    c?.addEventListener("scroll", handleScroll);

    return () => {
      c?.removeEventListener("scroll", handleScroll);
    };
  });

  return (
    <div
      className="flex flex-col items-center gap-4 px-[25px] overflow-x-hidden w-full overflow-y-scroll h-0 flex-grow"
      style={{
        perspective: "1000px",
        perspectiveOrigin: "center",
      }}
      ref={container}
    >
      <div className="flex-shrink-0 w-full h-full" ref={topPadding} />
      {[...children].flat().map((c, i) => (
        <div
          className="flex-shrink-0 max-w-[350px] aspect-[85.60/53.98] w-full"
          style={{ transformStyle: "preserve-3d", zIndex: i }}
        >
          <div
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateX(0deg)",
            }}
          >
            {c}
          </div>
        </div>
      ))}
      <div className="flex-shrink-0 w-full" ref={bottomPadding} />
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
  const [referenceType, setReferenceType] = useLocalStorageState<
    "morse" | "nato"
  >("referenceType", { defaultValue: "morse" });

  const [cards, setCards] = useState<(Contact & { id: string })[] | null>(null);

  useEffect(() => {
    getDocs(collection(db, `users/${user?.uid}/contacts`))
      .then((snapshot) => {
        setCards(
          snapshot.docs.map((doc) => {
            const data = doc.data() as Contact;
            return {
              ...data,
              id: doc.id,
            };
          })
        );
      })
      .catch((error) => {
        console.error("Error getting documents: ", error);
      });
  }, [db, user]);

  const createCard = useCallback(
    (c: Contact) => {
      addDoc(collection(db, `users/${user?.uid}/contacts`), c)
        .then((doc) => {
          const card = { ...c, id: doc.id };
          setCards(cards !== null ? [...cards, card] : null);
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
            cards?.map((card) => {
              if (card.id === old_card.id) {
                return { ...new_card, id: old_card.id };
              }
              return card;
            }) ?? null
          );
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    },
    [cards, db, user]
  );

  const makeDeleteHandler = useCallback(
    (card: Contact & { id: string }) => () => {
      deleteDoc(doc(db, `users/${user?.uid}/contacts/${card.id}`))
        .then(() => {
          setCards(cards?.filter((c) => c.id !== card.id) ?? null);
        })
        .catch((error) => {
          console.error("Error deleting document: ", error);
        });
    },
    [cards, db, user]
  );

  const ViewComponent = VIEW_COMPONENTS[view] || GridView;

  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col h-full p-4 items-stretch">
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
        <div className="flex flex-col gap-2">
          <div className="flex flex-col md:flex-row w-full justify-between gap-2">
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
              <span className="px-2 py-1">Hint mode</span>
              <button
                onClick={() => setReferenceType("morse")}
                className={
                  referenceType === "morse"
                    ? "px-2 py-1 bg-blue-200 rounded-lg"
                    : "px-2 py-1 bg-white rounded-lg"
                }
              >
                Morse Code
              </button>
              <button
                onClick={() => setReferenceType("nato")}
                className={
                  referenceType === "nato"
                    ? "px-2 py-1 bg-blue-200 rounded-lg"
                    : "px-2 py-1 bg-white rounded-lg"
                }
              >
                NATO Phonetics
              </button>
            </div>
          </div>

          <div className="flex flex-row rounded-xl bg-white p-1 md:self-start">
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

      {view !== "column" && (
        <div className="max-w-xl w-full mx-auto py-8 px-4">
          <input
            className="w-full text-7xl font-mono border-b-4 outline-none border-gray-200 hover:border-black focus:border-black transition-colors"
            placeholder="search"
            value={query}
            onChange={(e) => setQuery(e.target.value.toLocaleUpperCase())}
          />
        </div>
      )}

      {cards !== null ? (
        <ViewComponent>
          {cards
            .sort(SORTS[sort].impl)
            .filter((c) => {
              if (query) {
                const q = query.toLocaleLowerCase();
                return (
                  c.callsign.toLocaleLowerCase().includes(q) ||
                  c.name.toLocaleLowerCase().includes(q)
                );
              }
              return true;
            })
            .map((card, i, arr) => {
              const last = i > 0 ? arr[i - 1] : null;

              const tag = SORTS[sort].tag;
              if (tag && view === "column") {
                return { card, tag: tag(card, last) };
              }
              return { card, tag: undefined };
            })
            .map(({ card, tag }) => (
              <Card
                key={card.callsign}
                contact={card}
                onEdit={makeEditHandler(card)}
                onDelete={makeDeleteHandler(card)}
                referenceType={referenceType}
                tab={tag}
              />
            ))}
          <Card
            createMode
            contact={{ name: "", callsign: "" }}
            onEdit={createCard}
            onDelete={() => {}}
            referenceType={referenceType}
          />
        </ViewComponent>
      ) : (
        <div />
      )}
    </div>
  );
}
