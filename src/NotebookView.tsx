import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Download, BookOpen, Hash, Pencil, Type, Trash2, RotateCcw } from 'lucide-react';
import { Course } from './types';
import { cn } from './lib/utils';

interface Point {
  x: number;
  y: number;
  pressure: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

const SketchCanvas: React.FC<{ onSave?: (dataUrl: string) => void }> = ({ onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match display size
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        redraw();
      }
    };

    const redraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

      allStrokes.forEach(stroke => {
        if (stroke.points.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        
        for (let i = 0; i < stroke.points.length - 1; i++) {
          const p1 = stroke.points[i];
          const p2 = stroke.points[i + 1];
          // Use pressure for variable width
          ctx.lineWidth = stroke.width * (p1.pressure || 0.5) * 2;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    redraw();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [strokes, currentStroke]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5
    };

    setCurrentStroke({
      points: [newPoint],
      color: '#C5A059', // Prestige Gold
      width: 2
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !currentStroke) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5
    };

    setCurrentStroke({
      ...currentStroke,
      points: [...currentStroke.points, newPoint]
    });
  };

  const handlePointerUp = () => {
    if (currentStroke) {
      setStrokes([...strokes, currentStroke]);
    }
    setIsDrawing(false);
    setCurrentStroke(null);
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke(null);
  };

  const undo = () => {
    setStrokes(strokes.slice(0, -1));
  };

  return (
    <div className="w-full h-full relative bg-black/20 rounded-xl overflow-hidden border border-white/5">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full touch-none cursor-crosshair"
        style={{ touchAction: 'none' }}
      />
      <div className="absolute bottom-6 right-6 flex gap-2">
        <button
          onClick={undo}
          className="p-3 rounded-full bg-black/60 border border-white/10 text-white/60 hover:text-white transition-all"
          title="Undo"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={clearCanvas}
          className="p-3 rounded-full bg-black/60 border border-white/10 text-white/60 hover:text-prestige-gold transition-all"
          title="Clear Canvas"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div className="absolute top-6 left-6 pointer-events-none">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">Sketch Pad (Apple Pencil Optimized)</span>
      </div>
    </div>
  );
};

interface NotebookViewProps {
  activeCourse: Course;
}

export const NotebookView: React.FC<NotebookViewProps> = ({ activeCourse }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string>('');
  const [mode, setMode] = useState<'text' | 'sketch'>('text');

  const selectedTopic = activeCourse.topics.find(t => t.id === selectedTopicId);

  const handlePushToObsidian = () => {
    const date = new Date().toISOString().split('T')[0];
    const topicName = selectedTopic?.name || 'Uncategorized';
    const subTopicName = selectedTopic?.subTopics?.find(s => s.id === selectedSubTopicId)?.name || '';
    
    const frontmatter = `---
date: ${date}
course: "${activeCourse.name}"
topic: "${topicName}"
${subTopicName ? `subtopic: "${subTopicName}"\n` : ''}tags: [study-notes, prestige-tracker]
---

`;
    
    const fullContent = frontmatter + content;
    const encodedName = encodeURIComponent(title || 'Untitled Study Note');
    const encodedContent = encodeURIComponent(fullContent);
    
    // Obsidian URI scheme to create a new note
    window.location.href = `obsidian://new?vault=${encodeURIComponent(activeCourse.vaultName)}&name=${encodedName}&content=${encodedContent}`;
  };

  const handleDownloadMarkdown = () => {
    const date = new Date().toISOString().split('T')[0];
    const topicName = selectedTopic?.name || 'Uncategorized';
    const subTopicName = selectedTopic?.subTopics?.find(s => s.id === selectedSubTopicId)?.name || '';
    
    const frontmatter = `---
date: ${date}
course: "${activeCourse.name}"
topic: "${topicName}"
${subTopicName ? `subtopic: "${subTopicName}"\n` : ''}tags: [study-notes, prestige-tracker]
---

`;
    const fullContent = frontmatter + content;
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'Untitled Study Note'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="p-8 md:p-16 max-w-4xl mx-auto space-y-8 min-h-screen flex flex-col"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-prestige-gold">
              <BookOpen size={16} />
              <span className="text-[10px] uppercase tracking-[0.4em] font-medium">Study Notebook</span>
            </div>
            
            <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
              <button
                onClick={() => setMode('text')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest transition-all",
                  mode === 'text' ? "bg-prestige-gold text-black font-bold" : "text-white/40 hover:text-white"
                )}
              >
                <Type size={12} />
                Type
              </button>
              <button
                onClick={() => setMode('sketch')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest transition-all",
                  mode === 'sketch' ? "bg-prestige-gold text-black font-bold" : "text-white/40 hover:text-white"
                )}
              >
                <Pencil size={12} />
                Sketch
              </button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Untitled Note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-4xl md:text-6xl font-serif font-black leading-[1.1] tracking-tighter outline-none placeholder:text-white/20 text-white"
          />
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadMarkdown}
            className="p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-white/60 hover:text-white flex items-center justify-center"
            title="Download as Markdown"
          >
            <Download size={18} />
          </button>
          <button
            onClick={handlePushToObsidian}
            className="px-6 py-3 rounded-lg bg-prestige-gold text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
          >
            <Send size={16} />
            Push to Obsidian
          </button>
        </div>
      </header>

      {/* Metadata Selectors */}
      <div className="flex flex-wrap gap-4 py-4 border-y border-white/10">
        <div className="flex items-center gap-2">
          <Hash size={14} className="text-white/40" />
          <select
            value={selectedTopicId}
            onChange={(e) => {
              setSelectedTopicId(e.target.value);
              setSelectedSubTopicId('');
            }}
            className="bg-transparent text-sm text-white/80 outline-none border-none cursor-pointer hover:text-white transition-colors appearance-none"
          >
            <option value="" className="bg-[#0A0A0B]">Select Topic...</option>
            {activeCourse.topics.map(topic => (
              <option key={topic.id} value={topic.id} className="bg-[#0A0A0B]">
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        {selectedTopic && selectedTopic.subTopics && selectedTopic.subTopics.length > 0 && (
          <>
            <div className="w-px h-4 bg-white/10 self-center" />
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-white/40" />
              <select
                value={selectedSubTopicId}
                onChange={(e) => setSelectedSubTopicId(e.target.value)}
                className="bg-transparent text-sm text-white/80 outline-none border-none cursor-pointer hover:text-white transition-colors appearance-none"
              >
                <option value="" className="bg-[#0A0A0B]">Select Subtopic...</option>
                {selectedTopic.subTopics.map(sub => (
                  <option key={sub.id} value={sub.id} className="bg-[#0A0A0B]">
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative group min-h-[500px]">
        <AnimatePresence mode="wait">
          {mode === 'text' ? (
            <motion.textarea
              key="text-editor"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              placeholder="Start typing your notes here... (Markdown supported)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[500px] bg-transparent text-white/80 text-base leading-relaxed outline-none resize-none placeholder:text-white/20 custom-scrollbar pb-32"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          ) : (
            <motion.div
              key="sketch-editor"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="w-full h-full min-h-[500px]"
            >
              <SketchCanvas />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
