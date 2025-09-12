"use client";

import React, { createContext, useContext } from "react";
import { useStudyStats } from "@/hooks/useStudyStats";

const StudyStatsContext = createContext<ReturnType<typeof useStudyStats> | null>(null);

export const useStudyStatsContext = () => {
  const context = useContext(StudyStatsContext);
  if (!context) {
    throw new Error('useStudyStatsContext must be used within StudyStatsProvider');
  }
  return context;
};

export const StudyStatsProvider = ({ children }: { children: React.ReactNode }) => {
  const studyStats = useStudyStats();
  
  return (
    <StudyStatsContext.Provider value={studyStats}>
      {children}
    </StudyStatsContext.Provider>
  );
};