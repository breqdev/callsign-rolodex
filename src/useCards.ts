import { useCallback, useContext, useEffect, useState } from "react";
import { Contact } from "./contact";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { FirebaseContext } from "./FirebaseWrapper";

export default function useCards() {
  const { user, db } = useContext(FirebaseContext);

  const [cards, setCards] = useState<(Contact & { id: string })[] | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, `users/${user?.uid}/contacts`),
      (snapshot) => {
        setCards(
          snapshot.docs.map((doc) => {
            const data = doc.data() as Contact;
            return {
              ...data,
              cardType: data.cardType !== undefined ? data.cardType : "person",
              location: data.location !== undefined ? data.location : "",
              id: doc.id,
            };
          })
        );
      }
    );

    return unsub;
  }, [db, user]);

  const addCard = useCallback(
    (c: Contact) => {
      addDoc(collection(db, `users/${user?.uid}/contacts`), c).catch(
        (error) => {
          console.error("Error adding document: ", error);
        }
      );
    },
    [db, user]
  );

  const editCard = useCallback(
    (old_card: Contact & { id: string }, new_card: Contact) => {
      setDoc(
        doc(db, `users/${user?.uid}/contacts/${old_card.id}`),
        new_card
      ).catch((error) => {
        console.error("Error updating document: ", error);
      });
    },
    [db, user]
  );

  const deleteCard = useCallback(
    (card: Contact & { id: string }) => {
      deleteDoc(doc(db, `users/${user?.uid}/contacts/${card.id}`)).catch(
        (error) => {
          console.error("Error deleting document: ", error);
        }
      );
    },
    [db, user]
  );

  return { cards, addCard, editCard, deleteCard };
}
