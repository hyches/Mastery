import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Filter, SortAsc, Download, X, AlertCircle } from 'lucide-react';
import { Course, MistakeEntry } from './types';
import { cn } from './lib/utils';
import { format, addDays, parseISO } from 'date-fns';

interface MistakeJournalProps {
  activeCourse: Course;
  updateActiveCourse: (updates: Partial<Course>) => void;
}

export const MistakeJournal: React.FC<MistakeJournalProps> = ({ activeCourse, updateActiveCourse }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'revisit'>('date');
  
  const [newMistake, setNewMistake] = useState<Partial<MistakeEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    questionType: 'Calculation',
    timeTakenSeconds: 0,
    whyWrong: '',
    correctReasoning: '',
  });

  const mistakes = activeCourse.mistakes || [];

  const handleAddMistake = () => {
    if (!newMistake.topicId || !newMistake.whyWrong || !newMistake.correctReasoning) return;
    
    const entry: MistakeEntry = {
      id: crypto.randomUUID(),
      date: newMistake.date!,
      topicId: newMistake.topicId!,
      subtopicId: newMistake.subtopicId,
      questionType: newMistake.questionType as any,
      timeTakenSeconds: Number(newMistake.timeTakenSeconds),
      whyWrong: newMistake.whyWrong!,
      correctReasoning: newMistake.correctReasoning!,
      formulaMissed: newMistake.formulaMissed,
      revisitDate: format(addDays(parseISO(newMistake.date!), 7), 'yyyy-MM-dd'),
    };

    updateActiveCourse({
      mistakes: [entry, ...mistakes]
    });
    setShowAddModal(false);
    setNewMistake({
      date: format(new Date(), 'yyyy-MM-dd'),
      questionType: 'Calculation',
      timeTakenSeconds: 0,
      whyWrong: '',
      correctReasoning: '',
    });
  };

  const deleteMistake = (id: string) => {
    updateActiveCourse({
      mistakes: mistakes.filter(m => m.id !== id)
    });
  };

  const filteredMistakes = mistakes
    .filter(m => filterTopic === 'all' || m.topicId === filterTopic)
    .sort((a, b) => {
      if (sortBy === 'date') return parseISO(b.date).getTime() - parseISO(a.date).getTime();
      return parseISO(a.revisitDate).getTime() - parseISO(b.revisitDate).getTime();
    });

  const exportForReview = () => {
    const text = filteredMistakes.map(m => {
      const topic = activeCourse.topics.find(t => t.id === m.topicId)?.name;
      return `DATE: ${m.date}\nTOPIC: ${topic}\nTYPE: ${m.questionType}\nWHY WRONG: ${m.whyWrong}\nCORRECT REASONING: ${m.correctReasoning}\n${m.formulaMissed ? `FORMULA: ${m.formulaMissed}\n` : ''}-------------------\n`;
    }).join('\n');
    
    // Copy to clipboard or download as text
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mistake_journal_review_${format(new Date(), 'yyyyMMdd')}.txt`;
    a.click();
  };

  return (
    <div className="p-8 md:p-16 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-6xl font-serif font-black tracking-tighter">Mistake Journal</h2>
          <p className="text-white/40 mt-4 font-light italic font-serif">Turn failures into expertise</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={exportForReview}
            className="flex items-center gap-2 px-6 py-3 glass hover:bg-white/10 transition-all text-xs uppercase tracking-widest font-bold"
          >
            <Download size={16} />
            Pre-Mock Review
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-prestige-gold text-black hover:bg-white transition-all text-xs uppercase tracking-widest font-bold"
          >
            <Plus size={16} />
            Log Mistake
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/40" />
          <select 
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="bg-transparent text-xs text-white/60 outline-none border-none cursor-pointer hover:text-white"
          >
            <option value="all" className="bg-black">All Topics</option>
            {activeCourse.topics.map(t => (
              <option key={t.id} value={t.id} className="bg-black">{t.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <SortAsc size={14} className="text-white/40" />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs text-white/60 outline-none border-none cursor-pointer hover:text-white"
          >
            <option value="date" className="bg-black">Sort by Date</option>
            <option value="revisit" className="bg-black">Sort by Revisit Date</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMistakes.map((mistake) => {
          const topic = activeCourse.topics.find(t => t.id === mistake.topicId);
          const isSlow = mistake.timeTakenSeconds > 150;
          
          return (
            <motion.div 
              key={mistake.id}
              layout
              className={cn(
                "glass p-6 group relative border-l-4",
                mistake.questionType === 'Ethics' ? "border-l-prestige-gold" : "border-l-blue-500/30"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <span className="text-[10px] uppercase tracking-widest text-prestige-gold font-bold">{topic?.name}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-40">{mistake.questionType}</span>
                    {isSlow && (
                      <span className="flex items-center gap-1 text-[8px] md:text-[10px] uppercase tracking-widest text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded">
                        <AlertCircle size={10} /> Slow ({Math.floor(mistake.timeTakenSeconds / 60)}m {mistake.timeTakenSeconds % 60}s)
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg md:text-xl font-serif">{mistake.whyWrong}</h3>
                </div>
                <button 
                  onClick={() => deleteMistake(mistake.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 text-sm">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest opacity-30 mt-4">Correct Reasoning</p>
                  <p className="text-white/70 leading-relaxed">{mistake.correctReasoning}</p>
                </div>
                {mistake.formulaMissed && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest opacity-30 mt-4">Formula Missed</p>
                    <code className="block p-3 bg-white/5 rounded font-mono text-prestige-gold">{mistake.formulaMissed}</code>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[10px] uppercase tracking-widest opacity-30">Attempted: {mistake.date}</span>
                <span className={cn(
                  "text-[10px] uppercase tracking-widest font-bold",
                  parseISO(mistake.revisitDate) <= new Date() ? "text-red-500" : "text-white/30"
                )}>
                  Revisit: {mistake.revisitDate}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#0A0A0B] border border-white/10 rounded-xl p-6 md:p-8 glass-dark overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <h3 className="text-xl md:text-2xl font-serif uppercase tracking-tight">Log Mistake</h3>
                <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white"><X size={24} /></button>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Topic</label>
                    <select 
                      value={newMistake.topicId}
                      onChange={(e) => setNewMistake({...newMistake, topicId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-prestige-gold transition-colors"
                    >
                      <option value="" className="bg-black">Select Topic</option>
                      {activeCourse.topics.map(t => (
                        <option key={t.id} value={t.id} className="bg-black">{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Type</label>
                    <select 
                      value={newMistake.questionType}
                      onChange={(e) => setNewMistake({...newMistake, questionType: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-prestige-gold transition-colors"
                    >
                      <option value="Calculation" className="bg-black">Calculation</option>
                      <option value="Conceptual" className="bg-black">Conceptual</option>
                      <option value="Ethics" className="bg-black">Ethics</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Date</label>
                    <input 
                      type="date"
                      value={newMistake.date}
                      onChange={(e) => setNewMistake({...newMistake, date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-prestige-gold transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Time (Seconds)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 180"
                      value={newMistake.timeTakenSeconds}
                      onChange={(e) => setNewMistake({...newMistake, timeTakenSeconds: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-prestige-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">What went wrong?</label>
                  <input 
                    type="text"
                    placeholder="Brief description of the error"
                    value={newMistake.whyWrong}
                    onChange={(e) => setNewMistake({...newMistake, whyWrong: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-prestige-gold transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Correct Reasoning</label>
                  <textarea 
                    rows={4}
                    placeholder="Explain the logic clearly"
                    value={newMistake.correctReasoning}
                    onChange={(e) => setNewMistake({...newMistake, correctReasoning: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-prestige-gold transition-colors resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Formula missed (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. NPV = Sum(CFt / (1+r)^t)"
                    value={newMistake.formulaMissed}
                    onChange={(e) => setNewMistake({...newMistake, formulaMissed: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-prestige-gold transition-colors"
                  />
                </div>

                <button 
                  onClick={handleAddMistake}
                  className="w-full py-4 bg-prestige-gold text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-white transition-all mt-4"
                >
                  Save Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
