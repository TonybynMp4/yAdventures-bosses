import type { SandstoneConfig } from 'sandstone'

// Shown in the pack descriptions, so the installed version is visible in game. Releases set
// PACK_VERSION to the tag; local builds use git describe (e.g. 0.4.1-3-g67bdf85-dirty)
const version =
  process.env.PACK_VERSION ||
  Bun.spawnSync(['git', 'describe', '--tags', '--always', '--dirty']).stdout.toString().trim() ||
  'dev'

export default {
  name: 'yAdventures-bosses',
  packs: {
    datapack: {
      description: `yAdventures bosses ${version}: Iceologer, Illusioner & Wildfire`,
      packFormat: 121,
    },
    resourcepack: {
      description: `yAdventures bosses ${version}: Iceologer, Illusioner & Wildfire assets`,
      packFormat: 97,
    },
  },
  onConflict: {
    default: 'throw',
  },
  namespace: 'yadventures-bosses',
  packUid: 'yadvboss',
  mcmeta: 'latest',
  saveOptions: {
    exportZips: false,
  },
  resources: {
    exclude: {
      // Sandstone always sets up Lantern Load and its internals; the pack uses its own minecraft:load tag
      // One regex: the CLI only keeps the last pattern's result
      generated: [/(^|[\\/])data[\\/]load[\\/]|__init__\.mcfunction$/],
      existing: [],
    },
  },
} as SandstoneConfig
