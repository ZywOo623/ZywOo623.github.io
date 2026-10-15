import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    series: z.string(),
    chapter: z.string().optional(),
    description: z.string(),
    tags: z.array(z.string())
  })
});

export const collections = { blog };
