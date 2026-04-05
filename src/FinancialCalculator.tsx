import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { Calculator, X, RotateCcw, HelpCircle, ChevronDown, ChevronUp, History, ExternalLink } from 'lucide-react';
import { cn } from './lib/utils';

// --- Types ---
interface TVMState {
  n: number;
  iy: number;
  pv: number;
  pmt: number;
  fv: number;
}

interface CashFlow {
  amount: number;
  frequency: number;
}

type CalcMode = 'Standard' | 'TVM' | 'CF' | 'STAT';

// --- Financial Math Helpers ---
const solveTVM = (target: keyof TVMState, state: TVMState): number => {
  const { n, iy, pv, pmt, fv } = state;
  const i = iy / 100;
  
  if (i === 0) {
    switch (target) {
      case 'fv': return -(pv + pmt * n);
      case 'pv': return -(fv + pmt * n);
      case 'pmt': return -(pv + fv) / n;
      case 'n': return -(pv + fv) / pmt;
      default: return 0;
    }
  }

  const q = Math.pow(1 + i, n);
  
  switch (target) {
    case 'fv':
      return -(pv * q + pmt * (q - 1) / i);
    case 'pv':
      return -(fv + pmt * (q - 1) / i) / q;
    case 'pmt':
      return -(pv * q + fv) * i / (q - 1);
    case 'n':
      return Math.log((pmt - fv * i) / (pmt + pv * i)) / Math.log(1 + i);
    case 'iy':
      // I/Y requires iterative solver (Newton-Raphson)
      let rate = 0.1;
      for (let iter = 0; iter < 20; iter++) {
        const q_iter = Math.pow(1 + rate, n);
        const f = pv * q_iter + pmt * (q_iter - 1) / rate + fv;
        const df = pv * n * Math.pow(1 + rate, n - 1) + pmt * (n * rate * Math.pow(1 + rate, n - 1) - (Math.pow(1 + rate, n) - 1)) / (rate * rate);
        rate = rate - f / df;
      }
      return rate * 100;
    default:
      return 0;
  }
};

const calculateNPV = (rate: number, flows: number[]): number => {
  const r = rate / 100;
  return flows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + r, t), 0);
};

const calculateIRR = (flows: number[]): number => {
  let low = -0.99;
  let high = 1.0;
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const npv = calculateNPV(mid * 100, flows);
    if (Math.abs(npv) < 0.00001) return mid * 100;
    if (npv > 0) low = mid;
    else high = mid;
  }
  return low * 100;
};

// --- Main Component ---
export const FinancialCalculator: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  isPopout?: boolean;
}> = ({ isOpen, onClose, isPopout = false }) => {
  const [display, setDisplay] = useState('0');
  const [isSecond, setIsSecond] = useState(false);
  const [mode, setMode] = useState<CalcMode>('Standard');
  const [tvm, setTvm] = useState<TVMState>({ n: 0, iy: 0, pv: 0, pmt: 0, fv: 0 });
  const [cashFlows, setCashFlows] = useState<number[]>([0]); // CF0, CF1, ...
  const [cfIndex, setCfIndex] = useState(0);
  const [pendingCompute, setPendingCompute] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [memory, setMemory] = useState<number>(0);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [isNewInput, setIsNewInput] = useState(true);

  // --- Core Logic ---
  const handleInput = (val: string) => {
    if (isNewInput) {
      setDisplay(val === '.' ? '0.' : val);
      setIsNewInput(false);
    } else {
      if (val === '.' && display.includes('.')) return;
      setDisplay(prev => prev === '0' && val !== '.' ? val : prev + val);
    }
  };

  const handleAction = (action: string) => {
    const current = parseFloat(display);

    if (isSecond) {
      setIsSecond(false);
      switch (action) {
        case 'FV': // CLR TVM
          setTvm({ n: 0, iy: 0, pv: 0, pmt: 0, fv: 0 });
          setDisplay('0');
          setIsNewInput(true);
          return;
        case 'CE/C': // CLR WORK
          if (mode === 'CF') setCashFlows([0]);
          setDisplay('0');
          setIsNewInput(true);
          return;
        case 'PV': // AMORT
          setMode('Standard'); // Mocked
          return;
        case 'PMT': // BGN
          // Toggle BGN/END (mocked)
          return;
      }
    }

    if (pendingCompute) {
      setPendingCompute(false);
      if (['N', 'I/Y', 'PV', 'PMT', 'FV'].includes(action)) {
        handleCompute(action);
        return;
      }
    }

    switch (action) {
      case '2nd':
        setIsSecond(!isSecond);
        return;
      case 'CPT':
        setPendingCompute(true);
        return;
      case 'ENTER':
        if (mode === 'CF') {
          const newFlows = [...cashFlows];
          newFlows[cfIndex] = current;
          setCashFlows(newFlows);
          setIsNewInput(true);
        }
        return;
      case 'UP':
        if (mode === 'CF' && cfIndex > 0) {
          setCfIndex(cfIndex - 1);
          setDisplay(String(cashFlows[cfIndex - 1]));
          setIsNewInput(true);
        }
        return;
      case 'DOWN':
        if (mode === 'CF') {
          const nextIndex = cfIndex + 1;
          if (nextIndex >= cashFlows.length) {
            setCashFlows([...cashFlows, 0]);
          }
          setCfIndex(nextIndex);
          setDisplay(String(cashFlows[nextIndex] || 0));
          setIsNewInput(true);
        }
        return;
      case 'CE/C':
        setDisplay('0');
        setIsNewInput(true);
        if (display === '0') {
          setPendingOp(null);
          setPrevVal(null);
        }
        return;
      case '+/-':
        setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
        return;
      case 'STO':
        setMemory(current);
        setIsNewInput(true);
        return;
      case 'RCL':
        setDisplay(String(memory));
        setIsNewInput(true);
        return;
      
      // Arithmetic
      case '+':
      case '-':
      case '*':
      case '/':
        if (prevVal !== null && pendingOp) {
          const result = performOp(prevVal, current, pendingOp);
          setPrevVal(result);
          setDisplay(String(result));
        } else {
          setPrevVal(current);
        }
        setPendingOp(action);
        setIsNewInput(true);
        return;
      case '=':
        if (prevVal !== null && pendingOp) {
          const result = performOp(prevVal, current, pendingOp);
          setHistory(prev => [`${prevVal} ${pendingOp} ${current} = ${result}`, ...prev].slice(0, 5));
          setDisplay(String(result));
          setPrevVal(null);
          setPendingOp(null);
          setIsNewInput(true);
        }
        return;

      // Math Functions
      case '1/x':
        setDisplay(String(1 / current));
        setIsNewInput(true);
        return;
      case 'x²':
        setDisplay(String(current * current));
        setIsNewInput(true);
        return;
      case '√x':
        setDisplay(String(Math.sqrt(current)));
        setIsNewInput(true);
        return;
      case 'N':
      case 'I/Y':
      case 'PV':
      case 'PMT':
      case 'FV':
        const key = action.toLowerCase().replace('/', '') as keyof TVMState;
        setTvm(prev => ({ ...prev, [key]: current }));
        setIsNewInput(true);
        return;
      
      // Mode Switches
      case 'CF':
        setMode('CF');
        setCfIndex(0);
        setDisplay(String(cashFlows[0]));
        return;
      case 'NPV':
        if (mode === 'CF') {
          const npv = calculateNPV(current, cashFlows);
          setDisplay(npv.toFixed(2));
          setIsNewInput(true);
        }
        return;
      case 'IRR':
        if (mode === 'CF') {
          const irr = calculateIRR(cashFlows);
          setDisplay(irr.toFixed(2));
          setIsNewInput(true);
        }
        return;
    }
  };

  const performOp = (a: number, b: number, op: string) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return a / b;
      default: return b;
    }
  };

  const handleCompute = (target: string) => {
    const key = target.toLowerCase().replace('/', '') as keyof TVMState;
    const result = solveTVM(key, tvm);
    setTvm(prev => ({ ...prev, [key]: result }));
    setDisplay(result.toFixed(4));
    setIsNewInput(true);
  };

  // --- Keyboard Support ---
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for calculator keys to avoid page scrolling
      const calcKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', '=', 'Enter', 'Backspace', 'Escape'];
      if (calcKeys.includes(e.key)) {
        e.preventDefault();
      }

      if (/[0-9.]/.test(e.key)) {
        handleInput(e.key);
      } else if (['+', '-', '*', '/', '='].includes(e.key)) {
        handleAction(e.key);
      } else if (e.key === 'Enter') {
        handleAction('=');
      } else if (e.key === 'Backspace' || e.key === 'Escape') {
        handleAction('CE/C');
      } else if (e.key.toLowerCase() === 'n') {
        handleAction('N');
      } else if (e.key.toLowerCase() === 'i') {
        handleAction('I/Y');
      } else if (e.key.toLowerCase() === 'p') {
        handleAction('PV');
      } else if (e.key.toLowerCase() === 'm') {
        handleAction('PMT');
      } else if (e.key.toLowerCase() === 'f') {
        handleAction('FV');
      } else if (e.key.toLowerCase() === 's') {
        handleAction('STO');
      } else if (e.key.toLowerCase() === 'r') {
        handleAction('RCL');
      } else if (e.key.toLowerCase() === 'c') {
        handleAction('CPT');
      } else if (e.key === 'Shift') {
        handleAction('2nd');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleInput, handleAction]);

  const dragControls = useDragControls();

  if (!isOpen) return null;

  return (
    <motion.div
      drag={!isPopout}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragTransition={{ power: 0, timeConstant: 0 }}
      dragConstraints={{ left: -1000, right: 0, top: 0, bottom: 1000 }}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={cn(
        "bg-[#0A0A0B] z-[1001] flex flex-col border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden rounded-xl cursor-default",
        isPopout ? "w-full h-full" : "fixed right-8 top-24 w-[320px]"
      )}
    >
      {/* Header - Drag Handle */}
      <div 
        onPointerDown={(e) => !isPopout && dragControls.start(e)}
        className={cn(
          "p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.03] select-none",
          !isPopout ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-prestige-gold/20 flex items-center justify-center text-prestige-gold">
            <Calculator size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-prestige-gold">BA II Plus Professional</h3>
              <div className="w-1 h-1 rounded-full bg-prestige-gold/40 animate-pulse" />
            </div>
            <p className="text-[7px] uppercase tracking-widest opacity-40">Financial Command Center</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isPopout && (
            <button 
              onClick={() => {
                const url = window.location.origin + '?calculator=true';
                window.open(url, 'BAIIPlus', 'width=340,height=600,menubar=no,toolbar=no,location=no,status=no');
                onClose();
              }}
              className="text-white/20 hover:text-white transition-colors p-2"
              title="Pop out into new window"
            >
              <ExternalLink size={16} />
            </button>
          )}
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors p-2">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Display Screen */}
      <div className="p-6 bg-black/60 flex flex-col items-end justify-center min-h-[110px] relative border-b border-white/5">
        <div className="absolute top-3 left-5 flex items-center gap-3">
          {isSecond && (
            <motion.span 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[8px] text-prestige-gold font-bold uppercase tracking-widest bg-prestige-gold/10 px-1.5 py-0.5 rounded"
            >
              2nd
            </motion.span>
          )}
          <span className="text-[7px] opacity-30 font-mono uppercase tracking-widest">{mode}</span>
          {pendingOp && <span className="text-[7px] text-prestige-gold font-mono">{pendingOp}</span>}
        </div>
        
        <div className="flex flex-col items-end w-full">
          {prevVal !== null && (
            <span className="text-[9px] opacity-20 font-mono mb-1">{prevVal} {pendingOp}</span>
          )}
          <div className="text-4xl font-mono font-light tracking-tighter text-white truncate w-full text-right">
            {display}
          </div>
        </div>
      </div>

      {/* Keypad Area */}
      <div className="flex-1 p-4 grid grid-cols-4 gap-2 bg-white/[0.01] overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* Row 1: TVM / Special */}
        <CalcButton label="2nd" onClick={() => handleAction('2nd')} variant="second" active={isSecond} />
        <CalcButton label="CPT" onClick={() => handleAction('CPT')} variant="action" active={pendingCompute} />
        <CalcButton label="ENTER" onClick={() => handleAction('ENTER')} variant="action" />
        <div className="flex gap-1">
          <CalcButton label="↑" onClick={() => handleAction('UP')} variant="util" className="flex-1" />
          <CalcButton label="↓" onClick={() => handleAction('DOWN')} variant="util" className="flex-1" />
        </div>
        <CalcButton label="ON/OFF" onClick={onClose} variant="danger" />

        {/* Row 2: TVM */}
        <CalcButton label="N" subLabel="XP/Y" onClick={() => handleAction('N')} variant="tvm" />
        <CalcButton label="I/Y" subLabel="P/Y" onClick={() => handleAction('I/Y')} variant="tvm" />
        <CalcButton label="PV" subLabel="AMORT" onClick={() => handleAction('PV')} variant="tvm" />
        <CalcButton label="PMT" subLabel="BGN" onClick={() => handleAction('PMT')} variant="tvm" />

        {/* Row 3: TVM / CF */}
        <CalcButton label="FV" subLabel="CLR TVM" onClick={() => handleAction('FV')} variant="tvm" />
        <CalcButton label="CF" subLabel="DATA" onClick={() => handleAction('CF')} variant="mode" />
        <CalcButton label="NPV" subLabel="STAT" onClick={() => handleAction('NPV')} variant="mode" />
        <CalcButton label="IRR" subLabel="BOND" onClick={() => handleAction('IRR')} variant="mode" />

        {/* Row 4: Math */}
        <CalcButton label="1/x" subLabel="DATE" onClick={() => handleAction('1/x')} variant="math" />
        <CalcButton label="x²" subLabel="DEPR" onClick={() => handleAction('x²')} variant="math" />
        <CalcButton label="√x" subLabel="ICONV" onClick={() => handleAction('√x')} variant="math" />
        <CalcButton label="÷" onClick={() => handleAction('/')} variant="op" />

        {/* Row 5: Numbers */}
        <CalcButton label="7" onClick={() => handleInput('7')} />
        <CalcButton label="8" onClick={() => handleInput('8')} />
        <CalcButton label="9" onClick={() => handleInput('9')} />
        <CalcButton label="×" onClick={() => handleAction('*')} variant="op" />

        {/* Row 6: Numbers */}
        <CalcButton label="4" onClick={() => handleInput('4')} />
        <CalcButton label="5" onClick={() => handleInput('5')} />
        <CalcButton label="6" onClick={() => handleInput('6')} />
        <CalcButton label="-" onClick={() => handleAction('-')} variant="op" />

        {/* Row 7: Numbers */}
        <CalcButton label="1" onClick={() => handleInput('1')} />
        <CalcButton label="2" onClick={() => handleInput('2')} />
        <CalcButton label="3" onClick={() => handleInput('3')} />
        <CalcButton label="+" onClick={() => handleAction('+')} variant="op" />

        {/* Row 8: Bottom */}
        <CalcButton label="0" onClick={() => handleInput('0')} />
        <CalcButton label="." onClick={() => handleInput('.')} />
        <CalcButton label="+/-" onClick={() => handleAction('+/-')} />
        <CalcButton label="=" onClick={() => handleAction('=')} variant="equal" />

        {/* Row 9: Utility */}
        <CalcButton label="STO" onClick={() => handleAction('STO')} variant="util" />
        <CalcButton label="RCL" onClick={() => handleAction('RCL')} variant="util" />
        <CalcButton label="CE/C" subLabel="CLR WRK" onClick={() => handleAction('CE/C')} variant="util" />
        <button 
          onClick={() => setMode('Standard')}
          className="col-span-1 h-12 rounded bg-white/5 flex items-center justify-center text-[8px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
        >
          Standard
        </button>
      </div>

      {/* History / Info Panel */}
      <AnimatePresence>
        {history.length > 0 && (
          <motion.div 
            initial={{ height: 0 }} animate={{ height: 'auto' }}
            className="px-6 py-4 border-t border-white/5 bg-black/40"
          >
            <div className="flex items-center gap-2 mb-3 opacity-30">
              <History size={10} />
              <span className="text-[8px] uppercase tracking-widest">Tape History</span>
            </div>
            <div className="space-y-1.5">
              {history.map((h, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] font-mono">
                  <span className="opacity-30">{h.split('=')[0]}</span>
                  <span className="text-prestige-gold">{h.split('=')[1]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Sub-components ---
const CalcButton: React.FC<{ 
  label: string; 
  subLabel?: string; 
  onClick: () => void; 
  variant?: 'default' | 'action' | 'tvm' | 'mode' | 'math' | 'op' | 'equal' | 'second' | 'danger' | 'util';
  active?: boolean;
  className?: string;
}> = ({ label, subLabel, onClick, variant = 'default', active, className }) => {
  const variants = {
    default: "bg-white/5 hover:bg-white/10 text-white",
    action: active ? "bg-prestige-gold text-black font-bold" : "bg-white/10 hover:bg-prestige-gold hover:text-black text-prestige-gold font-bold",
    tvm: "bg-prestige-gold/10 hover:bg-prestige-gold hover:text-black text-prestige-gold",
    mode: "bg-white/10 hover:bg-white/20 text-white/80",
    math: "bg-white/5 hover:bg-white/10 text-white/60",
    op: "bg-white/10 hover:bg-prestige-gold/20 text-prestige-gold",
    equal: "bg-prestige-gold text-black font-bold shadow-[0_0_15px_rgba(197,160,89,0.3)]",
    second: active ? "bg-prestige-gold text-black font-bold" : "bg-white/20 hover:bg-prestige-gold hover:text-black text-white",
    danger: "bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500",
    util: "bg-white/5 hover:bg-white/10 text-white/40"
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative h-10 rounded flex flex-col items-center justify-center transition-all duration-300 group",
        variants[variant],
        className
      )}
    >
      {subLabel && (
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[6px] uppercase tracking-tighter text-prestige-gold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {subLabel}
        </span>
      )}
      <span className={cn(
        "text-[11px] font-mono",
        variant === 'equal' || variant === 'action' ? "font-bold" : ""
      )}>
        {label}
      </span>
    </button>
  );
};
