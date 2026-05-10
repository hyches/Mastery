import React from 'react';
import { motion } from 'motion/react';
import { Wrench, CheckCircle2, Circle, Github, Folder } from 'lucide-react';
import { Course, ToolBuild } from './types';
import { cn } from './lib/utils';

interface ToolsChecklistProps {
  activeCourse: Course;
  updateActiveCourse: (updates: Partial<Course>) => void;
}

export const ToolsChecklist: React.FC<ToolsChecklistProps> = ({ activeCourse, updateActiveCourse }) => {
  const tools = activeCourse.tools || [];
  const completedCount = tools.filter(t => t.status === 'Complete').length;
  const progressPercent = tools.length > 0 ? (completedCount / tools.length) * 100 : 0;

  const toggleStatus = (id: string) => {
    const newTools = tools.map(t => {
      if (t.id === id) {
        const nextStatus: ToolBuild['status'] = 
          t.status === 'Not Started' ? 'In Progress' :
          t.status === 'In Progress' ? 'Complete' : 'Not Started';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    updateActiveCourse({ tools: newTools });
  };

  const updatePath = (id: string, path: string) => {
    const newTools = tools.map(t => t.id === id ? { ...t, path } : t);
    updateActiveCourse({ tools: newTools });
  };

  return (
    <div className="p-8 md:p-16 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-6xl font-serif font-black tracking-tighter text-white">Power Tools</h2>
          <p className="text-white/40 mt-4 font-light italic font-serif">Build the machine that solves the exam</p>
        </div>
        <div className="flex flex-col items-end gap-3 min-w-[200px]">
          <div className="flex justify-between w-full text-[10px] uppercase tracking-widest font-bold">
            <span className="text-prestige-gold">Architecture Progress</span>
            <span className="text-white/40">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-prestige-gold shadow-[0_0_10px_rgba(197,160,89,0.5)]"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {tools.map((tool) => (
          <div 
            key={tool.id}
            className={cn(
              "glass p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500",
              tool.status === 'Complete' ? "border-prestige-gold/20" : "border-white/5"
            )}
          >
            <div className="flex items-center gap-6">
              <button 
                onClick={() => toggleStatus(tool.id)}
                className="transition-transform active:scale-95"
              >
                {tool.status === 'Complete' ? (
                  <CheckCircle2 size={32} className="text-prestige-gold" strokeWidth={1.5} />
                ) : tool.status === 'In Progress' ? (
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-prestige-gold animate-spin" />
                ) : (
                  <Circle size={32} className="text-white/10" strokeWidth={1.5} />
                )}
              </button>
              
              <div>
                <h3 className={cn(
                  "text-xl font-serif tracking-tight",
                  tool.status === 'Complete' ? "text-white" : "text-white/60"
                )}>
                  {tool.name}
                </h3>
                <span className={cn(
                  "text-[10px] uppercase tracking-[0.2em] font-bold mt-1 block",
                  tool.status === 'Complete' ? "text-prestige-gold" : 
                  tool.status === 'In Progress' ? "text-blue-400" : "text-white/20"
                )}>
                  {tool.status}
                </span>
              </div>
            </div>

            <div className="flex-1 max-w-md">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
                  {tool.path?.includes('github.com') ? <Github size={14} /> : <Folder size={14} />}
                </div>
                <input 
                  type="text"
                  placeholder="Local path or GitHub link..."
                  value={tool.path || ''}
                  onChange={(e) => updatePath(tool.id, e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-xs font-mono text-white/40 focus:text-white focus:border-prestige-gold transition-all outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-8 bg-prestige-gold/5 border-prestige-gold/10">
        <div className="flex items-start gap-4">
          <Wrench size={24} className="text-prestige-gold" />
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-widest font-bold text-prestige-gold">The Build Constraint</h4>
            <p className="text-sm text-white/50 leading-relaxed font-light italic opacity-80">
              "Building the tool is the ultimate check of understanding. If you can't code the DCF, you don't know the DCF."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
