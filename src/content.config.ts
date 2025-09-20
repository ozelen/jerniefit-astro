import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
  }),
});

const services = defineCollection({
  // Load Markdown and MDX files in the `src/content/services/` directory.
  loader: glob({ base: "./src/content/services", pattern: "**/*.{md,mdx}" }),
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    price: z.string().optional(),
    icon: z.string().optional(),
    features: z.array(z.string()).optional(),
    ctaText: z.string().optional(),
    ctaLink: z.string().optional(),
    isPromo: z.boolean().optional(),
    slug: z.string().optional(),
  }),
});

export const collections = { blog, services };
