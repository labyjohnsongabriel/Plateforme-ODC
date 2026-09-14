import { useState } from 'react';
import { Plus, Trash2, GripVertical, CheckCircle, Circle, Save, X } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Badge } from '@/components/common/Badge';
import { cn } from '@/utils/cn';
import type { QuizQuestion } from '../types/evaluation.types';

interface QuizBuilderProps {
  initialQuestions?: QuizQuestion[];
  onSave: (questions: QuizQuestion[]) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function QuizBuilder({
  initialQuestions = [],
  onSave,
  onCancel,
  loading,
}: QuizBuilderProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialQuestions.length > 0
      ? initialQuestions
      : [
          {
            question: '',
            type: 'CHOIX_UNIQUE',
            options: [
              { text: '', isCorrect: true },
              { text: '', isCorrect: false },
            ],
            points: 1,
          },
        ]
  );

  // ========================================================================
  // Ajouter une question
  // ========================================================================
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: '',
        type: 'CHOIX_UNIQUE',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
        ],
        points: 1,
      },
    ]);
  };

  // ========================================================================
  // Supprimer une question
  // ========================================================================
  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // ========================================================================
  // Mettre à jour une question
  // ========================================================================
  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  // ========================================================================
  // Gestion des options
  // ========================================================================
  const addOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: [...q.options, { text: '', isCorrect: false }],
            }
          : q
      )
    );
  };

  const updateOption = (qIndex: number, oIndex: number, field: string, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((o, oi) =>
                oi === oIndex ? { ...o, [field]: value } : o
              ),
            }
          : q
      )
    );
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex && q.options.length > 2
          ? { ...q, options: q.options.filter((_, oi) => oi !== oIndex) }
          : q
      )
    );
  };

  const toggleCorrect = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;

        if (q.type === 'CHOIX_UNIQUE' || q.type === 'VRAI_FAUX') {
          // Une seule bonne réponse
          return {
            ...q,
            options: q.options.map((o, oi) => ({
              ...o,
              isCorrect: oi === oIndex,
            })),
          };
        } else {
          // Plusieurs bonnes réponses
          return {
            ...q,
            options: q.options.map((o, oi) =>
              oi === oIndex ? { ...o, isCorrect: !o.isCorrect } : o
            ),
          };
        }
      })
    );
  };

  // ========================================================================
  // Total des points
  // ========================================================================
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-heading font-bold text-lg text-odc-text-light dark:text-odc-text-dark">
              Éditeur de Quiz
            </h3>
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
              {questions.length} question(s) • {totalPoints} points au total
            </p>
          </div>
          <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addQuestion}>
            Ajouter une question
          </Button>
        </div>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, qIndex) => (
          <Card key={qIndex} className="relative group">
            {/* Header question */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 flex items-center gap-2">
                <GripVertical size={18} className="text-odc-text-muted-light cursor-move" />
                <div className="w-8 h-8 rounded-lg bg-odc-primary text-white flex items-center justify-center text-sm font-bold">
                  {qIndex + 1}
                </div>
              </div>

              <div className="flex-1">
                <Input
                  placeholder="Écrivez votre question..."
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                />
              </div>

              <button
                onClick={() => removeQuestion(qIndex)}
                disabled={questions.length === 1}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-odc-error-bg text-odc-error transition-colors disabled:opacity-30"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Options de configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Select
                label="Type"
                value={question.type}
                onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                options={[
                  { value: 'CHOIX_UNIQUE', label: 'Choix unique' },
                  { value: 'CHOIX_MULTIPLE', label: 'Choix multiple' },
                  { value: 'VRAI_FAUX', label: 'Vrai / Faux' },
                ]}
              />

              <Input
                label="Points"
                type="number"
                value={question.points}
                onChange={(e) =>
                  updateQuestion(qIndex, 'points', Number(e.target.value))
                }
                min={1}
              />

              <div className="flex items-end">
                <Badge variant="primary" size="md">
                  {question.options.filter((o) => o.isCorrect).length} bonne(s) réponse(s)
                </Badge>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2 mb-3">
              {question.options.map((option, oIndex) => (
                <div
                  key={oIndex}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg border-2 transition-colors',
                    option.isCorrect
                      ? 'border-odc-success bg-odc-success-bg/50'
                      : 'border-odc-border-light dark:border-odc-border-dark'
                  )}
                >
                  <button
                    onClick={() => toggleCorrect(qIndex, oIndex)}
                    className="flex-shrink-0"
                  >
                    {option.isCorrect ? (
                      <CheckCircle size={20} className="text-odc-success" />
                    ) : (
                      <Circle size={20} className="text-odc-text-muted-light" />
                    )}
                  </button>

                  <input
                    type="text"
                    placeholder={`Option ${oIndex + 1}`}
                    value={option.text}
                    onChange={(e) =>
                      updateOption(qIndex, oIndex, 'text', e.target.value)
                    }
                    className="flex-1 bg-transparent border-0 focus:outline-none text-sm text-odc-text-light dark:text-odc-text-dark"
                  />

                  {question.options.length > 2 && (
                    <button
                      onClick={() => removeOption(qIndex, oIndex)}
                      className="flex-shrink-0 p-1 rounded hover:bg-odc-error-bg text-odc-error transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => addOption(qIndex)}
            >
              Ajouter une option
            </Button>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white dark:bg-odc-surface-dark p-4 rounded-xl border border-odc-border-light dark:border-odc-border-dark shadow-odc-md">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} icon={<X size={16} />}>
            Annuler
          </Button>
        )}
        <Button
          variant="primary"
          onClick={() => onSave(questions)}
          loading={loading}
          icon={<Save size={16} />}
        >
          Enregistrer le quiz
        </Button>
      </div>
    </div>
  );
}