// MemoryCardGame.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import Confetti from 'react-confetti';
import { Clock, RotateCw, Star, Trophy, HelpCircle } from 'lucide-react';

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
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue-50 to-pastel-purple-50 text-gray-800 p-4 flex flex-col items-center justify-center font-sans">
      {/* Confetti effect when game is completed */}
      {gameCompleted && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          colors={['#A5D8FF', '#FFD6FF', '#CAFFBF', '#FDFFB6', '#FFADAD']}
        />
      )}

      <motion.div
        className="max-w-4xl w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-pastel-blue-200"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-gray-800 mb-2"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-pastel-purple-500 to-pastel-pink-500 bg-clip-text text-transparent">
                Memory Match
              </span>
            </motion.h1>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Match pairs of cards to win the game
            </motion.p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <motion.div
              className="bg-pastel-blue-100 px-4 py-2 rounded-lg flex items-center shadow-sm border border-pastel-blue-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Clock className="text-pastel-blue-500 mr-2 w-5 h-5" />
              <span className="font-medium text-pastel-blue-800">{formatTime(timer)}</span>
            </motion.div>

            <motion.div
              className="bg-pastel-green-100 px-4 py-2 rounded-lg flex items-center shadow-sm border border-pastel-green-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCw className="text-pastel-green-500 mr-2 w-5 h-5" />
              <span className="font-medium text-pastel-green-800">{moves} moves</span>
            </motion.div>

            <motion.div
              className="bg-pastel-yellow-100 px-4 py-2 rounded-lg flex items-center shadow-sm border border-pastel-yellow-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star className="text-pastel-yellow-500 mr-2 w-5 h-5" />
              <span className="font-medium text-pastel-yellow-800">{score} points</span>
            </motion.div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <motion.button
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${difficulty === 'easy'
                ? 'bg-pastel-green-100 text-pastel-green-800 border-2 border-pastel-green-300 shadow-inner'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setDifficulty('easy');
                setTimeout(startNewGame, 300);
              }}
            >
              Easy
            </motion.button>

            <motion.button
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${difficulty === 'medium'
                ? 'bg-pastel-blue-100 text-pastel-blue-800 border-2 border-pastel-blue-300 shadow-inner'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setDifficulty('medium');
                setTimeout(startNewGame, 300);
              }}
            >
              Medium
            </motion.button>

            <motion.button
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${difficulty === 'hard'
                ? 'bg-pastel-pink-100 text-pastel-pink-800 border-2 border-pastel-pink-300 shadow-inner'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setDifficulty('hard');
                setTimeout(startNewGame, 300);
              }}
            >
              Hard
            </motion.button>
          </div>

          <div className="flex justify-center mb-8">
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-pastel-purple-400 to-pastel-pink-400 text-white font-medium rounded-lg hover:opacity-90 transition-all shadow-md flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startNewGame}
            >
              <RotateCw className="w-5 h-5" />
              New Game
            </motion.button>
          </div>

          {/* Game cards */}
          <div className={`grid ${difficulty === 'easy' ? 'grid-cols-4' :
            difficulty === 'medium' ? 'grid-cols-4 md:grid-cols-6' :
              'grid-cols-4 md:grid-cols-8'
            } gap-3 md:gap-4 justify-center`}>
            {cards.map(card => (
              <motion.div
                key={card.id}
                onClick={() => flipCard(card.id)}
                className={`aspect-square cursor-pointer relative`}
                style={{ perspective: '1000px' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className={`absolute inset-0 rounded-xl shadow-sm flex items-center justify-center text-3xl transition-all duration-300 ${card.isFlipped || card.isMatched
                      ? 'opacity-0 rotate-y-90 bg-gradient-to-br from-gray-200 to-gray-300'
                      : 'opacity-100 rotate-y-0 bg-gradient-to-br from-pastel-blue-300 to-pastel-purple-300'
                    }`}
                  animate={{
                    rotateY: card.isFlipped || card.isMatched ? 90 : 0,
                    opacity: card.isFlipped || card.isMatched ? 0 : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <HelpCircle className="w-10 h-10 text-white opacity-80" />
                </motion.div>

                <motion.div
                  className={`absolute inset-0 rounded-xl shadow-sm flex items-center justify-center text-3xl md:text-4xl ${card.isMatched
                      ? 'bg-gradient-to-br from-pastel-green-100 to-pastel-green-200 border-2 border-pastel-green-300'
                      : 'bg-white'
                    }`}
                  animate={{
                    rotateY: card.isFlipped || card.isMatched ? 0 : -90,
                    opacity: card.isFlipped || card.isMatched ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {card.icon}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Win screen */}
          {gameCompleted && (
            <AnimatePresence>
              <motion.div
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white p-8 rounded-2xl max-w-md w-full text-center shadow-xl border-2 border-pastel-purple-200"
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  <Trophy className="w-16 h-16 mx-auto text-pastel-yellow-500 mb-4" />
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Congratulations! 🎉
                  </h2>

                  <div className="space-y-3 mb-6 text-gray-600">
                    <p className="flex justify-between items-center">
                      <span className="flex items-center text-pastel-blue-600">
                        <Clock className="mr-2 w-5 h-5" /> Time:
                      </span>
                      <span className="font-medium">{formatTime(timer)}</span>
                    </p>
                    <p className="flex justify-between items-center">
                      <span className="flex items-center text-pastel-green-600">
                        <RotateCw className="mr-2 w-5 h-5" /> Moves:
                      </span>
                      <span className="font-medium">{moves}</span>
                    </p>
                    <p className="flex justify-between items-center">
                      <span className="flex items-center text-pastel-yellow-600">
                        <Star className="mr-2 w-5 h-5" /> Score:
                      </span>
                      <span className="font-medium text-emerald-600">{score}</span>
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <motion.button
                      className="px-6 py-3 bg-gradient-to-r from-pastel-purple-400 to-pastel-pink-400 text-white font-medium rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startNewGame}
                    >
                      <RotateCw className="w-5 h-5" />
                      Play Again
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="bg-pastel-blue-50 p-4 text-center text-gray-500 text-sm border-t border-pastel-blue-100">
          Made with React, TypeScript & TailwindCSS | © {new Date().getFullYear()} Memory Match
        </div>
      </motion.div>
    </div>
  );
};

export default MemoryCardGame;