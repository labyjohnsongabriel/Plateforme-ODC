import { z } from 'zod';

/* ============================================================================
   PRIMITIVES RÉUTILISABLES
   ============================================================================ */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Adresse email invalide')
  .max(150, 'Email trop long');

export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(72, 'Le mot de passe est trop long')
  .regex(/[A-Z]/, 'Doit contenir une majuscule')
  .regex(/[a-z]/, 'Doit contenir une minuscule')
  .regex(/[0-9]/, 'Doit contenir un chiffre');

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s().-]{6,20}$/, 'Numéro de téléphone invalide')
  .optional()
  .or(z.literal(''));

export const uuidSchema = z.string().uuid('Identifiant invalide');

export const urlSchema = z.string().url('URL invalide').optional().or(z.literal(''));

/* ============================================================================
   AUTH
   ============================================================================ */
export const loginSchema = z.object({
  email: emailSchema,
  motDePasse: z.string().min(1, 'Mot de passe requis'),
});

export const registerSchema = z.object({
  nom: z.string().trim().min(2, 'Nom trop court').max(100),
  prenom: z.string().trim().min(2, 'Prénom trop court').max(100),
  email: emailSchema,
  motDePasse: passwordSchema,
  telephone: phoneSchema,
  roleNom: z.enum(['PARTICIPANT', 'PARTENAIRE']).default('PARTICIPANT'),
});

export const changePasswordSchema = z
  .object({
    ancienMotDePasse: z.string().min(1, 'Ancien mot de passe requis'),
    nouveauMotDePasse: passwordSchema,
    confirmation: z.string(),
  })
  .refine((d) => d.nouveauMotDePasse === d.confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmation'],
  })
  .refine((d) => d.ancienMotDePasse !== d.nouveauMotDePasse, {
    message: 'Le nouveau mot de passe doit être différent',
    path: ['nouveauMotDePasse'],
  });

/* ============================================================================
   PROFIL
   ============================================================================ */
export const updateProfileSchema = z.object({
  nom: z.string().trim().min(2).max(100).optional(),
  prenom: z.string().trim().min(2).max(100).optional(),
  telephone: phoneSchema,
  bio: z.string().trim().max(2000).optional(),
  ville: z.string().trim().max(200).optional(),
  linkedin: urlSchema,
  siteWeb: urlSchema,
  entreprise: z.string().trim().max(200).optional(),
  poste: z.string().trim().max(200).optional(),
  competences: z.array(z.string().trim().max(100)).max(30).optional(),
});

/* ============================================================================
   FORMATION
   ============================================================================ */
export const formationSchema = z.object({
  titre: z.string().trim().min(3, 'Titre trop court').max(200),
  slug: z.string().trim().min(3).max(220).optional(),
  description: z.string().trim().min(10, 'Description trop courte').max(5000),
  objectifs: z.string().trim().max(2000).optional(),
  prerequis: z.string().trim().max(2000).optional(),
  programme: z.string().trim().max(10000).optional(),
  domaineId: uuidSchema.optional(),
  domaine: z.string().trim().min(2).max(100).optional(),
  niveau: z.enum(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE']),
  dureeHeures: z.coerce.number().int().positive().max(500),
  imageUrl: urlSchema,
  prix: z.coerce.number().nonnegative().max(1000000).optional(),
  nbParticipantsMax: z.coerce.number().int().min(0).max(10000).optional(),
  estPubliee: z.boolean().optional(),
  actif: z.boolean().optional(),
  miseEnAvant: z.boolean().optional(),
});

/* ============================================================================
   SESSION
   ============================================================================ */
export const sessionSchema = z
  .object({
    formationId: uuidSchema,
    formateurId: uuidSchema.optional(),
    codeSession: z.string().trim().min(3).max(50).optional(),
    dateDebut: z.coerce.date(),
    dateFin: z.coerce.date(),
    lieu: z.string().trim().max(200).optional(),
    lienVisio: urlSchema,
    capacite: z.coerce.number().int().positive().max(10000).default(30),
    statut: z.enum(['PLANIFIEE', 'OUVERTE', 'EN_COURS', 'TERMINEE', 'ANNULEE']).optional(),
    notes: z.string().trim().max(5000).optional(),
    imageUrl: urlSchema,
    estPubliee: z.boolean().optional(),
    dateOuvertureInscriptions: z.coerce.date().optional(),
    dateFermetureInscriptions: z.coerce.date().optional(),
  })
  .refine((d) => d.dateFin > d.dateDebut, {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['dateFin'],
  });

/* ============================================================================
   INSCRIPTION
   ============================================================================ */
export const inscriptionSchema = z.object({
  sessionId: uuidSchema,
  motivation: z.string().trim().max(1000).optional(),
});

/* ============================================================================
   ÉVALUATION
   ============================================================================ */
export const evaluationSchema = z.object({
  sessionId: uuidSchema,
  titre: z.string().trim().min(3).max(200),
  type: z.enum(['PRE_TEST', 'POST_TEST', 'QUIZ', 'PROJET', 'EXAMEN', 'TP', 'ORAL']),
  noteMax: z.coerce.number().positive().max(100).default(20),
  noteMinPassage: z.coerce.number().nonnegative().max(100).default(10),
  coefficient: z.coerce.number().positive().max(10).default(1),
  dateEvaluation: z.coerce.date().optional(),
  dureeMinutes: z.coerce.number().int().positive().max(600).optional(),
  description: z.string().trim().max(5000).optional(),
  consignes: z.string().trim().max(5000).optional(),
});

/* ============================================================================
   NOTE
   ============================================================================ */
export const noteSchema = z.object({
  participantId: uuidSchema,
  note: z.coerce.number().nonnegative().max(100),
  commentaire: z.string().trim().max(1000).optional(),
});

/* ============================================================================
   Types inférés
   ============================================================================ */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type FormationInput = z.infer<typeof formationSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
export type InscriptionInput = z.infer<typeof inscriptionSchema>;
export type EvaluationInput = z.infer<typeof evaluationSchema>;
export type NoteInput = z.infer<typeof noteSchema>;