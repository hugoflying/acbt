import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Le back-office peut enregistrer un champ facultatif vide sous la forme '' ou null : on le traite comme absent.
const vide = (v: unknown) => (v === '' || v === null ? undefined : v);
const opt = <T extends z.ZodTypeAny>(schema: T) => z.preprocess(vide, schema.optional());

const actualites = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/actualites' }),
  schema: z.object({
    titre: z.string(),
    date: z.coerce.date(),
    image: opt(z.string()),
    galerie: z.array(z.string()).default([]),
    publie: z.boolean().default(true),
  }),
});

const avions = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/avions' }),
  schema: z.object({
    nom: z.string(),
    immatriculation: opt(z.string()),
    type: z.string(),
    puissance: opt(z.number()),
    places: opt(z.number()),
    usage: opt(z.string()),
    description: opt(z.string()),
    photos: z.array(z.string()).default([]),
    // Chaque ligne s'applique à partir de sa date : on peut saisir un futur tarif à l'avance.
    tarifs: z
      .array(
        z.object({
          a_partir_du: z.coerce.date(),
          prix_heure: z.number(),
          prix_instruction: opt(z.number()),
          note: opt(z.string()),
        }),
      )
      .default([]),
    ordre: z.number().default(10),
    actif: z.boolean().default(true),
  }),
});

export const CATEGORIES_DOCS = ['Vie du club', 'Documentation pilote', 'Documentation avion', 'Pour les élèves', 'Examens', 'Examen pratique', 'Sécurité', 'Préparation des vols', 'Météo', 'Formulaires'] as const;
export const RUBRIQUES_AVION = ['Manuel de vol', 'Paramètres', 'Check-list', 'Centrage', 'Guide radio rapide', 'Radio VFR', 'Transpondeur', 'DME', 'Balise de détresse', 'Autre'] as const;

const documents = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/documents' }),
  schema: z.object({
    titre: z.string(),
    categorie: z.enum(CATEGORIES_DOCS),
    avions: z.array(z.string()).default([]),
    rubrique: opt(z.enum(RUBRIQUES_AVION)),
    fichier: opt(z.string()),
    lien: opt(z.string()),
    description: opt(z.string()),
    mis_a_jour: opt(z.coerce.date()),
    ordre: z.number().default(10),
  }),
});

export const collections = { actualites, avions, documents };
