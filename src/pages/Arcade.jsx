import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy, Skull } from 'lucide-react';
import { useToast } from '../components/TacticalToast';

// CONFIG
const GRID_SIZE = 20;
const SPEED_INITIAL = 150;
const MIN_SWIPE_DISTANCE = 30; // Minimum pixels to register a swipe

export default function Arcade() {
    const toast = useToast();

    // Game State
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 5 });
    const [direction, setDirection] = useState('RIGHT');
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(
        parseInt(localStorage.getItem('ARCADE_HIGHSCORE')) || 0
    );
    const [isPlaying, setIsPlaying] = useState(false);
    const gameLoopRef = useRef();

    // Touch State for Swipe Detection
    const touchStartRef = useRef(null);
    const touchEndRef = useRef(null);

    // --- GAME ENGINE ---
    useEffect(() => {
        if (isPlaying && !gameOver) {
            gameLoopRef.current = setInterval(moveSnake, Math.max(50, SPEED_INITIAL - (score * 2)));
        } else {
            clearInterval(gameLoopRef.current);
        }
        return () => clearInterval(gameLoopRef.current);
    }, [isPlaying, gameOver, snake, direction]);

    // Keyboard Controls (Fixed Scrolling Issue)
    useEffect(() => {
        const handleKey = (e) => {
            // Prevent default browser scrolling for arrow keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            switch (e.key) {
                case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
                case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
                case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
                case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [direction]);

    // --- TOUCH / SWIPE CONTROLS ---
    const onTouchStart = (e) => {
        touchEndRef.current = null;
        touchStartRef.current = {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        };
    };

    const onTouchMove = (e) => {
        touchEndRef.current = {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        };
    };

    const onTouchEnd = () => {
        if (!touchStartRef.current || !touchEndRef.current) return;

        const distanceX = touchStartRef.current.x - touchEndRef.current.x;
        const distanceY = touchStartRef.current.y - touchEndRef.current.y;
        const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

        if (isHorizontal) {
            // Horizontal Swipe
            if (Math.abs(distanceX) > MIN_SWIPE_DISTANCE) {
                if (distanceX > 0 && direction !== 'RIGHT') {
                    setDirection('LEFT');
                } else if (distanceX < 0 && direction !== 'LEFT') {
                    setDirection('RIGHT');
                }
            }
        } else {
            // Vertical Swipe
            if (Math.abs(distanceY) > MIN_SWIPE_DISTANCE) {
                if (distanceY > 0 && direction !== 'DOWN') {
                    setDirection('UP');
                } else if (distanceY < 0 && direction !== 'UP') {
                    setDirection('DOWN');
                }
            }
        }
    };

    // Logic: Move
    const moveSnake = () => {
        const newSnake = [...snake];
        const head = { ...newSnake[0] };

        switch (direction) {
            case 'UP': head.y -= 1; break;
            case 'DOWN': head.y += 1; break;
            case 'LEFT': head.x -= 1; break;
            case 'RIGHT': head.x += 1; break;
        }

        // Collision: Walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            return handleGameOver();
        }

        // Collision: Self
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
            return handleGameOver();
        }

        newSnake.unshift(head); // Add new head

        // Eat Food
        if (head.x === food.x && head.y === food.y) {
            setScore(s => s + 1);
            spawnFood();
        } else {
            newSnake.pop(); // Remove tail
        }

        setSnake(newSnake);
    };

    const spawnFood = () => {
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        setFood({ x, y });
    };

    const handleGameOver = () => {
        setGameOver(true);
        setIsPlaying(false);
        toast.error("CONNECTION SEVERED: SYNCHRONIZATION FAILED");
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('ARCADE_HIGHSCORE', score);
            toast.success("NEW RECORD ESTABLISHED!");
        }
    };

    const resetGame = () => {
        setSnake([{ x: 10, y: 10 }]);
        setScore(0);
        setGameOver(false);
        setDirection('RIGHT');
        setIsPlaying(true);
        toast.info("NEURAL LINK ESTABLISHED...");
    };

    return (
        <div
            className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-lg mx-auto p-4 touch-none"
            // Attach touch listeners to the main container
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >

            {/* HEADER HUD */}
            <div className="w-full flex items-center justify-between mb-6 bg-void-800 border border-white/10 p-4 clip-chamfer select-none">
                <div>
                    <h1 className="font-mech font-bold text-2xl text-white uppercase tracking-widest">
                        Reflex <span className="text-cyber">Trainer</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-code">V 1.0.4 // SWIPE_ENABLED</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-code uppercase">Peak Sync</p>
                    <p className="text-xl font-mech font-bold text-amber-400 flex items-center justify-end gap-2">
                        <Trophy size={16} /> {highScore}
                    </p>
                </div>
            </div>

            {/* GAME BOARD */}
            <div className="relative bg-void-950 border-2 border-void-700 shadow-2xl shadow-cyber/10 p-1 clip-chamfer select-none">

                {/* Grid Container */}
                <div
                    className="grid gap-px bg-void-900"
                    style={{
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                        width: 'min(90vw, 400px)',
                        height: 'min(90vw, 400px)'
                    }}
                >
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);

                        const isSnake = snake.some(s => s.x === x && s.y === y);
                        const isHead = snake[0].x === x && snake[0].y === y;
                        const isFood = food.x === x && food.y === y;

                        return (
                            <div
                                key={i}
                                className={`w-full h-full transition-colors duration-100 border-[0.5px] border-white/5
                  ${isHead ? 'bg-cyber shadow-[0_0_10px_#00f0ff] z-10' :
                                        isSnake ? 'bg-cyber/60' :
                                            isFood ? 'bg-flux animate-pulse shadow-[0_0_10px_#ff003c]' :
                                                'bg-transparent'}
                `}
                            />
                        );
                    })}
                </div>

                {/* OVERLAYS */}
                {(!isPlaying && !gameOver) && (
                    <div className="absolute inset-0 bg-void-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                        <button
                            onClick={resetGame}
                            className="group px-8 py-4 bg-cyber text-void-950 font-mech font-bold text-xl uppercase tracking-widest clip-chamfer hover:bg-white transition-all hover:scale-105"
                        >
                            <span className="flex items-center gap-2"><Play size={24} /> Initialize</span>
                        </button>
                        <p className="mt-4 text-cyber/60 font-code text-xs">PRESS SPACE / TAP TO START</p>
                    </div>
                )}

                {gameOver && (
                    <div className="absolute inset-0 bg-flux/10 backdrop-blur-md flex flex-col items-center justify-center z-20 border-2 border-flux">
                        <Skull size={48} className="text-flux mb-4 animate-bounce" />
                        <h2 className="text-3xl font-mech font-bold text-white mb-2">SYNC LOST</h2>
                        <p className="font-code text-flux mb-6">SCORE: {score}</p>
                        <button
                            onClick={resetGame}
                            className="px-6 py-3 bg-flux text-white font-bold font-mech uppercase tracking-widest clip-chamfer hover:bg-red-600 transition"
                        >
                            <span className="flex items-center gap-2"><RotateCcw size={18} /> Reboot</span>
                        </button>
                    </div>
                )}
            </div>

            {/* SCORE DISPLAY */}
            <div className="w-full max-w-[400px] flex justify-between items-center mt-4 px-2 select-none">
                <div className="font-code text-cyber text-lg">SCORE: <span className="font-bold">{score}</span></div>
                <div className="text-[10px] text-slate-500 font-code flex items-center gap-1">
                    STATUS: <span className={isPlaying ? "text-green-500 animate-pulse" : "text-red-500"}>{isPlaying ? 'CONNECTED' : 'OFFLINE'}</span>
                </div>
            </div>

            {/* NOTE: Mobile Buttons Removed in favor of Swipe Controls */}
            <div className="md:hidden mt-6 text-center">
                <p className="text-[10px] text-slate-500 font-code animate-pulse">
            // SWIPE SCREEN TO DIRECT NEURAL LINK
                </p>
            </div>

        </div>
    );
}