import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Save, X, Calendar, Award, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { DatePicker } from '@/components/common/DatePicker';
import { FormSection } from '@/components/forms/FormSection';
import { FormError } from '@/components/forms/FormError';
import { EvaluationService } from '../services/evaluation.service';
import { createEvaluationSchema, TypeEvaluation } from '../types/evaluation.types';
import type { CreateEvaluationFormData } from '../types/evaluation.types';

interface EvaluationFormProps {
    sessionId: string;
    evaluationId?: string;
    initialData?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function EvaluationForm({
    sessionId,
    evaluationId,
    initialData,
    onSuccess,
    onCancel,
}: EvaluationFormProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const isEdit = !!evaluationId;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateEvaluationFormData>({
        resolver: zodResolver(createEvaluationSchema),
        defaultValues: initialData || {
            sessionId,
            titre: '',
            type: TypeEvaluation.QUIZ,
            noteMax: 20,
            coefficient: 1,
            description: '',
            consignes: '',
        },
    });

    const onSubmit = async (data: CreateEvaluationFormData) => {
        setLoading(true);
        setGlobalError(null);

        try {
            if (isEdit) {
                await EvaluationService.update(evaluationId!, data);
            } else {
                await EvaluationService.create({ ...data, sessionId });
            }
            onSuccess?.();
        } catch (err: any) {
            setGlobalError(err.response?.data?.message || 'Erreur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {globalError && <FormError message={globalError} />}

            <Card>
                <FormSection
                    title="Informations de l'évaluation"
                    description="Définissez les détails de l'évaluation"
                    icon={<FileText size={20} />}
                    columns={2}
                >
                    <div className="md:col-span-2">
                        <Input
                            label="Titre de l'évaluation"
                            placeholder="Ex: Examen final - React"
                            icon={<FileText size={16} />}
                            error={errors.titre?.message}
                            required
                            {...register('titre')}
                        />
                    </div>

                    <Select
                        label="Type d'évaluation"
                        error={errors.type?.message}
                        required
                        options={[
                            { value: TypeEvaluation.QUIZ, label: 'Quiz' },
                            { value: TypeEvaluation.EXAMEN, label: 'Examen' },
                            { value: TypeEvaluation.PROJET, label: 'Projet' },
                            { value: TypeEvaluation.TP, label: 'Travaux pratiques' },
                            { value: TypeEvaluation.ORAL, label: 'Présentation orale' },
                        ]}
                        {...register('type')}
                    />

                    <DatePicker
                        label="Date de l'évaluation"
                        error={errors.dateEvaluation?.message}
                        {...register('dateEvaluation')}
                    />

                    <Input
                        label="Note maximale"
                        type="number"
                        icon={<Award size={16} />}
                        error={errors.noteMax?.message}
                        required
                        {...register('noteMax', { valueAsNumber: true })}
                    />

                    <Input
                        label="Coefficient"
                        type="number"
                        step="0.5"
                        icon={<Target size={16} />}
                        error={errors.coefficient?.message}
                        {...register('coefficient', { valueAsNumber: true })}
                    />
                </FormSection>

                <div className="mt-6 space-y-4">
                    <Textarea
                        label="Description"
                        placeholder="Description de l'évaluation..."
                        rows={3}
                        maxLength={2000}
                        showCount
                        error={errors.description?.message}
                        {...register('description')}
                    />

                    <Textarea
                        label="Consignes"
                        placeholder="Instructions pour les participants..."
                        rows={4}
                        maxLength={5000}
                        showCount
                        error={errors.consignes?.message}
                        {...register('consignes')}
                    />
                </div>
            </Card>

            <div className="flex items-center justify-end gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel || (() => navigate(-1))}
                    icon={<X size={16} />}
                >
                    Annuler
                </Button>
                <Button type="submit" variant="primary" loading={loading} icon={<Save size={16} />}>
                    {isEdit ? 'Enregistrer' : 'Créer l\'évaluation'}
                </Button>
            </div>
        </form>
    );
}