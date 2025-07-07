// MemoryCardGame.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import Confetti from 'react-confetti';
import {
  Clock,
  RotateCw,
  Star,
  Trophy,
  Sparkles,
  Palette,
  Heart,
  Gem,
  Flower,
  Leaf,
  Cherry
} from 'lucide-react';

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
    '🌿', '🍄', '🌻', '🌷', '🌼', '🌸',
    '🦋', '🐞', '🐢', '🐬', '🦄', '🌈'
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

  // Pastel color palette
  const colors = {
    background: "linear-gradient(135deg, #f9d7ff 0%, #d1e9ff 50%, #d0f4ff 100%)",
    cardBack: "linear-gradient(135deg, #ffcbf2, #f3c4fb)",
    easy: "linear-gradient(135deg, #b5ead7, #c7ceea)",
    medium: "linear-gradient(135deg, #ffdac1, #ffb7b2)",
    hard: "linear-gradient(135deg, #ffafcc, #cdb4db)",
    button: "linear-gradient(135deg, #ff9aa2, #ffb7b2, #ffdac1)",
    accent: "#ff9e93",
    text: "#5a5a72"
  };

  return (
    <div
      className="min-h-screen text-gray-800 p-4 flex flex-col items-center justify-center font-sans overflow-hidden relative"
      style={{ background: colors.background }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, ${['#ff9aa2', '#ffb7b2', '#ffdac1'][i % 3]} 0%, transparent 70%)`,
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 50],
              y: [0, (Math.random() - 0.5) * 50],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Confetti effect when game is completed */}
      {gameCompleted && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          colors={['#FFD6FF', '#E7C6FF', '#C8B6FF', '#B8C0FF', '#BBD0FF']}
        />
      )}

      <motion.div
        className="max-w-4xl w-full bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border-4 border-white"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 5, 0] }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <Sparkles className="text-pink-400 w-10 h-10" />
              <Palette className="text-blue-400 w-10 h-10" />
              <Heart className="text-red-400 w-10 h-10" />
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-2"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                background: "linear-gradient(90deg, #FF9E93 0%, #FFB6C1 30%, #87CEEB 70%, #98D8C0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Pastel Memory Match
            </motion.h1>
            <motion.p
              className="text-lg text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Match pairs of cards to win the game
            </motion.p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <motion.div
              className="bg-white px-4 py-3 rounded-xl flex items-center shadow-lg border-2 border-blue-100"
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Clock className="text-blue-400 mr-2 w-6 h-6" />
              <span className="font-bold text-blue-600">{formatTime(timer)}</span>
            </motion.div>

            <motion.div
              className="bg-white px-4 py-3 rounded-xl flex items-center shadow-lg border-2 border-green-100"
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCw className="text-green-400 mr-2 w-6 h-6" />
              <span className="font-bold text-green-600">{moves} moves</span>
            </motion.div>

            <motion.div
              className="bg-white px-4 py-3 rounded-xl flex items-center shadow-lg border-2 border-yellow-100"
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star className="text-yellow-400 mr-2 w-6 h-6" />
              <span className="font-bold text-yellow-600">{score} points</span>
            </motion.div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <motion.button
              className={`px-5 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${difficulty === 'easy'
                ? 'text-white shadow-green-300'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              style={{ background: difficulty === 'easy' ? colors.easy : 'white' }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setDifficulty('easy');
                setTimeout(startNewGame, 300);
              }}
            >
              <span className="flex items-center">
                <Leaf className="mr-2 w-4 h-4" />
                Easy
              </span>
            </motion.button>

            <motion.button
              className={`px-5 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${difficulty === 'medium'
                ? 'text-white shadow-orange-300'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              style={{ background: difficulty === 'medium' ? colors.medium : 'white' }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setDifficulty('medium');
                setTimeout(startNewGame, 300);
              }}
            >
              <span className="flex items-center">
                <Flower className="mr-2 w-4 h-4" />
                Medium
              </span>
            </motion.button>

            <motion.button
              className={`px-5 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${difficulty === 'hard'
                ? 'text-white shadow-purple-300'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              style={{ background: difficulty === 'hard' ? colors.hard : 'white' }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setDifficulty('hard');
                setTimeout(startNewGame, 300);
              }}
            >
              <span className="flex items-center">
                <Gem className="mr-2 w-4 h-4" />
                Hard
              </span>
            </motion.button>
          </div>

          <div className="flex justify-center mb-8">
            <motion.button
              className="px-7 py-3 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-xl flex items-center gap-2"
              style={{ background: colors.button }}
              whileHover={{
                scale: 1.05,
                y: -3,
                boxShadow: "0 10px 25px rgba(255, 154, 162, 0.4)"
              }}
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
            } gap-4 md:gap-5 justify-center`}>
            {cards.map(card => (
              <motion.div
                key={card.id}
                onClick={() => flipCard(card.id)}
                className={`aspect-square cursor-pointer relative`}
                style={{ perspective: '1000px' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className={`absolute inset-0 rounded-2xl shadow-lg flex items-center justify-center text-4xl transition-all duration-300 ${card.isFlipped || card.isMatched
                    ? 'opacity-0 rotate-y-90'
                    : 'opacity-100 rotate-y-0'
                    }`}
                  style={{ background: colors.cardBack }}
                  animate={{
                    rotateY: card.isFlipped || card.isMatched ? 90 : 0,
                    opacity: card.isFlipped || card.isMatched ? 0 : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center text-white"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Cherry className="w-8 h-8 opacity-80" />
                  </motion.div>
                </motion.div>

                <motion.div
                  className={`absolute inset-0 rounded-2xl shadow-lg flex items-center justify-center text-4xl md:text-5xl ${card.isMatched
                    ? 'bg-gradient-to-br from-green-100 to-green-200 border-4 border-green-300'
                    : 'bg-white'
                    }`}
                  animate={{
                    rotateY: card.isFlipped || card.isMatched ? 0 : -90,
                    opacity: card.isFlipped || card.isMatched ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.span
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: card.isMatched ? [0, 10, -10, 0] : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {card.icon}
                  </motion.span>

                  {card.isMatched && (
                    <motion.div
                      className="absolute -top-2 -right-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, 360] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Star className="w-6 h-6 text-yellow-400 fill-yellow-200" />
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Win screen */}
          <AnimatePresence>
            {gameCompleted && (
              <motion.div
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-gradient-to-br from-pink-100 to-blue-100 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl border-4 border-white"
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  <motion.div
                    className="mb-6"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Trophy className="w-20 h-20 mx-auto text-yellow-500 fill-yellow-300" />
                  </motion.div>

                  <motion.h2
                    className="text-3xl font-bold mb-6 text-gray-800"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                      You Win! 🎉
                    </span>
                  </motion.h2>

                  <motion.div
                    className="space-y-4 mb-8 text-gray-700 bg-white/80 rounded-xl p-5 border-2 border-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="flex justify-between items-center text-lg">
                      <span className="flex items-center text-blue-600 font-medium">
                        <Clock className="mr-3 w-5 h-5" /> Time:
                      </span>
                      <span className="font-bold">{formatTime(timer)}</span>
                    </p>
                    <p className="flex justify-between items-center text-lg">
                      <span className="flex items-center text-green-600 font-medium">
                        <RotateCw className="mr-3 w-5 h-5" /> Moves:
                      </span>
                      <span className="font-bold">{moves}</span>
                    </p>
                    <p className="flex justify-between items-center text-lg">
                      <span className="flex items-center text-yellow-600 font-medium">
                        <Star className="mr-3 w-5 h-5" /> Score:
                      </span>
                      <span className="font-bold text-purple-700 text-xl">{score}</span>
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      className="px-7 py-4 text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-3 text-lg shadow-lg mx-auto"
                      style={{ background: colors.button }}
                      whileHover={{
                        scale: 1.05,
                        y: -3,
                        boxShadow: "0 10px 25px rgba(255, 154, 162, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startNewGame}
                    >
                      <RotateCw className="w-6 h-6" />
                      Play Again
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white/80 p-4 text-center text-gray-600 text-sm border-t-2 border-white">
          <div className="flex items-center justify-center gap-1">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-400 fill-red-300" />
            <span>using React, TypeScript & TailwindCSS</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MemoryCardGame;