"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Target,
  Trophy,
  Star,
  AlertTriangle,
  Bell,
  BellOff,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'motivation';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number; // en segundos, undefined = persistente
}

interface MotivationalNotificationsProps {
  onOpenProgress: () => void;
  onStartQuiz: () => void;
}

export default function MotivationalNotifications({ 
  onOpenProgress, 
  onStartQuiz 
}: MotivationalNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsHidden, setNotificationsHidden] = useState<boolean>(false);

  useEffect(() => {
    // Actualizar el tiempo cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Calcular tiempo hasta el examen (mañana 6 PM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0); // 6 PM
    
    const timeUntilExam = tomorrow.getTime() - currentTime.getTime();
    const hoursUntilExam = Math.floor(timeUntilExam / (1000 * 60 * 60));
    
    // Generar notificaciones basadas en el tiempo y progreso
    const newNotifications: Notification[] = [];

    // Notificación de tiempo crítico
    if (hoursUntilExam <= 24 && hoursUntilExam > 12) {
      newNotifications.push({
        id: 'exam-tomorrow',
        type: 'warning',
        title: '⏰ ¡Examen Mañana!',
        message: `Quedan ${hoursUntilExam} horas. ¡Es momento de intensificar el estudio!`,
        action: {
          label: 'Ver progreso',
          onClick: onOpenProgress
        }
      });
    } else if (hoursUntilExam <= 12 && hoursUntilExam > 6) {
      newNotifications.push({
        id: 'final-stretch',
        type: 'warning',
        title: '🚨 Recta Final',
        message: `Solo ${hoursUntilExam} horas restantes. ¡Enfócate en los temas débiles!`,
        action: {
          label: 'Quiz intensivo',
          onClick: onStartQuiz
        }
      });
    } else if (hoursUntilExam <= 6) {
      newNotifications.push({
        id: 'last-hours',
        type: 'warning',
        title: '⚡ Últimas Horas',
        message: `¡Solo ${hoursUntilExam} horas! Repaso final con flashcards.`,
        action: {
          label: 'Repaso rápido',
          onClick: onOpenProgress
        }
      });
    }

    // Notificaciones motivacionales
    const studyTime = parseInt(localStorage.getItem('todayStudyTime') || '0');
    const completedActivities = parseInt(localStorage.getItem('todayActivities') || '0');
    
    if (studyTime < 60) { // Menos de 1 hora
      newNotifications.push({
        id: 'need-more-study',
        type: 'motivation',
        title: '📚 ¡Necesitas estudiar más!',
        message: 'Has estudiado menos de 1 hora hoy. ¡Cada minuto cuenta!',
        action: {
          label: 'Empezar ahora',
          onClick: onStartQuiz
        },
        duration: 300 // 5 minutos
      });
    }

    if (completedActivities === 0) {
      newNotifications.push({
        id: 'no-activities',
        type: 'info',
        title: '🎯 ¡Comienza tu práctica!',
        message: 'Aún no has completado ninguna actividad hoy. ¡El primer paso es el más importante!',
        action: {
          label: 'Quiz rápido',
          onClick: onStartQuiz
        },
        duration: 180 // 3 minutos
      });
    }

    // Verificar logros recientes
    const recentAchievements = JSON.parse(localStorage.getItem('recentAchievements') || '[]');
    if (recentAchievements.length > 0) {
      newNotifications.push({
        id: 'achievement-unlocked',
        type: 'success',
        title: '🏆 ¡Logro Desbloqueado!',
        message: `¡Felicitaciones! Has desbloqueado: ${recentAchievements[0].title}`,
        duration: 120 // 2 minutos
      });
    }

    // Mensajes motivacionales por hora
    const hour = currentTime.getHours();
    if (hour >= 6 && hour <= 9) {
      newNotifications.push({
        id: 'morning-motivation',
        type: 'motivation',
        title: '🌅 ¡Buenos días, estudiante!',
        message: 'La mañana es perfecta para estudiar. Tu mente está fresca y lista.',
        duration: 240
      });
    } else if (hour >= 14 && hour <= 17) {
      newNotifications.push({
        id: 'afternoon-boost',
        type: 'motivation',
        title: '☀️ Impulso de Tarde',
        message: 'Perfecto momento para una sesión de repaso intensivo.',
        action: {
          label: 'Ver progreso',
          onClick: onOpenProgress
        },
        duration: 180
      });
    } else if (hour >= 20 && hour <= 23) {
      newNotifications.push({
        id: 'evening-reminder',
        type: 'info',
        title: '🌙 Repaso Nocturno',
        message: 'Tiempo ideal para revisar lo aprendido y consolidar conceptos.',
        duration: 300
      });
    }

    setNotifications(newNotifications);
  }, [currentTime, onOpenProgress, onStartQuiz]);

  // Auto-remover notificaciones con duración
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration * 1000);
      }
    });
  }, [notifications]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <Trophy className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Target className="w-5 h-5" />;
      case 'motivation': return <Star className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getNotificationColors = (type: string) => {
    switch (type) {
      case 'success': return 'from-green-500 to-emerald-500 border-green-300';
      case 'warning': return 'from-orange-500 to-red-500 border-orange-300';
      case 'info': return 'from-blue-500 to-indigo-500 border-blue-300';
      case 'motivation': return 'from-purple-500 to-pink-500 border-purple-300';
      default: return 'from-gray-500 to-gray-600 border-gray-300';
    }
  };

  if (notifications.length === 0 || notificationsHidden) return (
    <div className="fixed top-20 right-4 z-40">
      {notificationsHidden && (
        <button
          onClick={() => setNotificationsHidden(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all duration-200"
          title="Mostrar notificaciones"
        >
          <Star className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed top-20 right-4 z-40 space-y-3 max-w-sm">
      {/* Botón para ocultar todas las notificaciones */}
      <div className="flex justify-end">
        <button
          onClick={() => setNotificationsHidden(true)}
          className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded-full shadow-lg transition-all duration-200"
        >
          Ocultar todas
        </button>
      </div>
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            className={`bg-gradient-to-r ${getNotificationColors(notification.type)} text-white p-4 rounded-lg shadow-lg border-2 backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-white/90 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                  <p className="text-xs text-white/90 leading-relaxed">{notification.message}</p>
                  {notification.action && (
                    <Button
                      onClick={() => {
                        notification.action?.onClick();
                        removeNotification(notification.id);
                      }}
                      size="sm"
                      variant="secondary"
                      className="mt-2 text-xs bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      {notification.action.label}
                    </Button>
                  )}
                </div>
              </div>
              <Button
                onClick={() => removeNotification(notification.id)}
                size="sm"
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/20 h-6 w-6 p-0 ml-2"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Barra de progreso para notificaciones con duración */}
            {notification.duration && (
              <div className="mt-2 w-full bg-white/20 rounded-full h-1">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: notification.duration, ease: "linear" }}
                  className="bg-white h-1 rounded-full"
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}