import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, CheckSquare, Zap, Flame, Calendar as CalendarIcon, Info } from 'lucide-react';
import { Course } from './types';
import { cn } from './lib/utils';
import { format, startOfWeek, addDays, isToday, parseISO } from 'date-fns';

interface WeeklyPlanProps {
  activeCourse: Course;
  updateActiveCourse: (updates: Partial<Course>) => void;
}

export const WeeklyPlan: React.FC<WeeklyPlanProps> = ({ activeCourse, updateActiveCourse }) => {
  const [todayDrip, setTodayDrip] = useState(false);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const drips = activeCourse.dailyEthicsDrips || [];
    setTodayDrip(drips.includes(todayStr));
  }, [activeCourse.dailyEthicsDrips, todayStr]);

  const toggleEthicsDrip = () => {
    const drips = activeCourse.dailyEthicsDrips || [];
    let newDrips;
    if (todayDrip) {
      newDrips = drips.filter(d => d !== todayStr);
    } else {
      newDrips = [...drips, todayStr];
    }
    updateActiveCourse({ dailyEthicsDrips: newDrips });
    setTodayDrip(!todayDrip);
  };

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const planTemplate = [
    { day: 'Monday', morning: 'Read New Topic', night: 'MCQs (20)' },
    { day: 'Tuesday', morning: 'Read Sub-topics', night: 'Mistake Review' },
    { day: 'Wednesday', morning: 'Mistake Journal Refill', night: 'Active Recall' },
    { day: 'Thursday', morning: 'Ethics Case Study', night: 'Calculator Practice' },
    { day: 'Friday', morning: 'Formula Drill', night: 'Weekly Summary' },
    { day: 'Saturday', morning: 'Mini-Mock (Ethics focus)', night: 'Rest/Audit' },
    { day: 'Sunday', morning: 'Recovery Day', night: 'Prepare Next Week' },
  ];

  return (
    <div className="p-8 md:p-16 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-6xl font-serif font-black tracking-tighter text-white">Battle Plan</h2>
          <p className="text-white/40 mt-4 font-light italic font-serif">Structure is the antidote to anxiety</p>
        </div>
        
        <div 
          onClick={toggleEthicsDrip}
          className={cn(
            "p-6 glass border-l-4 cursor-pointer transition-all duration-500 min-w-[280px]",
            todayDrip ? "border-l-prestige-gold bg-prestige-gold/5" : "border-l-white/10 hover:border-l-white/20"
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-prestige-gold">Ethics Daily Drip</p>
              <h4 className="text-sm font-medium">{todayDrip ? "Immersion Complete" : "Launch Daily Drip"}</h4>
            </div>
            {todayDrip ? <Zap className="text-prestige-gold fill-prestige-gold" size={24} /> : <Zap className="text-white/20" size={24} />}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-7 gap-4">
        {weekDays.map((day, idx) => {
          const isTodayDay = isToday(day);
          const template = planTemplate[idx];
          
          return (
            <div 
              key={idx}
              className={cn(
                "glass p-4 space-y-4 flex flex-col transition-all duration-500",
                isTodayDay ? "border-prestige-gold/40 ring-1 ring-prestige-gold/20 scale-[1.02]" : "opacity-60"
              )}
            >
              <div className="border-b border-white/5 pb-2">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-prestige-gold">{template.day}</p>
                <p className="text-xs font-mono opacity-40">{format(day, 'MMM dd')}</p>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="space-y-1">
                  <p className="text-[8px] uppercase tracking-widest opacity-30 font-bold">AM</p>
                  <p className="text-[11px] leading-tight font-medium text-white/80">{template.morning}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] uppercase tracking-widest opacity-30 font-bold">PM</p>
                  <p className="text-[11px] leading-tight font-medium text-white/80">{template.night}</p>
                </div>
              </div>

              {isTodayDay && (
                <div className="pt-2">
                  <div className="h-1 w-full bg-prestige-gold/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ left: '-100%' }}
                      animate={{ left: '100%' }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="relative h-full w-1/2 bg-prestige-gold/60"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 space-y-6">
          <div className="flex items-center gap-4">
            <ClipboardList className="text-prestige-gold" size={24} />
            <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-prestige-gold">Strategic Directives</h3>
          </div>
          <ul className="space-y-4 text-sm text-white/60 font-light">
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-prestige-gold mt-1.5 shrink-0" />
              <span>Prioritize your <strong>Ethics Daily Drip</strong> above all other study. 15 mins every single day.</span>
            </li>
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-prestige-gold mt-1.5 shrink-0" />
              <span>Saturday is for <strong>Mini-Mocks</strong>. Do not simulate a full exam until the last 4 weeks.</span>
            </li>
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-prestige-gold mt-1.5 shrink-0" />
              <span>Log every single question you miss in the <strong>Mistake Journal</strong> immediately.</span>
            </li>
          </ul>
        </div>

        <div className="glass p-8 space-y-6 border-l-4 border-l-blue-500/30">
          <div className="flex items-center gap-4">
            <Info className="text-blue-400" size={24} />
            <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-blue-400">Recovery Policy</h3>
          </div>
          <p className="text-sm text-white/60 font-light leading-relaxed italic">
            Recovery Days are not "lazy days." They are scheduled maintenance for your brain. Marking a Recovery Day on the calendar signals to yourself that this rest is <strong>planned and productive</strong>.
          </p>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-blue-400 font-bold bg-blue-400/5 p-3 rounded border border-blue-400/10">
            <Flame size={12} /> Total Recovery Days Used: {(activeCourse.recoveryDays || []).length}
          </div>
        </div>
      </div>
    </div>
  );
};
