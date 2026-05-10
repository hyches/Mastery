import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  ExternalLink, 
  LayoutDashboard, 
  Settings, 
  TrendingUp,
  Timer,
  ChevronRight,
  ChevronLeft,
  Target,
  Award,
  Zap,
  Plus,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Flame,
  Search,
  BarChart3,
  Square,
  Calculator,
  FileText,
  AlertCircle,
  Wrench,
  ClipboardList,
  BarChart4
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, differenceInDays, parseISO, startOfDay, subDays, addDays, subMinutes, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { CFATopic, AppState, StudySession, TopicStatus, Course, ScheduledRevision, SubTopic } from './types';
import { CFA_TOPICS, CA_INTER_TOPICS } from './constants';
import { FinancialCalculator } from './FinancialCalculator';
import { NotebookView } from './NotebookView';
import { MistakeJournal } from './MistakeJournal';
import { ToolsChecklist } from './ToolsChecklist';
import { MonthlyAudit } from './MonthlyAudit';
import { WeeklyPlan } from './WeeklyPlan';
import { cn } from './lib/utils';

const COLORS = ['#C5A059', '#8e8e8e', '#4a4a4a', '#2a2a2a'];

const CalendarView = ({ activeCourse, updateActiveCourse, setActiveTab }: { activeCourse: Course, updateActiveCourse: (u: Partial<Course>) => void, setActiveTab: any }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const assessments = activeCourse.assessments.filter(a => a.date === dateStr);
    const sessions = activeCourse.sessions.filter(s => s.date === dateStr);
    const isRecovery = (activeCourse.recoveryDays || []).includes(dateStr);
    return {
      events: [...assessments.map(a => ({ ...a, eventType: 'assessment' })), ...sessions.map(s => ({ ...s, eventType: 'session' }))],
      isRecovery
    };
  };

  const toggleRecovery = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const existing = activeCourse.recoveryDays || [];
    if (existing.includes(dateStr)) {
      updateActiveCourse({ recoveryDays: existing.filter(d => d !== dateStr) });
    } else {
      updateActiveCourse({ recoveryDays: [...existing, dateStr] });
    }
  };

  return (
    <div className="p-8 md:p-16 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tighter">Study Calendar</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2 md:mt-4">
            <p className="text-white/40 font-light italic font-serif">Commitments & Milestones</p>
            <span className="text-[10px] uppercase tracking-widest text-blue-400 opacity-60">Tip: Click date number to toggle Recovery Day</span>
          </div>
        </div>
        <div className="flex items-center gap-4 glass p-2 px-4">
          <button 
            onClick={() => setCurrentMonth(new Date())} 
            className="text-[8px] uppercase tracking-widest opacity-40 hover:opacity-100 px-4 py-2 border-r border-white/10 transition-all"
          >
            Today
          </button>
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/5 transition-colors"><ChevronLeft size={20} /></button>
          <span className="text-sm uppercase tracking-[0.3em] font-bold min-w-[180px] text-center">{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/5 transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="glass overflow-hidden border border-white/5">
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-4 text-center text-[10px] uppercase tracking-widest opacity-30 font-bold">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const { events, isRecovery } = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            
            return (
              <div 
                key={idx} 
                className={cn(
                  "min-h-[80px] md:min-h-[140px] p-2 md:p-3 border-r border-b border-white/5 transition-colors hover:bg-white/[0.02] flex flex-col group",
                  !isCurrentMonth && "opacity-10 pointer-events-none",
                  isRecovery && "bg-blue-500/[0.03]"
                )}
              >
                <div className="flex justify-between items-start mb-1 md:mb-3">
                  <button 
                    onClick={() => toggleRecovery(day)}
                    className={cn(
                      "text-xs font-mono p-1 rounded hover:bg-white/10 transition-all",
                      isToday(day) && "text-prestige-gold font-bold scale-125",
                      isRecovery && "text-blue-400 font-bold"
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                  <div className="flex gap-1 items-center">
                    {isRecovery && (
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="text-[8px] uppercase tracking-widest text-blue-400 font-bold bg-blue-400/10 px-1.5 py-0.5 rounded"
                      >
                        Recovery
                      </motion.div>
                    )}
                    {isToday(day) && <div className="w-1.5 h-1.5 rounded-full bg-prestige-gold shadow-[0_0_8px_rgba(197,160,89,1)]" />}
                  </div>
                </div>
                <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
                  {events.map((event: any, eIdx) => (
                    <div 
                      key={eIdx}
                      onClick={() => {
                        if (event.eventType === 'assessment') {
                          setActiveTab('assessments');
                        } else {
                          setActiveTab('sessions');
                        }
                      }}
                      className={cn(
                        "text-[9px] p-2 truncate rounded-sm border cursor-pointer transition-all hover:scale-[1.02]",
                        event.eventType === 'assessment' 
                          ? (event.type === 'Revision' ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-prestige-gold/10 border-prestige-gold/20 text-prestige-gold")
                          : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      )}
                      title={event.name || 'Study Session'}
                    >
                      <div className="flex justify-between items-center gap-1">
                        <div className="flex flex-col gap-0.5 truncate">
                          <span className="truncate">{event.name || 'Session'}</span>
                          {event.subTopicId && (
                            <span className="text-[7px] opacity-40 truncate">
                              {activeCourse.topics.find(t => t.id === event.topicId)?.subTopics?.find(st => st.id === event.subTopicId)?.name}
                            </span>
                          )}
                        </div>
                        {event.time && <span className="opacity-40 shrink-0">{event.time}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-8 opacity-40">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-prestige-gold" />
          <span className="text-[10px] uppercase tracking-widest">Assessments</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[10px] uppercase tracking-widest">Revisions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-[10px] uppercase tracking-widest">Recovery Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[10px] uppercase tracking-widest">Sessions</span>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const isPopout = useMemo(() => new URLSearchParams(window.location.search).get('calculator') === 'true', []);

  if (isPopout) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
        <FinancialCalculator isOpen={true} onClose={() => window.close()} isPopout={true} />
      </div>
    );
  }

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('prestige_tracker_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: Ensure all course fields exist
      const migratedCourses = parsed.courses.map((course: Course) => {
        return {
          ...course,
          mistakes: course.mistakes || [],
          ethicsMiniMocks: course.ethicsMiniMocks || [],
          dailyEthicsDrips: course.dailyEthicsDrips || [],
          recoveryDays: course.recoveryDays || [],
          auditLogs: course.auditLogs || [],
          tools: course.tools || [
            { id: 'tvm', name: 'TVM Calculator', status: 'Not Started' },
            { id: 'stats', name: 'Stats Calculator', status: 'Not Started' },
            { id: 'dcf', name: 'DCF Model', status: 'Not Started' },
            { id: 'yield', name: 'Bond Yield + Duration', status: 'Not Started' },
            { id: 'port', name: 'Portfolio Metrics', status: 'Not Started' }
          ],
          assessments: course.assessments || []
        };
      });
      return { ...parsed, courses: migratedCourses };
    }
    
    // Initial default courses
    const initialCourses: Course[] = [
      {
        id: 'cfa-level-1',
        name: 'CFA Level I',
        description: 'Chartered Financial Analyst - Level I Exam',
        topics: CFA_TOPICS,
        sessions: [],
        assessments: [],
        scheduledRevisions: [],
        examDate: format(new Date(new Date().getFullYear(), 11, 15), 'yyyy-MM-dd'),
        vaultName: 'CFA-Notes',
        mistakes: [],
        ethicsMiniMocks: [],
        dailyEthicsDrips: [],
        recoveryDays: [],
        auditLogs: [],
        tools: [
          { id: 'tvm', name: 'TVM Calculator', status: 'Not Started' },
          { id: 'stats', name: 'Stats Calculator', status: 'Not Started' },
          { id: 'dcf', name: 'DCF Model', status: 'Not Started' },
          { id: 'yield', name: 'Bond Yield + Duration', status: 'Not Started' },
          { id: 'port', name: 'Portfolio Metrics', status: 'Not Started' }
        ]
      },
      {
        id: 'ca-inter',
        name: 'CA Inter',
        description: 'Chartered Accountancy Intermediate Exam',
        topics: CA_INTER_TOPICS,
        sessions: [],
        assessments: [],
        scheduledRevisions: [],
        examDate: format(new Date(new Date().getFullYear(), 4, 1), 'yyyy-MM-dd'),
        vaultName: 'CA-Notes',
        mistakes: [],
        ethicsMiniMocks: [],
        dailyEthicsDrips: [],
        recoveryDays: [],
        auditLogs: [],
        tools: [
          { id: 'tvm', name: 'TVM Calculator', status: 'Not Started' },
          { id: 'stats', name: 'Stats Calculator', status: 'Not Started' },
          { id: 'dcf', name: 'DCF Model', status: 'Not Started' },
          { id: 'yield', name: 'Bond Yield + Duration', status: 'Not Started' },
          { id: 'port', name: 'Portfolio Metrics', status: 'Not Started' }
        ]
      }
    ];

    return {
      courses: initialCourses,
      activeCourseId: null,
    };
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'topics' | 'sessions' | 'assessments' | 'settings' | 'calendar' | 'notebook' | 'mistakes' | 'tools' | 'plan' | 'audit'>('dashboard');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingAssessmentId, setEditingAssessmentId] = useState<string | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [quickFireQuestions, setQuickFireQuestions] = useState<{question: string, answer: string}[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // Custom Modal States
  const [inputModal, setInputModal] = useState<{
    show: boolean;
    title: string;
    label: string;
    placeholder: string;
    value: string;
    onConfirm: (value: string) => void;
  }>({
    show: false,
    title: '',
    label: '',
    placeholder: '',
    value: '',
    onConfirm: () => {},
  });

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    setQuickFireQuestions([]);
  }, [editingTopicId]);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' }), []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateQuickFire = async (topicName: string) => {
    setIsGeneratingQuestions(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate 3 quick-fire recall questions for the topic: "${topicName}" in the context of ${activeCourse.name}. 
        Focus on core concepts, formulas, or key definitions. 
        Keep questions and answers concise.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ["question", "answer"]
            }
          }
        }
      });
      const questions = JSON.parse(response.text);
      setQuickFireQuestions(questions);
    } catch (error) {
      console.error("Failed to generate questions:", error);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem('prestige_tracker_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    let interval: number;
    if (isTimerActive) {
      interval = window.setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const activeCourse = useMemo(() => {
    return state.courses.find(c => c.id === state.activeCourseId) || null;
  }, [state.courses, state.activeCourseId]);

  const stats = useMemo(() => {
    if (!activeCourse) return null;
    const totalTopics = activeCourse.topics.length;
    const completed = activeCourse.topics.filter(t => t.status === 'Completed').length;
    const progress = totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0;
    const daysLeft = differenceInDays(parseISO(activeCourse.examDate), startOfDay(new Date()));
    const totalHours = Math.round(activeCourse.sessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60);
    
    // Calculate Readiness Score
    const completedAssessments = activeCourse.assessments.filter(a => a.status === 'Completed' && a.type !== 'Revision');
    const avgAccuracy = completedAssessments.length > 0 
      ? completedAssessments.reduce((acc, a) => acc + ((a.score || 0) / (a.totalMarks || 100)), 0) / completedAssessments.length 
      : 0;
    const avgConfidence = activeCourse.topics.length > 0
      ? activeCourse.topics.reduce((acc, t) => acc + t.confidence, 0) / (activeCourse.topics.length * 5)
      : 0;
    
    const readinessScore = Math.round((progress * 0.3) + (avgAccuracy * 100 * 0.5) + (avgConfidence * 100 * 0.2));

    // Calculate Streak
    const sessionDates = [...new Set(activeCourse.sessions.map(s => s.date))].sort().reverse();
    let streak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    if (sessionDates.includes(today) || sessionDates.includes(yesterday)) {
      let current = sessionDates.includes(today) ? new Date() : subDays(new Date(), 1);
      while (sessionDates.includes(format(current, 'yyyy-MM-dd'))) {
        streak++;
        current = subDays(current, 1);
      }
    }

    const ethicsMiniMocksCompleted = (activeCourse.ethicsMiniMocks || []).length;
    const morningStudyIdx = startOfWeek(new Date(), { weekStartsOn: 1 });
    const dailyEthicsDripsThisWeek = (activeCourse.dailyEthicsDrips || []).filter(date => {
      const d = parseISO(date);
      return d >= morningStudyIdx && d <= addDays(morningStudyIdx, 6);
    }).length;
    const mistakeJournalEntriesCount = (activeCourse.mistakes || []).length;
    const recoveryDaysUsed = (activeCourse.recoveryDays || []).length;
    const toolCompletionPercentage = activeCourse.tools ? Math.round((activeCourse.tools.filter(t => t.status === 'Complete').length / activeCourse.tools.length) * 100) : 0;

    return { 
      completed, progress, daysLeft, totalHours, readinessScore, streak,
      ethicsMiniMocksCompleted, dailyEthicsDripsThisWeek, 
      mistakeJournalEntriesCount, recoveryDaysUsed, toolCompletionPercentage 
    };
  }, [activeCourse]);

  // SRS & Confidence Decay Logic
  useEffect(() => {
    if (!activeCourse) return;
    
    const now = new Date();
    let updated = false;
    const updatedTopics = activeCourse.topics.map(topic => {
      if (!topic.lastStudied) return topic;
      
      const lastDate = new Date(topic.lastStudied);
      const daysSince = differenceInDays(now, lastDate);
      
      let newStatus = topic.status;
      let newConfidence = topic.confidence;
      
      // If completed but not studied for 7 days, mark for Review
      if (topic.status === 'Completed' && daysSince >= 7) {
        newStatus = 'Review';
        updated = true;
      }
      
      // Confidence decay: -1 star every 14 days of inactivity
      if (daysSince >= 14 && topic.confidence > 1) {
        const decayAmount = Math.floor(daysSince / 14);
        const targetConfidence = Math.max(1, topic.confidence - decayAmount);
        if (targetConfidence !== topic.confidence) {
          newConfidence = targetConfidence;
          updated = true;
        }
      }
      
      return { ...topic, status: newStatus, confidence: newConfidence };
    });
    
    if (updated) {
      updateActiveCourse({ topics: updatedTopics });
    }
  }, [state.activeCourseId]);

  const chartData = useMemo(() => {
    if (!activeCourse) return [];
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayMins = activeCourse.sessions
        .filter(s => s.date === dateStr)
        .reduce((acc, s) => acc + s.durationMinutes, 0);
      return {
        date: format(d, 'MMM dd'),
        hours: Number((dayMins / 60).toFixed(1)),
      };
    });
    return last7Days;
  }, [activeCourse]);

  const updateActiveCourse = (updates: Partial<Course>) => {
    if (!state.activeCourseId) return;
    setState(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === state.activeCourseId ? { ...c, ...updates } : c)
    }));
  };

  const updateTopic = (id: string, updates: Partial<CFATopic>) => {
    if (!activeCourse) return;
    updateActiveCourse({
      topics: activeCourse.topics.map(t => t.id === id ? { ...t, ...updates } : t)
    });
  };

  const addSubTopic = (topicId: string) => {
    if (!activeCourse) return;
    setInputModal({
      show: true,
      title: 'New Sub-Topic',
      label: 'Sub-topic Name',
      placeholder: 'e.g. Ethics Principles, Market Efficiency...',
      value: '',
      onConfirm: (name) => {
        if (!name) return;
        const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
        const newSubTopic: SubTopic = {
          id,
          name,
          status: 'Not Started',
          confidence: 0
        };
        const topic = activeCourse.topics.find(t => t.id === topicId);
        if (topic) {
          updateTopic(topicId, { subTopics: [...(topic.subTopics || []), newSubTopic] });
        }
      }
    });
  };

  const updateSubTopic = (topicId: string, subTopicId: string, updates: Partial<SubTopic>) => {
    const topic = activeCourse.topics.find(t => t.id === topicId);
    if (topic && topic.subTopics) {
      updateTopic(topicId, {
        subTopics: topic.subTopics.map(st => st.id === subTopicId ? { ...st, ...updates } : st)
      });
    }
  };

  const deleteSubTopic = (topicId: string, subTopicId: string) => {
    setConfirmModal({
      show: true,
      title: 'Delete Sub-Topic',
      message: 'Are you sure you want to delete this sub-topic? This action cannot be undone.',
      onConfirm: () => {
        const topic = activeCourse.topics.find(t => t.id === topicId);
        if (topic && topic.subTopics) {
          updateTopic(topicId, {
            subTopics: topic.subTopics.filter(st => st.id !== subTopicId)
          });
        }
      }
    });
  };

  const addSession = (topicId: string, mins: number) => {
    if (!activeCourse) return;
    const now = new Date();
    const startTime = format(subMinutes(now, mins), 'HH:mm');
    const endTime = format(now, 'HH:mm');
    const newSession: StudySession = {
      id: crypto.randomUUID(),
      topicId,
      durationMinutes: mins,
      date: format(now, 'yyyy-MM-dd'),
      startTime,
      endTime,
      sessionProgress: 0,
    };
    updateActiveCourse({
      sessions: [newSession, ...activeCourse.sessions],
      topics: activeCourse.topics.map(t => t.id === topicId ? { ...t, lastStudied: now.toISOString() } : t)
    });
  };

  const handleTimerStop = () => {
    if (selectedTopicId && timerSeconds > 60) {
      addSession(selectedTopicId, Math.floor(timerSeconds / 60));
    }
    setIsTimerActive(false);
    setTimerSeconds(0);
  };

  const getObsidianLink = (item: { name: string, obsidianPath?: string }) => {
    if (!activeCourse) return '#';
    const path = item.obsidianPath || `${activeCourse.name}/${item.name}`;
    return `obsidian://open?vault=${encodeURIComponent(activeCourse.vaultName)}&file=${encodeURIComponent(path)}`;
  };

  const getObsidianCreateLink = (item: { name: string, obsidianPath?: string }) => {
    if (!activeCourse) return '#';
    const path = item.obsidianPath || `${activeCourse.name}/${item.name}`;
    const parts = path.split('/');
    const name = parts.pop() || item.name;
    const folder = parts.join('/');
    return `obsidian://new?vault=${encodeURIComponent(activeCourse.vaultName)}&name=${encodeURIComponent(name)}${folder ? `&path=${encodeURIComponent(folder)}` : ''}`;
  };

  const handleAddCourse = () => {
    if (!newCourseName.trim()) return;
    const newCourse: Course = {
      id: crypto.randomUUID(),
      name: newCourseName,
      description: 'Custom Professional Course',
      topics: [],
      sessions: [],
      assessments: [],
      scheduledRevisions: [],
      examDate: format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd'),
      vaultName: 'My-Notes'
    };
    setState(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse],
      activeCourseId: newCourse.id
    }));
    setNewCourseName('');
    setShowAddCourseModal(false);
  };

  const resetProgress = () => {
    setConfirmModal({
      show: true,
      title: 'Reset Progress',
      message: 'Are you sure you want to reset all progress? This will clear all courses, topics, and study history. This action is irreversible.',
      onConfirm: () => {
        localStorage.removeItem('prestige_tracker_state');
        localStorage.removeItem('cfa_tracker_state');
        window.location.reload();
      }
    });
  };

  const deleteCourse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({
      show: true,
      title: 'Delete Course',
      message: 'Are you sure you want to delete this course? All progress will be lost.',
      onConfirm: () => {
        setState(prev => ({
          ...prev,
          courses: prev.courses.filter(c => c.id !== id),
          activeCourseId: prev.activeCourseId === id ? null : prev.activeCourseId
        }));
      }
    });
  };

  if (!state.activeCourseId) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-[#F5F2ED] font-sans atmosphere flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full space-y-12"
        >
          <div className="text-center space-y-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 border-2 border-prestige-gold flex items-center justify-center rotate-45 mx-auto mb-8"
            >
              <span className="rotate-[-45deg] font-serif font-black text-2xl text-prestige-gold">M</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter uppercase">Mastery Progress</h1>
            <p className="text-white/40 font-light text-lg">Select your path to professional excellence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {state.courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                onClick={() => setState(prev => ({ ...prev, activeCourseId: course.id }))}
                className="group glass p-8 cursor-pointer hover:bg-white/5 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-prestige-gold/0 group-hover:bg-prestige-gold transition-all duration-500" />
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-serif font-bold group-hover:text-prestige-gold transition-colors">{course.name}</h2>
                  <button 
                    onClick={(e) => deleteCourse(course.id, e)}
                    className="opacity-0 group-hover:opacity-40 hover:opacity-100 transition-all text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-white/40 text-sm font-light mb-6">{course.description}</p>
                <div className="flex items-center gap-2 text-prestige-gold text-[10px] uppercase tracking-widest font-bold">
                  Enter Command Center <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * state.courses.length }}
              onClick={() => setShowAddCourseModal(true)}
              className="group glass p-8 cursor-pointer border-dashed border-white/10 hover:border-prestige-gold/50 transition-all duration-500 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-prestige-gold group-hover:text-prestige-gold transition-all">
                <Plus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold">Add Professional Course</h2>
                <p className="text-white/40 text-xs font-light">Custom curriculum tracking</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showAddCourseModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
              onClick={() => setShowAddCourseModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-dark w-full max-w-md p-6 md:p-10 space-y-6 md:space-y-8"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-2xl md:text-3xl font-serif font-bold">New Course</h3>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest opacity-30">Course Name</label>
                  <input 
                    autoFocus
                    type="text"
                    value={newCourseName}
                    onChange={e => setNewCourseName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCourse()}
                    placeholder="e.g. CPA, FRM, Bar Exam..."
                    className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-prestige-gold/50 transition-colors"
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowAddCourseModal(false)}
                    className="flex-1 py-4 border border-white/10 text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddCourse}
                    className="flex-1 py-4 bg-prestige-gold text-black text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all"
                  >
                    Create Course
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // If we have an active course, render the main tracker
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F5F2ED] font-sans atmosphere overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-24 flex-col items-center py-12 border-r border-white/5 glass-dark z-50">
        <button 
          onClick={() => setState(prev => ({ ...prev, activeCourseId: null }))}
          className="mb-16 group relative"
        >
          <div className="w-10 h-10 border border-prestige-gold flex items-center justify-center rotate-45 group-hover:bg-prestige-gold transition-all duration-500">
            <span className="rotate-[-45deg] font-serif font-black text-prestige-gold group-hover:text-black transition-all">
              M
            </span>
          </div>
          <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap bg-black p-2 border border-white/10">
            Change Course
          </span>
        </button>

        <nav className="flex-1 flex flex-col gap-6 py-4 overflow-y-auto no-scrollbar">
          {[
            { id: 'dashboard', icon: LayoutDashboard },
            { id: 'plan', icon: ClipboardList },
            { id: 'topics', icon: BookOpen },
            { id: 'calendar', icon: Calendar },
            { id: 'sessions', icon: Clock },
            { id: 'mistakes', icon: AlertCircle },
            { id: 'tools', icon: Wrench },
            { id: 'assessments', icon: Award },
            { id: 'notebook', icon: FileText },
            { id: 'audit', icon: BarChart4 },
            { id: 'settings', icon: Settings }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "relative p-3 transition-all duration-500 group",
                activeTab === tab.id ? "text-prestige-gold" : "text-white/30 hover:text-white/60"
              )}
            >
              <tab.icon size={22} strokeWidth={1.5} />
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute -right-[1px] top-1/4 bottom-1/4 w-[2px] bg-prestige-gold shadow-[0_0_10px_rgba(197,160,89,0.5)]"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-6">
          <div className="vertical-rl text-[10px] uppercase tracking-[0.3em] font-light opacity-30">
            {activeCourse.name}
          </div>
        </div>
      </aside>

      {/* Mobile Nav - Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0A0A0B]/80 backdrop-blur-xl border-t border-white/5 md:hidden flex items-center justify-around px-4 z-50">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'plan', icon: ClipboardList },
          { id: 'topics', icon: BookOpen },
          { id: 'calendar', icon: Calendar },
          { id: 'mistakes', icon: AlertCircle },
          { id: 'sessions', icon: Clock },
          { id: 'settings', icon: Settings }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "p-2 transition-all duration-300",
              activeTab === tab.id ? "text-prestige-gold" : "text-white/30"
            )}
          >
            <tab.icon size={20} strokeWidth={2} />
          </button>
        ))}
        <button 
          onClick={() => setState(prev => ({ ...prev, activeCourseId: null }))}
          className="p-2 text-white/30"
        >
          <div className="w-5 h-5 border border-prestige-gold/40 flex items-center justify-center rotate-45">
            <span className="rotate-[-45deg] text-[8px] font-serif font-black text-prestige-gold">M</span>
          </div>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="ml-0 md:ml-24 h-screen overflow-y-auto relative pb-20 md:pb-0">
        {/* Top Right Calculator Trigger */}
        <button 
          onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
          className={cn(
            "fixed top-6 right-6 md:top-8 md:right-8 z-[100] p-3 md:p-4 glass-dark border border-white/10 rounded-full transition-all duration-500 group hover:border-prestige-gold/50",
            isCalculatorOpen ? "text-prestige-gold shadow-[0_0_20px_rgba(197,160,89,0.2)]" : "text-white/40 hover:text-white"
          )}
        >
          <Calculator size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap bg-black/90 p-2 px-4 border border-white/10 pointer-events-none">
            Financial Calculator
          </span>
        </button>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && stats && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 md:p-16 max-w-7xl mx-auto space-y-8"
            >
              {/* Hero Section */}
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 text-prestige-gold"
                  >
                    <Target size={16} />
                    <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-medium">Mastery Progress • {stats.progress}% Complete</span>
                  </motion.div>
                  <h1 className="text-4xl md:text-8xl font-serif font-black leading-[0.9] tracking-tighter uppercase">
                    {activeCourse.name}
                  </h1>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest opacity-30">Exam Date</p>
                    <p className="text-lg md:text-xl font-mono">{format(parseISO(activeCourse.examDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="h-12 w-px bg-white/10" />
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest opacity-30">Days Remaining</p>
                    <p className="text-lg md:text-xl font-mono text-prestige-gold">{stats.daysLeft}</p>
                  </div>
                </div>
              </header>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-2 gap-4 h-auto md:h-[800px]">
                {/* Readiness Score */}
                <div className="md:col-span-1 md:row-span-1 glass p-8 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
                    <TrendingUp size={200} />
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-1">Readiness Score</h3>
                    <p className="text-xs text-prestige-gold/60 italic font-serif">Weighted Mastery</p>
                  </div>
                  <div className="relative">
                    <span className="text-6xl md:text-8xl font-mono font-black">{stats.readinessScore}</span>
                    <span className="text-lg md:text-xl opacity-20 ml-2">%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.readinessScore}%` }}
                        className="h-full bg-prestige-gold"
                      />
                    </div>
                    <p className="text-[10px] opacity-30 uppercase tracking-widest">Target: 85% for Confidence</p>
                  </div>
                </div>

                {/* Velocity Chart */}
                <div className="md:col-span-2 md:row-span-1 glass p-8 flex flex-col space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-1">Study Velocity</h3>
                      <p className="text-xs text-prestige-gold/60 italic font-serif">Hours per Day</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-40">
                      <Zap size={12} /> Last 7 Days
                    </div>
                  </div>
                  <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#ffffff" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          dy={10}
                          opacity={0.3}
                        />
                        <YAxis 
                          stroke="#ffffff" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          dx={-10}
                          opacity={0.3}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0B', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F2ED', fontSize: '12px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="hours" 
                          stroke="#C5A059" 
                          fillOpacity={1} 
                          fill="url(#colorHours)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Streak & Hours */}
                <div className="md:col-span-1 md:row-span-1 grid grid-rows-2 gap-4">
                  <div className="glass p-6 flex flex-col justify-between group cursor-default">
                    <div className="flex justify-between items-start">
                      <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40">Current Streak</h3>
                      <Flame size={16} className="text-orange-500 group-hover:scale-125 transition-transform" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-mono font-bold">{stats.streak}</span>
                      <span className="text-xs opacity-30 uppercase tracking-widest">Days</span>
                    </div>
                  </div>
                  <div className="glass p-6 flex flex-col justify-between group cursor-default">
                    <div className="flex justify-between items-start">
                      <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40">Total Investment</h3>
                      <Clock size={16} className="text-prestige-gold group-hover:rotate-12 transition-transform" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-mono font-bold">{stats.totalHours}</span>
                      <span className="text-xs opacity-30 uppercase tracking-widest">Hours</span>
                    </div>
                  </div>
                </div>

                {/* Next Focus */}
                <div className="md:col-span-1 md:row-span-1 glass p-8 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-1">Next Focus</h3>
                      <p className="text-xs text-prestige-gold/60 italic font-serif">Priority Topics</p>
                    </div>
                    <div className="space-y-6">
                      {activeCourse.topics.filter(t => t.status === 'In Progress' || t.status === 'Review').slice(0, 2).map(topic => (
                        <motion.div 
                          key={topic.id}
                          whileHover={{ x: 5 }}
                          className="group cursor-pointer"
                          onClick={() => { setSelectedTopicId(topic.id); setActiveTab('topics'); }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-[8px] uppercase tracking-widest text-prestige-gold">{topic.weight} Weight</p>
                            {topic.status === 'Review' && <span className="text-[8px] uppercase tracking-widest text-red-500 animate-pulse">Review Needed</span>}
                          </div>
                          <h4 className="text-lg font-serif leading-tight group-hover:text-prestige-gold transition-colors">{topic.name}</h4>
                          <div className="mt-3 h-0.5 w-full bg-white/5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${topic.confidence * 20}%` }}
                              className={cn("h-full", topic.status === 'Review' ? "bg-red-500" : "bg-prestige-gold")}
                            />
                          </div>
                        </motion.div>
                      ))}
                      {activeCourse.topics.filter(t => t.status === 'In Progress' || t.status === 'Review').length === 0 && (
                        <p className="text-sm opacity-30 italic">No active topics. Start a topic from the curriculum to see it here.</p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('topics')}
                    className="w-full py-3 border border-white/10 text-[8px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500 mt-4"
                  >
                    Curriculum
                  </button>
                </div>

                {/* Strategic Tracking Bento */}
                <div className="md:col-span-3 md:row-span-1 grid md:grid-cols-3 gap-4">
                  {/* Ethics Tracker */}
                  <div className="glass p-6 flex flex-col justify-between group overflow-hidden relative">
                    <Zap size={80} className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 transition-all text-prestige-gold" />
                    <div className="flex justify-between items-start">
                      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-prestige-gold">Ethics Mastery</h3>
                      <button 
                        onClick={() => updateActiveCourse({ ethicsMiniMocks: [...(activeCourse.ethicsMiniMocks || []), new Date().toISOString()] })}
                        className="p-1 px-2 border border-prestige-gold/20 rounded text-[8px] uppercase tracking-widest hover:bg-prestige-gold hover:text-black transition-all"
                      >
                        + Log Mini-Mock
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-baseline gap-4">
                        <div className="flex flex-col">
                          <span className="text-3xl font-mono font-bold">{stats.ethicsMiniMocksCompleted}</span>
                          <span className="text-[8px] uppercase tracking-widest opacity-40">Mocks</span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex flex-col">
                          <span className="text-3xl font-mono font-bold text-prestige-gold">{stats.dailyEthicsDripsThisWeek}/7</span>
                          <span className="text-[8px] uppercase tracking-widest opacity-40">Drip Streak</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "h-1.5 flex-1 rounded-full",
                              i < stats.dailyEthicsDripsThisWeek ? "bg-prestige-gold" : "bg-white/5"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mistake Journal Stats */}
                  <div className="glass p-6 flex flex-col justify-between group cursor-pointer" onClick={() => setActiveTab('mistakes')}>
                    <div className="flex justify-between items-start">
                      <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40">Mistake Journal</h3>
                      <AlertCircle size={16} className="text-red-500 opacity-40" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-mono font-bold">{stats.mistakeJournalEntriesCount}</span>
                      <span className="text-xs opacity-30 uppercase tracking-widest">Leads</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-red-500/60 font-bold">Fix these before mocks</p>
                  </div>

                  {/* Build & Recovery */}
                  <div className="glass p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center group cursor-pointer" onClick={() => setActiveTab('tools')}>
                        <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40">Tool Builds</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-prestige-gold font-bold">{stats.toolCompletionPercentage}%</span>
                          <Wrench size={14} className="text-prestige-gold opacity-40 group-hover:rotate-45 transition-transform" />
                        </div>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.toolCompletionPercentage}%` }}
                          className="h-full bg-prestige-gold"
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] opacity-40">Recovery Days</h3>
                        <p className="text-xl font-mono text-blue-400 font-bold">{stats.recoveryDaysUsed}</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('calendar')}
                        className="p-1 px-3 glass hover:bg-white/10 transition-all text-[8px] uppercase tracking-widest font-bold"
                      >
                        Log Rest
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'topics' && (
            <motion.div 
              key="topics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 md:p-16 max-w-7xl mx-auto space-y-12"
            >
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                  <h2 className="text-6xl font-serif font-black tracking-tighter">Curriculum</h2>
                  <p className="text-white/40 mt-4 font-light">Mastering the pillars of {activeCourse.name}.</p>
                </div>
                
                <div className="flex items-center gap-6 glass p-4 px-8">
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] uppercase tracking-widest opacity-30">Active Session</p>
                    <p className="text-2xl font-mono font-light text-prestige-gold">
                      {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <button 
                    onClick={() => {
                      if (!selectedTopicId) return alert('Select a topic from the list below.');
                      isTimerActive ? handleTimerStop() : setIsTimerActive(true);
                    }}
                    className={cn(
                      "p-3 rounded-full transition-all duration-500",
                      isTimerActive ? "bg-red-500/20 text-red-500" : "bg-prestige-gold/20 text-prestige-gold"
                    )}
                  >
                    {isTimerActive ? <Clock size={20} /> : <Zap size={20} />}
                  </button>
                  {isTimerActive && (
                    <button 
                      onClick={() => setIsZenMode(true)}
                      className="p-3 rounded-full bg-white/5 text-white/40 hover:text-prestige-gold transition-all duration-500"
                      title="Enter Zen Mode"
                    >
                      <Target size={20} />
                    </button>
                  )}
                </div>
              </header>

              <div className="grid grid-cols-1 gap-4">
                {activeCourse.topics.length === 0 && (
                  <div className="glass p-12 text-center space-y-6">
                    <p className="text-white/40 italic">No topics defined for this course yet.</p>
                    <button 
                      onClick={() => {
                        setInputModal({
                          show: true,
                          title: 'New Topic',
                          label: 'Topic Name',
                          placeholder: 'e.g. Financial Reporting, Derivatives...',
                          value: '',
                          onConfirm: (name) => {
                            if (name) {
                              const newTopic: CFATopic = {
                                id: crypto.randomUUID(),
                                name,
                                weight: 'Custom',
                                status: 'Not Started',
                                confidence: 0
                              };
                              updateActiveCourse({ topics: [...activeCourse.topics, newTopic] });
                            }
                          }
                        });
                      }}
                      className="px-8 py-3 border border-prestige-gold text-prestige-gold text-[10px] uppercase tracking-widest hover:bg-prestige-gold hover:text-black transition-all"
                    >
                      Add First Topic
                    </button>
                  </div>
                )}
                {activeCourse.topics.map((topic, idx) => (
                  <div key={topic.id} className="space-y-1">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={cn(
                        "group relative grid grid-cols-1 md:grid-cols-[60px_1fr_120px_150px_100px] items-center p-8 transition-all duration-500 cursor-pointer overflow-hidden",
                        selectedTopicId === topic.id ? "glass-dark border-prestige-gold/50 bg-prestige-gold/5" : "glass hover:bg-white/5"
                      )}
                    >
                      {selectedTopicId === topic.id && (
                        <motion.div layoutId="active-topic" className="absolute left-0 top-0 bottom-0 w-1 bg-prestige-gold" />
                      )}
                      
                      <span className={cn(
                        "text-2xl font-serif italic transition-all",
                        selectedTopicId === topic.id ? "opacity-100 text-prestige-gold" : "opacity-20 group-hover:opacity-100 group-hover:text-prestige-gold"
                      )}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      
                      <div>
                        <h4 className={cn(
                          "text-xl font-serif transition-transform duration-500",
                          selectedTopicId === topic.id ? "text-prestige-gold translate-x-2" : "group-hover:translate-x-2"
                        )}>{topic.name}</h4>
                        <p className="text-[10px] uppercase tracking-widest opacity-30 mt-1">{topic.weight} Weight</p>
                      </div>

                      <div className={cn(
                        "text-[10px] uppercase tracking-widest",
                        topic.status === 'Review' ? "text-red-500 font-bold" : "opacity-40"
                      )}>
                        {topic.status}
                      </div>

                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <div 
                            key={star}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full transition-all duration-500",
                              topic.confidence >= star ? "bg-prestige-gold shadow-[0_0_8px_rgba(197,160,89,0.5)]" : "bg-white/10"
                            )}
                          />
                        ))}
                      </div>

                      <div className="flex justify-end gap-6 opacity-100 transition-opacity">
                        <div className="flex items-center gap-4">
                          {topic.status !== 'Completed' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedTopics = activeCourse.topics.map(t => 
                                  t.id === topic.id ? { ...t, status: 'Completed' as const } : t
                                );
                                updateActiveCourse({ topics: updatedTopics });
                              }}
                              className="text-green-500/40 hover:text-green-500 transition-colors"
                              title="Mark as Completed"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const newAss: any = {
                                id: crypto.randomUUID(),
                                type: 'Sectional Test',
                                topicId: topic.id,
                                name: `Assessment: ${topic.name}`,
                                date: format(new Date(), 'yyyy-MM-dd'),
                                time: format(new Date(), 'HH:mm'),
                                status: 'Scheduled',
                                strengthTopics: [],
                                weaknessTopics: []
                              };
                              updateActiveCourse({ assessments: [...activeCourse.assessments, newAss] });
                              setActiveTab('assessments');
                            }}
                            className="text-prestige-gold/40 hover:text-prestige-gold transition-colors"
                            title="Schedule Assessment"
                          >
                            <Award size={18} />
                          </button>
                        </div>
                        <div className="h-4 w-px bg-white/10 self-center" />
                        <div className="flex items-center gap-2">
                          <a 
                            href={getObsidianLink(topic)} 
                            onClick={e => e.stopPropagation()} 
                            className="text-prestige-gold hover:text-white transition-colors flex items-center gap-2"
                            title="Open in Obsidian"
                          >
                            <ExternalLink size={18} />
                            <span className="text-[10px] uppercase tracking-widest hidden lg:inline">Notes</span>
                          </a>
                          <a 
                            href={getObsidianCreateLink(topic)} 
                            onClick={e => e.stopPropagation()} 
                            className="text-white/20 hover:text-prestige-gold transition-colors"
                            title="Create Note if Missing"
                          >
                            <Plus size={14} />
                          </a>
                        </div>
                        <div className="h-4 w-px bg-white/10 self-center" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTopicId(topic.id);
                          }}
                          className="text-white/40 hover:text-prestige-gold transition-colors"
                          title="Edit Topic"
                        >
                          <Settings size={18} />
                        </button>
                      </div>
                    </motion.div>

                    <AnimatePresence>
                      {selectedTopicId === topic.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden ml-4 md:ml-[60px] space-y-1"
                        >
                          {topic.subTopics?.map(st => (
                            <div key={st.id} className="glass-dark p-4 flex items-center justify-between group border-l border-prestige-gold/20">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-1 h-1 rounded-full",
                                  st.status === 'Completed' ? "bg-green-500" : "bg-white/20"
                                )} />
                                <span className="text-sm font-serif opacity-60 group-hover:opacity-100 transition-opacity">{st.name}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <div 
                                      key={star}
                                      className={cn(
                                        "w-1 h-1 rounded-full transition-all",
                                        st.confidence >= star ? "bg-prestige-gold" : "bg-white/5"
                                      )}
                                    />
                                  ))}
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newAss: any = {
                                      id: crypto.randomUUID(),
                                      type: 'Sectional Test',
                                      topicId: topic.id,
                                      subTopicId: st.id,
                                      name: `Assessment: ${st.name}`,
                                      date: format(new Date(), 'yyyy-MM-dd'),
                                      time: format(new Date(), 'HH:mm'),
                                      status: 'Scheduled',
                                      strengthTopics: [],
                                      weaknessTopics: []
                                    };
                                    updateActiveCourse({ assessments: [...activeCourse.assessments, newAss] });
                                    setActiveTab('assessments');
                                  }}
                                  className="text-prestige-gold/40 hover:text-prestige-gold transition-colors"
                                  title="Schedule Assessment"
                                >
                                  <Award size={14} />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newRev: any = {
                                      id: crypto.randomUUID(),
                                      type: 'Revision',
                                      topicId: topic.id,
                                      subTopicId: st.id,
                                      name: `Revision: ${st.name}`,
                                      date: format(new Date(), 'yyyy-MM-dd'),
                                      time: format(new Date(), 'HH:mm'),
                                      status: 'Scheduled',
                                      strengthTopics: [],
                                      weaknessTopics: []
                                    };
                                    
                                    // Update sub-topic status to 'Review'
                                    const updatedSubTopics = topic.subTopics?.map(sub => 
                                      sub.id === st.id ? { ...sub, status: 'Review' as const } : sub
                                    );
                                    
                                    updateTopic(topic.id, { subTopics: updatedSubTopics });
                                    updateActiveCourse({ assessments: [...activeCourse.assessments, newRev] });
                                    setActiveTab('assessments');
                                  }}
                                  className="text-prestige-gold/40 hover:text-prestige-gold transition-colors"
                                  title="Schedule Revision"
                                >
                                  <Calendar size={14} />
                                </button>
                                <a 
                                  href={getObsidianLink(st)}
                                  onClick={e => e.stopPropagation()}
                                  className="text-prestige-gold/40 hover:text-prestige-gold transition-colors"
                                  title="Open Note"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            </div>
                          ))}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              addSubTopic(topic.id);
                            }}
                            className="w-full p-3 border border-dashed border-white/5 text-[8px] uppercase tracking-widest opacity-20 hover:opacity-100 hover:border-prestige-gold/30 transition-all flex items-center justify-center gap-2"
                          >
                            <Plus size={10} /> {(!topic.subTopics || topic.subTopics.length === 0) ? 'Add First Sub-Topic' : 'Add Sub-Topic'}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                {activeCourse.topics.length > 0 && (
                  <button 
                    onClick={() => {
                      setInputModal({
                        show: true,
                        title: 'New Topic',
                        label: 'Topic Name',
                        placeholder: 'e.g. Fixed Income, Portfolio Management...',
                        value: '',
                        onConfirm: (name) => {
                          if (name) {
                            const newTopic: CFATopic = {
                              id: crypto.randomUUID(),
                              name,
                              weight: 'Custom',
                              status: 'Not Started',
                              confidence: 0
                            };
                            updateActiveCourse({ topics: [...activeCourse.topics, newTopic] });
                          }
                        }
                      });
                    }}
                    className="w-full py-6 border border-dashed border-white/10 text-[10px] uppercase tracking-widest opacity-30 hover:opacity-100 hover:border-prestige-gold/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Add Topic to Curriculum
                  </button>
                )}
              </div>

              <AnimatePresence>
                {editingTopicId && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md"
                    onClick={() => setEditingTopicId(null)}
                  >
                    <motion.div 
                      className="glass-dark w-full max-w-4xl p-6 md:p-12 space-y-8 md:space-y-12 relative overflow-y-auto max-h-[90vh]"
                      onClick={e => e.stopPropagation()}
                    >
                      <button 
                        onClick={() => setEditingTopicId(null)}
                        className="absolute top-4 right-4 md:top-8 md:right-8 text-white/30 hover:text-white"
                      >
                        <Settings size={20} />
                      </button>

                      <div className="space-y-4">
                        <p className="text-prestige-gold text-[10px] uppercase tracking-[0.4em]">Mastery Detail</p>
                        <h3 className="text-5xl font-serif font-black">{activeCourse.topics.find(t => t.id === editingTopicId)?.name}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest opacity-30">Status & Confidence</label>
                            <div className="flex gap-4">
                              <select 
                                value={activeCourse.topics.find(t => t.id === editingTopicId)?.status}
                                onChange={e => updateTopic(editingTopicId, { status: e.target.value as any })}
                                className="bg-white/5 border border-white/10 p-3 text-xs uppercase tracking-widest focus:outline-none"
                              >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Review">Review</option>
                              </select>
                              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button 
                                    key={star}
                                    onClick={() => updateTopic(editingTopicId, { confidence: star })}
                                    className={cn(
                                      "w-2 h-2 rounded-full transition-all",
                                      (activeCourse.topics.find(t => t.id === editingTopicId)?.confidence || 0) >= star ? "bg-prestige-gold" : "bg-white/10"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-end">
                              <label className="text-[10px] uppercase tracking-widest opacity-30">Obsidian Integration</label>
                              <div className="flex gap-4">
                                <a 
                                  href={getObsidianLink(activeCourse.topics.find(t => t.id === editingTopicId)!)}
                                  className="text-[10px] uppercase tracking-widest text-prestige-gold hover:text-white transition-colors"
                                >
                                  Open
                                </a>
                                <a 
                                  href={getObsidianCreateLink(activeCourse.topics.find(t => t.id === editingTopicId)!)}
                                  className="text-[10px] uppercase tracking-widest text-white/30 hover:text-prestige-gold transition-colors"
                                >
                                  Create
                                </a>
                              </div>
                            </div>
                            <input 
                              type="text"
                              value={activeCourse.topics.find(t => t.id === editingTopicId)?.obsidianPath || ''}
                              onChange={e => updateTopic(editingTopicId, { obsidianPath: e.target.value })}
                              placeholder="Path in vault..."
                              className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-prestige-gold/50 transition-colors"
                            />
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] uppercase tracking-widest opacity-30">Sub-Topics / Readings</label>
                              <button 
                                onClick={() => addSubTopic(editingTopicId!)}
                                className="text-[8px] uppercase tracking-widest text-prestige-gold hover:text-white transition-colors flex items-center gap-2"
                              >
                                Add Sub-Topic <Plus size={10} />
                              </button>
                            </div>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                              {activeCourse.topics.find(t => t.id === editingTopicId)?.subTopics?.map(st => (
                                <div key={st.id} className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 group">
                                  <div className="flex-1">
                                    <p className="text-sm font-serif">{st.name}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                      <select 
                                        value={st.status}
                                        onChange={e => updateSubTopic(editingTopicId!, st.id, { status: e.target.value as any })}
                                        className="bg-transparent text-[8px] uppercase tracking-widest opacity-40 focus:outline-none"
                                      >
                                        <option value="Not Started">Not Started</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Review">Review</option>
                                      </select>
                                      <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                          <button 
                                            key={star}
                                            onClick={() => updateSubTopic(editingTopicId!, st.id, { confidence: star })}
                                            className={cn(
                                              "w-1 h-1 rounded-full transition-all",
                                              st.confidence >= star ? "bg-prestige-gold" : "bg-white/10"
                                            )}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a 
                                      href={getObsidianLink(st)}
                                      className="text-prestige-gold/60 hover:text-prestige-gold"
                                      title="Open Note"
                                    >
                                      <ExternalLink size={14} />
                                    </a>
                                    <button 
                                      onClick={() => deleteSubTopic(editingTopicId!, st.id)}
                                      className="text-red-500/40 hover:text-red-500"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {(!activeCourse.topics.find(t => t.id === editingTopicId)?.subTopics || activeCourse.topics.find(t => t.id === editingTopicId)?.subTopics?.length === 0) && (
                                <p className="text-[10px] opacity-20 italic text-center py-4">No sub-topics defined.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest opacity-30">Quick Notes</label>
                            <textarea 
                              value={activeCourse.topics.find(t => t.id === editingTopicId)?.notes || ''}
                              onChange={e => updateTopic(editingTopicId, { notes: e.target.value })}
                              rows={6}
                              className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-prestige-gold/50 transition-colors resize-none"
                              placeholder="Formulas, concepts, reminders..."
                            />
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] uppercase tracking-widest opacity-30">Quick Fire Recall</label>
                              <button 
                                onClick={() => generateQuickFire(activeCourse.topics.find(t => t.id === editingTopicId)?.name || '')}
                                disabled={isGeneratingQuestions}
                                className="text-[8px] uppercase tracking-widest text-prestige-gold hover:text-white transition-colors flex items-center gap-2"
                              >
                                {isGeneratingQuestions ? 'Generating...' : 'Generate Questions'}
                                <Zap size={10} />
                              </button>
                            </div>
                            <div className="space-y-4">
                              {quickFireQuestions.map((q, i) => (
                                <div key={i} className="p-4 bg-white/5 border border-white/10 space-y-2 group">
                                  <p className="text-xs font-serif italic text-white/60">{q.question}</p>
                                  <p className="text-xs font-mono text-prestige-gold opacity-0 group-hover:opacity-100 transition-opacity">
                                    {q.answer}
                                  </p>
                                </div>
                              ))}
                              {quickFireQuestions.length === 0 && !isGeneratingQuestions && (
                                <p className="text-[10px] opacity-20 italic text-center py-4">Generate recall questions to test your knowledge.</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4">
                            <button 
                              onClick={() => {
                                setConfirmModal({
                                  show: true,
                                  title: 'Delete Topic',
                                  message: 'Are you sure you want to delete this topic? This will also delete all associated sub-topics.',
                                  onConfirm: () => {
                                    updateActiveCourse({ topics: activeCourse.topics.filter(t => t.id !== editingTopicId) });
                                    setEditingTopicId(null);
                                    if (selectedTopicId === editingTopicId) setSelectedTopicId(null);
                                  }
                                });
                              }}
                              className="text-[10px] uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Delete Topic
                            </button>
                            <button 
                              onClick={() => setEditingTopicId(null)}
                              className="px-8 py-3 bg-prestige-gold text-black text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all"
                            >
                              Save & Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <CalendarView 
              activeCourse={activeCourse} 
              updateActiveCourse={updateActiveCourse} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'sessions' && (
            <motion.div 
              key="sessions"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 md:p-16 max-w-7xl mx-auto space-y-12"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-6xl font-serif font-black tracking-tighter">History</h2>
                  <p className="text-white/40 mt-4 font-light">A detailed log of your study sessions.</p>
                </div>
              </header>

              <div className="glass overflow-x-auto border border-white/5">
                <table className="w-full text-left border-collapse min-w-[700px] md:min-w-0">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest opacity-40">
                      <th className="p-6 font-medium">Date</th>
                      <th className="p-6 font-medium">Topic</th>
                      <th className="p-6 font-medium">Time (From-To)</th>
                      <th className="p-6 font-medium">Duration</th>
                      <th className="p-6 font-medium">Pages</th>
                      <th className="p-6 font-medium">Progress</th>
                      <th className="p-6 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activeCourse.sessions.map((session) => {
                      const topic = activeCourse.topics.find(t => t.id === session.topicId);
                      return (
                        <tr key={session.id} className="group hover:bg-white/5 transition-colors">
                          <td className="p-6 text-sm font-light">{format(parseISO(session.date), 'MMM dd, yyyy')}</td>
                          <td className="p-6">
                            <p className="text-sm font-serif">{topic?.name || 'Deleted Topic'}</p>
                          </td>
                          <td className="p-6 text-xs font-mono opacity-60">
                            {session.startTime && session.endTime ? `${session.startTime} - ${session.endTime}` : '-'}
                          </td>
                          <td className="p-6 text-sm font-serif italic text-prestige-gold">
                            {session.durationMinutes} min
                          </td>
                          <td className="p-6 text-xs font-mono opacity-60">
                            {session.startPage !== undefined && session.endPage !== undefined ? `${session.startPage} - ${session.endPage}` : '-'}
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden min-w-[60px]">
                                <div className="h-full bg-prestige-gold" style={{ width: `${session.sessionProgress || 0}%` }} />
                              </div>
                              <span className="text-[10px] font-mono opacity-40">{session.sessionProgress || 0}%</span>
                            </div>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => setEditingSessionId(session.id)}
                                className="text-white/40 hover:text-prestige-gold transition-colors"
                              >
                                <Settings size={14} />
                              </button>
                              <button 
                                onClick={() => updateActiveCourse({ sessions: activeCourse.sessions.filter(s => s.id !== session.id) })}
                                className="text-red-500/40 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {activeCourse.sessions.length === 0 && (
                  <div className="p-24 text-center opacity-20">
                    <Clock size={48} className="mx-auto mb-4" />
                    <p className="font-serif italic text-xl">No sessions logged yet.</p>
                  </div>
                )}
              </div>

              {/* Session Edit Modal */}
              <AnimatePresence>
                {editingSessionId && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md"
                    onClick={() => setEditingSessionId(null)}
                  >
                    <motion.div 
                      className="glass-dark w-full max-w-2xl p-6 md:p-12 space-y-6 md:space-y-8 relative overflow-y-auto max-h-[90vh]"
                      onClick={e => e.stopPropagation()}
                    >
                      <h3 className="text-xl md:text-3xl font-serif font-bold">Session Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase tracking-widest opacity-30">Start Time</label>
                          <input 
                            type="time"
                            value={activeCourse.sessions.find(s => s.id === editingSessionId)?.startTime || ''}
                            onChange={e => {
                              const sessions = activeCourse.sessions.map(s => s.id === editingSessionId ? { ...s, startTime: e.target.value } : s);
                              updateActiveCourse({ sessions });
                            }}
                            className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-prestige-gold/50"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase tracking-widest opacity-30">End Time</label>
                          <input 
                            type="time"
                            value={activeCourse.sessions.find(s => s.id === editingSessionId)?.endTime || ''}
                            onChange={e => {
                              const sessions = activeCourse.sessions.map(s => s.id === editingSessionId ? { ...s, endTime: e.target.value } : s);
                              updateActiveCourse({ sessions });
                            }}
                            className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-prestige-gold/50"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase tracking-widest opacity-30">Start Page</label>
                          <input 
                            type="number"
                            value={activeCourse.sessions.find(s => s.id === editingSessionId)?.startPage || ''}
                            onChange={e => {
                              const sessions = activeCourse.sessions.map(s => s.id === editingSessionId ? { ...s, startPage: parseInt(e.target.value) } : s);
                              updateActiveCourse({ sessions });
                            }}
                            className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-prestige-gold/50"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase tracking-widest opacity-30">End Page</label>
                          <input 
                            type="number"
                            value={activeCourse.sessions.find(s => s.id === editingSessionId)?.endPage || ''}
                            onChange={e => {
                              const sessions = activeCourse.sessions.map(s => s.id === editingSessionId ? { ...s, endPage: parseInt(e.target.value) } : s);
                              updateActiveCourse({ sessions });
                            }}
                            className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-prestige-gold/50"
                          />
                        </div>
                        <div className="col-span-2 space-y-4">
                          <label className="text-[10px] uppercase tracking-widest opacity-30">Session Progress (%)</label>
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            value={activeCourse.sessions.find(s => s.id === editingSessionId)?.sessionProgress || 0}
                            onChange={e => {
                              const sessions = activeCourse.sessions.map(s => s.id === editingSessionId ? { ...s, sessionProgress: parseInt(e.target.value) } : s);
                              updateActiveCourse({ sessions });
                            }}
                            className="w-full accent-prestige-gold"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => setEditingSessionId(null)}
                        className="w-full py-4 bg-prestige-gold text-black text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all"
                      >
                        Save Details
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'assessments' && (
            <motion.div 
              key="assessments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 md:p-16 max-w-7xl mx-auto space-y-12"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-6xl font-serif font-black tracking-tighter">Assessments</h2>
                  <p className="text-white/40 mt-4 font-light">Schedule and track your mocks and revisions.</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      const newAssessment: any = {
                        id: crypto.randomUUID(),
                        type: 'Revision',
                        name: 'Topic Revision Session',
                        date: format(new Date(), 'yyyy-MM-dd'),
                        time: format(new Date(), 'HH:mm'),
                        status: 'Scheduled',
                        strengthTopics: [],
                        weaknessTopics: []
                      };
                      updateActiveCourse({ assessments: [...(activeCourse.assessments || []), newAssessment] });
                      setEditingAssessmentId(newAssessment.id);
                    }}
                    className="px-8 py-4 border border-white/10 text-white/40 text-[10px] uppercase tracking-[0.3em] hover:border-prestige-gold hover:text-prestige-gold transition-all duration-500 flex items-center gap-2"
                  >
                    <Calendar size={14} /> Schedule Revision
                  </button>
                  <button 
                    onClick={() => {
                      const newAssessment: any = {
                        id: crypto.randomUUID(),
                        type: 'Mock',
                        name: 'New Mock Exam',
                        date: format(new Date(), 'yyyy-MM-dd'),
                        status: 'Scheduled',
                        strengthTopics: [],
                        weaknessTopics: []
                      };
                      updateActiveCourse({ assessments: [...(activeCourse.assessments || []), newAssessment] });
                      setEditingAssessmentId(newAssessment.id);
                    }}
                    className="px-8 py-4 border border-prestige-gold text-prestige-gold text-[10px] uppercase tracking-[0.3em] hover:bg-prestige-gold hover:text-black transition-all duration-500 flex items-center gap-2"
                  >
                    <Plus size={14} /> Schedule Assessment
                  </button>
                </div>
              </header>

              {/* Performance Summary Table */}
              <div className="glass p-10 space-y-8">
                <div className="flex justify-between items-end">
                  <h3 className="text-2xl font-serif">Performance Summary</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-30">Aggregated by Assessment Type</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-4 text-[10px] uppercase tracking-widest opacity-30">Type</th>
                        <th className="pb-4 text-[10px] uppercase tracking-widest opacity-30">Count</th>
                        <th className="pb-4 text-[10px] uppercase tracking-widest opacity-30">Avg. Score</th>
                        <th className="pb-4 text-[10px] uppercase tracking-widest opacity-30">Total Marks</th>
                        <th className="pb-4 text-[10px] uppercase tracking-widest opacity-30">Avg. Accuracy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {['Mock', 'Sectional Test', 'Revision'].map(type => {
                        const completed = (activeCourse.assessments || []).filter(a => a.status === 'Completed' && a.type === type);
                        const totalScore = completed.reduce((sum, a) => sum + (a.score || 0), 0);
                        const totalPossible = completed.reduce((sum, a) => sum + (a.totalMarks || 100), 0);
                        const accuracy = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
                        
                        return (
                          <tr key={type} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="py-6 font-serif text-lg">{type}</td>
                            <td className="py-6 font-mono text-sm opacity-60">{completed.length}</td>
                            <td className="py-6 font-mono text-sm opacity-60">
                              {type === 'Revision' ? '-' : (completed.length > 0 ? Math.round(totalScore / completed.length) : '-')}
                            </td>
                            <td className="py-6 font-mono text-sm opacity-60">
                              {type === 'Revision' ? '-' : totalPossible}
                            </td>
                            <td className="py-6">
                              {type === 'Revision' ? (
                                <span className="text-[10px] uppercase tracking-widest opacity-20 italic">Practice Only</span>
                              ) : (
                                <div className="flex items-center gap-4">
                                  <span className={cn(
                                    "font-mono text-sm",
                                    accuracy >= 70 ? "text-green-500" : accuracy >= 50 ? "text-prestige-gold" : "text-red-500"
                                  )}>{accuracy}%</span>
                                  <div className="flex-1 h-1 bg-white/5 max-w-[100px]">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${accuracy}%` }}
                                      className={cn(
                                        "h-full",
                                        accuracy >= 70 ? "bg-green-500" : accuracy >= 50 ? "bg-prestige-gold" : "bg-red-500"
                                      )}
                                    />
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Performance by Topic Table */}
              <div className="glass p-10 space-y-8">
                <div className="flex justify-between items-end">
                  <h3 className="text-2xl font-serif">Performance by Topic</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-30">Topic-Specific Assessment Data</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-4 text-[10px] uppercase tracking-widest opacity-30">Topic</th>
                        <th className="pb-4 text-[10px] uppercase tracking-widest opacity-30">Tests</th>
                        <th className="pb-4 text-[10px] uppercase tracking-widest opacity-30">Avg. Score</th>
                        <th className="pb-4 text-[10px] uppercase tracking-widest opacity-30">Avg. Accuracy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {activeCourse.topics.map(topic => {
                        const topicAssessments = (activeCourse.assessments || []).filter(a => 
                          a.status === 'Completed' && 
                          a.topicId === topic.id && 
                          a.type !== 'Revision'
                        );
                        if (topicAssessments.length === 0) return null;
                        
                        const totalScore = topicAssessments.reduce((sum, a) => sum + (a.score || 0), 0);
                        const totalPossible = topicAssessments.reduce((sum, a) => sum + (a.totalMarks || 100), 0);
                        const accuracy = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
                        
                        return (
                          <tr key={topic.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="py-6 font-serif text-lg">{topic.name}</td>
                            <td className="py-6 font-mono text-sm opacity-60">{topicAssessments.length}</td>
                            <td className="py-6 font-mono text-sm opacity-60">{Math.round(totalScore / topicAssessments.length)}</td>
                            <td className="py-6">
                              <div className="flex items-center gap-4">
                                <span className={cn(
                                  "font-mono text-sm",
                                  accuracy >= 70 ? "text-green-500" : accuracy >= 50 ? "text-prestige-gold" : "text-red-500"
                                )}>{accuracy}%</span>
                                <div className="flex-1 h-1 bg-white/5 max-w-[100px]">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${accuracy}%` }}
                                    className={cn(
                                      "h-full",
                                      accuracy >= 70 ? "bg-green-500" : accuracy >= 50 ? "bg-prestige-gold" : "bg-red-500"
                                    )}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {(activeCourse.assessments || []).filter(a => a.status === 'Completed' && !a.topicId && a.type !== 'Revision').length > 0 && (
                        <tr className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-6 font-serif text-lg opacity-40 italic">General / Full Course</td>
                          {(() => {
                            const general = (activeCourse.assessments || []).filter(a => a.status === 'Completed' && !a.topicId && a.type !== 'Revision');
                            const totalScore = general.reduce((sum, a) => sum + (a.score || 0), 0);
                            const totalPossible = general.reduce((sum, a) => sum + (a.totalMarks || 100), 0);
                            const accuracy = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
                            return (
                              <>
                                <td className="py-6 font-mono text-sm opacity-60">{general.length}</td>
                                <td className="py-6 font-mono text-sm opacity-60">{general.length > 0 ? Math.round(totalScore / general.length) : '-'}</td>
                                <td className="py-6">
                                  <div className="flex items-center gap-4">
                                    <span className={cn(
                                      "font-mono text-sm",
                                      accuracy >= 70 ? "text-green-500" : accuracy >= 50 ? "text-prestige-gold" : "text-red-500"
                                    )}>{accuracy}%</span>
                                    <div className="flex-1 h-1 bg-white/5 max-w-[100px]">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${accuracy}%` }}
                                        className={cn(
                                          "h-full",
                                          accuracy >= 70 ? "bg-green-500" : accuracy >= 50 ? "bg-prestige-gold" : "text-red-500"
                                        )}
                                      />
                                    </div>
                                  </div>
                                </td>
                              </>
                            );
                          })()}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Scheduled Revisions / Reminders */}
              {(activeCourse.assessments || []).filter(a => a.type === 'Revision' && a.status === 'Scheduled').length > 0 && (
                <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <h3 className="text-2xl font-serif">Scheduled Revisions</h3>
                    <p className="text-[10px] uppercase tracking-widest opacity-30">Upcoming Sessions</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeCourse.assessments
                      .filter(a => a.type === 'Revision' && a.status === 'Scheduled')
                      .map((rev) => {
                        const topic = activeCourse.topics.find(t => t.id === rev.topicId);
                        return (
                          <motion.div 
                            key={rev.id}
                            className="glass p-6 space-y-4 border-l-2 border-prestige-gold/30 hover:border-prestige-gold transition-all"
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <h4 className="font-serif text-lg">{rev.name || topic?.name || 'Revision Session'}</h4>
                                <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest opacity-40">
                                  <input 
                                    type="date"
                                    value={rev.date}
                                    onChange={e => {
                                      updateActiveCourse({
                                        assessments: activeCourse.assessments.map(a => 
                                          a.id === rev.id ? { ...a, date: e.target.value } : a
                                        )
                                      });
                                    }}
                                    className="bg-transparent border-none focus:outline-none focus:text-prestige-gold transition-colors"
                                  />
                                  <input 
                                    type="time"
                                    value={rev.time || ''}
                                    onChange={e => {
                                      updateActiveCourse({
                                        assessments: activeCourse.assessments.map(a => 
                                          a.id === rev.id ? { ...a, time: e.target.value } : a
                                        )
                                      });
                                    }}
                                    className="bg-transparent border-none focus:outline-none focus:text-prestige-gold transition-colors"
                                  />
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  updateActiveCourse({ 
                                    assessments: activeCourse.assessments.filter(a => a.id !== rev.id) 
                                  });
                                }}
                                className="text-white/20 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setEditingAssessmentId(rev.id)}
                                className="flex-1 py-2 bg-white/5 border border-white/10 text-[8px] uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all"
                              >
                                Log Results
                              </button>
                              <select 
                                value={rev.topicId || ''}
                                onChange={e => {
                                  updateActiveCourse({
                                    assessments: activeCourse.assessments.map(a => 
                                      a.id === rev.id ? { ...a, topicId: e.target.value || undefined } : a
                                    )
                                  });
                                }}
                                className="bg-white/5 border border-white/10 text-[8px] uppercase tracking-widest px-2 focus:outline-none"
                              >
                                <option value="">Full Course</option>
                                {activeCourse.topics.map(t => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                              </select>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(activeCourse.assessments || []).map((assessment) => (
                  <motion.div 
                    key={assessment.id}
                    className="glass p-10 space-y-6 group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-prestige-gold">{assessment.type}</span>
                        <h3 className="text-2xl font-serif">{assessment.name}</h3>
                        {assessment.subTopicId && (
                          <p className="text-[10px] uppercase tracking-widest text-prestige-gold/60 mt-1">
                            Sub-topic: {activeCourse.topics.find(t => t.id === assessment.topicId)?.subTopics?.find(st => st.id === assessment.subTopicId)?.name}
                          </p>
                        )}
                        <p className="text-xs opacity-40">{format(parseISO(assessment.date), 'MMMM dd, yyyy')}</p>
                        {assessment.originAssessmentId && (
                          <div className="flex items-center gap-2 mt-2 text-[8px] uppercase tracking-widest text-prestige-gold/50">
                            <TrendingUp size={10} />
                            <span>Follow-up from: {activeCourse.assessments.find(a => a.id === assessment.originAssessmentId)?.name || 'Previous Test'}</span>
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "px-3 py-1 text-[8px] uppercase tracking-widest border",
                        assessment.status === 'Completed' ? "border-green-500/50 text-green-500" : "border-white/20 text-white/40"
                      )}>
                        {assessment.status}
                      </div>
                    </div>

                    {assessment.status === 'Completed' && (
                      <div className="space-y-6 pt-6 border-t border-white/5">
                        {assessment.type !== 'Revision' && (
                          <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-widest opacity-30">Score</p>
                              <p className="text-3xl font-mono text-prestige-gold">
                                {assessment.score || 0}<span className="text-xs opacity-30 ml-1">/ {assessment.totalMarks || 100}</span>
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase tracking-widest opacity-30">Accuracy</p>
                              <p className="text-3xl font-mono">
                                {Math.round(((assessment.score || 0) / (assessment.totalMarks || 100)) * 100)}%
                                {assessment.originAssessmentId && (
                                  <span className={cn(
                                    "text-[10px] ml-2 font-sans",
                                    (() => {
                                      const prev = activeCourse.assessments.find(a => a.id === assessment.originAssessmentId);
                                      if (!prev || prev.score === undefined || prev.totalMarks === undefined) return "text-white/20";
                                      const prevAcc = (prev.score / prev.totalMarks) * 100;
                                      const currAcc = ((assessment.score || 0) / (assessment.totalMarks || 100)) * 100;
                                      return currAcc > prevAcc ? "text-green-500" : "text-red-500";
                                    })()
                                  )}>
                                    {(() => {
                                      const prev = activeCourse.assessments.find(a => a.id === assessment.originAssessmentId);
                                      if (!prev || prev.score === undefined || prev.totalMarks === undefined) return "";
                                      const prevAcc = Math.round((prev.score / prev.totalMarks) * 100);
                                      const currAcc = Math.round(((assessment.score || 0) / (assessment.totalMarks || 100)) * 100);
                                      const diff = currAcc - prevAcc;
                                      return diff >= 0 ? `+${diff}%` : `${diff}%`;
                                    })()}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {assessment.strengthTopics && assessment.strengthTopics.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[8px] uppercase tracking-widest text-green-500/60 font-bold">Strengths</p>
                              <div className="flex flex-wrap gap-1.5">
                                {assessment.strengthTopics.map(tid => {
                                  const t = activeCourse.topics.find(topic => topic.id === tid);
                                  return t ? (
                                    <span key={tid} className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] rounded-sm">
                                      {t.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                          {assessment.weaknessTopics && assessment.weaknessTopics.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[8px] uppercase tracking-widest text-red-500/60 font-bold">Weaknesses</p>
                              <div className="flex flex-wrap gap-1.5">
                                {assessment.weaknessTopics.map(tid => {
                                  const t = activeCourse.topics.find(topic => topic.id === tid);
                                  return t ? (
                                    <div key={tid} className="flex items-center gap-1">
                                      <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] rounded-sm">
                                        {t.name}
                                      </span>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const newRev: any = {
                                            id: crypto.randomUUID(),
                                            type: 'Revision',
                                            topicId: tid,
                                            name: `Revision: ${t.name}`,
                                            date: format(new Date(), 'yyyy-MM-dd'),
                                            time: format(new Date(), 'HH:mm'),
                                            status: 'Scheduled',
                                            strengthTopics: [],
                                            weaknessTopics: [],
                                            originAssessmentId: assessment.id
                                          };
                                          
                                          // Update topic status to 'Review'
                                          const updatedTopics = activeCourse.topics.map(topic => 
                                            topic.id === tid ? { ...topic, status: 'Review' as const } : topic
                                          );

                                          updateActiveCourse({ 
                                            assessments: [...activeCourse.assessments, newRev],
                                            topics: updatedTopics
                                          });
                                        }}
                                        className="p-1 text-white/20 hover:text-prestige-gold transition-colors"
                                        title="Schedule Revision & Mark for Review"
                                      >
                                        <Calendar size={10} />
                                      </button>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {(assessment.strengthImpact || assessment.weaknessImprovement) && (
                          <div className="space-y-3 bg-white/5 p-4 rounded-sm">
                            {assessment.strengthImpact && (
                              <div className="space-y-1">
                                <p className="text-[8px] uppercase tracking-widest text-green-500/60 font-bold">Impact</p>
                                <p className="text-xs italic opacity-70 leading-relaxed">"{assessment.strengthImpact}"</p>
                              </div>
                            )}
                            {assessment.weaknessImprovement && (
                              <div className="space-y-1">
                                <p className="text-[8px] uppercase tracking-widest text-red-500/60 font-bold">Improvement</p>
                                <p className="text-xs italic opacity-70 leading-relaxed">"{assessment.weaknessImprovement}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      {assessment.status === 'Scheduled' && assessment.type === 'Revision' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // 1. Mark current revision as completed
                            const updatedAssessments = activeCourse.assessments.map(a => 
                              a.id === assessment.id ? { ...a, status: 'Completed' as const } : a
                            );
                            
                            // 2. Create new assessment for the same topic
                            const topic = activeCourse.topics.find(t => t.id === assessment.topicId);
                            const newAss: any = {
                              id: crypto.randomUUID(),
                              type: 'Sectional Test',
                              topicId: assessment.topicId,
                              name: `Re-Assessment: ${topic?.name || 'Topic'}`,
                              date: format(new Date(), 'yyyy-MM-dd'),
                              time: format(new Date(), 'HH:mm'),
                              status: 'Scheduled',
                              strengthTopics: [],
                              weaknessTopics: [],
                              originAssessmentId: assessment.originAssessmentId || assessment.id
                            };
                            
                            updateActiveCourse({ assessments: [...updatedAssessments, newAss] });
                          }}
                          className="flex-1 py-3 bg-prestige-gold text-black text-[10px] uppercase tracking-widest hover:bg-white transition-all font-bold"
                        >
                          Complete & Re-Assess
                        </button>
                      )}
                      <button 
                        onClick={() => setEditingAssessmentId(assessment.id)}
                        className="flex-1 py-3 border border-white/10 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                      >
                        {assessment.status === 'Completed' ? 'View Results' : 'Update / Log Results'}
                      </button>
                      <button 
                        onClick={() => updateActiveCourse({ assessments: activeCourse.assessments.filter(a => a.id !== assessment.id) })}
                        className="p-3 border border-white/10 text-red-500/40 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Assessment Edit Modal */}
              <AnimatePresence>
                {editingAssessmentId && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md"
                    onClick={() => setEditingAssessmentId(null)}
                  >
                    <motion.div 
                      className="glass-dark w-full max-w-5xl p-12 space-y-12 relative max-h-[90vh] overflow-y-auto"
                      onClick={e => e.stopPropagation()}
                    >
                      <h3 className="text-4xl font-serif font-bold">Assessment Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest opacity-30">Basic Info</label>
                            <div className="space-y-4">
                              <input 
                                type="text"
                                value={activeCourse.assessments.find(a => a.id === editingAssessmentId)?.name || ''}
                                onChange={e => {
                                  const assessments = activeCourse.assessments.map(a => a.id === editingAssessmentId ? { ...a, name: e.target.value } : a);
                                  updateActiveCourse({ assessments });
                                }}
                                placeholder="Assessment Name"
                                className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-prestige-gold/50"
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <select 
                                  value={activeCourse.assessments.find(a => a.id === editingAssessmentId)?.type}
                                  onChange={e => {
                                    const assessments = activeCourse.assessments.map(a => a.id === editingAssessmentId ? { ...a, type: e.target.value as any } : a);
                                    updateActiveCourse({ assessments });
                                  }}
                                  className="w-full bg-white/5 border border-white/10 p-4 text-xs uppercase tracking-widest focus:outline-none appearance-none"
                                >
                                  <option value="Mock">Mock Exam</option>
                                  <option value="Revision">Revision</option>
                                  <option value="Sectional Test">Sectional Test</option>
                                </select>
                                <select 
                                  value={activeCourse.assessments.find(a => a.id === editingAssessmentId)?.topicId || ''}
                                  onChange={e => {
                                    const assessments = activeCourse.assessments.map(a => a.id === editingAssessmentId ? { ...a, topicId: e.target.value || undefined, subTopicId: undefined } : a);
                                    updateActiveCourse({ assessments });
                                  }}
                                  className="w-full bg-white/5 border border-white/10 p-4 text-xs uppercase tracking-widest focus:outline-none appearance-none truncate"
                                >
                                  <option value="">Full Course</option>
                                  {activeCourse.topics.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                                </select>
                                {activeCourse.assessments.find(a => a.id === editingAssessmentId)?.topicId && (
                                  <select 
                                    value={activeCourse.assessments.find(a => a.id === editingAssessmentId)?.subTopicId || ''}
                                    onChange={e => {
                                      const assessments = activeCourse.assessments.map(a => a.id === editingAssessmentId ? { ...a, subTopicId: e.target.value || undefined } : a);
                                      updateActiveCourse({ assessments });
                                    }}
                                    className="w-full bg-white/5 border border-white/10 p-4 text-xs uppercase tracking-widest focus:outline-none appearance-none truncate"
                                  >
                                    <option value="">All Sub-topics</option>
                                    {activeCourse.topics.find(t => t.id === activeCourse.assessments.find(a => a.id === editingAssessmentId)?.topicId)?.subTopics?.map(st => (
                                      <option key={st.id} value={st.id}>{st.name}</option>
                                    ))}
                                  </select>
                                )}
                                <input 
                                  type="date"
                                  value={activeCourse.assessments.find(a => a.id === editingAssessmentId)?.date}
                                  onChange={e => {
                                    const assessments = activeCourse.assessments.map(a => a.id === editingAssessmentId ? { ...a, date: e.target.value } : a);
                                    updateActiveCourse({ assessments });
                                  }}
                                  className="w-full bg-white/5 border border-white/10 p-4 text-xs focus:outline-none"
                                />
                                <input 
                                  type="time"
                                  value={activeCourse.assessments.find(a => a.id === editingAssessmentId)?.time || ''}
                                  onChange={e => {
                                    const assessments = activeCourse.assessments.map(a => a.id === editingAssessmentId ? { ...a, time: e.target.value } : a);
                                    updateActiveCourse({ assessments });
                                  }}
                                  className="w-full bg-white/5 border border-white/10 p-4 text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest opacity-30">Status & Performance</label>
                            <div className="space-y-4">
                              <select 
                                value={activeCourse.assessments.find(a => a.id === editingAssessmentId)?.status}
                                onChange={e => {
                                  const assessments = activeCourse.assessments.map(a => a.id === editingAssessmentId ? { ...a, status: e.target.value as any } : a);
                                  updateActiveCourse({ assessments });
                                }}
                                className="w-full bg-white/5 border border-white/10 p-4 text-xs uppercase tracking-widest focus:outline-none"
                              >
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              {activeCourse.assessments.find(a => a.id === editingAssessmentId)?.type !== 'Revision' && (
                                <div className="grid grid-cols-2 gap-4">
                                  <input 
                                    type="number"
                                    placeholder="Score"
                                    value={activeCourse.assessments.find(a => a.id === editingAssessmentId)?.score ?? ''}
                                    onChange={e => {
                                      const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                                      const assessments = activeCourse.assessments.map(a => a.id === editingAssessmentId ? { ...a, score: val, status: val !== undefined ? 'Completed' : a.status } : a);
                                      updateActiveCourse({ assessments });
                                    }}
                                    className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none"
                                  />
                                  <input 
                                    type="number"
                                    placeholder="Total Marks"
                                    value={activeCourse.assessments.find(a => a.id === editingAssessmentId)?.totalMarks ?? ''}
                                    onChange={e => {
                                      const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                                      const assessments = activeCourse.assessments.map(a => a.id === editingAssessmentId ? { ...a, totalMarks: val } : a);
                                      updateActiveCourse({ assessments });
                                    }}
                                    className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest opacity-30">Strengths & Weaknesses</label>
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest opacity-20">Strength Topics</p>
                                <div className="flex flex-wrap gap-2">
                                  {activeCourse.topics.map(topic => {
                                    const assessment = activeCourse.assessments.find(a => a.id === editingAssessmentId);
                                    const isSelected = assessment?.strengthTopics?.includes(topic.id);
                                    return (
                                      <button
                                        key={topic.id}
                                        onClick={() => {
                                          const assessments = activeCourse.assessments.map(a => {
                                            if (a.id !== editingAssessmentId) return a;
                                            const strengths = isSelected 
                                              ? a.strengthTopics.filter(id => id !== topic.id)
                                              : [...(a.strengthTopics || []), topic.id];
                                            return { ...a, strengthTopics: strengths };
                                          });
                                          updateActiveCourse({ assessments });
                                        }}
                                        className={cn(
                                          "px-3 py-1 text-[9px] border transition-all",
                                          isSelected ? "bg-green-500/20 border-green-500 text-green-500" : "border-white/10 text-white/40 hover:border-white/30"
                                        )}
                                      >
                                        {topic.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest opacity-20">Weakness Topics</p>
                                <div className="flex flex-wrap gap-2">
                                  {activeCourse.topics.map(topic => {
                                    const assessment = activeCourse.assessments.find(a => a.id === editingAssessmentId);
                                    const isSelected = assessment?.weaknessTopics?.includes(topic.id);
                                    return (
                                      <button
                                        key={topic.id}
                                        onClick={() => {
                                          const assessments = activeCourse.assessments.map(a => {
                                            if (a.id !== editingAssessmentId) return a;
                                            const weaknesses = isSelected 
                                              ? a.weaknessTopics.filter(id => id !== topic.id)
                                              : [...(a.weaknessTopics || []), topic.id];
                                            return { ...a, weaknessTopics: weaknesses };
                                          });
                                          updateActiveCourse({ assessments });
                                        }}
                                        className={cn(
                                          "px-3 py-1 text-[9px] border transition-all",
                                          isSelected ? "bg-red-500/20 border-red-500 text-red-500" : "border-white/10 text-white/40 hover:border-white/30"
                                        )}
                                      >
                                        {topic.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest opacity-20">Strength Impact (How it helped)</p>
                                <textarea 
                                  placeholder="e.g. Strong grasp of Ethics saved time for complex Quant problems..."
                                  value={activeCourse.assessments.find(a => a.id === editingAssessmentId)?.strengthImpact || ''}
                                  onChange={e => {
                                    const assessments = activeCourse.assessments.map(a => a.id === editingAssessmentId ? { ...a, strengthImpact: e.target.value } : a);
                                    updateActiveCourse({ assessments });
                                  }}
                                  className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none h-20 resize-none"
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest opacity-20">Weakness Improvement (Progress made)</p>
                                <textarea 
                                  placeholder="e.g. Improved from 40% to 65% in Derivatives after targeted revision..."
                                  value={activeCourse.assessments.find(a => a.id === editingAssessmentId)?.weaknessImprovement || ''}
                                  onChange={e => {
                                    const assessments = activeCourse.assessments.map(a => a.id === editingAssessmentId ? { ...a, weaknessImprovement: e.target.value } : a);
                                    updateActiveCourse({ assessments });
                                  }}
                                  className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none h-20 resize-none"
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest opacity-20">General Notes</p>
                                <textarea 
                                  placeholder="Additional observations..."
                                  value={activeCourse.assessments.find(a => a.id === editingAssessmentId)?.notes || ''}
                                  onChange={e => {
                                    const assessments = activeCourse.assessments.map(a => a.id === editingAssessmentId ? { ...a, notes: e.target.value } : a);
                                    updateActiveCourse({ assessments });
                                  }}
                                  className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none h-24 resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => setEditingAssessmentId(null)}
                        className="w-full py-4 bg-prestige-gold text-black text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all"
                      >
                        Save Assessment
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 md:p-16 max-w-2xl mx-auto space-y-16"
            >
              <header>
                <h2 className="text-6xl font-serif font-black tracking-tighter">Settings</h2>
                <p className="text-white/40 mt-4 font-light">Configure your {activeCourse.name} environment.</p>
              </header>

              <div className="space-y-12">
                <section className="space-y-6">
                  <h3 className="text-xl font-serif italic text-prestige-gold">Course Identity</h3>
                  <div className="glass p-8 space-y-4">
                    <label className="text-[10px] uppercase tracking-widest opacity-30">Course Name</label>
                    <input 
                      type="text" 
                      value={activeCourse.name}
                      onChange={e => updateActiveCourse({ name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-prestige-gold/50"
                    />
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-xl font-serif italic text-prestige-gold">Obsidian Vault</h3>
                  <div className="glass p-8 space-y-4">
                    <label className="text-[10px] uppercase tracking-widest opacity-30">Vault Name</label>
                    <input 
                      type="text" 
                      value={activeCourse.vaultName}
                      onChange={e => updateActiveCourse({ vaultName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-prestige-gold/50"
                      placeholder="e.g. CFA-Study-Notes"
                    />
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-xl font-serif italic text-prestige-gold">Exam Date</h3>
                  <div className="glass p-8 space-y-4">
                    <label className="text-[10px] uppercase tracking-widest opacity-30">Target Date</label>
                    <input 
                      type="date" 
                      value={activeCourse.examDate}
                      onChange={e => updateActiveCourse({ examDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-prestige-gold/50"
                    />
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-xl font-serif italic text-red-500">Danger Zone</h3>
                  <div className="glass p-8 space-y-6 border-red-500/20">
                    <div className="space-y-2">
                      <p className="text-sm opacity-60">Resetting progress will permanently delete all your courses, topics, assessments, and study history. This is useful if you want to start fresh or clear development data.</p>
                    </div>
                    <button 
                      onClick={resetProgress}
                      className="w-full py-4 border border-red-500/30 text-red-500 text-[10px] uppercase tracking-widest font-bold hover:bg-red-500 hover:text-white transition-all"
                    >
                      Reset All Progress (Temp)
                    </button>
                  </div>
                </section>

                <div className="pt-12 border-t border-white/10">
                  <button 
                    onClick={() => {
                      setConfirmModal({
                        show: true,
                        title: 'Delete Course',
                        message: 'Are you sure you want to delete this course? This action is irreversible.',
                        onConfirm: () => {
                          setState(prev => ({
                            ...prev,
                            courses: prev.courses.filter(c => c.id !== state.activeCourseId),
                            activeCourseId: null
                          }));
                        }
                      });
                    }}
                    className="text-[10px] uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors"
                  >
                    Delete Current Course
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notebook' && (
            <NotebookView key="notebook" activeCourse={activeCourse} />
          )}

          {activeTab === 'mistakes' && (
            <MistakeJournal 
              activeCourse={activeCourse} 
              updateActiveCourse={updateActiveCourse} 
            />
          )}

          {activeTab === 'tools' && (
            <ToolsChecklist 
              activeCourse={activeCourse} 
              updateActiveCourse={updateActiveCourse} 
            />
          )}

          {activeTab === 'plan' && (
            <WeeklyPlan 
              activeCourse={activeCourse} 
              updateActiveCourse={updateActiveCourse} 
            />
          )}

          {activeTab === 'audit' && (
            <MonthlyAudit 
              activeCourse={activeCourse} 
              updateActiveCourse={updateActiveCourse} 
            />
          )}
        </AnimatePresence>
      </main>
      {/* Zen Mode Overlay */}
      <AnimatePresence>
        {isZenMode && isTimerActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#0A0A0B] flex flex-col items-center justify-center space-y-12 p-8"
          >
            <div className="absolute top-12 left-12 flex items-center gap-4 opacity-20">
              <div className="w-8 h-8 border border-prestige-gold rotate-45 flex items-center justify-center">
                <span className="rotate-[-45deg] font-serif text-xs text-prestige-gold">M</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.4em] font-medium">Zen Focus</span>
            </div>

            <button 
              onClick={() => setIsZenMode(false)}
              className="absolute top-12 right-12 text-[10px] uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity"
            >
              Exit Focus
            </button>

            <div className="text-center space-y-4">
              <p className="text-[10px] uppercase tracking-[0.5em] text-prestige-gold opacity-60">Currently Mastering</p>
              <h2 className="text-4xl md:text-6xl font-serif italic max-w-2xl mx-auto">
                {activeCourse.topics.find(t => t.id === selectedTopicId)?.name || 'Deep Work Session'}
              </h2>
            </div>

            <div className="relative">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-[15vw] font-mono font-black tracking-tighter opacity-10 absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                {formatTime(timerSeconds)}
              </motion.div>
              <div className="text-[12vw] font-mono font-light tracking-tighter relative z-10">
                {formatTime(timerSeconds)}
              </div>
            </div>

            <div className="flex items-center gap-12">
              <button 
                onClick={handleTimerStop}
                className="group flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                  <Square size={20} fill="currentColor" />
                </div>
                <span className="text-[10px] uppercase tracking-widest opacity-20 group-hover:opacity-100">End Session</span>
              </button>
            </div>

            <div className="absolute bottom-12 text-[10px] uppercase tracking-[0.3em] opacity-10 italic">
              "The secret of getting ahead is getting started."
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCommandPalette(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="w-full max-w-2xl glass overflow-hidden border border-white/10 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex items-center gap-4">
                <Search className="text-prestige-gold" size={20} />
                <input 
                  autoFocus
                  type="text"
                  placeholder="Search topics, assessments, or actions..."
                  className="w-full bg-transparent border-none outline-none text-xl font-serif placeholder:opacity-20"
                  value={commandSearch}
                  onChange={e => setCommandSearch(e.target.value)}
                />
                <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono opacity-40">ESC</div>
              </div>
              <div className="max-h-[400px] overflow-y-auto p-2">
                {activeCourse.topics
                  .filter(t => t.name.toLowerCase().includes(commandSearch.toLowerCase()))
                  .slice(0, 5)
                  .map(topic => (
                    <button 
                      key={topic.id}
                      onClick={() => {
                        setSelectedTopicId(topic.id);
                        setActiveTab('topics');
                        setShowCommandPalette(false);
                      }}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-lg group text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-white/10 flex items-center justify-center font-serif text-prestige-gold">
                          {topic.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-serif">{topic.name}</p>
                          <p className="text-[10px] uppercase tracking-widest opacity-30">{topic.status}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                
                <div className="p-2 mt-2 border-t border-white/5">
                  <p className="text-[10px] uppercase tracking-widest opacity-20 p-2">Quick Actions</p>
                  <button 
                    onClick={() => { setActiveTab('assessments'); setShowCommandPalette(false); }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-white/5 rounded-lg text-sm font-serif"
                  >
                    <BarChart3 size={16} className="text-prestige-gold" />
                    View Performance Analytics
                  </button>
                  <button 
                    onClick={() => { setActiveTab('topics'); setShowCommandPalette(false); }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-white/5 rounded-lg text-sm font-serif"
                  >
                    <BookOpen size={16} className="text-prestige-gold" />
                    Browse Curriculum
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Input Modal */}
      <AnimatePresence>
        {inputModal.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
            onClick={() => setInputModal(prev => ({ ...prev, show: false }))}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark w-full max-w-md p-6 md:p-10 space-y-6 md:space-y-8"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-2xl md:text-3xl font-serif font-bold">{inputModal.title}</h3>
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest opacity-30">{inputModal.label}</label>
                <input 
                  autoFocus
                  type="text"
                  value={inputModal.value}
                  onChange={e => setInputModal(prev => ({ ...prev, value: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      inputModal.onConfirm(inputModal.value);
                      setInputModal(prev => ({ ...prev, show: false }));
                    }
                    if (e.key === 'Escape') {
                      setInputModal(prev => ({ ...prev, show: false }));
                    }
                  }}
                  placeholder={inputModal.placeholder}
                  className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-prestige-gold/50 transition-colors"
                />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setInputModal(prev => ({ ...prev, show: false }))}
                  className="flex-1 py-4 border border-white/10 text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    inputModal.onConfirm(inputModal.value);
                    setInputModal(prev => ({ ...prev, show: false }));
                  }}
                  className="flex-1 py-4 bg-prestige-gold text-black text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {confirmModal.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md"
            onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark w-full max-w-md p-10 space-y-8"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-3xl font-serif font-bold">{confirmModal.title}</h3>
              <p className="text-sm opacity-60 leading-relaxed">{confirmModal.message}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                  className="flex-1 py-4 border border-white/10 text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(prev => ({ ...prev, show: false }));
                  }}
                  className="flex-1 py-4 bg-red-500 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCalculatorOpen && (
          <FinancialCalculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
