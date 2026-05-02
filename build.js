import * as esbuild from 'esbuild'

const once = process.argv.includes('--once')

const ctx = await esbuild.context({
  entryPoints: ['poc/poc.ts'],
  bundle: true,
  outfile: 'poc/dist/bundle.js',
  sourcemap: true,
})

if (once) {
  await ctx.rebuild()
  await ctx.dispose()
  console.log('Build complete.')
} else {
  await ctx.watch()
  console.log('Watching...')
}
