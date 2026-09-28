import { Advancement, ItemModifier, LootTable, Recipe } from 'sandstone'
import { BLUE, fn, GRAY } from './lib.ts'

// ============================================================ items
function totemComponents(kind: string) {
  return {
    'minecraft:item_model': `yadventures-bosses:totem_of_${kind}`,
    'minecraft:item_name': { translate: `item.yadventures-bosses.totem_of_${kind}` },
    'minecraft:lore': [{ translate: 'item.yadventures-bosses.totem.tooltip', color: 'gray', italic: false }],
    'minecraft:rarity': 'uncommon',
    '!minecraft:death_protection': {},
  }
}

// Wildfire Crown: a smithing upgrade for netherite helmets (keeps trim, enchantments, damage...)
const CROWN_EQUIPPABLE = { slot: 'head', asset_id: 'yadventures-bosses:wildfire_crown_netherite', equip_sound: 'minecraft:item.armor.equip_netherite' }
// The crowned helmet is a golden helmet under the hood: datapacks can't add item types, and golden
// helmets are already #piglin_safe_armor. Everything else is netherite helmet stats.
const CROWN_STATS = {
  'minecraft:attribute_modifiers': ([['armor', 3], ['armor_toughness', 3], ['knockback_resistance', 0.1]] as const).map(([a, v]) => (
    { type: `minecraft:${a}`, id: 'minecraft:armor.helmet', amount: v, operation: 'add_value', slot: 'head' })),
  'minecraft:max_damage': 407,
  'minecraft:enchantable': { value: 15 },
  'minecraft:repairable': { items: '#minecraft:repairs_netherite_armor' },
  'minecraft:damage_resistant': { types: '#minecraft:is_fire' },
}
const CROWN_DATA = { 'yadventures-bosses': { crown: true } }
const FRAGMENT = {
  'minecraft:item_model': 'yadventures-bosses:wildfire_crown_fragment',
  'minecraft:item_name': { translate: 'item.yadventures-bosses.wildfire_crown_fragment' },
  'minecraft:max_stack_size': 64,
  'minecraft:enchantment_glint_override': false,
  'minecraft:rarity': 'common',
  'minecraft:lore': [{ translate: 'item.yadventures-bosses.wildfire_crown_fragment.tooltip', color: 'gray', italic: false }],
}
// Real template tooltips/slot icons are hardcoded to the vanilla template items, so this one is a
// lookalike on an item survival players can't place (game master block)
const TEMPLATE_BASE = 'minecraft:structure_block'
const TEMPLATE = {
  'minecraft:item_model': 'yadventures-bosses:wildfire_crown_upgrade_smithing_template',
  'minecraft:item_name': { translate: 'item.minecraft.smithing_template' },
  'minecraft:rarity': 'uncommon',
  'minecraft:lore': [
    { translate: 'item.yadventures-bosses.smithing_template.wildfire_crown_upgrade', ...GRAY },
    '',
    { translate: 'item.minecraft.smithing_template.applies_to', ...GRAY },
    { text: ' ', ...BLUE, extra: [{ translate: 'item.yadventures-bosses.smithing_template.wildfire_crown_upgrade.applies_to' }] },
    { translate: 'item.minecraft.smithing_template.ingredients', ...GRAY },
    { text: ' ', ...BLUE, extra: [{ translate: 'block.minecraft.gold_block' }] },
  ],
}
/** name: [base item, components, custom data] */
export const ITEMS: Record<string, [string, object, string]> = {
  totem_of_freezing: ['minecraft:totem_of_undying', totemComponents('freezing'), '{yadventures-bosses:{kind:"totem",totem:"freezing"}}'],
  totem_of_illusion: ['minecraft:totem_of_undying', totemComponents('illusion'), '{yadventures-bosses:{kind:"totem",totem:"illusion"}}'],
  wildfire_crown_upgrade_smithing_template: [TEMPLATE_BASE, TEMPLATE, '{yadventures-bosses:{item:"wildfire_crown_upgrade_smithing_template"}}'],
  wildfire_crown_fragment: ['minecraft:debug_stick', FRAGMENT, '{yadventures-bosses:{item:"wildfire_crown_fragment"}}'],
}

export function itemEntry(name: string, extra: object[] = []) {
  const [base, components, data] = ITEMS[name]
  return {
    type: 'minecraft:item', name: base,
    modifier: [{ type: 'minecraft:set_components', components }, { type: 'minecraft:set_custom_data', tag: data }, ...extra],
  }
}

export const count = (min: number, max: number) =>
  ({ type: 'minecraft:set_count', count: { type: 'minecraft:uniform', min, max } })

const looting = (min: number, max: number) => ({
  type: 'minecraft:enchanted_count_increase', enchantment: 'minecraft:looting',
  count: { type: 'minecraft:uniform', min, max },
})

const KILLED_BY_PLAYER = { type: 'minecraft:killed_by_player' }

for (const name in ITEMS) {
  LootTable(`yadventures-bosses:items/${name}`, { pools: [{ rolls: 1, entries: [itemEntry(name)] }] } as any)
  fn(`yadventures-bosses:give/${name}`, `loot give @s loot yadventures-bosses:items/${name}`)
}

// Boss drops are only minor items: the signature items (totems, crown fragments) come from the vaults
LootTable('yadventures-bosses:entities/wildfire', {
  type: 'minecraft:entity', pools: [
    { rolls: 1, entries: [{ type: 'minecraft:item', name: 'minecraft:blaze_powder', modifier: [count(0, 2), looting(0, 1)] }] }],
  random_sequence: 'yadventures-bosses:entities/wildfire',
} as any)
LootTable('yadventures-bosses:entities/empty', { type: 'minecraft:entity', pools: [] } as any)
LootTable('minecraft:entities/illusioner', {
  type: 'minecraft:entity', pools: [
    { rolls: 1, entries: [{ type: 'minecraft:item', name: 'minecraft:emerald', modifier: [count(0, 1), looting(0, 1)] }], condition: KILLED_BY_PLAYER },
    { rolls: 1, entries: [{ type: 'minecraft:item', name: 'minecraft:arrow', modifier: [count(0, 2), looting(0, 1)] }] },
  ],
  random_sequence: 'minecraft:entities/illusioner',
} as any)
LootTable('yadventures-bosses:entities/iceologer', {
  type: 'minecraft:entity', pools: [
    { rolls: 1, entries: [{ type: 'minecraft:item', name: 'minecraft:emerald', modifier: [count(0, 1), looting(0, 1)] }], condition: KILLED_BY_PLAYER },
    { rolls: 1, entries: [{ type: 'minecraft:item', name: 'minecraft:blue_ice', modifier: [count(0, 2), looting(0, 1)] }] },
  ],
  random_sequence: 'yadventures-bosses:entities/iceologer',
} as any)

LootTable('yadventures-bosses:technical/player_head', {
  type: 'minecraft:command', pools: [{ rolls: 1, entries: [
    { type: 'minecraft:item', name: 'minecraft:player_head', modifier: [{ type: 'minecraft:fill_player_head', entity: 'this' }] }] }],
} as any)

ItemModifier('yadventures-bosses:consume', { type: 'minecraft:set_count', count: -1, add: true } as any)

const TEMPLATE_RESULT = {
  id: TEMPLATE_BASE,
  components: { ...TEMPLATE, 'minecraft:custom_data': { 'yadventures-bosses': { item: 'wildfire_crown_upgrade_smithing_template' } } },
}
Recipe('yadventures-bosses:wildfire_crown_upgrade_smithing_template', {
  type: 'minecraft:crafting_shaped', category: 'misc',
  pattern: ['CCC', 'CSC'], key: { C: 'minecraft:debug_stick', S: 'minecraft:netherite_scrap' }, result: TEMPLATE_RESULT,
} as any)
// Duplication, like the netherite upgrade (gold ingots instead of diamonds, blaze rod instead of netherrack)
Recipe('yadventures-bosses:wildfire_crown_upgrade_smithing_template_duplication', {
  type: 'minecraft:crafting_shaped', category: 'misc',
  pattern: ['GTG', 'GBG', 'GGG'],
  key: { G: 'minecraft:gold_ingot', T: TEMPLATE_BASE, B: 'minecraft:blaze_rod' },
  result: { ...TEMPLATE_RESULT, count: 2 },
} as any)
Recipe('yadventures-bosses:wildfire_crown', {
  type: 'minecraft:smithing_transform', category: 'equipment',
  template: TEMPLATE_BASE, base: 'minecraft:netherite_helmet', addition: 'minecraft:gold_block',
  result: {
    id: 'minecraft:golden_helmet', components: {
      'minecraft:equippable': CROWN_EQUIPPABLE,
      ...CROWN_STATS,
      'minecraft:item_model': 'yadventures-bosses:wildfire_crown_netherite_helmet',
      'minecraft:item_name': { translate: 'item.yadventures-bosses.wildfire_crown' },
      'minecraft:custom_data': CROWN_DATA,
    },
  },
} as any)

// ============================================================ advancement (totems)
const TOTEM_DATA = '{yadventures-bosses:{kind:"totem"}}'
Advancement('yadventures-bosses:technical/totem_hurt', {
  criteria: {
    hurt: {
      trigger: 'minecraft:entity_hurt_player', conditions: {
        player: {
          type: 'minecraft:any_of', terms: ['weapon.mainhand', 'weapon.offhand'].map((s) => ({
            type: 'minecraft:entity_properties', entity: 'this',
            predicate: { slots: { [s]: { predicates: { 'minecraft:custom_data': TOTEM_DATA } } } },
          })),
        },
        damage: { source_entity: {} },
      },
    },
  },
  rewards: { function: 'yadventures-bosses:totem/hurt' },
} as any)
