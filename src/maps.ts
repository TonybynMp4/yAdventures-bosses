import { readFileSync } from 'node:fs'
import { LootTable, Tag, VillagerTrade } from 'sandstone'
import { fn } from './lib.ts'
import { KEY_LANG, pool } from './spawners.ts'

export const vendor = (path: string) => JSON.parse(readFileSync(`vendor/${path}`, 'utf8'))

// ============================================================ explorer maps
// Vanilla map decorations are a fixed registry: the maps use the unused marker types, retextured in the
// resource pack (target_x, target_point, blue_marker)
export const MAPS: Record<string, [string[], string, string]> = { // name: [structures, decoration, item name]
  citadel: [['yadventures-bosses:citadel'], 'minecraft:target_x', 'Citadel Explorer Map'],
  iceologer: [['yadventures-bosses:iceologer_cabin'], 'minecraft:target_point', 'Iceologer Explorer Map'],
  illusioner: [['yadventures-bosses:illusioner_shack', 'yadventures-bosses:illusioner_training_grounds'],
    'minecraft:blue_marker', 'Illusioner Explorer Map'],
}
const mapModifiers = (m: string, search_radius = 50) => [
  {
    type: 'minecraft:set_components', components: {
      'minecraft:item_name': { translate: `item.yadventures-bosses.${m}_map` },
      'minecraft:item_model': `yadventures-bosses:${m}_map`,
    },
  },
  {
    type: 'minecraft:exploration_map', decoration: MAPS[m][1],
    destination: `#yadventures-bosses:on_${m}_maps`, search_radius,
  },
  // no structure within range: no map (vanilla does the same)
  {
    type: 'minecraft:filtered', item_filter: { predicates: { 'minecraft:map_id': {} } },
    on_fail: { type: 'minecraft:discard' },
  }]

for (const [m, [structures, , name]] of Object.entries(MAPS)) {
  Tag('worldgen/structure', `yadventures-bosses:on_${m}_maps`, structures as any)
  LootTable(`yadventures-bosses:maps/${m}`, { pools: [pool(1, [{
    type: 'minecraft:item', name: 'minecraft:filled_map', modifier: mapModifiers(m) }])] } as any)
  fn(`yadventures-bosses:give/${m}_map`, `loot give @s loot yadventures-bosses:maps/${m}`)
  KEY_LANG[`item.yadventures-bosses.${m}_map`] = name
}

// Datapacks can't inject into vanilla loot tables: these are the vanilla 26.3 tables plus one pool each
const MAP_CHESTS: Record<string, [string, number]> = { // vanilla table: [map, chance]
  'chests/bastion_treasure': ['citadel', 0.5],
  'chests/bastion_other': ['citadel', 0.1],
  'chests/woodland_mansion': ['illusioner', 0.1],
}
for (const [table, [m, chance]] of Object.entries(MAP_CHESTS)) {
  const t = vendor(`loot_table/${table}.json`)
  t.pools.push({
    rolls: 1, condition: { type: 'minecraft:random_chance', chance },
    entries: [{ type: 'minecraft:loot_table', value: `yadventures-bosses:maps/${m}` }],
  })
  LootTable(`minecraft:${table}`, t)
}

// Snowy cartographers sell the Iceologer map at journeyman level, next to the monument and trial chambers
// maps (vanilla offers 2 of that level's trades)
VillagerTrade('yadventures-bosses:cartographer/emerald_and_compass_iceologer_map', {
  wants: { id: 'minecraft:emerald', count: 13 },
  additional_wants: { id: 'minecraft:compass' },
  gives: { id: 'minecraft:filled_map' },
  given_item_modifier: mapModifiers('iceologer', 100),
  merchant_predicate: {
    type: 'minecraft:entity_properties', entity: 'this',
    predicate: { 'minecraft:predicates': { 'minecraft:villager/variant': ['minecraft:snow'] } },
  },
  max_uses: 12, reputation_discount: 0.2, xp: 10,
} as any)
Tag('villager_trade', 'minecraft:cartographer/level_3',
  ['yadventures-bosses:cartographer/emerald_and_compass_iceologer_map'] as any)
