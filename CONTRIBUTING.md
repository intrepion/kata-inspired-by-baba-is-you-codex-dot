# Development standards

Keep mechanics pure and deterministic in src/engine.ts. Render and persistence belong outside the engine. Use strict TypeScript. Every authored level must have a replay that completes through the public turn API and demonstrably changes rules. Add behavioral regressions for mechanics fixes. Run npm run check before publishing. Do not add external runtime services or copied game assets.
