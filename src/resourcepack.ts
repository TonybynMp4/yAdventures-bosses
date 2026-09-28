import { Atlas, Equipment, ItemModelDefinition, Language, Model, SoundsIndex } from 'sandstone'
import { range } from './lib.ts'
import { MAPS, vendor } from './maps.ts'
import { KEY_LANG } from './spawners.ts'

// ============================================================ resource pack
// Textures, sounds and the iceologer model files live directly in resources/resourcepack; models, item
// definitions, equipment, sound events and lang are generated here.
const modelRef = (model: string) => ({ type: 'minecraft:model', model })
const itemDef = (name: string, model: object) => ItemModelDefinition(name, { model } as any)

for (const t of ['totem_of_freezing', 'totem_of_illusion', 'wildfire_crown_fragment', 'wildfire_crown_upgrade_smithing_template',
  ...Object.keys(MAPS).map((m) => `${m}_map`)]) {
  Model('item', `yadventures-bosses:${t}`, { parent: 'minecraft:item/generated', textures: { layer0: `yadventures-bosses:item/${t}` } } as any)
  itemDef(`yadventures-bosses:${t}`, modelRef(`yadventures-bosses:item/${t}`))
}
// Crowned netherite helmet: the netherite equipment asset plus the crown layer (trims still render on top),
// and the vanilla item model (with its trim variants) plus a crown overlay
const eq = vendor('netherite_equipment.json')
eq.layers.humanoid.push({ texture: 'yadventures-bosses:wildfire_crown' })
Equipment('yadventures-bosses:wildfire_crown_netherite', eq)
Model('item', 'yadventures-bosses:wildfire_crown_overlay', { parent: 'minecraft:item/generated', textures: { layer0: 'yadventures-bosses:item/wildfire_crown_overlay' } } as any)
itemDef('yadventures-bosses:wildfire_crown_netherite_helmet', {
  type: 'minecraft:composite', models: [
    vendor('netherite_helmet_model.json'),
    modelRef('yadventures-bosses:item/wildfire_crown_overlay')],
})

Atlas('minecraft:blocks', { sources: [{ type: 'directory', source: 'yadventures-bosses_entity', prefix: 'entity/' }] } as any)

type Vec = [number, number, number]
function cube(from: Vec, to: Vec, [u, v]: [number, number], [w, h, dd]: Vec, rotation?: object) {
  const r = (u1: number, v1: number, u2: number, v2: number) => [u1 / 4, v1 / 4, u2 / 4, v2 / 4]
  const e: Record<string, unknown> = {
    from, to, faces: {
      north: { uv: r(u + dd, v + dd, u + dd + w, v + dd + h), texture: '#0' },
      east: { uv: r(u, v + dd, u + dd, v + dd + h), texture: '#0' },
      south: { uv: r(u + 2 * dd + w, v + dd, u + 2 * dd + 2 * w, v + dd + h), texture: '#0' },
      west: { uv: r(u + dd + w, v + dd, u + 2 * dd + w, v + dd + h), texture: '#0' },
      up: { uv: r(u + dd, v, u + dd + w, v + dd), rotation: 180, texture: '#0' },
      down: { uv: r(u + dd + w, v, u + dd + 2 * w, v + dd), rotation: 180, texture: '#0' },
    },
  }
  if (rotation) e.rotation = rotation
  return e
}

const TEX = { 0: 'yadventures-bosses:entity/wildfire', particle: 'yadventures-bosses:entity/wildfire' }
Model('wildfire', 'yadventures-bosses:body', {
  texture_size: [64, 64], textures: TEX, elements: [
    cube([6, 0, 6], [10, 21, 10], [0, 0], [4, 21, 4]),
    cube([4, 21, 4], [12, 29, 12], [0, 26], [8, 8, 8]),
    cube([3.8, 20.8, 3.8], [12.2, 30.2, 12.2], [0, 43], [8, 9, 8]),
  ],
} as any)
itemDef('yadventures-bosses:wildfire/body', modelRef('yadventures-bosses:wildfire/body'))
itemDef('yadventures-bosses:wildfire/shields_0', { type: 'minecraft:empty' })
for (const n of range(5).slice(1)) {
  Model('wildfire', `yadventures-bosses:shields_${n}`, {
    texture_size: [64, 64], textures: TEX, elements: range(n).map((k) =>
      cube([3, 1.5, -1.5], [13, 18.5, 0.5], [17, 0], [10, 17, 2], { origin: [8, 22, 8], x: 15, y: -k * 90, rescale: false })),
  } as any)
  itemDef(`yadventures-bosses:wildfire/shields_${n}`, modelRef(`yadventures-bosses:wildfire/shields_${n}`))
}

// Iceologer: the model files in models/iceologer are hand-maintained (texture from Friends & Foes).
// Item definitions pick the variant from custom_model_data flags: head [hurt], body [hurt, moving, spellcasting]
const iceModel = (path: string) => modelRef(`yadventures-bosses:iceologer/${path}`)
const ifFlag = (index: number, on_true: object, on_false: object) =>
  ({ type: 'minecraft:condition', property: 'minecraft:custom_model_data', index, on_true, on_false })
const hurtVariant = (path: string) => ifFlag(0, iceModel(`${path}/hurt`), iceModel(`${path}/normal`))
// every leg rotation layered; their animated textures show one frame at a time
const walkingLegs = (v: string) => ({
  type: 'minecraft:composite',
  models: ['left', 'right'].flatMap((side) => range(9).map((i) => iceModel(`legs/${side}/${i - 4}/${v}`))),
})

itemDef('yadventures-bosses:iceologer/head', hurtVariant('head'))
const iceBody = {
  type: 'minecraft:composite', models: [
    hurtVariant('body'),
    ifFlag(2, hurtVariant('arms/spellcasting'), hurtVariant('arms/crossed')),
    ifFlag(1, ifFlag(0, walkingLegs('hurt'), walkingLegs('normal')), hurtVariant('legs/static')),
  ],
}
itemDef('yadventures-bosses:iceologer/body', iceBody)
// The Iceologer's wandering trader briefly holds a plain milk bucket each time it restarts drinking (see
// iceologer.ts): draw milk held by any wandering trader as the body. Vanilla traders only hold milk while
// drinking it invisible at dawn, where this shows a floating body instead of a floating bucket.
itemDef('minecraft:milk_bucket', {
  type: 'minecraft:select', property: 'minecraft:context_entity_type',
  cases: [{ when: 'minecraft:wandering_trader', model: iceBody }],
  fallback: modelRef('minecraft:item/milk_bucket'),
})

// Ice chunk (Friends & Foes model): three ice blocks and two slabs, 2 x 1 x 2.5 blocks
const ICE_TEX = { 0: 'yadventures-bosses:entity/ice_chunk', particle: 'yadventures-bosses:entity/ice_chunk' }
Model('' as any, 'yadventures-bosses:ice_chunk', { // '' = models/ root (the types only allow a subfolder)
  texture_size: [64, 64], textures: ICE_TEX, elements: [
    cube([-8, 0, 4], [8, 16, 20], [0, 0], [16, 16, 16]),
    cube([8, 0, 4], [24, 16, 20], [0, 0], [16, 16, 16]),
    cube([-8, 0, -12], [8, 16, 4], [0, 0], [16, 16, 16]),
    cube([-8, 0, 20], [8, 16, 28], [0, 32], [16, 16, 8]),
    cube([4, 0, -8], [20, 16, 0], [0, 32], [16, 16, 8], { origin: [12, 8, -4], y: 90, rescale: false }),
  ],
} as any)
itemDef('yadventures-bosses:ice_chunk', modelRef('yadventures-bosses:ice_chunk'))

// Sound events (the .ogg files are in resources/resourcepack)
const sound = (folder: string, files: string[], subtitle: string) =>
  ({ sounds: files.map((f) => `yadventures-bosses:${folder}/${f}`), subtitle })
const numbered = (name: string, n: number) => range(n).map((i) => `${name}${i + 1}`)
const WILDFIRE_SOUNDS: [string, number, string?][] = [
  ['ambient', 4], ['death', 3], ['hurt', 3], ['shield_break', 3],
  ['shockwave', 3, 'subtitle.entity.yadventures-bosses.wildfire.shoot'], ['shoot', 4],
  ['step', 4, 'subtitles.block.generic.footsteps'], ['summon_blaze', 3],
]
const sounds: Record<string, object> = {
  'entity.player.mirror_move': sound('entity/player', numbered('mirror_move', 2), 'subtitle.entity.yadventures-bosses.player.mirror_move'),
  ...Object.fromEntries(WILDFIRE_SOUNDS.map(([name, n, subtitle]) => [`entity.wildfire.${name}`,
    sound('entity/wildfire', numbered(name, n), subtitle ?? `subtitle.entity.yadventures-bosses.wildfire.${name}`)])),
  'item.armor.equip_wildfire_crown': sound('item/wildfire_crown', numbered('equip', 3), 'subtitle.item.yadventures-bosses.armor.equip_wildfire_crown'),
}
for (const [event, files] of [
  ['entity.iceologer.ambient', numbered('ambient', 3)],
  ['entity.iceologer.cast_spell', numbered('cast_spell', 2)],
  ['entity.iceologer.death', numbered('death', 3)],
  ['entity.iceologer.hurt', numbered('hurt', 3)],
  ['entity.iceologer.prepare_slowness', ['prepare_slowness']],
  ['entity.iceologer.prepare_summon', ['prepare_summon']],
  ['entity.ice_chunk.ambient', ['ambient']],
  ['entity.ice_chunk.hit', ['hit']],
  ['entity.ice_chunk.summon', ['summon']],
] as [string, string[]][]) {
  sounds[event] = sound(`entity/${event.split('.')[1]}`, files, `subtitle.${event.replace('.', '.yadventures-bosses.')}`)
}
SoundsIndex(sounds as any, 'yadventures-bosses')

// subtitles for the sounds above
const SUBS = {
  'subtitle.entity.yadventures-bosses.iceologer.ambient': 'Iceologer murmurs',
  'subtitle.entity.yadventures-bosses.iceologer.cast_spell': 'Iceologer casts spell',
  'subtitle.entity.yadventures-bosses.iceologer.death': 'Iceologer dies',
  'subtitle.entity.yadventures-bosses.iceologer.hurt': 'Iceologer hurts',
  'subtitle.entity.yadventures-bosses.iceologer.prepare_slowness': 'Iceologer prepares slowness',
  'subtitle.entity.yadventures-bosses.iceologer.prepare_summon': 'Iceologer prepares summoning',
  'subtitle.entity.yadventures-bosses.ice_chunk.ambient': 'Ice Chunk cracks',
  'subtitle.entity.yadventures-bosses.ice_chunk.hit': 'Ice Chunk falls',
  'subtitle.entity.yadventures-bosses.ice_chunk.summon': 'Ice Chunk cracks',
  'subtitle.entity.yadventures-bosses.wildfire.ambient': 'Wildfire breathes',
  'subtitle.entity.yadventures-bosses.wildfire.death': 'Wildfire dies',
  'subtitle.entity.yadventures-bosses.wildfire.hurt': 'Wildfire hurts',
  'subtitle.entity.yadventures-bosses.wildfire.shield_break': "Wildfire's shield brokes",
  'subtitle.entity.yadventures-bosses.wildfire.shockwave': 'Wildfire shockwaves',
  'subtitle.entity.yadventures-bosses.wildfire.shoot': 'Wildfire shoots',
  'subtitle.entity.yadventures-bosses.wildfire.summon_blaze': 'Wildfire summons blazes',
  'subtitle.entity.yadventures-bosses.player.mirror_move': 'Player displaces',
  'subtitle.item.yadventures-bosses.armor.equip_wildfire_crown': 'Wildfire Crown crackles',
}

Language('yadventures-bosses:en_us', {
  'entity.yadventures-bosses.iceologer': 'Iceologer',
  'entity.yadventures-bosses.wildfire': 'Wildfire',
  'item.yadventures-bosses.totem_of_freezing': 'Totem of Freezing',
  'item.yadventures-bosses.totem_of_illusion': 'Totem of Illusion',
  'item.yadventures-bosses.totem.tooltip': 'Triggers when taking damage and health falls below half of your max health.',
  'item.yadventures-bosses.wildfire_crown': 'Wildfire Crown',
  'item.yadventures-bosses.wildfire_crown_fragment.tooltip': 'Craft 5 with a netherite scrap into a Wildfire Crown Upgrade',
  'item.yadventures-bosses.smithing_template.wildfire_crown_upgrade': 'Wildfire Crown Upgrade',
  'item.yadventures-bosses.smithing_template.wildfire_crown_upgrade.applies_to': 'Netherite Helmet',
  'item.yadventures-bosses.wildfire_crown_fragment': 'Wildfire Crown Fragment',
  ...SUBS,
  ...KEY_LANG,
})
