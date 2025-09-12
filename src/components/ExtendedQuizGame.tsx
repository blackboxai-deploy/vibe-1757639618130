"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
  difficulty: 'fácil' | 'medio' | 'difícil';
}

interface QuizGameProps {
  onClose: () => void;
  onComplete?: (score: number, timeSpent: number, questionsTotal: number) => void;
}

export default function QuizGame({ onClose, onComplete }: QuizGameProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameMode, setGameMode] = useState<'practice' | 'exam' | 'speed'>('practice');
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [autoAdvance, setAutoAdvance] = useState<NodeJS.Timeout | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState<boolean>(false);
  const [quizVariation, setQuizVariation] = useState<'all' | 'recent' | 'difficult' | 'random10'>('random10');

  const questions: QuizQuestion[] = useMemo(() => [
    {
      id: "q1",
      question: "¿Cuáles son los componentes de la tríada cognitiva según el modelo cognitivo?",
      options: [
        "Pensamiento, emoción, conducta",
        "Consciente, preconsciente, inconsciente",
        "Ello, yo, superyó",
        "Estímulo, respuesta, refuerzo"
      ],
      correct: 0,
      explanation: "La tríada cognitiva incluye cognición (pensamientos), afecto (emociones) y conducta (acciones).",
      category: "Modelo Cognitivo",
      difficulty: "medio"
    },
    {
      id: "q2",
      question: "Según Skinner, ¿qué tipo de condicionamiento utiliza consecuencias para modificar la conducta?",
      options: [
        "Condicionamiento clásico",
        "Condicionamiento operante",
        "Aprendizaje observacional",
        "Condicionamiento reflexivo"
      ],
      correct: 1,
      explanation: "El condicionamiento operante de Skinner utiliza refuerzos y castigos como consecuencias para modificar la conducta.",
      category: "Conductismo",
      difficulty: "fácil"
    },
    {
      id: "q3",
      question: "¿Cuáles son los tres niveles de la cultura según Schein?",
      options: [
        "Individual, grupal, organizacional",
        "Artefactos, valores, presunciones básicas",
        "Consciente, preconsciente, inconsciente",
        "Formal, informal, social"
      ],
      correct: 1,
      explanation: "Schein define tres niveles: artefactos/creaciones (visible), valores (conscientes) y presunciones básicas (inconscientes).",
      category: "Cultura Organizacional",
      difficulty: "medio"
    },
    {
      id: "q4",
      question: "¿Qué son las neuronas espejo según Goleman?",
      options: [
        "Células que controlan los movimientos",
        "Base neurológica para la resonancia emocional y empatía",
        "Neuronas que procesan información visual",
        "Células responsables de la memoria"
      ],
      correct: 1,
      explanation: "Las neuronas espejo son la base neurológica para la resonancia emocional y la empatía según Goleman.",
      category: "Inteligencia Social",
      difficulty: "difícil"
    },
    {
      id: "q5",
      question: "¿Cuáles son las seis emociones básicas universales?",
      options: [
        "Amor, odio, miedo, alegría, tristeza, sorpresa",
        "Ira, miedo, tristeza, felicidad, repugnancia, sorpresa",
        "Ansiedad, depresión, euforia, calma, ira, confusión",
        "Placer, dolor, excitación, relajación, tensión, alivio"
      ],
      correct: 1,
      explanation: "Las seis emociones básicas universales son: ira, miedo, tristeza, felicidad, repugnancia y sorpresa.",
      category: "Emociones",
      difficulty: "medio"
    },
    {
      id: "q6",
      question: "¿Qué es la disonancia cognitiva?",
      options: [
        "Tener múltiples pensamientos simultáneos",
        "Inconsistencia entre actitudes y conductas",
        "Pérdida de memoria a corto plazo",
        "Dificultad para tomar decisiones"
      ],
      correct: 1,
      explanation: "La disonancia cognitiva es la inconsistencia entre actitudes y conductas, que se reduce según importancia, influencia y recompensas.",
      category: "Actitudes",
      difficulty: "medio"
    },
    {
      id: "q7",
      question: "Según la Gestalt, ¿qué principio explica que percibimos totalidades completas?",
      options: [
        "Ley de cierre",
        "Ley de buena forma",
        "Ley de proximidad",
        "Todas las anteriores"
      ],
      correct: 3,
      explanation: "La Gestalt establece múltiples leyes (buena forma, cierre, semejanza, proximidad, continuidad) que explican cómo percibimos totalidades.",
      category: "Gestalt",
      difficulty: "difícil"
    },
    {
      id: "q8",
      question: "¿Cuáles son los cinco grandes factores de personalidad?",
      options: [
        "Introversión, neuroticismo, creatividad, sociabilidad, impulsividad",
        "Extroversión, afabilidad, meticulosidad, estabilidad emocional, apertura",
        "Optimismo, pesimismo, realismo, idealismo, pragmatismo",
        "Liderazgo, seguimiento, independencia, dependencia, autonomía"
      ],
      correct: 1,
      explanation: "Los cinco grandes son: extroversión, afabilidad, meticulosidad, estabilidad emocional y apertura.",
      category: "Personalidad",
      difficulty: "medio"
    },
    {
      id: "q9",
      question: "¿Qué proceso describe la institucionalización según Berger y Luckmann?",
      options: [
        "Creación, desarrollo, consolidación",
        "Externalización, objetivación, internalización",
        "Planificación, implementación, evaluación",
        "Inicio, crecimiento, madurez"
      ],
      correct: 1,
      explanation: "El proceso dialéctico de institucionalización incluye: externalización, objetivación e internalización.",
      category: "Institucionalización",
      difficulty: "difícil"
    },
    {
      id: "q10",
      question: "¿Qué caracteriza al aprendizaje observacional de Bandura?",
      options: [
        "Requiere refuerzo inmediato",
        "Solo funciona con castigos",
        "Adquisición por observación y ejecución posterior",
        "Necesita repetición constante"
      ],
      correct: 2,
      explanation: "El aprendizaje observacional de Bandura se caracteriza por la adquisición por observación y ejecución posterior.",
      category: "Conductismo",
      difficulty: "medio"
    },
    // NUEVAS PREGUNTAS AGREGADAS
    {
      id: "q11",
      question: "¿Cuál es la diferencia entre trabajo emocional superficial y profundo?",
      options: [
        "No hay diferencia real",
        "Superficial es actuar, profundo es sentir realmente",
        "Superficial es fácil, profundo es difícil",
        "Superficial es público, profundo es privado"
      ],
      correct: 1,
      explanation: "La actuación superficial implica fingir emociones, mientras que la profunda busca realmente sentir las emociones apropiadas para la situación.",
      category: "Emociones",
      difficulty: "medio"
    },
    {
      id: "q12",
      question: "¿Qué son las células fusiformes según Goleman?",
      options: [
        "Células que procesan memoria",
        "Células que facilitan respuestas rápidas en interacción social",
        "Células que controlan movimientos",
        "Células que regulan emociones"
      ],
      correct: 1,
      explanation: "Las células fusiformes facilitan respuestas rápidas y adecuadas en la interacción social, siendo parte del sistema neurológico del liderazgo.",
      category: "Inteligencia Social",
      difficulty: "difícil"
    },
    {
      id: "q13",
      question: "¿Qué es la reificación según Berger y Luckmann?",
      options: [
        "El proceso de crear instituciones",
        "Ocultar el origen humano de las instituciones",
        "La legitimación de normas",
        "La internalización de valores"
      ],
      correct: 1,
      explanation: "La reificación es cuando ocultamos u olvidamos el origen humano de las instituciones, haciéndolas parecer naturales e inmutables.",
      category: "Institucionalización",
      difficulty: "difícil"
    },
    {
      id: "q14",
      question: "¿Cuáles son los axiomas de comunicación de la TGS?",
      options: [
        "Hablar, escuchar, entender",
        "Es imposible no comunicar; contenido/relación; digital/analógica",
        "Emisor, receptor, mensaje",
        "Verbal, no verbal, paraverbal"
      ],
      correct: 1,
      explanation: "Los axiomas incluyen: es imposible no comunicar, toda comunicación tiene contenido y relación, y puede ser digital (verbal) o analógica (no verbal).",
      category: "Comunicación Sistémica",
      difficulty: "medio"
    },
    {
      id: "q15",
      question: "¿Qué es el escalamiento del compromiso?",
      options: [
        "Aumentar la motivación gradualmente",
        "Persistir en decisiones fallidas por inversión previa",
        "Comprometerse más con el trabajo",
        "Escalar responsabilidades"
      ],
      correct: 1,
      explanation: "El escalamiento del compromiso es cuando persistimos en decisiones fallidas porque ya invertimos tiempo, dinero o esfuerzo en ellas.",
      category: "Toma de Decisiones",
      difficulty: "difícil"
    },
    {
      id: "q16",
      question: "¿Qué son los osciladores según Goleman?",
      options: [
        "Neuronas que controlan el equilibrio",
        "Células que sincronizan movimientos y favorecen conexión",
        "Sistemas de control emocional",
        "Receptores de información social"
      ],
      correct: 1,
      explanation: "Los osciladores sincronizan movimientos corporales y favorecen la conexión interpersonal, siendo parte del sistema neurológico social.",
      category: "Inteligencia Social",
      difficulty: "difícil"
    },
    {
      id: "q17",
      question: "¿Qué es la causalidad ahistórica de Lewin?",
      options: [
        "Los eventos pasados no importan",
        "Importa la situación presente total, no la historia",
        "Cada situación es única",
        "No hay causas reales"
      ],
      correct: 1,
      explanation: "Para Lewin, la conducta se explica por la situación presente total (el espacio vital), no por la historia previa del individuo.",
      category: "Gestalt y Campo",
      difficulty: "difícil"
    },
    {
      id: "q18",
      question: "¿Cuáles son los mecanismos de defensa principales del psicoanálisis?",
      options: [
        "Ataque, huida, congelamiento",
        "Represión, negación, racionalización",
        "Amor, odio, indiferencia",
        "Consciente, preconsciente, inconsciente"
      ],
      correct: 1,
      explanation: "Los principales mecanismos de defensa incluyen represión (olvidar), negación (no aceptar) y racionalización (justificar), entre otros.",
      category: "Psicoanálisis",
      difficulty: "medio"
    },
    {
      id: "q19",
      question: "¿Qué es el sesgo de confirmación?",
      options: [
        "Confirmar todo lo que nos dicen",
        "Buscar información que confirme nuestras creencias previas",
        "Confirmar antes de decidir",
        "Necesitar confirmación de otros"
      ],
      correct: 1,
      explanation: "El sesgo de confirmación es nuestra tendencia a buscar, interpretar y recordar información que confirma nuestras creencias preexistentes.",
      category: "Sesgos Cognitivos",
      difficulty: "medio"
    },
    {
      id: "q20",
      question: "¿Qué caracteriza a una cultura organizacional fuerte vs débil?",
      options: [
        "Fuerte tiene más reglas, débil menos reglas",
        "Fuerte: valores compartidos ampliamente; Débil: valores diversos",
        "Fuerte es autoritaria, débil es democrática",
        "No hay diferencia real"
      ],
      correct: 1,
      explanation: "Una cultura fuerte tiene valores centrales compartidos ampliamente, mientras que una débil presenta valores diversos y menos consenso.",
      category: "Cultura Organizacional",
      difficulty: "medio"
    },
    // PREGUNTAS ADICIONALES 21-30
    {
      id: "q21",
      question: "¿Qué es la sedimentación según Berger y Luckmann?",
      options: [
        "Acumulación de experiencias en la memoria",
        "Proceso de olvido institucional",
        "Formación de capas sociales",
        "Cristalización de conocimiento colectivo"
      ],
      correct: 3,
      explanation: "La sedimentación es la cristalización del conocimiento colectivo que se transmite a través del lenguaje y se convierte en tradición.",
      category: "Institucionalización",
      difficulty: "difícil"
    },
    {
      id: "q22",
      question: "¿Cuál es la principal diferencia entre refuerzo positivo y negativo?",
      options: [
        "Positivo es bueno, negativo es malo",
        "Positivo suma algo deseado, negativo quita algo indeseado",
        "Positivo es para adultos, negativo para niños",
        "Positivo es voluntario, negativo es forzado"
      ],
      correct: 1,
      explanation: "El refuerzo positivo agrega un estímulo agradable, mientras que el refuerzo negativo elimina un estímulo desagradable. Ambos aumentan la probabilidad de la conducta.",
      category: "Conductismo",
      difficulty: "medio"
    },
    {
      id: "q23",
      question: "¿Qué son las valencias en la teoría de Lewin?",
      options: [
        "Valores personales",
        "Fuerzas de atracción o repulsión en el espacio vital",
        "Habilidades individuales",
        "Características de personalidad"
      ],
      correct: 1,
      explanation: "Las valencias son fuerzas de atracción (positivas) o repulsión (negativas) que los objetos o situaciones ejercen sobre la persona en su espacio vital.",
      category: "Gestalt y Campo",
      difficulty: "medio"
    },
    {
      id: "q24",
      question: "¿Qué es el sesgo de anclaje?",
      options: [
        "Preferir opciones familiares",
        "Basar decisiones en la primera información recibida",
        "Evitar cambios de opinión",
        "Seguir a la mayoría"
      ],
      correct: 1,
      explanation: "El sesgo de anclaje ocurre cuando nos basamos excesivamente en la primera información (el 'ancla') al tomar decisiones posteriores.",
      category: "Sesgos Cognitivos",
      difficulty: "medio"
    },
    {
      id: "q25",
      question: "¿Cuáles son las dimensiones culturales de Hofstede?",
      options: [
        "Individual, grupal, organizacional",
        "Distancia al poder, individualismo/colectivismo, masculinidad/feminidad, incertidumbre, tiempo",
        "Formal, informal, mixta",
        "Alta, media, baja"
      ],
      correct: 1,
      explanation: "Hofstede identificó cinco dimensiones: distancia al poder, individualismo vs colectivismo, masculinidad vs feminidad, evitación de la incertidumbre y orientación temporal.",
      category: "Cultura Organizacional",
      difficulty: "medio"
    }
  ], []);

  const shuffledQuestions = useMemo(() => {
    let selectedQuestions = [...questions];
    
    // Aplicar variación de quiz
    switch (quizVariation) {
      case 'random10':
        selectedQuestions = selectedQuestions
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        break;
      case 'recent':
        // Últimas 15 preguntas agregadas (simulado)
        selectedQuestions = selectedQuestions.slice(-15);
        break;
      case 'difficult':
        selectedQuestions = selectedQuestions.filter(q => q.difficulty === 'difícil');
        if (selectedQuestions.length < 5) {
          // Si hay muy pocas difíciles, agregar algunas medias
          selectedQuestions = [
            ...selectedQuestions,
            ...questions.filter(q => q.difficulty === 'medio').slice(0, 10)
          ];
        }
        break;
      case 'all':
        selectedQuestions = [...questions];
        break;
    }
    
    return selectedQuestions.sort(() => Math.random() - 0.5);
  }, [questions, quizVariation]);

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'speed' && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameMode === 'speed' && !showResult) {
      handleTimeUp();
    }
  }, [gameState, gameMode, timeLeft, showResult]);

  const startGame = (mode: 'practice' | 'exam' | 'speed', variation?: 'all' | 'recent' | 'difficult' | 'random10') => {
    setGameMode(mode);
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(mode === 'speed' ? 15 : 30);
    setStartTime(Date.now());
    setAutoAdvanceEnabled(mode !== 'practice'); // Solo práctica permite control manual total
    
    if (variation) {
      setQuizVariation(variation);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === shuffledQuestions[currentQuestion].correct;
    setAnswers([...answers, isCorrect]);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    // Solo avanzar automáticamente si está habilitado
    if (!autoAdvanceEnabled) {
      return; // En modo práctica o si el usuario desactivó auto-avance
    }
    
    // En otros modos, dar más tiempo para leer la explicación
    const waitTime = isCorrect ? 3000 : 5000;
    
    const timeout = setTimeout(() => {
      if (currentQuestion < shuffledQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(gameMode === 'speed' ? 15 : 30);
      } else {
        completeQuiz();
      }
    }, waitTime);
    
    setAutoAdvance(timeout);
  };

  const handleTimeUp = () => {
    setAnswers([...answers, false]);
    setTimeout(() => {
      if (currentQuestion < shuffledQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(gameMode === 'speed' ? 15 : 30);
      } else {
        setGameState('results');
      }
    }, 1000);
  };

  const handleNextQuestion = () => {
    if (autoAdvance) {
      clearTimeout(autoAdvance);
      setAutoAdvance(null);
    }
    
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(gameMode === 'speed' ? 15 : 30);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60); // minutos
    const finalScore = Math.round((score / shuffledQuestions.length) * 100);
    
    // Callback para registrar la sesión
    if (onComplete) {
      onComplete(finalScore, timeSpent, shuffledQuestions.length);
    }
    
    setGameState('results');
  };

  const toggleAutoAdvance = () => {
    setAutoAdvanceEnabled(!autoAdvanceEnabled);
    if (autoAdvance) {
      clearTimeout(autoAdvance);
      setAutoAdvance(null);
    }
  };

  const restartGame = () => {
    setGameState('menu');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
  };

  const getScoreMessage = () => {
    const percentage = (score / shuffledQuestions.length) * 100;
    if (percentage >= 90) return "¡Excelente! 🏆 Estás muy bien preparado";
    if (percentage >= 70) return "¡Muy bien! 🌟 Buen dominio del tema";
    if (percentage >= 50) return "Bien 👍 Sigue practicando";
    return "Necesitas repasar más 📚 ¡Tú puedes!";
  };

  if (gameState === 'menu') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <Card className="w-full max-w-2xl mx-4">
          <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="w-8 h-8" />
                Quiz de Psicología ({questions.length} preguntas)
              </CardTitle>
              <Button onClick={onClose} variant="ghost" className="text-white hover:bg-white/10">
                ✕
              </Button>
            </div>
            <p className="text-purple-100">Pon a prueba tus conocimientos</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Selector de Variación */}
            <div>
              <h3 className="font-semibold mb-3">Tipo de Quiz:</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setQuizVariation('random10')}
                  variant={quizVariation === 'random10' ? 'default' : 'outline'}
                  size="sm"
                >
                  🎲 10 Aleatorias
                </Button>
                <Button
                  onClick={() => setQuizVariation('difficult')}
                  variant={quizVariation === 'difficult' ? 'default' : 'outline'}
                  size="sm"
                >
                  🔥 Solo Difíciles
                </Button>
                <Button
                  onClick={() => setQuizVariation('recent')}
                  variant={quizVariation === 'recent' ? 'default' : 'outline'}
                  size="sm"
                >
                  ⭐ Recientes
                </Button>
                <Button
                  onClick={() => setQuizVariation('all')}
                  variant={quizVariation === 'all' ? 'default' : 'outline'}
                  size="sm"
                >
                  📚 Todas ({questions.length})
                </Button>
              </div>
            </div>

            {/* Modos de Juego */}
            <div className="grid gap-4">
              <Button
                onClick={() => startGame('practice', quizVariation)}
                className="p-6 text-left bg-blue-50 border-2 border-blue-200 hover:border-blue-400 text-blue-800"
                variant="outline"
              >
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Modo Práctica</div>
                    <div className="text-sm text-blue-600">Control manual • Lee las explicaciones tranquilo</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => startGame('speed', quizVariation)}
                className="p-6 text-left bg-red-50 border-2 border-red-200 hover:border-red-400 text-red-800"
                variant="outline"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Modo Rápido</div>
                    <div className="text-sm text-red-600">15 segundos por pregunta • Entrenamiento intensivo</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => startGame('exam', quizVariation)}
                className="p-6 text-left bg-green-50 border-2 border-green-200 hover:border-green-400 text-green-800"
                variant="outline"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Simulacro de Examen</div>
                    <div className="text-sm text-green-600">30 segundos • Evaluación final</div>
                  </div>
                </div>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 text-center">
                💡 Selecciona el tipo de quiz y luego el modo de juego
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (gameState === 'playing') {
    const question = shuffledQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / shuffledQuestions.length) * 100;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <Card className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-600">
                Pregunta {currentQuestion + 1} de {shuffledQuestions.length}
              </div>
              <div className="flex items-center gap-4">
                {gameMode === 'speed' && (
                  <div className={`text-lg font-bold ${timeLeft <= 5 ? 'text-red-600' : 'text-blue-600'}`}>
                    ⏱️ {timeLeft}s
                  </div>
                )}
                <Button 
                  onClick={onClose} 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕ Salir
                </Button>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mb-3">
                {question.category}
              </span>
              <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                {question.question}
              </h2>
            </div>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                let buttonClass = "p-4 text-left border-2 rounded-lg transition-all duration-200 ";
                
                if (showResult) {
                  if (index === question.correct) {
                    buttonClass += "border-green-500 bg-green-50 text-green-800";
                  } else if (index === selectedAnswer && index !== question.correct) {
                    buttonClass += "border-red-500 bg-red-50 text-red-800";
                  } else {
                    buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
                  }
                } else {
                  buttonClass += "border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-800";
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={buttonClass}
                    disabled={showResult}
                    whileHover={{ scale: showResult ? 1 : 1.02 }}
                    whileTap={{ scale: showResult ? 1 : 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="flex-1">{option}</div>
                      {showResult && index === question.correct && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {showResult && index === selectedAnswer && index !== question.correct && <XCircle className="w-5 h-5 text-red-600" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">💡 Explicación:</h3>
                    <p className="text-blue-700">{question.explanation}</p>
                  </div>
                  
                  {/* Controles de navegación */}
                  <div className="flex justify-center gap-3 flex-wrap">
                    <Button 
                      onClick={handleNextQuestion}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {currentQuestion < shuffledQuestions.length - 1 ? 'Siguiente Pregunta →' : 'Ver Resultados 🏁'}
                    </Button>
                    
                    {gameMode !== 'practice' && (
                      <Button
                        onClick={toggleAutoAdvance}
                        variant={autoAdvanceEnabled ? "destructive" : "secondary"}
                        size="sm"
                      >
                        {autoAdvanceEnabled ? '⏸️ Pausar Auto' : '▶️ Auto Avanzar'}
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (gameState === 'results') {
    const percentage = Math.round((score / shuffledQuestions.length) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <Card className="w-full max-w-2xl mx-4">
          <CardHeader className="text-center bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="w-8 h-8" />
                ¡Quiz Completado!
              </CardTitle>
              <Button onClick={onClose} variant="ghost" className="text-white hover:bg-white/10">
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-6">
            <div className="space-y-4">
              <div className="text-6xl font-bold text-blue-600">{percentage}%</div>
              <p className="text-xl text-gray-700">{getScoreMessage()}</p>
              <div className="text-lg">
                <span className="text-green-600 font-semibold">{score}</span> correctas de{" "}
                <span className="font-semibold">{shuffledQuestions.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl">✅</div>
                <div className="text-green-800 font-semibold">Correctas</div>
                <div className="text-2xl font-bold text-green-600">{score}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl">❌</div>
                <div className="text-red-800 font-semibold">Incorrectas</div>
                <div className="text-2xl font-bold text-red-600">{shuffledQuestions.length - score}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={restartGame} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Jugar otra vez
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Volver al estudio
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
}