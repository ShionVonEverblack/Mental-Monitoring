# Worker Cleanup 1: RTL Regional Hardening & Scratch Removal
1. Update `src/App.tsx` RTL check to `lng.startsWith('ar')`.
2. Remove temporary `scratch/` files to ensure 0 warnings across entire repo in oxlint.
3. Enhance `src/services/safetyCardService.ts` phone parsing for unlabelled hyphenated phone numbers.
4. Run full test suite, oxlint, tsc, and build.
