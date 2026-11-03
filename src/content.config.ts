import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const actualites = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/actualites' }),
  schema: z.object({
    titre: z.string(),
    date: z.coerce.date(),
    image: z.string().optional(),
    galerie: z.array(z.string()).default([]),
    publie: z.boolean().default(true),
  }),
});

const avions = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/avions' }),
  schema: z.object({
    nom: z.string(),
    immatriculation: z.string().optional(),
    type: z.string(),
    puissance: z.number().optional(),
    places: z.number().optional(),
    usage: z.string().optional(),
    description: z.string().optional(),
    photos: z.array(z.string()).default([]),
    // Chaque ligne s'applique à partir de sa date : on peut saisir un futur tarif à l'avance.
    tarifs: z
      .array(
        z.object({
          a_partir_du: z.coerce.date(),
          prix_heure: z.number(),
          prix_heure_jeune: z.number().optional(),
          note: z.string().optional(),
        }),
      )
      .default([]),
    ordre: z.number().default(10),
    actif: z.boolean().default(true),
  }),
});

const documents = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/documents' }),
  schema: z.object({
    titre: z.string(),
    categorie: z.enum(['Sécurité', 'Préparation des vols', 'Météo', 'Formulaires', 'Vie du club']),
    fichier: z.string(),
    description: z.string().optional(),
    mis_a_jour: z.coerce.date().optional(),
  }),
});

export const collections = { actualites, avions, documents };
