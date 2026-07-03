import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Terminal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence, useAnimation, animate } from 'motion/react';

export interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

interface QuizProps {
  title: string;
  questions: Question[];
  onComplete?: (score: number, total: number) => void;
}

export function QuizComponent({ title, questions, onComplete }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(3);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setCountdown(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOptionId) return;
    setIsAnswered(true);
    if (selectedOptionId === currentQuestion.correctOptionId) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setIsFinished(true);
      onComplete?.(score + (selectedOptionId === currentQuestion.correctOptionId ? 1 : 0), questions.length);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    }
  };

  const handleRestart = () => {
    setCountdown(3);
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (countdown !== null) {
    return (
      <div className="bg-[var(--color-card)] cyber-chamfer border border-[var(--color-border)] p-8 sm:p-12 text-center flex flex-col items-center justify-center shadow-sm h-full min-h-[400px] font-mono relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-8xl font-black text-[var(--color-accent)] cyber-glitch-text"
          >
            {countdown > 0 ? countdown : 'START'}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="bg-[var(--color-card)] cyber-chamfer border border-[var(--color-border)] p-8 sm:p-12 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 shadow-sm h-full min-h-[400px] font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-circuit opacity-10 pointer-events-none"></div>
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.6 }}
          className={cn(
            "w-20 h-20 cyber-chamfer-reverse border-2 flex items-center justify-center mb-6 relative z-10 bg-[var(--color-background)] mx-auto",
            passed ? "border-[var(--color-accent)] text-[var(--color-accent)] shadow-[0_0_15px_var(--color-accent)]" : "border-[var(--color-destructive)] text-[var(--color-destructive)] shadow-[0_0_15px_var(--color-destructive)]"
          )}
        >
          {passed ? <Terminal className="w-10 h-10 animate-blink" strokeWidth={1.5} /> : <RotateCcw className="w-10 h-10" strokeWidth={1.5} />}
        </motion.div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-heading font-black tracking-widest text-[var(--color-foreground)] mb-2 uppercase cyber-glitch-text">
            {passed ? 'EVALUATION_PASSED' : 'EVALUATION_FAILED'}
          </h2>
          <p className="text-[var(--color-muted-foreground)] mb-8 max-w-sm mx-auto text-sm uppercase tracking-widest">
            CORRECT_RESPONSES: <ScoreCounter value={score} passed={passed} /> / <span className="font-bold text-[var(--color-foreground)]">{questions.length}</span> (<ScoreCounter value={percentage} passed={passed} />%).
            {passed ? ' DATA UPLOADED TO NEURAL LINK.' : ' DATA CORRUPTION DETECTED. RETRY.'}
          </p>

          <div className="flex gap-4 justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRestart}
              className="px-6 py-2.5 cyber-chamfer-sm font-bold text-xs tracking-widest text-[var(--color-foreground)] bg-transparent border border-[var(--color-border)] hover:border-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors uppercase"
            >
              RUN_DIAGNOSTICS_AGAIN
            </motion.button>
            {passed && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 cyber-chamfer-sm font-bold text-xs tracking-widest text-[var(--color-background)] bg-[var(--color-accent)] border border-[var(--color-accent)] hover:bg-transparent hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-2 hover:neon-glow uppercase"
              >
                 INITIALIZE_NEXT <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isCurrentCorrect = isAnswered && selectedOptionId === currentQuestion.correctOptionId;
  const isCurrentWrong = isAnswered && selectedOptionId !== currentQuestion.correctOptionId && selectedOptionId !== null;

  return (
    <motion.div 
      initial={false}
      animate={isCurrentWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className={cn(
        "bg-[var(--color-card)] cyber-chamfer border border-[var(--color-border)] p-6 sm:p-8 flex flex-col h-full font-mono relative overflow-hidden group hover:border-[var(--color-accent)]/50 transition-colors",
        isCurrentCorrect && "border-[var(--color-accent)] shadow-[inset_0_0_50px_rgba(0,255,136,0.2)]",
        isCurrentWrong && "border-[var(--color-destructive)] shadow-[inset_0_0_50px_rgba(255,51,102,0.2)]"
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/5 blur-[100px] pointer-events-none"></div>
      
      <div className="flex items-center gap-4 mb-8 relative z-10 border-b border-[var(--color-border)] pb-4">
        <div className="w-12 h-12 bg-[var(--color-background)] border border-[var(--color-accent)] text-[var(--color-accent)] cyber-chamfer-reverse flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,255,136,0.2)]">
          <span className="font-bold text-sm tracking-widest">{currentQuestionIndex + 1}/{questions.length}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--color-accent)] font-bold">{'>'}</span>
            <h2 className="font-heading font-bold text-[var(--color-foreground)] tracking-widest uppercase truncate">{title}</h2>
          </div>
          <div className="h-1 w-full bg-[var(--color-muted)] relative">
             <div 
               className="absolute top-0 left-0 h-full bg-[var(--color-accent)] transition-all duration-500 ease-out shadow-[0_0_5px_var(--color-accent)]" 
               style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
             />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)] max-w-3xl leading-snug tracking-wide uppercase mb-6">
              {currentQuestion.text}
            </h3>

            <div className="space-y-4">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const isCorrect = option.id === currentQuestion.correctOptionId;
                const showCorrect = isAnswered && isCorrect;
                const showWrong = isAnswered && isSelected && !isCorrect;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    disabled={isAnswered}
                    className={cn(
                      "w-full text-left px-5 py-4 border transition-all flex items-center justify-between group cyber-chamfer-sm relative overflow-hidden",
                      !isAnswered && !isSelected && "border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 cursor-pointer",
                      !isAnswered && isSelected && "border-[var(--color-accent)] bg-[var(--color-accent)]/10 cursor-pointer text-[var(--color-accent)] shadow-[inset_0_0_10px_rgba(0,255,136,0.1)]",
                      showCorrect && "border-[var(--color-accent)] bg-[var(--color-accent)]/20 cursor-default shadow-[inset_0_0_10px_rgba(0,255,136,0.2)]",
                      showWrong && "border-[var(--color-destructive)] bg-[var(--color-destructive)]/10 cursor-default",
                      isAnswered && !isSelected && !isCorrect && "border-[var(--color-border)] bg-[var(--color-background)] opacity-50 cursor-default"
                    )}
                  >
                    {!isAnswered && !isSelected && (
                      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,136,0.05)_50%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
                    )}
                    
                    <div className="flex items-start gap-4 relative z-10">
                      <span className={cn(
                        "font-bold font-mono text-sm mt-0.5",
                        showCorrect ? "text-[var(--color-accent)]" : showWrong ? "text-[var(--color-destructive)]" : isSelected ? "text-[var(--color-accent)]" : "text-[var(--color-muted-foreground)]"
                      )}>
                        {'>'}
                      </span>
                      <span className={cn(
                        "font-medium uppercase tracking-wide text-sm leading-relaxed",
                        showCorrect ? "text-[var(--color-accent)]" : showWrong ? "text-[var(--color-destructive)]" : "text-[var(--color-foreground)]",
                      )}>
                        {option.text}
                      </span>
                    </div>

                    <div className="shrink-0 ml-4 relative z-10">
                      {!isAnswered && (
                        <div className={cn(
                          "w-4 h-4 border flex items-center justify-center transition-colors cyber-chamfer-sm",
                          isSelected ? "border-[var(--color-accent)] bg-[var(--color-accent)] shadow-[0_0_5px_var(--color-accent)]" : "border-[var(--color-border)] group-hover:border-[var(--color-accent)]"
                        )} />
                      )}
                      {showCorrect && <Terminal className="w-5 h-5 text-[var(--color-accent)] animate-blink" strokeWidth={2} />}
                      {showWrong && <XCircle className="w-5 h-5 text-[var(--color-destructive)]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex items-center justify-between relative z-10">
        <p className={cn(
          "text-xs font-bold tracking-widest uppercase transition-opacity duration-300",
          isAnswered ? "opacity-100" : "opacity-0",
          selectedOptionId === currentQuestion.correctOptionId ? "text-[var(--color-accent)]" : "text-[var(--color-destructive)]"
        )}>
          {selectedOptionId === currentQuestion.correctOptionId ? '[VALIDATION_SUCCESS]' : '[VALIDATION_ERROR]'}
        </p>

        {!isAnswered ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!selectedOptionId}
            className="px-8 py-2.5 bg-transparent border border-[var(--color-accent)] text-[var(--color-accent)] cyber-chamfer text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-accent)] hover:text-[var(--color-background)] hover:neon-glow disabled:opacity-30 disabled:border-[var(--color-border)] disabled:text-[var(--color-muted-foreground)] disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
          >
            EXECUTE
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="px-8 py-2.5 bg-[var(--color-accent)] border border-[var(--color-accent)] text-[var(--color-background)] cyber-chamfer text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-[var(--color-accent)] neon-glow hover:neon-glow-lg transition-all inline-flex items-center gap-2 group"
          >
            {isLastQuestion ? 'EVALUATE_DATA' : 'NEXT_QUERY'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function ScoreCounter({ value, passed }: { value: number, passed: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      onUpdate(v) {
        setDisplayValue(Math.round(v));
      }
    });
    return controls.stop;
  }, [value]);

  return <span className={cn("font-bold", passed ? "text-[var(--color-accent)]" : "text-[var(--color-destructive)]")}>{displayValue}</span>;
}
