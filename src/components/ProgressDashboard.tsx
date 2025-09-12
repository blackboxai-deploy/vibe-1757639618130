"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Brain,
  BookOpen,
  Trophy,
  Zap,
  Star,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StudySession {
  date: string;
  activity: 'quiz' | 'flashcards' | 'memory';
  score: number;
  timeSpent: number;
  errorsByTopic: Record<string, number>;
  completed: boolean;
}

interface DailyGoal {
  id: string;
  type: 'quiz' | 'flashcards' | 'memory' | 'study_time';
  target: number;
  current: number;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface WeakArea {
  topic: string;
  category: string;
  errors: number;
  lastAttempt: string;
  improvement: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  maxProgress: number;
}

import { useStudyStats } from "@/hooks/useStudyStats";

interface ProgressDashboardProps {
  onClose: () => void;
  onStartRecovery: (topic: string) => void;
}

export default function ProgressDashboard({ onClose, onStartRecovery }: ProgressDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'analysis' | 'achievements'>('overview');
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  
  // Usar el hook de estadísticas reales
  const { sessions, dailyGoals, achievements, stats, resetDailyGoals } = useStudyStats();

  // Inicializar áreas débiles (simuladas por ahora)
  useEffect(() => {
    const simulatedWeakAreas: WeakArea[] = [
      {
        topic: 'Neuronas Espejo',
        category: 'Inteligencia Social',
        errors: 3,
        lastAttempt: 'Hace 1 hora',
        improvement: -15
      },
      {
        topic: 'Condicionamiento Operante',
        category: 'Conductismo',
        errors: 2,
        lastAttempt: 'Hace 30 min',
        improvement: 25
      },
      {
        topic: 'Niveles de Schein',
        category: 'Cultura Organizacional',
        errors: 4,
        lastAttempt: 'Hace 2 horas',
        improvement: -5
      }
    ];
    setWeakAreas(simulatedWeakAreas);
  }, []);

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <Brain className="w-4 h-4" />;
      case 'flashcards': return <BookOpen className="w-4 h-4" />;
      case 'memory': return <Trophy className="w-4 h-4" />;
      case 'study_time': return <Clock className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Ya no necesitamos esta función local, usamos la del hook

  const TabButton = ({ id, label, icon, active }: { 
    id: string; 
    label: string; 
    icon: React.ReactNode; 
    active: boolean 
  }) => (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center gap-2 ${active ? 'bg-blue-600 text-white' : ''}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BarChart3 className="w-8 h-8" />
              Panel de Progreso
            </CardTitle>
            <Button onClick={onClose} variant="ghost" className="text-white hover:bg-white/10">
              ✕
            </Button>
          </div>
          
          {/* Pestañas */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <TabButton 
              id="overview" 
              label="Resumen" 
              icon={<TrendingUp className="w-4 h-4" />} 
              active={activeTab === 'overview'} 
            />
            <TabButton 
              id="goals" 
              label="Objetivos" 
              icon={<Target className="w-4 h-4" />} 
              active={activeTab === 'goals'} 
            />
            <TabButton 
              id="analysis" 
              label="Análisis" 
              icon={<AlertTriangle className="w-4 h-4" />} 
              active={activeTab === 'analysis'} 
            />
            <TabButton 
              id="achievements" 
              label="Logros" 
              icon={<Award className="w-4 h-4" />} 
              active={activeTab === 'achievements'} 
            />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Estadísticas principales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
                    <div className="text-sm text-blue-700">Sesiones completadas</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{Math.round(stats.avgScore)}%</div>
                    <div className="text-sm text-green-700">Promedio de aciertos</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(stats.totalTime / 60)}h</div>
                    <div className="text-sm text-purple-700">Tiempo estudiado</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.completedGoals}/{stats.totalGoals}
                    </div>
                    <div className="text-sm text-yellow-700">Objetivos cumplidos</div>
                  </div>
                </div>

                {/* Progreso hacia el examen */}
                <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800">
                      <Zap className="w-5 h-5" />
                      Preparación para el Examen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Preparación general</span>
                        <span className="font-semibold">75%</span>
                      </div>
                      <div className="w-full bg-red-200 rounded-full h-3">
                        <div className="bg-red-600 h-3 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <div className="text-sm text-red-700">
                        ¡Vas muy bien! Sigue con los ejercicios de memoria y flashcards.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actividad reciente */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Actividad Reciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sessions.length > 0 ? (
                      <div className="space-y-3">
                        {sessions.slice(0, 5).map((session, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {session.activity === 'quiz' && <Brain className="w-5 h-5 text-blue-600" />}
                              {session.activity === 'flashcards' && <BookOpen className="w-5 h-5 text-green-600" />}
                              {session.activity === 'memory' && <Trophy className="w-5 h-5 text-purple-600" />}
                              <div>
                                <div className="font-medium">
                                  {session.activity === 'quiz' && 'Quiz'}
                                  {session.activity === 'flashcards' && 'Flashcards'}
                                  {session.activity === 'memory' && 'Memoria'}
                                </div>
                                <div className="text-sm text-gray-600">{session.date}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{session.score}%</div>
                              <div className="text-sm text-gray-600">{session.timeSpent}min</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Aún no hay actividad registrada</p>
                        <p className="text-sm">¡Empieza a usar los juegos para ver tu progreso!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'goals' && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Objetivos de Hoy</h3>
                  <Button onClick={resetDailyGoals} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reiniciar
                  </Button>
                </div>

                <div className="grid gap-4">
                  {dailyGoals.map((goal) => (
                    <Card key={goal.id} className={`border-2 ${getPriorityColor(goal.priority)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getGoalIcon(goal.type)}
                            <div>
                              <div className="font-medium">{goal.description}</div>
                              <div className="text-sm opacity-70">
                                Prioridad: {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Media' : 'Baja'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {goal.current}/{goal.target}
                            </div>
                            {goal.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                            ) : (
                              <div className="w-16 bg-gray-200 rounded-full h-2 mt-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Consejos para Alcanzar tus Objetivos</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Usa el modo rápido del quiz para mejorar tu velocidad de respuesta</li>
                      <li>• Marca las flashcards como dominadas solo cuando estés 100% seguro</li>
                      <li>• En el juego de memoria, comienza con nivel fácil y ve subiendo</li>
                      <li>• Toma descansos de 10 min cada hora de estudio</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'analysis' && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold">Análisis de Rendimiento</h3>

                {/* Áreas débiles */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="w-5 h-5" />
                      Áreas que Necesitan Atención
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {weakAreas.map((area, index) => (
                        <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-orange-800">{area.topic}</div>
                              <div className="text-sm text-orange-600">{area.category}</div>
                              <div className="text-sm text-gray-600">{area.lastAttempt}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-orange-700">{area.errors}</div>
                              <div className="text-sm text-orange-600">errores</div>
                              <div className={`text-xs ${area.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {area.improvement >= 0 ? '↗' : '↘'} {Math.abs(area.improvement)}%
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Button 
                              size="sm" 
                              onClick={() => onStartRecovery(area.topic)}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Practicar este tema
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recomendaciones */}
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      Recomendaciones Personalizadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-green-700">
                      <div className="flex items-start gap-2">
                        <Star className="w-4 h-4 mt-0.5 text-green-600" />
                        <div>
                          <strong>Prioridad Alta:</strong> Refuerza "Neuronas Espejo" con flashcards específicas
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Star className="w-4 h-4 mt-0.5 text-green-600" />
                        <div>
                          <strong>Técnica recomendada:</strong> Usa el juego de memoria nivel medio para conectar conceptos
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Star className="w-4 h-4 mt-0.5 text-green-600" />
                        <div>
                          <strong>Horario óptimo:</strong> Practica en sesiones de 25 min con descansos de 5 min
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Logros y Recompensas</h3>
                  <div className="text-sm text-gray-600">
                    {stats.unlockedAchievements}/{stats.totalAchievements} desbloqueados
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <Card 
                      key={achievement.id} 
                      className={`${
                        achievement.unlocked 
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`text-3xl ${achievement.unlocked ? 'grayscale-0' : 'grayscale'}`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <div className={`font-semibold ${
                              achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'
                            }`}>
                              {achievement.title}
                            </div>
                            <div className={`text-sm ${
                              achievement.unlocked ? 'text-yellow-600' : 'text-gray-500'
                            }`}>
                              {achievement.description}
                            </div>
                            {achievement.unlocked && achievement.unlockedDate && (
                              <div className="text-xs text-yellow-600 mt-1">
                                Desbloqueado: {achievement.unlockedDate}
                              </div>
                            )}
                          </div>
                          {achievement.unlocked ? (
                            <CheckCircle className="w-6 h-6 text-yellow-600" />
                          ) : (
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                {achievement.progress}/{achievement.maxProgress}
                              </div>
                              <div className="w-16 bg-gray-300 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                                  style={{ 
                                    width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {stats.unlockedAchievements === 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6 text-center">
                      <Trophy className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                      <h4 className="font-semibold text-blue-800 mb-2">¡Comienza a Desbloquear Logros!</h4>
                      <p className="text-sm text-blue-600">
                        Completa actividades de estudio para ganar insignias y recompensas
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}