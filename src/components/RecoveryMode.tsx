"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecoveryQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface RecoveryModeProps {
  topic: string;
  onClose: () => void;
  onComplete: (score: number, improvements: string[]) => void;
}

export default function RecoveryMode({ topic, onClose, onComplete }: RecoveryModeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [gamePhase, setGamePhase] = useState<'practice' | 'results'>('practice');

  const recoveryQuestions: Record<string, RecoveryQuestion[]> = {
    "Neuronas Espejo": [
      {
        id: "nm1",
        topic: "Neuronas Espejo",
        question: "¿Cuál es la función principal de las neuronas espejo según Goleman?",
        options: [
          "Controlar los movimientos corporales",
          "Facilitar la resonancia emocional y empatía",
          "Procesar información visual",
          "Regular las funciones cerebrales básicas"
        ],
        correct: 1,
        explanation: "Las neuronas espejo son la base neurológica para la resonancia emocional y la empatía, permitiendo que entendamos y sintamos las emociones de otros.",
        difficulty: "medium"
      },
      {
        id: "nm2",
        topic: "Neuronas Espejo",
        question: "¿Cómo se relacionan las neuronas espejo con el liderazgo efectivo?",
        options: [
          "Permiten tomar decisiones más rápidas",
          "Ayudan a construir vínculos y retener talento",
          "Mejoran la capacidad de análisis",
          "Reducen el estrés laboral"
        ],
        correct: 1,
        explanation: "El liderazgo efectivo aprovecha las neuronas espejo para construir vínculos emocionales, retener talento y mejorar la efectividad organizacional.",
        difficulty: "hard"
      },
      {
        id: "nm3",
        topic: "Neuronas Espejo",
        question: "¿Qué sucede cuando las neuronas espejo se activan?",
        options: [
          "Se produce una respuesta automática de imitación",
          "Percibimos y resonamos con las emociones de otros",
          "Aumenta nuestra capacidad de concentración",
          "Se mejora la memoria a largo plazo"
        ],
        correct: 1,
        explanation: "Cuando las neuronas espejo se activan, percibimos y resonamos automáticamente con las emociones y estados de otras personas.",
        difficulty: "easy"
      }
    ],
    "Condicionamiento Operante": [
      {
        id: "co1",
        topic: "Condicionamiento Operante",
        question: "¿Cuál es la diferencia entre refuerzo positivo y negativo?",
        options: [
          "El positivo es bueno y el negativo es malo",
          "El positivo agrega algo deseado, el negativo quita algo indeseado",
          "El positivo es para niños, el negativo para adultos",
          "No hay diferencia real entre ambos"
        ],
        correct: 1,
        explanation: "El refuerzo positivo agrega un estímulo deseado para aumentar la conducta, mientras que el refuerzo negativo quita un estímulo indeseado para el mismo efecto.",
        difficulty: "medium"
      },
      {
        id: "co2",
        topic: "Condicionamiento Operante",
        question: "¿Qué es la extinción en el condicionamiento operante?",
        options: [
          "La eliminación completa de una conducta",
          "El castigo severo por una conducta",
          "La eliminación del refuerzo que mantenía la conducta",
          "El reemplazo de una conducta por otra"
        ],
        correct: 2,
        explanation: "La extinción es la eliminación del refuerzo que mantenía una conducta, lo que gradualmente reduce su frecuencia hasta que desaparece.",
        difficulty: "hard"
      },
      {
        id: "co3",
        topic: "Condicionamiento Operante",
        question: "Según Skinner, ¿cuándo es más efectivo aplicar el refuerzo?",
        options: [
          "Inmediatamente después de la conducta deseada",
          "Varios días después de la conducta",
          "Solo cuando la conducta es perfecta",
          "Una vez por semana sin importar la conducta"
        ],
        correct: 0,
        explanation: "El refuerzo es más efectivo cuando se aplica inmediatamente después de la conducta deseada, creando una asociación clara entre la acción y la consecuencia.",
        difficulty: "easy"
      }
    ],
    "Niveles de Schein": [
      {
        id: "ns1",
        topic: "Niveles de Schein",
        question: "¿Cuál es el nivel más profundo de la cultura según Schein?",
        options: [
          "Artefactos y creaciones",
          "Valores conscientes",
          "Presunciones básicas",
          "Rituales organizacionales"
        ],
        correct: 2,
        explanation: "Las presunciones básicas son el nivel más profundo e inconsciente de la cultura organizacional, son automáticas e invisibles pero guían toda la organización.",
        difficulty: "easy"
      },
      {
        id: "ns2",
        topic: "Niveles de Schein",
        question: "¿Por qué las presunciones básicas son tan importantes?",
        options: [
          "Son fáciles de cambiar",
          "Se pueden observar directamente",
          "Guían inconscientemente todo el comportamiento organizacional",
          "Solo afectan a los directivos"
        ],
        correct: 2,
        explanation: "Las presunciones básicas son fundamentales porque guían inconscientemente todo el comportamiento organizacional, siendo automáticas e invisibles pero muy poderosas.",
        difficulty: "medium"
      },
      {
        id: "ns3",
        topic: "Niveles de Schein",
        question: "¿Qué incluyen los artefactos y creaciones?",
        options: [
          "Solo los valores declarados de la empresa",
          "Las creencias profundas e inconscientes",
          "Todo lo visible: arquitectura, tecnología, patrones de comportamiento",
          "Únicamente los documentos oficiales"
        ],
        correct: 2,
        explanation: "Los artefactos incluyen todo lo que se puede ver y oír en la organización: arquitectura, tecnología, patrones de comportamiento, documentos, pero son difíciles de descifrar.",
        difficulty: "hard"
      }
    ]
  };

  const questions = useMemo(() => {
    return recoveryQuestions[topic] || [];
  }, [topic]);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    setAnswers([...answers, isCorrect]);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGamePhase('results');
      }
    }, 2500);
  };

  const getImprovementTips = () => {
    const percentage = (score / questions.length) * 100;
    const tips = [];

    if (percentage < 50) {
      tips.push("Revisa los conceptos básicos de este tema");
      tips.push("Usa las flashcards específicas para reforzar");
      tips.push("Practica con ejercicios más simples primero");
    } else if (percentage < 80) {
      tips.push("¡Vas mejorando! Sigue practicando");
      tips.push("Enfócate en los detalles específicos");
      tips.push("Relaciona este tema con otros conceptos");
    } else {
      tips.push("¡Excelente progreso!");
      tips.push("Ya dominas lo básico, ahora profundiza");
      tips.push("Puedes ayudar a explicar este tema a otros");
    }

    return tips;
  };

  const handleComplete = () => {
    const improvements = getImprovementTips();
    onComplete(score, improvements);
    onClose();
  };

  if (questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Tema no disponible</h2>
            <p className="text-gray-600 mb-4">
              Aún no tenemos ejercicios específicos para "{topic}".
            </p>
            <Button onClick={onClose} className="w-full">
              Volver
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (gamePhase === 'results') {
    const percentage = Math.round((score / questions.length) * 100);
    const improvements = getImprovementTips();
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <Card className="w-full max-w-2xl mx-4">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-6 h-6" />
              Sesión de Recuperación Completada
            </CardTitle>
            <p className="text-green-100">Tema: {topic}</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="text-5xl font-bold text-blue-600">{percentage}%</div>
              <div className="text-lg">
                <span className="text-green-600 font-semibold">{score}</span> correctas de{" "}
                <span className="font-semibold">{questions.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-green-800">Correctas</div>
                <div className="text-2xl font-bold text-green-600">{score}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="font-semibold text-red-800">Incorrectas</div>
                <div className="text-2xl font-bold text-red-600">{questions.length - score}</div>
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 text-lg">
                  💡 Recomendaciones para Mejorar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {improvements.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-blue-700">
                      <Target className="w-4 h-4 mt-0.5 text-blue-600" />
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={() => {
                setGamePhase('practice');
                setCurrentQuestion(0);
                setScore(0);
                setAnswers([]);
                setSelectedAnswer(null);
                setShowResult(false);
              }} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Practicar otra vez
              </Button>
              <Button onClick={handleComplete} variant="outline" className="flex-1">
                Completar sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <Card className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-6 h-6" />
              Modo Recuperación: {topic}
            </CardTitle>
            <div className="text-right">
              <div className="text-sm opacity-90">
                Pregunta {currentQuestion + 1} de {questions.length}
              </div>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">
                Reforzando conocimientos en {topic}
              </span>
            </div>
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
                buttonClass += "border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-800";
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
                className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Explicación detallada:
                </h3>
                <p className="text-orange-700">{question.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}