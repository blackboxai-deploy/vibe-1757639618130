"use client";

import { useState, useEffect } from "react";

export interface StudySession {
  id: string;
  date: string;
  activity: 'quiz' | 'flashcards' | 'memory' | 'recovery';
  score: number;
  timeSpent: number;
  questionsTotal?: number;
  questionsCorrect?: number;
  topic?: string;
  difficulty?: string;
  completed: boolean;
}

export interface DailyGoal {
  id: string;
  type: 'quiz' | 'flashcards' | 'memory' | 'study_time';
  target: number;
  current: number;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  maxProgress: number;
}

export const useStudyStats = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [masteredFlashcards, setMasteredFlashcards] = useState<Set<string>>(new Set());
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0);

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = () => {
    try {
      // Cargar sesiones
      const savedSessions = localStorage.getItem('studySessions');
      if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
      }

      // Cargar flashcards dominadas
      const savedMastered = localStorage.getItem('masteredFlashcards');
      if (savedMastered) {
        setMasteredFlashcards(new Set(JSON.parse(savedMastered)));
      }

      // Cargar tiempo total
      const savedTime = localStorage.getItem('totalStudyTime');
      if (savedTime) {
        setTotalStudyTime(parseInt(savedTime));
      }

      // Inicializar objetivos diarios
      const savedGoals = localStorage.getItem('dailyGoals');
      if (savedGoals) {
        setDailyGoals(JSON.parse(savedGoals));
      } else {
        initializeDailyGoals();
      }

      // Inicializar logros
      const savedAchievements = localStorage.getItem('achievements');
      if (savedAchievements) {
        setAchievements(JSON.parse(savedAchievements));
      } else {
        initializeAchievements();
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      // Inicializar con valores por defecto si hay error
      initializeDailyGoals();
      initializeAchievements();
    }
  };

  const initializeDailyGoals = () => {
    const defaultGoals: DailyGoal[] = [
      {
        id: 'quiz_goal',
        type: 'quiz',
        target: 3,
        current: 0,
        description: 'Completar 3 quizzes con +70% de aciertos',
        completed: false,
        priority: 'high'
      },
      {
        id: 'flashcards_goal',
        type: 'flashcards',
        target: 10,
        current: 0,
        description: 'Dominar 10 flashcards diferentes',
        completed: false,
        priority: 'high'
      },
      {
        id: 'memory_goal',
        type: 'memory',
        target: 2,
        current: 0,
        description: 'Completar 2 juegos de memoria con +80% precisión',
        completed: false,
        priority: 'medium'
      },
      {
        id: 'study_time_goal',
        type: 'study_time',
        target: 120, // 2 horas en minutos
        current: 0,
        description: 'Estudiar al menos 2 horas hoy',
        completed: false,
        priority: 'high'
      }
    ];
    setDailyGoals(defaultGoals);
    localStorage.setItem('dailyGoals', JSON.stringify(defaultGoals));
  };

  const initializeAchievements = () => {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first_quiz',
        title: 'Primer Quiz',
        description: 'Completar tu primer quiz',
        icon: '🎯',
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'quiz_master',
        title: 'Maestro del Quiz',
        description: 'Obtener 100% en un quiz',
        icon: '🏆',
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'flashcard_pro',
        title: 'Experto en Flashcards',
        description: 'Dominar 15 flashcards',
        icon: '📚',
        unlocked: false,
        progress: 0,
        maxProgress: 15
      },
      {
        id: 'memory_champion',
        title: 'Campeón de Memoria',
        description: 'Completar nivel difícil en menos de 2 minutos',
        icon: '🧠',
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'study_warrior',
        title: 'Guerrero del Estudio',
        description: 'Estudiar 3 días consecutivos',
        icon: '⚔️',
        unlocked: false,
        progress: 0,
        maxProgress: 3
      },
      {
        id: 'perfectionist',
        title: 'Perfeccionista',
        description: 'No cometer errores en 5 actividades seguidas',
        icon: '✨',
        unlocked: false,
        progress: 0,
        maxProgress: 5
      }
    ];
    setAchievements(defaultAchievements);
    localStorage.setItem('achievements', JSON.stringify(defaultAchievements));
  };

  // Función para registrar una nueva sesión de estudio
  const recordSession = (sessionData: Omit<StudySession, 'id' | 'date'>) => {
    const newSession: StudySession = {
      id: `session_${Date.now()}`,
      date: new Date().toLocaleString('es-ES'),
      ...sessionData
    };

    const updatedSessions = [newSession, ...sessions].slice(0, 50); // Mantener solo las últimas 50
    setSessions(updatedSessions);
    localStorage.setItem('studySessions', JSON.stringify(updatedSessions));

    // Actualizar tiempo total de estudio
    const newTotalTime = totalStudyTime + sessionData.timeSpent;
    setTotalStudyTime(newTotalTime);
    localStorage.setItem('totalStudyTime', newTotalTime.toString());

    // Actualizar objetivos diarios
    updateDailyGoals(sessionData);

    // Verificar logros
    checkAchievements(newSession, updatedSessions);

    return newSession;
  };

  // Función para actualizar objetivos diarios
  const updateDailyGoals = (sessionData: Omit<StudySession, 'id' | 'date'>) => {
    const updatedGoals = dailyGoals.map(goal => {
      let increment = 0;

      switch (goal.type) {
        case 'quiz':
          if (sessionData.activity === 'quiz' && sessionData.score >= 70) {
            increment = 1;
          }
          break;
        case 'memory':
          if (sessionData.activity === 'memory' && sessionData.score >= 80) {
            increment = 1;
          }
          break;
        case 'study_time':
          increment = sessionData.timeSpent;
          break;
        case 'flashcards':
          // Se actualiza por separado cuando se dominan flashcards
          break;
      }

      const newCurrent = goal.current + increment;
      const newCompleted = newCurrent >= goal.target;

      return {
        ...goal,
        current: Math.min(newCurrent, goal.target),
        completed: newCompleted
      };
    });

    setDailyGoals(updatedGoals);
    localStorage.setItem('dailyGoals', JSON.stringify(updatedGoals));
  };

  // Función para marcar flashcards como dominadas
  const markFlashcardMastered = (cardId: string, mastered: boolean) => {
    const newMastered = new Set(masteredFlashcards);
    
    if (mastered) {
      newMastered.add(cardId);
    } else {
      newMastered.delete(cardId);
    }

    setMasteredFlashcards(newMastered);
    localStorage.setItem('masteredFlashcards', JSON.stringify([...newMastered]));

    // Actualizar objetivo de flashcards
    const updatedGoals = dailyGoals.map(goal => {
      if (goal.type === 'flashcards') {
        const newCurrent = newMastered.size;
        return {
          ...goal,
          current: Math.min(newCurrent, goal.target),
          completed: newCurrent >= goal.target
        };
      }
      return goal;
    });

    setDailyGoals(updatedGoals);
    localStorage.setItem('dailyGoals', JSON.stringify(updatedGoals));

    // Verificar logro de flashcards
    checkFlashcardAchievements(newMastered.size);
  };

  // Función para verificar y desbloquear logros
  const checkAchievements = (newSession: StudySession, allSessions: StudySession[]) => {
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.unlocked) return achievement;

      let shouldUnlock = false;
      let newProgress = achievement.progress;

      switch (achievement.id) {
        case 'first_quiz':
          if (newSession.activity === 'quiz') {
            shouldUnlock = true;
            newProgress = 1;
          }
          break;

        case 'quiz_master':
          if (newSession.activity === 'quiz' && newSession.score === 100) {
            shouldUnlock = true;
            newProgress = 1;
          }
          break;

        case 'memory_champion':
          if (newSession.activity === 'memory' && 
              newSession.difficulty === 'hard' && 
              newSession.timeSpent <= 120) {
            shouldUnlock = true;
            newProgress = 1;
          }
          break;

        case 'study_warrior':
          // Verificar días consecutivos (simplificado)
          const today = new Date().toDateString();
          const sessionsToday = allSessions.filter(s => 
            new Date(s.date).toDateString() === today
          ).length;
          if (sessionsToday > 0) {
            newProgress = Math.min(achievement.progress + 1, 3);
            shouldUnlock = newProgress >= 3;
          }
          break;

        case 'perfectionist':
          const recentSessions = allSessions.slice(0, 5);
          if (recentSessions.length === 5 && 
              recentSessions.every(s => s.score === 100)) {
            shouldUnlock = true;
            newProgress = 5;
          }
          break;
      }

      return {
        ...achievement,
        progress: newProgress,
        unlocked: shouldUnlock,
        unlockedDate: shouldUnlock ? new Date().toLocaleString('es-ES') : achievement.unlockedDate
      };
    });

    setAchievements(updatedAchievements);
    localStorage.setItem('achievements', JSON.stringify(updatedAchievements));

    // Mostrar notificación de nuevo logro
    const newlyUnlocked = updatedAchievements.find(a => 
      a.unlocked && !achievements.find(old => old.id === a.id && old.unlocked)
    );
    
    if (newlyUnlocked) {
      // Guardar logro para mostrar en notificaciones
      const recentAchievements = JSON.parse(localStorage.getItem('recentAchievements') || '[]');
      recentAchievements.unshift(newlyUnlocked);
      localStorage.setItem('recentAchievements', JSON.stringify(recentAchievements.slice(0, 3)));
    }
  };

  const checkFlashcardAchievements = (masteredCount: number) => {
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.id === 'flashcard_pro') {
        const shouldUnlock = masteredCount >= 15;
        return {
          ...achievement,
          progress: masteredCount,
          unlocked: shouldUnlock,
          unlockedDate: shouldUnlock && !achievement.unlocked ? 
            new Date().toLocaleString('es-ES') : achievement.unlockedDate
        };
      }
      return achievement;
    });

    setAchievements(updatedAchievements);
    localStorage.setItem('achievements', JSON.stringify(updatedAchievements));
  };

  // Función para reiniciar objetivos diarios
  const resetDailyGoals = () => {
    initializeDailyGoals();
  };

  // Estadísticas calculadas
  const stats = {
    totalSessions: sessions.length,
    totalTime: totalStudyTime,
    avgScore: sessions.length > 0 ? 
      sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length : 0,
    completedGoals: dailyGoals.filter(g => g.completed).length,
    totalGoals: dailyGoals.length,
    unlockedAchievements: achievements.filter(a => a.unlocked).length,
    totalAchievements: achievements.length,
    masteredFlashcardsCount: masteredFlashcards.size,
    quizSessions: sessions.filter(s => s.activity === 'quiz').length,
    memorySessions: sessions.filter(s => s.activity === 'memory').length,
    flashcardSessions: sessions.filter(s => s.activity === 'flashcards').length
  };

  return {
    sessions,
    dailyGoals,
    achievements,
    masteredFlashcards,
    totalStudyTime,
    stats,
    recordSession,
    markFlashcardMastered,
    resetDailyGoals,
    loadFromStorage
  };
};