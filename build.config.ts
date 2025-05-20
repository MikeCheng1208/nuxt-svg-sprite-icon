import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/module'
  ],
  externals: [
    '@nuxt/kit',
    'chokidar',
    'readdirp'
  ],
  declaration: true,
  rollup: {
    emitCJS: true
  },
  failOnWarn: false
})