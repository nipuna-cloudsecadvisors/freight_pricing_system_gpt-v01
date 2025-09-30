# Resolving Merge Conflicts

When you push this branch to a remote repository you may see an error similar to:

```
This branch has conflicts that must be resolved
Conflicting files:
  README.md
  docs/DEPLOYMENT.md
  prisma/schema.prisma
```

Follow the steps below to resolve the conflicts locally and update the pull request.

## 1. Fetch the latest base branch

```bash
git fetch origin
# Replace `main` with the branch you are targeting if it differs
git checkout work
git merge origin/main
```

Git will pause at the merge and mark the conflicting files with `<<<<<<<`, `=======`, and `>>>>>>>` blocks.

## 2. Open the conflicting files and keep the desired content

For each file:

1. Search for the conflict markers.
2. Decide which parts from `HEAD` (your branch) and which parts from `origin/main` (the base branch) should be kept.
3. Delete the conflict markers and any discarded sections so the file compiles/reads correctly.

Tips for the specific files:

- **README.md** – keep project overview content from both sides if useful. Ensure headings stay consistent.
- **docs/DEPLOYMENT.md** – combine deployment instructions so they reflect the newest steps while avoiding duplication.
- **prisma/schema.prisma** – make sure the resulting schema is valid Prisma syntax. After resolving, run `pnpm prisma:format` if available to tidy formatting.

## 3. Stage and test

```bash
git add README.md docs/DEPLOYMENT.md prisma/schema.prisma
pnpm prisma:validate   # optional but recommended
pnpm test              # run if available
```

Fix any issues reported by the commands above before proceeding.

## 4. Complete the merge

```bash
git commit
```

The default merge message is usually fine, but you can customise it if desired.

Finally push the branch to update the remote pull request:

```bash
git push origin work
```

If you run into problems you can abort the merge with `git merge --abort` and start again.

## 5. Alternative: rebase instead of merge

If you prefer a linear history:

```bash
git fetch origin
git rebase origin/main
```

Resolve conflicts exactly as above, then continue the rebase:

```bash
git add <files>
git rebase --continue
git push --force-with-lease origin work
```

> Use `--force-with-lease` rather than `--force` to avoid overwriting other team members' work.
