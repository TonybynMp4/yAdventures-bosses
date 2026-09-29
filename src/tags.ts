import { Predicate, Tag } from 'sandstone'

// ============================================================ predicates / tags
const chance = (name: string, chance: number) =>
  Predicate(`yadventures-bosses:chance/${name}`, { type: 'minecraft:random_chance', chance } as any)
chance('half', 0.5)
chance('third', 0.33)
chance('wildfire_ambient', 0.0125)
chance('iceologer_ambient', 0.17)

const entity = (predicate: object) => ({ type: 'minecraft:entity_properties', entity: 'this', predicate })
Predicate('yadventures-bosses:is_passenger', entity({ vehicle: {} }) as any)
Predicate('yadventures-bosses:long_invisibility', entity({ effects: { 'minecraft:invisibility': { duration: { min: 61 } } } }) as any)
Predicate('yadventures-bosses:long_blindness', entity({ effects: { 'minecraft:blindness': { duration: { min: 61 } } } }) as any)
Predicate('yadventures-bosses:wearing_wildfire_crown', entity({
  slots: { 'armor.head': { predicates: { 'minecraft:custom_data': '{yadventures-bosses:{crown:1b}}' } } },
}) as any)
Predicate('yadventures-bosses:burning', {
  type: 'minecraft:any_of', terms: [
    entity({ flags: { is_on_fire: true } }),
    entity({ location: { fluid: { fluids: '#minecraft:lava' } } }),
  ],
} as any)
// The Iceologer model's legs animate while it walks (and isn't riding anything)
Predicate('yadventures-bosses:moving', {
  type: 'minecraft:all_of', terms: [
    entity({ movement: { horizontal_speed: { min: 0.00001 } } }),
    { type: 'minecraft:inverted', term: entity({ vehicle: {} }) }],
} as any)

const mc = (names: string) => names.trim().split(/\s+/).map((b) => `minecraft:${b}`)

Tag('block', 'yadventures-bosses:passable', [
  '#minecraft:air', '#minecraft:small_flowers', '#minecraft:saplings',
  ...mc(`short_grass tall_grass fern large_fern dead_bush bush short_dry_grass tall_dry_grass snow vine glow_lichen
    light leaf_litter warped_roots crimson_roots nether_sprouts sweet_berry_bush firefly_bush`)] as any)
Tag('block', 'yadventures-bosses:citadel_pillar_replaceable', mc('air cave_air water lava bubble_column fire soul_fire') as any)
Tag('entity_type', 'yadventures-bosses:wildfire_allies', mc('blaze wither_skeleton') as any)
// Mobs on the yadventures-bosses.illagers team don't attack the (wandering trader based) Iceologer
Tag('entity_type', 'yadventures-bosses:prevent_aggression', [
  ...mc('zombie husk drowned zombie_villager'), '#minecraft:illager', ...mc('vex ravager zombified_piglin')] as any)
Tag('entity_type', 'yadventures-bosses:iceologer_targets', mc('player iron_golem villager wandering_trader glow_squid') as any)
Tag('entity_type', 'yadventures-bosses:villagers', mc('villager wandering_trader') as any)
Tag('block', 'yadventures-bosses:ice_chunk_passable', [
  '#minecraft:replaceable', '#minecraft:small_flowers', '#minecraft:saplings', 'minecraft:light'] as any)
// Blocks the Iceologer can see through when looking for a target
Tag('block', 'yadventures-bosses:see_through', [
  ...`air banners beds buttons wool_carpets corals wall_corals crops fences fence_gates fire flower_pots leaves
    pressure_plates rails saplings all_signs flowers candles cave_vines candle_cakes lightning_rods lanterns bars
    chains`.trim().split(/\s+/).map((t) => `#minecraft:${t}`),
  ...mc(`small_amethyst_bud medium_amethyst_bud large_amethyst_bud amethyst_cluster big_dripleaf big_dripleaf_stem
    small_dripleaf spore_blossom glow_lichen hanging_roots moss_carpet pointed_dripstone sulfur_spike water
    dead_tube_coral_fan dead_brain_coral_fan dead_bubble_coral_fan dead_fire_coral_fan dead_horn_coral_fan
    dead_tube_coral_wall_fan dead_brain_coral_wall_fan dead_bubble_coral_wall_fan dead_fire_coral_wall_fan
    dead_horn_coral_wall_fan cocoa comparator dead_bush fern short_grass large_fern lever attached_melon_stem
    melon_stem attached_pumpkin_stem pumpkin_stem redstone_torch redstone_wire repeater snow tall_grass
    tall_seagrass torch tripwire tripwire_hook wall_torch ladder turtle_egg conduit bubble_column nether_portal
    sea_pickle nether_wart red_mushroom brown_mushroom vine seagrass kelp kelp_plant sugar_cane lily_pad end_rod
    cobweb structure_void end_portal barrier crimson_fungus warped_fungus crimson_roots warped_roots
    nether_sprouts weeping_vines weeping_vines_plant twisting_vines twisting_vines_plant bamboo bamboo_sapling
    soul_torch copper_torch soul_wall_torch redstone_wall_torch copper_wall_torch scaffolding sweet_berry_bush
    sculk_vein mangrove_roots frogspawn pink_petals copper_grate waxed_copper_grate exposed_copper_grate
    waxed_exposed_copper_grate weathered_copper_grate waxed_weathered_copper_grate oxidized_copper_grate
    waxed_oxidized_copper_grate heavy_core trial_spawner vault pale_moss_carpet pale_hanging_moss resin_clump
    leaf_litter wildflowers bush firefly_bush cactus_flower short_dry_grass tall_dry_grass red_shrub
    shelf_mushroom`)] as any)
