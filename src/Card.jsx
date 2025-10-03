import AOT from "./assets/aot_logo.png";
import Background from "./assets/background.png";

export default function Card({ card, onClick }) {
  // card: { id, value, isFlipped, isMatched }
  const showFront = card.isFlipped || card.isMatched;

  return (
    <div
      className={`card-outer w-36 h-52 perspective`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <div className={`card-inner ${showFront ? "is-flipped" : ""}`}>
        {/* Front: revealed face (value) */}
        <div className="card-face card-front flex items-center justify-center rounded-2xl bg-white text-black font-bold shadow-md">
          <div className="card-value">{card.value}</div>
        </div>

        <div className="card-face card-back flex items-center justify-center rounded-2xl shadow-lg bg-[#212121] overflow-hidden relative">
          <img
            src={Background}
            alt="background"
            className="absolute inset-0 w-full h-full object-cover opacity-100"
          />
          <div className="relative z-10 rounded-full bg-gray-500 bg-opacity-10 flex items-center justify-center card-logo">
            <img src={AOT} alt="AOT Logo" className="card-logo-img" />
          </div>
        </div>
      </div>
    </div>
  );
}
