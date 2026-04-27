## Summary

<!-- Brief description of what this PR does (1-3 sentences) -->

## Changes

<!-- Detailed list of changes -->
-
-

## Type of Change

<!-- Check all that apply -->
- [ ] New feature (`feat:`)
- [ ] Bug fix (`fix:`)
- [ ] Documentation (`docs:`)
- [ ] Refactoring (`refactor:`)
- [ ] Testing (`test:`)
- [ ] Maintenance (`chore:`)

## Phase

<!-- Which build phase does this PR belong to? -->
- [ ] Phase 0 — Setup
- [ ] Phase 1 — Backend foundation
- [ ] Phase 2 — Public site shell
- [ ] Phase 3 — Catalog browsing
- [ ] Phase 4 — Product detail page
- [ ] Phase 5 — Admin panel
- [ ] Phase 6 — Catalog import
- [ ] Phase 7 — Deploy
- [ ] Post-launch / Phase 9

## Testing

<!-- How was this tested? -->
- [ ] Manual testing on desktop
- [ ] Manual testing on mobile (or responsive view)
- [ ] Type check passes (`tsc --noEmit`)
- [ ] Lint passes (`eslint .`)
- [ ] No tests needed (docs/config only)

**Test plan:**
<!-- Describe how to test this change locally -->
1.
2.

## Self-Review Checklist

<!-- CRITICAL — Review your own PR before requesting review -->
- [ ] Reviewed the full diff on GitHub
- [ ] No debug code (`console.log`, commented blocks, dead code)
- [ ] TypeScript strict mode compliance
- [ ] No hardcoded secrets, API keys, or service-role keys
- [ ] WhatsApp number / brand placeholders use `lib/brand.ts` constants, not hardcoded strings
- [ ] Mobile + desktop layouts both verified
- [ ] Loading + empty + error states handled (where applicable)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No breaking changes (or documented)

## Screenshots

<!-- Add screenshots for UI changes — desktop AND mobile views if relevant -->

## Related Issues / PRs

- Closes #
- Related to #

---

## ✅ Merge Criteria (All Must Be Met)

**Before clicking "Squash and merge", verify:**
- [ ] All CI checks passing
- [ ] Self-review completed (checklist above)
- [ ] All review comments addressed
- [ ] Branch up-to-date with main
- [ ] No merge conflicts
- [ ] PR is "Ready for review" (not Draft)

**⚠️ Do NOT merge if:**
- ❌ Tests / type-check / lint failing
- ❌ Review comments unresolved
- ❌ It's late on a Friday (unless a critical hotfix)
- ❌ You haven't verified locally

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
