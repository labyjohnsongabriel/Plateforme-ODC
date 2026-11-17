// src/services/evaluation.service.ts
import { QueryFailedError } from 'typeorm';
import { evaluationRepository } from '../repositories/EvaluationRepository';
import { noteRepository } from '../repositories/note.repository';
import { sessionRepository } from '../repositories/session.repository';
import { inscriptionRepository } from '../repositories/inscription.repository';
import { questionRepository } from '../repositories/question.repository';
import { rubricRepository } from '../repositories/rubric.repository';
import { reponseRepository } from '../repositories/reponse.repository';
import { RoleName, StatutInscription, TypeEvaluation } from '../entities/enums';
import { TypeQuestion, isTypeQuestion } from '../models/enums/EvaluationEnums';
import { StatutSoumission } from '../entities/Soumission.entity';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/AppError';
import { logger } from '../config/logger';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

const MANAGEMENT_ROLES = new Set<RoleName>([
  RoleName.FORMATEUR,
  RoleName.STAFF_ODC,
  RoleName.ADMINISTRATEUR,
]);

const EDITABLE_FIELDS = [
  'titre', 'type', 'noteMax', 'noteMinPassage', 'coefficient',
  'dateEvaluation', 'dureeMinutes', 'description', 'consignes', 'publiee',
] as const;

type EvaluationFilters = {
  sessionId?: unknown;
  type?: unknown;
  publiee?: unknown;
  page?: unknown;
  limit?: unknown;
};

function parsePositiveInteger(value: unknown, fallback: number, max: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

function assertManager(role: RoleName): void {
  if (!MANAGEMENT_ROLES.has(role)) {
    throw new ForbiddenError('Accès réservé à l’équipe pédagogique');
  }
}

function assertType(type: unknown): asserts type is TypeEvaluation {
  if (!Object.values(TypeEvaluation).includes(type as TypeEvaluation)) {
    throw new BadRequestError('Type d’évaluation invalide');
  }
}

function assertScoreSettings(data: { noteMax?: number; noteMinPassage?: number }): void {
  if (
    data.noteMax !== undefined &&
    (!Number.isFinite(Number(data.noteMax)) ||
      Number(data.noteMax) < 1 || Number(data.noteMax) > 100)
  ) {
    throw new BadRequestError('noteMax doit être compris entre 1 et 100');
  }
  if (
    data.noteMinPassage !== undefined &&
    (!Number.isFinite(Number(data.noteMinPassage)) || Number(data.noteMinPassage) < 0)
  ) {
    throw new BadRequestError('noteMinPassage doit être positif ou nul');
  }
  if (
    data.noteMax !== undefined && data.noteMinPassage !== undefined &&
    Number(data.noteMinPassage) > Number(data.noteMax)
  ) {
    throw new BadRequestError('noteMinPassage ne peut pas dépasser noteMax');
  }
}

function normalizeEvaluationData(data: Record<string, any>) {
  const noteMax = data.noteMax === undefined ? 20 : Number(data.noteMax);
  const noteMinPassage = data.noteMinPassage === undefined ? 10 : Number(data.noteMinPassage);
  const coefficient = data.coefficient === undefined ? 1 : Number(data.coefficient);

  assertScoreSettings({ noteMax, noteMinPassage });

  if (!Number.isFinite(coefficient) || coefficient < 0.5 || coefficient > 10) {
    throw new BadRequestError('Le coefficient doit être compris entre 0,5 et 10');
  }
  if (
    data.dureeMinutes !== undefined && data.dureeMinutes !== null &&
    (!Number.isInteger(Number(data.dureeMinutes)) ||
      Number(data.dureeMinutes) < 5 || Number(data.dureeMinutes) > 600)
  ) {
    throw new BadRequestError('La durée doit être comprise entre 5 et 600 minutes');
  }
  if (
    data.dateEvaluation !== undefined && data.dateEvaluation !== null &&
    data.dateEvaluation !== '' &&
    !Number.isFinite(new Date(data.dateEvaluation).getTime())
  ) {
    throw new BadRequestError('La date d’évaluation est invalide');
  }

  return {
    ...data,
    noteMax,
    noteMinPassage,
    coefficient,
    dureeMinutes:
      data.dureeMinutes === undefined || data.dureeMinutes === null
        ? null : Number(data.dureeMinutes),
    dateEvaluation:
      data.dateEvaluation === undefined || data.dateEvaluation === null ||
      data.dateEvaluation === ''
        ? null : new Date(data.dateEvaluation),
  };
}

/* ─── Validation questions ──────────────────────────────────────────────── */

type NormalizedQuestion = {
  type: TypeQuestion;
  enonce: string;
  points: number;
  obligatoire: boolean;
  ordre: number;
  bonneReponse: string | null;
  explication: string | null;
  options: Array<{
    label: string;
    correct: boolean;
    ordre: number;
    explication: string | null;
  }>;
};

function validateQuestions(raw: unknown): NormalizedQuestion[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) throw new BadRequestError('questions doit être un tableau');

  return raw.map((q: any, i: number) => {
    if (!q || typeof q !== 'object') {
      throw new BadRequestError(`Question ${i + 1} invalide`);
    }
    const typeStr = String(q.type ?? '').toUpperCase();
    if (!isTypeQuestion(typeStr)) {
      throw new BadRequestError(`Type de question ${i + 1} invalide : ${q.type}`);
    }
    if (typeof q.enonce !== 'string' || !q.enonce.trim()) {
      throw new BadRequestError(`Énoncé de la question ${i + 1} requis`);
    }
    const points = Number(q.points ?? 1);
    if (!Number.isFinite(points) || points <= 0) {
      throw new BadRequestError(`Points de la question ${i + 1} invalides`);
    }

    const isChoice =
      typeStr === TypeQuestion.QCM_SIMPLE ||
      typeStr === TypeQuestion.QCM_MULTIPLE ||
      typeStr === TypeQuestion.VRAI_FAUX;

    const rawOptions = Array.isArray(q.options) ? q.options : [];
    if (isChoice && rawOptions.length < 2) {
      throw new BadRequestError(`La question ${i + 1} doit avoir au moins 2 options`);
    }

    const options = rawOptions.map((o: any, oi: number) => {
      const label = String(o?.label ?? '').trim();
      if (!label) {
        throw new BadRequestError(`Option ${oi + 1} de la question ${i + 1} : libellé requis`);
      }
      return {
        label,
        correct: Boolean(o?.correct),
        ordre: Number(o?.ordre ?? oi),
        explication: o?.explication ? String(o.explication) : null,
      };
    });

    if (isChoice && !options.some((o) => o.correct)) {
      throw new BadRequestError(`La question ${i + 1} doit avoir au moins une bonne réponse`);
    }
    if (typeStr === TypeQuestion.QCM_SIMPLE && options.filter((o) => o.correct).length !== 1) {
      throw new BadRequestError(`La question ${i + 1} (QCM) doit avoir exactement une bonne réponse`);
    }

    return {
      type: typeStr as TypeQuestion,
      enonce: q.enonce.trim(),
      points,
      obligatoire: Boolean(q.obligatoire ?? true),
      ordre: Number(q.ordre ?? i),
      bonneReponse: q.bonneReponse ? String(q.bonneReponse) : null,
      explication: q.explication ? String(q.explication) : null,
      options,
    };
  });
}

/* ─── Validation rubric ─────────────────────────────────────────────────── */

type NormalizedCriterion = {
  label: string;
  description: string;
  poids: number;
  noteMax: number;
  ordre: number;
};

function validateRubric(raw: unknown): NormalizedCriterion[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) throw new BadRequestError('rubric doit être un tableau');

  return raw.map((c: any, i: number) => {
    if (!c || typeof c !== 'object') {
      throw new BadRequestError(`Critère ${i + 1} invalide`);
    }
    if (typeof c.label !== 'string' || !c.label.trim()) {
      throw new BadRequestError(`Libellé du critère ${i + 1} requis`);
    }
    const poids = Number(c.poids ?? 1);
    const noteMax = Number(c.noteMax ?? 5);
    if (!Number.isFinite(poids) || poids <= 0) {
      throw new BadRequestError(`Poids du critère ${i + 1} invalide (> 0)`);
    }
    if (!Number.isFinite(noteMax) || noteMax <= 0) {
      throw new BadRequestError(`Note max du critère ${i + 1} invalide (> 0)`);
    }
    return {
      label: c.label.trim(),
      description: String(c.description ?? '').trim(),
      poids,
      noteMax,
      ordre: Number(c.ordre ?? i),
    };
  });
}

/* ─── Persistance questions ─────────────────────────────────────────────── */

async function persistQuestions(
  evaluationId: string,
  questions: NormalizedQuestion[],
): Promise<void> {
  await questionRepository.deleteByEvaluation(evaluationId);
  if (!questions.length) return;

  for (const q of questions) {
    const entity = questionRepository.raw.create({
      evaluationId,
      type: q.type,
      enonce: q.enonce,
      points: q.points,
      obligatoire: q.obligatoire,
      ordre: q.ordre,
      bonneReponse: q.bonneReponse,
      explication: q.explication,
      options: q.options.map((o) => ({
        label: o.label,
        correct: o.correct,
        ordre: o.ordre,
        explication: o.explication,
      })),
    });
    await questionRepository.raw.save(entity);
  }
}

/* ─── Persistance rubric ────────────────────────────────────────────────── */

async function persistRubric(
  evaluationId: string,
  rubric: NormalizedCriterion[],
): Promise<void> {
  await rubricRepository.deleteByEvaluation(evaluationId);
  if (!rubric.length) return;

  const entities = rubric.map((c) =>
    rubricRepository.raw.create({
      evaluationId,
      label: c.label,
      description: c.description,
      poids: c.poids,
      noteMax: c.noteMax,
      ordre: c.ordre,
    }),
  );
  await rubricRepository.raw.save(entities);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICE
   ═══════════════════════════════════════════════════════════════════════════ */

export class EvaluationService {
  /* ─── FIND ALL ──────────────────────────────────────────────────────── */
  static async findAll(filters: EvaluationFilters, userId: string, role: RoleName) {
    if (role !== RoleName.PARTICIPANT) assertManager(role);

    const page = parsePositiveInteger(filters.page, 1, Number.MAX_SAFE_INTEGER);
    const limit = parsePositiveInteger(filters.limit, 20, 100);
    const type = filters.type;
    if (type !== undefined) assertType(type);

    const published =
      filters.publiee === true || filters.publiee === 'true' ? true
      : filters.publiee === false || filters.publiee === 'false' ? false
      : undefined;

    const [data, total] = await evaluationRepository.findVisible({
      userId, role,
      sessionId: typeof filters.sessionId === 'string' ? filters.sessionId : undefined,
      type: type as TypeEvaluation | undefined,
      publiee: role === RoleName.PARTICIPANT ? true : published,
      skip: (page - 1) * limit,
      take: limit,
    });

    if (role === RoleName.PARTICIPANT) {
      const submitted = await evaluationRepository.findSubmissionsByParticipant(
        data.map((e) => e.id), userId,
      );
      const submittedIds = new Set(submitted.map((s) => s.evaluationId));
      return {
        data: data.map((e) => ({ ...e, dejaSoumise: submittedIds.has(e.id) })),
        total, page, limit, totalPages: Math.ceil(total / limit),
      };
    }

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /* ─── CREATE ─────────────────────────────────────────────────────────── */
  static async create(userId: string, role: RoleName, data: Record<string, any>) {
    assertManager(role);

    const session = await sessionRepository.findByIdOrFail(data.sessionId);
    if (role === RoleName.FORMATEUR && session.formateurId !== userId) {
      throw new ForbiddenError('Vous n’êtes pas le formateur de cette session');
    }

    assertType(data.type);
    if (
      typeof data.titre !== 'string' ||
      data.titre.trim().length < 3 || data.titre.trim().length > 200
    ) {
      throw new BadRequestError('Le titre doit contenir entre 3 et 200 caractères');
    }
    if (data.publiee !== undefined && typeof data.publiee !== 'boolean') {
      throw new BadRequestError('publiee doit être un booléen');
    }

    const normalized = normalizeEvaluationData(data);
    const questions = validateQuestions(data.questions);
    const rubric = validateRubric(data.rubric);

    const evaluation = await evaluationRepository.raw.save(
      evaluationRepository.raw.create({
        sessionId: session.id,
        titre: data.titre.trim(),
        type: data.type,
        noteMax: normalized.noteMax,
        noteMinPassage: normalized.noteMinPassage,
        coefficient: normalized.coefficient,
        dateEvaluation: normalized.dateEvaluation,
        dureeMinutes: normalized.dureeMinutes,
        description: this.validateText(data.description, 'description', 5000),
        consignes: this.validateText(data.consignes, 'consignes', 5000),
        publiee: data.publiee ?? false,
        createurId: userId,
      }),
    );

    if (questions.length) await persistQuestions(evaluation.id, questions);
    if (rubric.length) await persistRubric(evaluation.id, rubric);

    logger.info(`Évaluation créée : ${evaluation.id} par ${userId}`);
    return evaluationRepository.findByIdOrFail(evaluation.id, [
      'session', 'session.formation',
      'questions', 'questions.options', 'rubric',
    ]);
  }

  /* ─── FIND BY SESSION ────────────────────────────────────────────────── */
  static async findBySession(sessionId: string, userId: string, role: RoleName) {
    await this.assertCanViewSession(sessionId, userId, role);
    return evaluationRepository
      .findVisible({
        userId, role, sessionId,
        publiee: role === RoleName.PARTICIPANT ? true : undefined,
      })
      .then(([evaluations]) => evaluations);
  }

  /* ─── ASSERT CAN VIEW SESSION ────────────────────────────────────────── */
  static async assertCanViewSession(sessionId: string, userId: string, role: RoleName) {
    const session = await sessionRepository.findByIdOrFail(sessionId);

    if (role === RoleName.PARTICIPANT) {
      const inscription = await inscriptionRepository.findBySessionAndParticipant(
        sessionId, userId,
      );
      if (!inscription || inscription.statut !== StatutInscription.ACCEPTEE) {
        throw new NotFoundError('Session introuvable');
      }
      return;
    }

    assertManager(role);
    if (role === RoleName.FORMATEUR && session.formateurId !== userId) {
      throw new ForbiddenError('Vous n’êtes pas le formateur de cette session');
    }
  }

  /* ─── FIND BY ID ─────────────────────────────────────────────────────── */
  static async findById(id: string, userId: string, role: RoleName) {
    const evaluation = await evaluationRepository.findByIdOrFail(id, [
      'session', 'session.formation',
      'questions', 'questions.options', 'rubric',
    ]);
    await this.assertCanAccess(evaluation, userId, role);

    // Tri
    if (evaluation.questions) {
      evaluation.questions.sort((a, b) => a.ordre - b.ordre);
      for (const q of evaluation.questions) {
        q.options?.sort((a, b) => a.ordre - b.ordre);
      }
    }
    if (evaluation.rubric) {
      evaluation.rubric.sort((a, b) => a.ordre - b.ordre);
    }

    if (role === RoleName.PARTICIPANT) {
      const submission = await evaluationRepository.findSubmission(id, userId);

      let reponsesParQuestion: Record<string, any> = {};
      if (submission) {
        const reponses = await reponseRepository.findBySoumission(submission.id);
        reponsesParQuestion = this.mapReponsesToClient(reponses);
      }

      return {
        ...evaluation,
        // ⚠️ Ne pas exposer les bonnes réponses avant correction
        questions: evaluation.questions.map((q) => ({
          ...q,
          options: q.options?.map(({ correct, ...rest }: any) => rest),
          bonneReponse: null,
        })),
        maSoumission: submission
          ? {
              id: submission.id,
              soumisAt: submission.soumisAt,
              statut: submission.statut,
              noteObtenue: submission.noteObtenue,
              noteMaxSnapshot: submission.noteMaxSnapshot,
              pourcentage: submission.pourcentage,
              commentaire: submission.commentaire,
              feedbackFormateur: submission.feedbackFormateur,
              corrigeAt: submission.corrigeAt,
              reponsesParQuestion,
            }
          : null,
      };
    }
    return evaluation;
  }

  /* ─── SOUMETTRE ──────────────────────────────────────────────────────── */
  static async soumettre(evaluationId: string, participantId: string, reponses: unknown) {
    const evaluation = await evaluationRepository.findByIdOrFail(evaluationId, [
      'session', 'questions', 'questions.options',
    ]);
    await this.assertCanAccess(evaluation, participantId, RoleName.PARTICIPANT);

    if (!evaluation.publiee) {
      throw new ForbiddenError('Cette évaluation n’est pas encore publiée');
    }
    if (!reponses || typeof reponses !== 'object' || Array.isArray(reponses)) {
      throw new BadRequestError('Les réponses doivent être fournies sous forme d’objet');
    }

    const parQuestion = (reponses as any).parQuestion ?? (reponses as any);
    const entries = Object.entries(parQuestion as Record<string, unknown>);
    if (!entries.length) throw new BadRequestError('Aucune réponse fournie');
    if (JSON.stringify(reponses).length > 50_000) {
      throw new BadRequestError('La réponse dépasse la taille maximale de 50 Ko');
    }
    if (await evaluationRepository.findSubmission(evaluationId, participantId)) {
      throw new ConflictError('Cette évaluation a déjà été soumise');
    }

    try {
      // ⭐ 1. Soumission
      const submission = await evaluationRepository.rawSubmission.save(
        evaluationRepository.rawSubmission.create({
          evaluationId,
          participantId,
          soumisAt: new Date(),
          debutAt: null,
          finAt: null,
          dureeSecondes: null,
          statut: StatutSoumission.SOUMISE,
          noteObtenue: null,
          noteMaxSnapshot: Number(evaluation.noteMax),
          pourcentage: null,
          commentaire: null,
          feedbackFormateur: null,
        }),
      );

      // ⭐ 2. Réponses
      const reponsesEntities: any[] = [];
      for (const [questionId, r] of entries) {
        const question = evaluation.questions.find((q) => q.id === questionId);
        if (!question) continue;

        const rep = r as any;
        const entity: Record<string, any> = {
          soumissionId: submission.id,
          questionId,
        };

        switch (question.type) {
          case TypeQuestion.QCM_SIMPLE:
            entity.optionId = rep?.optionId ? String(rep.optionId) : null;
            break;
          case TypeQuestion.QCM_MULTIPLE:
            entity.optionIds = Array.isArray(rep?.optionIds)
              ? rep.optionIds.map(String) : [];
            break;
          case TypeQuestion.VRAI_FAUX:
            entity.valeurBool =
              typeof rep?.valeur === 'boolean' ? rep.valeur : null;
            break;
          case TypeQuestion.TEXTE_COURT:
          case TypeQuestion.TEXTE_LONG:
          case TypeQuestion.CODE:
            entity.texte = rep?.texte ?? '';
            break;
          case TypeQuestion.FICHIER:
            entity.fichierUrl = rep?.fichierUrl ?? null;
            entity.nomFichier = rep?.nomFichier ?? null;
            break;
        }
        reponsesEntities.push(reponseRepository.raw.create(entity));
      }
      if (reponsesEntities.length) {
        await reponseRepository.raw.save(reponsesEntities);
      }

      // ⭐ 3. Auto-correction
      const needsAutoCorrection = [
        TypeEvaluation.QUIZ,
        TypeEvaluation.PRE_TEST,
        TypeEvaluation.POST_TEST,
        TypeEvaluation.EXAMEN,
      ].includes(evaluation.type as TypeEvaluation);

      if (needsAutoCorrection) {
        await this.corrigerAutomatiquement(submission.id, evaluation);
      }

      return evaluationRepository.rawSubmission.findOne({
        where: { id: submission.id },
        relations: ['reponses', 'reponses.question'],
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).driverError?.code === '23505'
      ) {
        throw new ConflictError('Cette évaluation a déjà été soumise');
      }
      throw error;
    }
  }

  /* ─── CORRECTION AUTOMATIQUE ─────────────────────────────────────────── */
  private static async corrigerAutomatiquement(soumissionId: string, evaluation: any) {
    const soumission = await evaluationRepository.rawSubmission.findOne({
      where: { id: soumissionId },
      relations: ['reponses', 'reponses.question', 'reponses.question.options'],
    });
    if (!soumission) return;

    let totalPoints = 0;
    let obtainedPoints = 0;
    let hasManualCorrection = false;

    for (const reponse of soumission.reponses) {
      const question = reponse.question;
      if (!question) continue;

      const pointsMax = Number(question.points);
      totalPoints += pointsMax;
      let correcte: boolean | null = null;

      switch (question.type) {
        case TypeQuestion.QCM_SIMPLE: {
          if (!reponse.optionId) { correcte = false; break; }
          const option = question.options.find((o: any) => o.id === reponse.optionId);
          correcte = option?.correct === true;
          break;
        }
        case TypeQuestion.VRAI_FAUX: {
          if (typeof reponse.valeurBool !== 'boolean') { correcte = false; break; }
          const expected =
            question.options.find((o: any) => o.correct)?.label?.toLowerCase() === 'vrai';
          correcte = reponse.valeurBool === expected;
          break;
        }
        case TypeQuestion.QCM_MULTIPLE: {
          const selected = reponse.optionIds ?? [];
          const correctIds = question.options
            .filter((o: any) => o.correct)
            .map((o: any) => String(o.id));
          correcte =
            selected.length === correctIds.length &&
            correctIds.every((id: string) => selected.includes(id));
          break;
        }
        case TypeQuestion.TEXTE_COURT:
        case TypeQuestion.CODE: {
          if (question.bonneReponse && reponse.texte) {
            correcte =
              question.bonneReponse.trim().toLowerCase() ===
              reponse.texte.trim().toLowerCase();
          } else {
            hasManualCorrection = true;
          }
          break;
        }
        case TypeQuestion.TEXTE_LONG:
        case TypeQuestion.FICHIER:
        default:
          hasManualCorrection = true;
      }

      reponse.correcte = correcte;
      reponse.noteObtenue =
        correcte === true ? pointsMax : correcte === false ? 0 : null;
      if (correcte === true) obtainedPoints += pointsMax;
    }

    await reponseRepository.raw.save(soumission.reponses);

    const noteMaxSnapshot = Number(evaluation.noteMax);
    const pourcentage = totalPoints > 0 ? (obtainedPoints / totalPoints) * 100 : 0;
    const noteFinale = (pourcentage / 100) * noteMaxSnapshot;

    soumission.statut = hasManualCorrection
      ? StatutSoumission.SOUMISE
      : StatutSoumission.CORRIGEE;
    soumission.noteObtenue = hasManualCorrection
      ? null : Math.round(noteFinale * 100) / 100;
    soumission.noteMaxSnapshot = noteMaxSnapshot;
    soumission.pourcentage = Math.round(pourcentage * 100) / 100;
    soumission.corrigeAt = new Date();

    await evaluationRepository.rawSubmission.save(soumission);
  }

  /* ─── FIND SUBMISSIONS ───────────────────────────────────────────────── */
  static async findSubmissions(evaluationId: string, userId: string, role: RoleName) {
    assertManager(role);
    const evaluation = await evaluationRepository.findByIdOrFail(evaluationId, ['session']);
    this.assertCanManage(evaluation, userId, role);
    return evaluationRepository.findSubmissions(evaluationId);
  }

  /* ─── UPDATE ─────────────────────────────────────────────────────────── */
  static async update(id: string, userId: string, role: RoleName, data: Record<string, any>) {
    assertManager(role);
    const evaluation = await evaluationRepository.findByIdOrFail(id, ['session']);
    this.assertCanManage(evaluation, userId, role);

    const patch: Record<string, unknown> = {};
    for (const field of EDITABLE_FIELDS) {
      if (data[field] !== undefined) patch[field] = data[field];
    }

    if (patch.type !== undefined) assertType(patch.type);
    if (!Object.keys(patch).length && data.questions === undefined && data.rubric === undefined) {
      throw new BadRequestError('Aucun champ valide à mettre à jour');
    }

    if (Object.keys(patch).length) {
      const normalized = normalizeEvaluationData({
        noteMax: patch.noteMax ?? evaluation.noteMax,
        noteMinPassage: patch.noteMinPassage ?? evaluation.noteMinPassage,
        coefficient: patch.coefficient ?? evaluation.coefficient,
        dureeMinutes: patch.dureeMinutes ?? evaluation.dureeMinutes,
        dateEvaluation: patch.dateEvaluation ?? evaluation.dateEvaluation,
      });
      Object.assign(patch, normalized);

      if (typeof patch.titre === 'string') patch.titre = patch.titre.trim();
      if (
        patch.titre !== undefined &&
        (typeof patch.titre !== 'string' ||
          patch.titre.length < 3 || patch.titre.length > 200)
      ) {
        throw new BadRequestError('Le titre doit contenir entre 3 et 200 caractères');
      }
      if (patch.description !== undefined) {
        patch.description = this.validateText(patch.description, 'description', 5000);
      }
      if (patch.consignes !== undefined) {
        patch.consignes = this.validateText(patch.consignes, 'consignes', 5000);
      }
      if (patch.publiee !== undefined && typeof patch.publiee !== 'boolean') {
        throw new BadRequestError('publiee doit être un booléen');
      }

      // ⚠️ Empêcher réduction du barème sous une note existante
      if (
        patch.noteMax !== undefined &&
        Number(patch.noteMax) < Number(evaluation.noteMax)
      ) {
        const maxExistingScore = await noteRepository.raw
          .createQueryBuilder('n')
          .where('n.evaluationId = :evaluationId', { evaluationId: id })
          .andWhere('n.note > :noteMax', { noteMax: Number(patch.noteMax) })
          .getCount();
        if (maxExistingScore > 0) {
          throw new ConflictError('Le nouveau barème est inférieur à une note déjà attribuée');
        }
      }

      Object.assign(evaluation, patch);
      await evaluationRepository.raw.save(evaluation);
    }

    // ⭐ Remplacer questions et rubric si fournis
    if (data.questions !== undefined) {
      const questions = validateQuestions(data.questions);
      await persistQuestions(id, questions);
    }
    if (data.rubric !== undefined) {
      const rubric = validateRubric(data.rubric);
      await persistRubric(id, rubric);
    }

    return evaluationRepository.findByIdOrFail(id, [
      'session', 'session.formation',
      'questions', 'questions.options', 'rubric',
    ]);
  }

  /* ─── TOGGLE PUBLICATION ─────────────────────────────────────────────── */
  static async togglePublication(id: string, userId: string, role: RoleName, publiee: boolean) {
    assertManager(role);
    const evaluation = await evaluationRepository.findByIdOrFail(id, ['session']);
    this.assertCanManage(evaluation, userId, role);
    evaluation.publiee = publiee;
    return evaluationRepository.raw.save(evaluation);
  }

  /* ─── SAISIR NOTE ────────────────────────────────────────────────────── */
  static async saisirNote(
    userId: string,
    role: RoleName,
    evaluationId: string,
    participantId: string,
    note: number,
    commentaire?: string,
  ) {
    assertManager(role);
    const evaluation = await evaluationRepository.findByIdOrFail(evaluationId, ['session']);
    this.assertCanManage(evaluation, userId, role);

    if (!Number.isFinite(note) || note < 0 || note > Number(evaluation.noteMax)) {
      throw new BadRequestError(`La note doit être comprise entre 0 et ${evaluation.noteMax}`);
    }

    const inscription = await inscriptionRepository.findBySessionAndParticipant(
      evaluation.sessionId, participantId,
    );
    if (!inscription || inscription.statut !== StatutInscription.ACCEPTEE) {
      throw new ForbiddenError(
        'La note ne peut être attribuée qu’à un participant accepté dans cette session',
      );
    }

    let result = await noteRepository.findByEvaluationAndParticipant(
      evaluationId, participantId,
    );

    if (result) {
      result.note = note;
      if (commentaire !== undefined) result.commentaire = commentaire;
      result.saisiePar = userId;
      result.dateSaisie = new Date();
    } else {
      result = noteRepository.raw.create({
        evaluationId, participantId, note, commentaire,
        saisiePar: userId, dateSaisie: new Date(),
      });
    }
    await noteRepository.save(result);

    // ⭐ Synchroniser la soumission si existante
    const submission = await evaluationRepository.findSubmission(evaluationId, participantId);
    if (submission) {
      submission.noteObtenue = note;
      submission.noteMaxSnapshot = Number(evaluation.noteMax);
      submission.pourcentage = Math.round((note / Number(evaluation.noteMax)) * 10000) / 100;
      submission.statut = StatutSoumission.CORRIGEE;
      submission.commentaire = commentaire ?? submission.commentaire;
      submission.corrigePar = userId;
      submission.corrigeAt = new Date();
      await evaluationRepository.rawSubmission.save(submission);
    }

    return result;
  }

  /* ─── MOYENNE ────────────────────────────────────────────────────────── */
  static async calculerMoyenne(sessionId: string, participantId: string) {
    const notes = await noteRepository.findBySessionAndParticipant(sessionId, participantId);
    if (!notes.length) return 0;

    const weightedTotal = notes.reduce(
      (sum, item) =>
        sum +
        (Number(item.note) / Number(item.evaluation.noteMax)) * 20 *
          Number(item.evaluation.coefficient || 1),
      0,
    );
    const totalCoefficient = notes.reduce(
      (sum, item) => sum + Number(item.evaluation.coefficient || 1),
      0,
    );

    return totalCoefficient === 0
      ? 0
      : Math.round((weightedTotal / totalCoefficient) * 100) / 100;
  }

  /* ─── DELETE ─────────────────────────────────────────────────────────── */
  static async delete(id: string, userId: string, role: RoleName) {
    assertManager(role);
    const evaluation = await evaluationRepository.findByIdOrFail(id, ['session']);
    this.assertCanManage(evaluation, userId, role);
    await evaluationRepository.raw.softDelete(id);
  }

  /* ─── HELPERS PRIVÉS ─────────────────────────────────────────────────── */

  private static async assertCanAccess(
    evaluation: { id: string; sessionId: string; session?: { formateurId: string | null }; publiee: boolean },
    userId: string,
    role: RoleName,
  ): Promise<void> {
    if (role === RoleName.PARTICIPANT) {
      if (!evaluation.publiee) throw new NotFoundError('Évaluation introuvable');
      const inscription = await inscriptionRepository.findBySessionAndParticipant(
        evaluation.sessionId, userId,
      );
      if (!inscription || inscription.statut !== StatutInscription.ACCEPTEE) {
        throw new NotFoundError('Évaluation introuvable');
      }
      return;
    }
    assertManager(role);
    this.assertCanManage(evaluation, userId, role);
  }

  private static assertCanManage(
    evaluation: { session?: { formateurId: string | null } },
    userId: string,
    role: RoleName,
  ): void {
    if (role === RoleName.FORMATEUR && evaluation.session?.formateurId !== userId) {
      throw new ForbiddenError('Vous ne pouvez gérer que les évaluations de vos sessions');
    }
  }

  private static validateText(value: unknown, field: string, maxLength: number): string | null {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value !== 'string' || value.length > maxLength) {
      throw new BadRequestError(
        `${field} doit être un texte de ${maxLength} caractères maximum`,
      );
    }
    return value.trim();
  }

  /** Convertit les lignes `reponses` → objet `reponsesParQuestion` */
  private static mapReponsesToClient(reponses: any[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const r of reponses) {
      const q = r.question;
      if (!q) continue;
      const typeStr = String(q.type).toUpperCase();
      switch (typeStr) {
        case TypeQuestion.QCM_SIMPLE:
          if (r.optionId) result[q.id] = { type: 'QCM', optionId: r.optionId };
          break;
        case TypeQuestion.QCM_MULTIPLE: {
          const ids = Array.isArray(r.optionIds) ? r.optionIds : [];
          if (ids.length) result[q.id] = { type: 'QCM_MULTIPLE', optionIds: ids };
          break;
        }
        case TypeQuestion.VRAI_FAUX:
          if (typeof r.valeurBool === 'boolean') {
            result[q.id] = { type: 'VRAI_FAUX', valeur: r.valeurBool };
          }
          break;
        case TypeQuestion.TEXTE_COURT:
          if (r.texte != null) result[q.id] = { type: 'TEXTE_COURT', texte: r.texte };
          break;
        case TypeQuestion.TEXTE_LONG:
          if (r.texte != null) result[q.id] = { type: 'TEXTE_LONG', texte: r.texte };
          break;
        case TypeQuestion.CODE:
          if (r.texte != null) result[q.id] = { type: 'CODE', texte: r.texte };
          break;
        case TypeQuestion.FICHIER:
          if (r.fichierUrl) {
            result[q.id] = {
              type: 'FICHIER',
              fichierUrl: r.fichierUrl,
              nomFichier: r.nomFichier ?? '',
            };
          }
          break;
      }
    }
    return result;
  }
}