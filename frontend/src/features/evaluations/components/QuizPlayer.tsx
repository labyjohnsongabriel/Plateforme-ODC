import { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Trophy, X } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { cn } from '@/utils/cn';
import type { QuizQuestion } from '../types/evaluation.types';

interface QuizPlayerProps {
  quizId: string;
  questions: QuizQuestion[];
  dureeMinutes?: number;
  onSubmit: (reponses: Record<string, string | string[]>) => Promise<any>;
  onCancel?: () => void;
}

export function QuizPlayer({
  quizId,
  questions,
  dureeMinutes = 30,
  onSubmit,
  onCancel,
}: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reponses, setReponses] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(dureeMinutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);

  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  // ========================================================================
  // Timer
  // ========================================================================
  useEffect(() => {
    if (showResults) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showResults]);

  // ========================================================================
  // Sélection réponse
  // ========================================================================
  const handleSelect = (optionIndex: number) => {
    const qId = currentQuestion.id || String(currentIndex);
    const optionId = String(optionIndex);

    if (currentQuestion.type === 'CHOIX_MULTIPLE') {
      const current = (reponses[qId] as string[]) || [];
      const updated = current.includes(optionId)
        ? current.filter((i) => i !== optionId)
        : [...current, optionId];
      setReponses({ ...reponses, [qId]: updated });
    } else {
      setReponses({ ...reponses, [qId]: optionId });
    }
  };

  const isSelected = (optionIndex: number): boolean => {
    const qId = currentQuestion.id || String(currentIndex);
    const optionId = String(optionIndex);
    const answer = reponses[qId];

    if (Array.isArray(answer)) return answer.includes(optionId);
    return answer === optionId;
  };

  // ========================================================================
  // Navigation
  // ========================================================================
  const next = () => {
    if (!isLast) setCurrentIndex(currentIndex + 1);
  };

  const prev = () => {
    if (!isFirst) setCurrentIndex(currentIndex - 1);
  };

  const goTo = (index: number) => {
    setCurrentIndex(index);
  };

  // ========================================================================
  // Soumission
  // ========================================================================
  const handleSubmit = async () => {
    if (!confirm('Voulez-vous vraiment terminer le quiz ?')) return;
    await submit();
  };

  const handleAutoSubmit = async () => {
    await submit();
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await onSubmit(reponses);
      setResult(res);
      setShowResults(true);
    } catch (err) {
      // géré par interceptor
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================================================
  // Format temps
  // ========================================================================
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timeIsLow = timeLeft < 60;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(reponses).length;

  // ========================================================================
  // Résultats
  // ========================================================================
  if (showResults && result) {
    const passed = result.pourcentage >= 50;

    return (
      <Card padding="lg" className="text-center max-w-lg mx-auto">
        <div
          className={cn(
            'inline-flex w-24 h-24 rounded-full items-center justify-center mb-6',
            passed ? 'bg-odc-success-bg' : 'bg-odc-error-bg'
          )}
        >
          <Trophy size={48} className={passed ? 'text-odc-success' : 'text-odc-error'} />
        </div>

        <h2 className="font-heading text-2xl font-bold mb-2 text-odc-text-light dark:text-odc-text-dark">
          {passed ? '🎉 Félicitations !' : 'Dommage...'}
        </h2>

        <p className="text-odc-text-muted-light dark:text-odc-text-muted-dark mb-6">
          {passed ? 'Vous avez réussi le quiz !' : 'Vous n\'avez pas atteint le seuil de réussite'}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-xl bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark">
            <div className="text-2xl font-bold text-odc-primary">{result.score || 0}</div>
            <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
              Score
            </div>
          </div>
          <div className="p-3 rounded-xl bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark">
            <div className="text-2xl font-bold text-odc-success">{result.pourcentage?.toFixed(1) || 0}%</div>
            <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
              Pourcentage
            </div>
          </div>
          <div className="p-3 rounded-xl bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark">
            <div className="text-2xl font-bold text-odc-info">{questions.length}</div>
            <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
              Questions
            </div>
          </div>
        </div>

        {onCancel && (
          <Button variant="primary" onClick={onCancel}>
            Terminer
          </Button>
        )}
      </Card>
    );
  }

  // ========================================================================
  // Quiz en cours
  // ========================================================================
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-odc-text-light dark:text-odc-text-dark">
                Question {currentIndex + 1} / {questions.length}
              </h2>
              <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                {answeredCount} réponse(s) donnée(s)
              </p>
            </div>
          </div>

          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full font-mono font-bold',
              timeIsLow
                ? 'bg-odc-error-bg text-odc-error animate-pulse'
                : 'bg-odc-primary-soft text-odc-primary-dark'
            )}
          >
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <ProgressBar value={progress} size="sm" />
        </div>
      </Card>

      {/* Question */}
      <Card padding="lg">
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-odc-primary text-white flex items-center justify-center font-bold flex-shrink-0">
              {currentIndex + 1}
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-lg text-odc-text-light dark:text-odc-text-dark leading-relaxed">
                {currentQuestion.question}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="primary" size="xs">
                  {currentQuestion.points} pt{currentQuestion.points > 1 ? 's' : ''}
                </Badge>
                {currentQuestion.type === 'CHOIX_MULTIPLE' && (
                  <Badge variant="info" size="xs">
                    Plusieurs réponses
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const selected = isSelected(index);
            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all',
                  'border-2',
                  selected
                    ? 'border-odc-primary bg-odc-primary-soft dark:bg-odc-primary-soft/20'
                    : 'border-odc-border-light dark:border-odc-border-dark hover:border-odc-primary/50 hover:bg-odc-primary-soft/30'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors',
                    selected
                      ? 'bg-odc-primary text-white'
                      : 'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark text-odc-text-muted-light'
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span
                  className={cn(
                    'flex-1 font-medium',
                    selected
                      ? 'text-odc-primary-dark dark:text-odc-primary-light'
                      : 'text-odc-text-light dark:text-odc-text-dark'
                  )}
                >
                  {option.text}
                </span>
                {selected && <CheckCircle size={20} className="text-odc-primary flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Navigation */}
      <Card>
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={prev}
            disabled={isFirst}
            icon={<ChevronLeft size={16} />}
          >
            Précédent
          </Button>

          {/* Indicateurs de progression */}
          <div className="hidden md:flex items-center gap-1">
            {questions.map((_, i) => {
              const isAnswered = reponses[String(i)] !== undefined;
              const isCurrent = i === currentIndex;

              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-xs font-semibold transition-all',
                    isCurrent
                      ? 'bg-odc-primary text-white scale-110 shadow-odc-sm'
                      : isAnswered
                      ? 'bg-odc-success-bg text-odc-success'
                      : 'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark text-odc-text-muted-light hover:bg-odc-primary-soft'
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {isLast ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
              icon={<CheckCircle size={16} />}
            >
              Terminer
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={next}
              icon={<ChevronRight size={16} />}
              iconRight={undefined}
            >
              Suivant
            </Button>
          )}
        </div>

        {onCancel && (
          <div className="mt-3 pt-3 border-t border-odc-border-light dark:border-odc-border-dark text-center">
            <button
              onClick={onCancel}
              className="text-xs text-odc-text-muted-light hover:text-odc-error transition-colors"
            >
              Abandonner le quiz
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}