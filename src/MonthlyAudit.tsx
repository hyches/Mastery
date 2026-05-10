import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, AlertTriangle, ShieldCheck, History, ChevronRight } from 'lucide-react';
import { Course, AuditEntry } from './types';
import { cn } from './lib/utils';
import { format, isLastDayOfMonth, endOfMonth, startOfMonth, subDays, isSunday, isAfter, parseISO } from 'date-fns';

interface MonthlyAuditProps {
  activeCourse: Course;
  updateActiveCourse: (updates: Partial<Course>) => void;
}

export const MonthlyAudit: React.FC<MonthlyAuditProps> = ({ activeCourse, updateActiveCourse }) => {
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [view, setView] = useState<'current' | 'history'>('current');

  const questions = [
    "Am I on CFA pace? (Be honest about chapters vs time left)",
    "Is coding reinforcing CFA or distracting? (Total tools built vs hours studied)",
    "Am I building tools or avoiding harder study? (Analysis vs Procrastination)",
    "What’s the single biggest drag on study quality?"
  ];

  useEffect(() => {
    // Check if it's the last Sunday of the month or within 2 days after
    const today = new Date();
    const lastDay = endOfMonth(today);
    
    // Find last Sunday
    let lastSunday = lastDay;
    while (!isSunday(lastSunday)) {
      lastSunday = subDays(lastSunday, 1);
    }

    const todayStr = format(today, 'yyyy-MM-dd');
    const hasAuditedThisMonth = (activeCourse.auditLogs || []).some(log => 
      format(parseISO(log.date), 'yyyy-MM') === format(today, 'yyyy-MM')
    );

    // If today is past last Sunday and we haven't audited this month
    if (isAfter(today, lastSunday) && !hasAuditedThisMonth) {
      setShowAuditModal(true);
    }
  }, [activeCourse.auditLogs]);

  const handleSubmitAudit = () => {
    if (answers.some(a => a.trim() === '')) return;

    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      date: format(new Date(), 'yyyy-MM-dd'),
      answers: [...answers],
    };

    updateActiveCourse({
      auditLogs: [entry, ...(activeCourse.auditLogs || [])]
    });
    setShowAuditModal(false);
  };

  const isPaceOff = answers[0].toLowerCase().includes('no') || answers[0].toLowerCase().includes('behind') || answers[0].toLowerCase().includes('off');

  return (
    <div className="p-8 md:p-16 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-6xl font-serif font-black tracking-tighter text-white">Monthly Audit</h2>
          <p className="text-white/40 mt-4 font-light italic font-serif">Radical transparency with your progress</p>
        </div>
        <div className="flex glass p-1 rounded-full">
          <button 
            onClick={() => setView('current')}
            className={cn(
              "px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all",
              view === 'current' ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
            )}
          >
            Session
          </button>
          <button 
            onClick={() => setView('history')}
            className={cn(
              "px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all",
              view === 'history' ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
            )}
          >
            History
          </button>
        </div>
      </div>

      {view === 'current' ? (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass p-8 space-y-6">
              <div className="flex items-center gap-4 text-prestige-gold">
                <ShieldCheck size={32} />
                <h3 className="text-2xl font-serif">Strategic Integrity</h3>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Every 4 weeks, we pause to ensure tool-building hasn't become a form of sophisticated procrastination. The goal is the Charter, not the app.
              </p>
            </div>
            <div className="glass p-8 space-y-6 border-l-4 border-l-prestige-gold bg-prestige-gold/5">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-prestige-gold">Audit Protocol</p>
              <p className="text-white/80 font-serif italic text-lg leading-relaxed">
                "Am I building tools to help me study, or am I building tools because studying is hard?"
              </p>
            </div>
          </div>

          <div className="glass p-12 space-y-12">
            {questions.map((q, i) => (
              <div key={i} className="space-y-4">
                <label className="text-xs uppercase tracking-widest font-bold text-white/40 flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[10px]">{i+1}</span>
                  {q}
                </label>
                <textarea 
                  value={answers[i]}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[i] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                  className="w-full bg-white/[0.02] border border-white/5 p-6 rounded-lg outline-none focus:border-prestige-gold transition-colors text-white/80 font-light resize-none h-32"
                  placeholder="Reflect deeply..."
                />
              </div>
            ))}

            <button 
              onClick={handleSubmitAudit}
              disabled={answers.some(a => a.trim() === '')}
              className="w-full py-6 bg-prestige-gold text-black font-bold uppercase tracking-[0.3em] text-xs hover:bg-white transition-all disabled:opacity-20"
            >
              Commit Audit Entry
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {(activeCourse.auditLogs || []).length === 0 ? (
            <div className="glass p-12 text-center text-white/20 uppercase tracking-widest text-xs">
              No audit history found
            </div>
          ) : (
            (activeCourse.auditLogs || []).map((log) => (
              <div key={log.id} className="glass p-8 space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <History size={16} className="text-prestige-gold" />
                    <span className="text-sm font-black tracking-widest uppercase">{format(parseISO(log.date), 'MMMM yyyy')}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono opacity-30">{log.date}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {questions.map((q, i) => (
                    <div key={i} className="space-y-2">
                      <p className="text-[8px] uppercase tracking-widest text-white/30 font-bold">{q}</p>
                      <p className="text-sm text-white/70 font-light italic leading-relaxed">"{log.answers[i]}"</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {showAuditModal && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl text-center space-y-12 p-8"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full border border-prestige-gold flex items-center justify-center text-prestige-gold shadow-[0_0_50px_rgba(197,160,89,0.2)]">
                  <Target size={48} strokeWidth={1} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-5xl font-serif font-black tracking-tighter uppercase italic">Monthly Reckoning</h3>
                  <p className="text-prestige-gold text-xs uppercase tracking-[0.4em] font-medium opacity-60">System requires strategic validation</p>
                </div>
              </div>

              <p className="text-white/40 text-lg font-light max-w-md mx-auto leading-relaxed">
                It is the end of the month. The system requires you to audit your progress before proceeding with further tool development.
              </p>

              <button 
                onClick={() => {
                  setShowAuditModal(false);
                  setView('current');
                }}
                className="group flex items-center gap-4 px-12 py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] mx-auto hover:bg-prestige-gold transition-all"
              >
                Enter Audit Session
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Warning Toast for Pace */}
      <AnimatePresence>
        {view === 'history' && (activeCourse.auditLogs || []).length > 0 && 
         (activeCourse.auditLogs![0].answers[0].toLowerCase().includes('no') || 
          activeCourse.auditLogs![0].answers[0].toLowerCase().includes('behind')) && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-12 right-12 z-[100] max-w-md glass-dark border-l-4 border-l-red-500 p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-red-500 shrink-0" size={24} />
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-widest font-black text-red-500">Pace Warning</h4>
                <p className="text-sm text-white/70">
                  You self-assessed as being off CFA pace. <span className="text-white font-bold underline">Plan: pause all coding until CFA pace restored.</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
