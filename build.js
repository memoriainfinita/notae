import * as esbuild from 'esbuild'

const once = process.argv.includes('--once')

const contexts = await Promise.all([
  esbuild.context({
    entryPoints: ['demo/demo.ts'],
    bundle: true,
    outfile: 'dist/demo.js',
    sourcemap: true,
  }),
  esbuild.context({
    entryPoints: ['demo/sandbox.ts'],
    bundle: true,
    outfile: 'dist/sandbox.js',
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
