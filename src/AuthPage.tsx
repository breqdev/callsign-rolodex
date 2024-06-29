import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FormEvent, useCallback, useContext, useState } from "react";
import { FirebaseContext } from "./FirebaseWrapper";

export default function AuthPage() {
  const { auth } = useContext(FirebaseContext);

  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);

  const handleLogin = useCallback(
    (e: FormEvent) => {
      const target = e.target as typeof e.target & {
        email: { value: string };
        password: { value: string };
      };

      e.preventDefault();
      signInWithEmailAndPassword(
        auth,
        target.email.value,
        target.password.value
      ).catch((error) => {
        setLoginError(error.message?.replace("Firebase: ", ""));
      });
    },
    [auth]
  );

  const handleSignUp = useCallback(
    (e: FormEvent) => {
      const target = e.target as typeof e.target & {
        email: { value: string };
        password: { value: string };
      };

      e.preventDefault();
      createUserWithEmailAndPassword(
        auth,
        target.email.value,
        target.password.value
      ).catch((error) => {
        setSignupError(error.message?.replace("Firebase: ", ""));
      });
    },
    [auth]
  );

  return (
    <div className="flex flex-col py-16 md:py-32 md:gap-8">
      <h1 className="text-center text-6xl font-mono">rolodex</h1>
      <div className="grid grid-cols-1 md:grid-cols-[16rem,min-content,16rem] w-full p-4 place-content-center md:gap-4 font-display">
        <form className="flex flex-col gap-4 py-4" onSubmit={handleLogin}>
          <h2 className="text-center text-3xl">Log In</h2>
          <input
            className="border border-black px-1 py-0.5"
            placeholder="email"
            name="email"
            type="email"
          />
          <input
            className="border border-black px-1 py-0.5"
            placeholder="password"
            name="password"
            type="password"
          />
          <button
            type="submit"
            className="border border-black px-1 py-0.5 hover:bg-black focus-visible:bg-black hover:text-white focus-visible:text-white"
          >
            continue <FontAwesomeIcon icon={faArrowRight} />
          </button>
          <span className="italic text-red-600 md:h-6">{loginError}</span>
        </form>
        <div className="hidden md:block w-px bg-black h-full rounded-full" />
        <form className="flex flex-col gap-4 py-4" onSubmit={handleSignUp}>
          <h2 className="text-center text-3xl">Sign Up</h2>
          <input
            className="border border-black px-1 py-0.5"
            placeholder="email"
            name="email"
            type="email"
          />
          <input
            className="border border-black px-1 py-0.5"
            placeholder="password"
            name="password"
            type="password"
          />
          <button
            type="submit"
            className="border border-black px-1 py-0.5 hover:bg-black focus-visible:bg-black hover:text-white focus-visible:text-white"
          >
            create account
          </button>
          <span className="italic text-red-600 md:h-6">{signupError}</span>
        </form>
      </div>
    </div>
  );
}
