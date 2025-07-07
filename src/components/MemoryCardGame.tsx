// MemoryCardGame.tsx
import React, { useState, useEffect, useCallback } from 'react';

type Card = {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
};

type Difficulty = 'easy' | 'medium' | 'hard';

const MemoryCardGame: React.FC = () => {
  const allIcons = [
    '🍎', '🍊', '🍇', '🍓', '🍒', '🍑',
    '🥝', '🥥', '🍍', '🥭', '🍋', '🍉',
    '🌿', '🍄', '🌻', '🌷', '🌼', '🌸'
  ];

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [score, setScore] = useState(0);

  const playSound = (sound: 'flip' | 'match' | 'win' | 'mismatch') => {
    const sounds = {
      flip: 'https://www.soundjay.com/buttons/button-09.mp3',
      match: 'https://www.soundjay.com/buttons/button-09.mp3',
      win: 'https://www.soundjay.com/buttons/button-09.mp3',
      mismatch: 'https://www.soundjay.com/buttons/button-10.mp3'
    };

    const audio = new Audio(sounds[sound]);
    audio.volume = 0.3;
    audio.play();
  };

  const startNewGame = useCallback(() => {
    setIsTimerRunning(true);
    setTimer(0);
    setMoves(0);
    setGameCompleted(false);
    setFlippedCards([]);
    setScore(0);

    const cardCounts = {
      easy: 8,
      medium: 12,
      hard: 16
    };

    const count = cardCounts[difficulty];
    const selectedIcons = allIcons.slice(0, count / 2);
    const gameIcons = [...selectedIcons, ...selectedIcons];

    const shuffledCards = [...gameIcons]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false
      }));

    setCards(shuffledCards);
  }, [difficulty]);

  useEffect(() => {
    let interval: number | null = null;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);

      if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
        playSound('match');
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, isMatched: true }
              : card
          )
        );
        setScore(prev => prev + 100);
        setFlippedCards([]);
      } else {
        playSound('mismatch');
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              flippedCards.includes(card.id) && !card.isMatched
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }

      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setIsTimerRunning(false);
      setGameCompleted(true);
      playSound('win');
      setScore(prev => prev + Math.max(0, 1000 - timer * 10));
    }
  }, [cards]);

  const flipCard = (id: number) => {
    if (flippedCards.length >= 2 || gameCompleted) return;

    const card = cards.find(c => c.id === id);

    if (!card || card.isFlipped || card.isMatched) return;

    playSound('flip');
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === id ? { ...card, isFlipped: true } : card
      )
    );

    setFlippedCards(prev => [...prev, id]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 p-4 flex flex-col items-center justify-center font-sans">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Memory Match
            </h1>
            <p className="text-gray-600">Match pairs of cards to win the game</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center shadow-sm">
              <span className="text-gray-700 mr-2">⏱️</span>
              <span className="font-medium">{formatTime(timer)}</span>
            </div>

            <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center shadow-sm">
              <span className="text-gray-700 mr-2">🔄</span>
              <span className="font-medium">{moves} moves</span>
            </div>

            <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center shadow-sm">
              <span className="text-gray-700 mr-2">⭐</span>
              <span className="font-medium">{score} points</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${difficulty === 'easy'
                  ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                }`}
              onClick={() => {
                setDifficulty('easy');
                setTimeout(startNewGame, 300);
              }}
            >
              Easy
            </button>

            <button
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${difficulty === 'medium'
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                }`}
              onClick={() => {
                setDifficulty('medium');
                setTimeout(startNewGame, 300);
              }}
            >
              Medium
            </button>

            <button
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${difficulty === 'hard'
                  ? 'bg-rose-100 text-rose-800 border-2 border-rose-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                }`}
              onClick={() => {
                setDifficulty('hard');
                setTimeout(startNewGame, 300);
              }}
            >
              Hard
            </button>
          </div>

          <div className="flex justify-center mb-8">
            <button
              className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-all shadow-md"
              onClick={startNewGame}
            >
              New Game
            </button>
          </div>

          {/* Game cards */}
          <div className={`grid ${difficulty === 'easy' ? 'grid-cols-4' :
              difficulty === 'medium' ? 'grid-cols-4 md:grid-cols-6' :
                'grid-cols-4 md:grid-cols-8'
            } gap-3 md:gap-4 justify-center`}>
            {cards.map(card => (
              <div
                key={card.id}
                onClick={() => flipCard(card.id)}
                className={`aspect-square cursor-pointer transition-all duration-300 transform ${card.isFlipped || card.isMatched
                    ? 'rotate-y-180'
                    : 'rotate-y-0 hover:scale-105'
                  } relative`}
                style={{ perspective: '1000px' }}
              >
                {/* Card back */}
                <div className={`absolute inset-0 rounded-xl shadow-sm flex items-center justify-center text-3xl transition-all duration-500 ${card.isFlipped || card.isMatched
                    ? 'opacity-0 rotate-y-90 bg-gradient-to-br from-gray-200 to-gray-300'
                    : 'opacity-100 rotate-y-0 bg-gradient-to-br from-gray-300 to-gray-400'
                  }`}>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    ?
                  </div>
                </div>

                {/* Card front */}
                <div className={`absolute inset-0 rounded-xl shadow-sm flex items-center justify-center text-3xl md:text-4xl transition-all duration-500 ${card.isFlipped || card.isMatched
                    ? 'opacity-100 rotate-y-0 bg-white'
                    : 'opacity-0 rotate-y-90 bg-white'
                  } ${card.isMatched ? 'bg-emerald-50 border-2 border-emerald-300' : ''}`}>
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Win screen */}
          {gameCompleted && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center shadow-xl">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  Congratulations! 🎉
                </h2>

                <div className="space-y-3 mb-6 text-gray-600">
                  <p className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">{formatTime(timer)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Moves:</span>
                    <span className="font-medium">{moves}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-medium text-emerald-600">{score}</span>
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-all"
                    onClick={startNewGame}
                  >
                    Play Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 text-center text-gray-500 text-sm">
          Made with React, TypeScript & TailwindCSS | © {new Date().getFullYear()} Memory Match
        </div>
      </div>
    </div>
  );
};

export default MemoryCardGame;