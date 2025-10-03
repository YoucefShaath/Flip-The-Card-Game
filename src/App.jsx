import { useEffect, useState } from "react";
import Card from "./Card";

function createShuffledDeck() {
  // create 10 pair values (1..10) => 20 cards total for a 10x2 grid
  const totalPairs = 10;
  const values = Array.from({ length: totalPairs }, (_, i) => i + 1);
  const pairs = values.flatMap((v) => [
    { id: `${v}-a`, value: v },
    { id: `${v}-b`, value: v },
  ]);

  // Fisher-Yates shuffle
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
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);

  useEffect(() => {
    // create new deck on mount
    setDeck(createShuffledDeck());
  }, []);

  useEffect(() => {
    if (firstId && secondId) {
      const first = deck.find((c) => c.id === firstId);
      const second = deck.find((c) => c.id === secondId);
      if (!first || !second) return;

      setLocked(true);
      setMoves((m) => m + 1);

      if (first.value === second.value) {
        // mark matched
        setDeck((d) =>
          d.map((c) =>
            c.value === first.value ? { ...c, isMatched: true } : c
          )
        );
        setMatches((m) => m + 1);
        // small delay so user sees the second card
        setTimeout(() => {
          setFirstId(null);
          setSecondId(null);
          setLocked(false);
        }, 400);
      } else {
        // not a match: flip back after short delay
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
  }, [firstId, secondId, deck]);

  function handleCardClick(cardId) {
    if (locked) return;
    const card = deck.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    // flip the clicked card
    setDeck((d) =>
      d.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    if (!firstId) {
      setFirstId(cardId);
      return;
    }

    if (firstId && !secondId) {
      // clicking the same card twice is ignored
      if (firstId === cardId) return;
      setSecondId(cardId);
      return;
    }
  }

  function resetGame() {
    setDeck(createShuffledDeck());
    setFirstId(null);
    setSecondId(null);
    setLocked(false);
    setMoves(0);
    setMatches(0);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="w-full px-4">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Flip Card — 10x2 Grid</h1>
          <div className="space-x-4">
            <span>Moves: {moves}</span>
            <span>Matches: {matches} / 10</span>
            <button
              onClick={resetGame}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
            >
              Reset
            </button>
          </div>
        </header>

        <main>
          <div className="grid grid-cols-10 grid-rows-2 gap-3 w-full">
            {deck.map((card) => (
              <Card
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card.id)}
              />
            ))}
          </div>
        </main>
      </div>
      {matches === 10 && (
        <div className="mt-6 text-center text-green-400 font-semibold">
          You won in {moves} moves! 🎉
        </div>
      )}
    </div>
  );
}
