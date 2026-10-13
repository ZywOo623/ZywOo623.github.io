# ZywOo623 site

This is the source for [zywoo623.github.io](https://zywoo623.github.io/). Astro builds static HTML for the homepage and each Markdown article. The graph and bit laboratories are the only React islands.

## Edit an article

Add a Markdown file under `src/content/blog/` and include `title`, `date`, `category`, `series`, `description`, and `tags` in its frontmatter. The file name becomes its public URL under `/blog/`. The guide series is ordered by its `0xNN` file name. Private Obsidian notes should be edited and reviewed before copying content here.

## Work locally

Use Node 24 and pnpm 11. From this directory:

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

`pnpm update:data` refreshes the public Codeforces snapshot before a build. If the API is unavailable, the last successful snapshot is retained. No keys or private data are used.

## Publish

GitHub Actions builds and deploys this directory on pushes to `main` and once daily for the Codeforces snapshot. The repository root also contains a generated static copy for the existing branch based Pages setup. To refresh that copy locally, run `pnpm build` and `pnpm export:root` before committing.
