import * as esbuild from 'esbuild'

const once = process.argv.includes('--once')

const contexts = await Promise.all([
  esbuild.context({
    entryPoints: ['poc/poc.ts'],
    bundle: true,
    outfile: 'poc/dist/bundle.js',
    sourcemap: true,
  }),
  esbuild.context({
    entryPoints: ['poc-sandbox/sandbox.ts'],
    bundle: true,
    outfile: 'poc-sandbox/dist/bundle.js',
    sourcemap: true,
  }),
])

if (once) {
  await Promise.all(contexts.map(ctx => ctx.rebuild()))
  await Promise.all(contexts.map(ctx => ctx.dispose()))
  console.log('Build complete.')
} else {
  await Promise.all(contexts.map(ctx => ctx.watch()))
  console.log('Watching...')
}
