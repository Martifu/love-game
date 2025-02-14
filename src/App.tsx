import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const LEVEL_WIDTH = 1380;
  const INITIAL_POSITION = 100;
  const LETTER_POSITION = LEVEL_WIDTH - 150;
  const MOVEMENT_SPEED = 3;

  const [position, setPosition] = useState(INITIAL_POSITION);
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [spriteIndex, setSpriteIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  const lastTimeRef = useRef(0);

  const characterSprites = [
    'https://github.com/Martifu/chat-client/blob/master/run1.png?raw=true',
    'https://github.com/Martifu/chat-client/blob/master/run2.png?raw=true',
    'https://github.com/Martifu/chat-client/blob/master/run3.png?raw=true',
    'https://github.com/Martifu/chat-client/blob/master/run4.png?raw=true',
    'https://github.com/Martifu/chat-client/blob/master/run5.png?raw=true',
    'https://github.com/Martifu/chat-client/blob/master/run6.png?raw=true',
  ];

  const standingSprite =
    'https://github.com/Martifu/chat-client/blob/master/stant.png?raw=true';

  // Pre-cargar imágenes para evitar retrasos en la animación
  useEffect(() => {
    const images = [...characterSprites, standingSprite];
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const frameInterval = 100; // Intervalo de cambio de sprite (ms)

    const animate = (currentTime: number) => {
      if (!isMoving) return;

      // Actualizar sprite cada 'frameInterval' ms
      if (currentTime - lastTimeRef.current > frameInterval) {
        setSpriteIndex((prev) => (prev + 1) % characterSprites.length);
        lastTimeRef.current = currentTime;
      }

      // Actualizar posición del personaje
      setPosition((prev) => {
        const newPos =
          direction === 'right'
            ? Math.min(prev + MOVEMENT_SPEED, LETTER_POSITION)
            : Math.max(prev - MOVEMENT_SPEED, INITIAL_POSITION);

        // Si alcanza la posición de la carta, se detiene y se muestra el mensaje
        if (newPos >= LETTER_POSITION) {
          setShowMessage(true);
          setIsMoving(false);
        }
        return newPos;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    if (isMoving) {
      lastTimeRef.current = performance.now();
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isMoving, direction, characterSprites.length]);

  const handleMove = (dir: 'left' | 'right') => {
    setDirection(dir);
    setIsMoving(true);
  };

  const handleStop = () => {
    setIsMoving(false);
    setSpriteIndex(0);
  };

  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col items-center justify-between p-4 overflow-hidden">
      <div className="relative w-full h-full overflow-hidden">
        {/* Background */}
        <div
          className="absolute h-full"
          style={{
            width: `${LEVEL_WIDTH}px`,
            backgroundImage: `url('https://github.com/Martifu/chat-client/blob/master/background.jpg?raw=true')`,
            transform: `translateX(${-position + INITIAL_POSITION}px)`,
            imageRendering: 'pixelated',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'transform 0.05s linear',
          }}
        />

        {/* Personaje */}
        <div
          className="absolute bottom-[10%] left-[100px] z-10"
          style={{
            transform: `scaleX(${direction === 'left' ? -1 : 1})`,
            width: '64px',
            height: '64px',
          }}
        >
          <img
            key={spriteIndex} // Forzamos el re-render con cada cambio de spriteIndex
            src={
              isMoving
                ? // Agregamos un query string para "romper" la caché si es necesario
                  `${characterSprites[spriteIndex]}&sprite=${spriteIndex}`
                : standingSprite
            }
            alt="character"
            className="w-full h-full"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Carta flotante */}
        <div
          className="absolute bottom-[10%] z-10"
          style={{
            transform: `translateX(${
              LETTER_POSITION - position + INITIAL_POSITION
            }px)`,
            transition: 'transform 0.05s linear',
          }}
        >
          <img
            src="https://github.com/Martifu/chat-client/blob/master/carta.png?raw=true"
            alt="letter"
            className="w-12 h-12 animate-bounce"
            style={{ imageRendering: 'pixelated', height: '35px' }}
          />
        </div>
      </div>

      {/* Controles */}
      <div className="flex gap-8 mt-4 z-20">
        <button
          className="bg-blue-500 p-4 rounded-full text-white hover:bg-blue-600 active:bg-blue-700 touch-none"
          onMouseDown={() => handleMove('left')}
          onMouseUp={handleStop}
          onMouseLeave={handleStop}
          onTouchStart={() => handleMove('left')}
          onTouchEnd={handleStop}
        >
          <ChevronLeft size={32} />
        </button>
        <button
          className="bg-blue-500 p-4 rounded-full text-white hover:bg-blue-600 active:bg-blue-700 touch-none"
          onMouseDown={() => handleMove('right')}
          onMouseUp={handleStop}
          onMouseLeave={handleStop}
          onTouchStart={() => handleMove('right')}
          onTouchEnd={handleStop}
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Modal de mensaje */}
      {showMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4">
              ¡Has encontrado la carta!
            </h2>
            <p className="text-lg mb-4">
              ¡Felicitaciones por completar el nivel!
            </p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => {
                setShowMessage(false);
                setPosition(INITIAL_POSITION);
              }}
            >
              Jugar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
