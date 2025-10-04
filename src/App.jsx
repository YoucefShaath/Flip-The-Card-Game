import { useEffect, useState } from "react";
import Card from "./Card";
import StartingPage from "./StartingPage";
import Characters from "../Characters.json";

function createShuffledDeck() {
  // build pairs from Characters.json
  const charObj =
    Characters && Characters.characters && Characters.characters[0]
      ? Characters.characters[0]
      : {};
  const entries = Object.entries(charObj); // [ [key, url], ... ]
  const totalPairs = Math.min(15, entries.length);
  const selected = entries.slice(0, totalPairs);
  const pairs = selected.flatMap(([key, url]) => [
    { id: `${key}-a`, value: { id: key, src: url } },
    { id: `${key}-b`, value: { id: key, src: url } },
  ]);

  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  return pairs.map((p) => ({ ...p, isFlipped: false, isMatched: false }));
}

export default function App() {
  const [deck, setDeck] = useState(() => createShuffledDeck());
  const [firstId, setFirstId] = useState(null);
  const [secondId, setSecondId] = useState(null);
  const [locked, setLocked] = useState(false);
  const [matches, setMatches] = useState(0);
  // phases: idle -> countdown -> preview -> playing -> won/lost
  const [phase, setPhase] = useState("idle");
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(0);

  // startGame will initialize deck and begin the countdown
  function startGame() {
    setDeck(createShuffledDeck());
    setFirstId(null);
    setSecondId(null);
    setLocked(false);
    setMatches(0);
    setTimer(0);
    setCountdown(3);
    setPhase("countdown");
  }

  useEffect(() => {
    if (phase !== "countdown") return;
    setCountdown(3);
    let iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(iv);
          setPhase("preview");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (phase !== "preview") return;
    // reveal all
    setDeck((d) => d.map((c) => ({ ...c, isFlipped: true })));
    const t = setTimeout(() => {
      setDeck((d) =>
        d.map((c) =>
          c.isMatched ? { ...c, isFlipped: true } : { ...c, isFlipped: false }
        )
      );
      setPhase("playing");
    }, 5000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    setTimer(0);
    const iv = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (matches === 15 && phase === "playing") {
      setPhase("won");
    }
  }, [matches, phase]);

  useEffect(() => {
    if (timer > 120 && phase === "playing") {
      setPhase("lost");
    }
  }, [timer, phase]);

  useEffect(() => {
    if (firstId && secondId) {
      const first = deck.find((c) => c.id === firstId);
      const second = deck.find((c) => c.id === secondId);
      if (!first || !second) return;

      setLocked(true);

      // compare character ids
      if (first.value && second.value && first.value.id === second.value.id) {
        setDeck((d) =>
          d.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c
          )
        );
        setMatches((n) => n + 1);
        setTimeout(() => {
          setFirstId(null);
          setSecondId(null);
          setLocked(false);
        }, 400);
      } else {
        setTimeout(() => {
          setDeck((d) =>
            d.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFirstId(null);
          setSecondId(null);
          setLocked(false);
        }, 800);
      }
    }
  }, [firstId, secondId]);

  function handleCardClick(cardId) {
    if (locked) return;
    if (phase !== "playing") return;
    const card = deck.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    setDeck((d) =>
      d.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    if (!firstId) {
      setFirstId(cardId);
      return;
    }

    if (firstId && !secondId) {
      if (firstId === cardId) return;
      setSecondId(cardId);
      return;
    }
  }

  function resetGame() {
    // return to idle and show starting page again
    setDeck(createShuffledDeck());
    setFirstId(null);
    setSecondId(null);
    setLocked(false);
    setMatches(0);
    setTimer(0);
    setPhase("idle");
    setCountdown(3);
  }

  return (
    <>
      <StartingPage onStart={startGame} show={phase === "idle"} />
      <div className="min-h-screen bg-[#37353E] text-white py-4">
        <div className="w-full px-2">
          <main className="relative">
            <div className="grid grid-cols-10 grid-rows-3 gap-y-2 w-full">
              {deck.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => handleCardClick(card.id)}
                />
              ))}
            </div>

            {phase === "countdown" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-10" />
                <div className="relative z-60 text-white text-6xl font-bold">
                  {countdown}
                </div>
              </div>
            )}

            {phase === "won" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="flex flex-col gap-4 absolute inset-0 bg-black bg-opacity-50" />
                <div className="relative z-60 text-white text-6xl font-bold text-center">
                  You Won!
                  <br />
                  <button
                    onClick={resetGame}
                    className="bg-green-500 hover:bg-green-600 p-4 rounded-2xl w-48 h-auto font-semibold text-3xl"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}

            {phase === "lost" && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="flex flex-col gap-4 absolute inset-0 bg-black bg-opacity-50" />
                <div className="relative z-60 text-white text-6xl font-bold text-center">
                  Time's Up!
                  <br />
                  <button
                    onClick={resetGame}
                    className="bg-red-500 hover:bg-red-600 p-4 rounded-2xl w-48 h-auto font-semibold text-3xl"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </main>
          <footer className="mt-4 flex justify-center items-center gap-6">
            <div className="text-2xl font-semibold">
              Matches: {matches} / 15
            </div>
            <button
              onClick={resetGame}
              className="bg-[#8E2426] hover:bg-red-600 px-3 py-1 rounded w-40 h-auto font-semibold text-3xl"
            >
              Reset
            </button>
            <div className="text-2xl font-semibold">Time: {timer}s</div>
          </footer>
        </div>
      </div>
    </>
  );
}
