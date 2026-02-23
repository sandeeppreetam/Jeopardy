import React, { useState } from 'react';
import { GameState, Player, Topic, GameSettings, HistoryItem } from './types';
import { generateQuestions } from './services/geminiService';
import SetupScreen from './components/SetupScreen';
import TopicScreen from './components/TopicScreen';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import QuestionModal from './components/QuestionModal';
import GameOverScreen from './components/GameOverScreen';
import HistoryPanel from './components/HistoryPanel';

const STORAGE_KEY = 'jeopardy_used_questions';
const MAX_STORED = 300; // cap so localStorage doesn't bloat

interface UsedQuestion {
  category: string;   // normalised to lowercase
  answer: string;
  question: string;
}

function loadUsedQuestions(): UsedQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsedQuestions(incoming: UsedQuestion[]) {
  try {
    const existing = loadUsedQuestions();
    // Deduplicate by answer+category, newest wins, keep under cap
    const map = new Map<string, UsedQuestion>();
    [...existing, ...incoming].forEach(q => {
      map.set(`${q.category}::${q.answer.toLowerCase()}`, q);
    });
    const trimmed = Array.from(map.values()).slice(-MAX_STORED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage unavailable — silently skip
  }
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    numTopics: 4,
    numQuestionsPerTopic: 4,
    timerSeconds: 30,
    gameMode: 'basic'
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [gameTheme, setGameTheme] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<{ topicIdx: number; qIdx: number } | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Preparing Session...");

  const handleSetupComplete = (newPlayers: Player[], settings: GameSettings) => {
    setPlayers(newPlayers);
    setGameSettings(settings);
    setGameState(GameState.TOPICS);
  };

  const handleTopicsComplete = async (topicNames: string[]) => {
    setGameState(GameState.LOADING);
    setLoadingMessage("Generating Question Board...");
    try {
      // Read exclusion list from localStorage before generating
      const usedQuestions = loadUsedQuestions();

      const { topics: generated, theme } = await generateQuestions(
        topicNames,
        gameSettings.numQuestionsPerTopic,
        usedQuestions
      );

      // Persist the newly generated questions so they're excluded next time
      const toStore: UsedQuestion[] = generated.flatMap(topic =>
        topic.questions.map(q => ({
          category: topic.title.toLowerCase(),
          answer: q.answer,
          question: q.question,
        }))
      );
      saveUsedQuestions(toStore);

      setTopics(generated);
      setGameTheme(theme);
      setGameState(GameState.PLAYING);
    } catch (error) {
      console.error("Failed to generate questions:", error);
      alert("Something went wrong with the trivia engine. Please try again.");
      setGameState(GameState.TOPICS);
    }
  };

  const handleSelectQuestion = (topicIdx: number, qIdx: number) => {
    setSelectedQuestion({ topicIdx, qIdx });
  };

  const updateScore = (pointsChange: number, result: 'correct' | 'wrong' | 'pass', isSpeedBonus = false) => {
    if (!selectedQuestion) return;

    const currentTopic = topics[selectedQuestion.topicIdx];
    const currentPlayer = players[currentPlayerIndex];

    const historyEntry: HistoryItem = {
      id: `h-${Date.now()}`,
      playerName: currentPlayer.name,
      playerColor: currentPlayer.color,
      topicTitle: currentTopic.title,
      points: pointsChange,
      result,
      questionText: topics[selectedQuestion.topicIdx].questions[selectedQuestion.qIdx].question,
      answerText: topics[selectedQuestion.topicIdx].questions[selectedQuestion.qIdx].answer,
      speedBonus: isSpeedBonus
    };
    setHistory(prev => [...prev, historyEntry]);

    const newPlayers = [...players];
    const p = newPlayers[currentPlayerIndex];
    p.score += Math.round(pointsChange);
    if (result === 'correct') p.correctCount++;
    if (result === 'wrong') p.wrongCount++;
    if (result === 'pass') p.passCount++;
    setPlayers(newPlayers);

    const newTopics = [...topics];
    newTopics[selectedQuestion.topicIdx].questions[selectedQuestion.qIdx].isAnswered = true;
    setTopics(newTopics);

    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setSelectedQuestion(null);
    const newAnsweredCount = answeredCount + 1;
    setAnsweredCount(newAnsweredCount);

    if (newAnsweredCount === (gameSettings.numTopics * gameSettings.numQuestionsPerTopic)) {
      setGameState(GameState.FINISHED);
    }
  };

  const handleLifelineUsed = (type: 'freeze' | 'hint' | 'double') => {
    const newPlayers = [...players];
    const p = newPlayers[currentPlayerIndex];
    if (type === 'freeze') p.lifelines.freezeUsed = true;
    if (type === 'hint') p.lifelines.hintUsed = true;
    if (type === 'double') p.lifelines.doubleUsed = true;
    setPlayers(newPlayers);
  };

  const handleRestart = () => {
    setGameState(GameState.SETUP);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setTopics([]);
    setGameTheme('');
    setAnsweredCount(0);
    setHistory([]);
    setSelectedQuestion(null);
  };

  return (
    <div className="min-h-screen py-16 px-6 md:px-12 flex flex-col items-center">
      <header className="mb-16 text-center animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-[0.3em] uppercase mb-4">
          JEOPARDY
        </h1>
        <div className="h-0.5 w-16 bg-[#C0C0C0] mx-auto mb-4" />
        <p className="text-gray-600 font-black tracking-[0.4em] uppercase text-[10px]">
          Think fast, wager faster.
        </p>
      </header>

      <main className="w-full max-w-7xl flex-grow flex items-center justify-center">
        {gameState === GameState.SETUP && (
          <SetupScreen onComplete={handleSetupComplete} />
        )}

        {gameState === GameState.TOPICS && (
          <TopicScreen 
            numTopics={gameSettings.numTopics}
            onComplete={handleTopicsComplete} 
            onBack={() => setGameState(GameState.SETUP)} 
          />
        )}

        {gameState === GameState.LOADING && (
          <div className="flex flex-col items-center gap-8 py-20">
            <div className="w-12 h-12 border border-[#C0C0C0]/30 border-t-[#C0C0C0] rounded-full animate-spin"></div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.5em] animate-pulse">{loadingMessage}</p>
          </div>
        )}

        {gameState === GameState.PLAYING && (
          <div className="w-full flex flex-col items-center">
            <ScoreBoard players={players} currentPlayerIndex={currentPlayerIndex} />
            
            {gameTheme && (
              <div className="mb-6 px-6 py-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <i className="fas fa-sparkles text-purple-400"></i>
                  <div>
                    <span className="text-[8px] text-purple-400 font-black uppercase tracking-wider">Game Theme</span>
                    <p className="text-sm text-white font-medium">{gameTheme}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="w-full flex flex-col lg:flex-row gap-12 items-start justify-center mt-4">
              <div className="flex-1 w-full order-2 lg:order-1">
                <GameBoard topics={topics} onSelectQuestion={handleSelectQuestion} />
              </div>
              
              <div className="w-full lg:w-auto order-1 lg:order-2 shrink-0">
                <HistoryPanel history={history} />
              </div>
            </div>
            
            {selectedQuestion && (
              <QuestionModal 
                question={topics[selectedQuestion.topicIdx].questions[selectedQuestion.qIdx]}
                currentPlayer={players[currentPlayerIndex]}
                timerSeconds={gameSettings.timerSeconds}
                gameMode={gameSettings.gameMode}
                onCorrect={(finalPoints, isSpeedBonus) => updateScore(finalPoints, 'correct', isSpeedBonus)}
                onWrong={(penalty) => updateScore(penalty, 'wrong')}
                onPass={(penalty) => updateScore(penalty, 'pass')}
                onLifelineUsed={handleLifelineUsed}
              />
            )}
          </div>
        )}

        {gameState === GameState.FINISHED && (
          <GameOverScreen players={players} onRestart={handleRestart} />
        )}
      </main>

      <footer className="mt-24 text-gray-700 text-[8px] uppercase font-black tracking-[0.6em] flex items-center gap-8">
        <span>Built by Sandeep Preetam Saila</span>
      </footer>
    </div>
  );
};

export default App;