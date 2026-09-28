import type { SandstoneConfig } from 'sandstone'

export default {
  name: 'yAdventures-bosses',
  packs: {
    datapack: {
      description: 'yAdventures bosses: Iceologer, Illusioner & Wildfire',
      packFormat: 121,
    },
    resourcepack: {
      description: 'yAdventures bosses: Iceologer, Illusioner & Wildfire assets',
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
