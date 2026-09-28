"""Generate the yadventures-bosses datapack logic + resource pack for yAdventures-bosses (Iceologer / Illusioner / Wildfire)."""
import json, math, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Y = ROOT
DP = f'{Y}/datapack/data'
RP = f'{Y}/resourcepack/assets'
VENDOR = f'{ROOT}/scripts/vendor'  # vanilla 26.3 assets the crown builds on


def wjson(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(obj, f, indent=2)
        f.write('\n')


def wtext(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(text.strip('\n') + '\n')


def fn(name, text):
    ns, p = name.split(':')
    wtext(f'{DP}/{ns}/function/{p}.mcfunction', text)


def dj(ns, rel, obj):
    wjson(f'{DP}/{ns}/{rel}.json', obj)


# ============================================================ items
def totem_components(kind):
    return {
        'minecraft:item_model': f'yadventures-bosses:totem_of_{kind}',
        'minecraft:item_name': {'translate': f'item.yadventures-bosses.totem_of_{kind}'},
        'minecraft:lore': [{'translate': 'item.yadventures-bosses.totem.tooltip', 'color': 'gray', 'italic': False}],
        'minecraft:rarity': 'uncommon',
        '!minecraft:death_protection': {},
    }


# Wildfire Crown: a smithing upgrade for any helmet (keeps its trim, enchantments, damage...)
# Wildfire Crown: a smithing upgrade for netherite helmets (keeps trim, enchantments, damage...)
CROWN_EQUIPPABLE = {'slot': 'head', 'asset_id': 'yadventures-bosses:wildfire_crown_netherite', 'equip_sound': 'minecraft:item.armor.equip_netherite'}
# The crowned helmet is a golden helmet under the hood: datapacks can't add item types, and golden
# helmets are already #piglin_safe_armor. Everything else is netherite helmet stats.
CROWN_STATS = {
    'minecraft:attribute_modifiers': [
        {'type': f'minecraft:{a}', 'id': 'minecraft:armor.helmet', 'amount': v, 'operation': 'add_value', 'slot': 'head'}
        for a, v in (('armor', 3), ('armor_toughness', 3), ('knockback_resistance', 0.1))],
    'minecraft:max_damage': 407,
    'minecraft:enchantable': {'value': 15},
    'minecraft:repairable': {'items': '#minecraft:repairs_netherite_armor'},
    'minecraft:damage_resistant': {'types': '#minecraft:is_fire'},
}
CROWN_DATA = {'yadventures-bosses': {'crown': True}}
FRAGMENT = {
    'minecraft:item_model': 'yadventures-bosses:wildfire_crown_fragment',
    'minecraft:item_name': {'translate': 'item.yadventures-bosses.wildfire_crown_fragment'},
    'minecraft:max_stack_size': 64,
    'minecraft:enchantment_glint_override': False,
    'minecraft:rarity': 'common',
    'minecraft:lore': [{'translate': 'item.yadventures-bosses.wildfire_crown_fragment.tooltip', 'color': 'gray', 'italic': False}],
    'minecraft:custom_data': {'yadventures-bosses': {'item': 'wildfire_crown_fragment'}},
}
GRAY = {'color': 'gray', 'italic': False}
BLUE = {'color': 'blue', 'italic': False}
# Real template tooltips/slot icons are hardcoded to the vanilla template items, so this one is a
# lookalike on an item survival players can't place (game master block)
TEMPLATE_BASE = 'minecraft:structure_block'
TEMPLATE = {
    'minecraft:item_model': 'yadventures-bosses:wildfire_crown_upgrade_smithing_template',
    'minecraft:item_name': {'translate': 'item.minecraft.smithing_template'},
    'minecraft:rarity': 'uncommon',
    'minecraft:lore': [
        {'translate': 'item.yadventures-bosses.smithing_template.wildfire_crown_upgrade', **GRAY},
        '',
        {'translate': 'item.minecraft.smithing_template.applies_to', **GRAY},
        {'text': ' ', **BLUE, 'extra': [{'translate': 'item.yadventures-bosses.smithing_template.wildfire_crown_upgrade.applies_to'}]},
        {'translate': 'item.minecraft.smithing_template.ingredients', **GRAY},
        {'text': ' ', **BLUE, 'extra': [{'translate': 'block.minecraft.gold_block'}]},
    ],
}
ITEMS = {
    'totem_of_freezing': ('minecraft:totem_of_undying', totem_components('freezing'), '{yadventures-bosses:{kind:"totem",totem:"freezing"}}'),
    'totem_of_illusion': ('minecraft:totem_of_undying', totem_components('illusion'), '{yadventures-bosses:{kind:"totem",totem:"illusion"}}'),
    'wildfire_crown_upgrade_smithing_template': (TEMPLATE_BASE, TEMPLATE, '{yadventures-bosses:{item:"wildfire_crown_upgrade_smithing_template"}}'),
    'wildfire_crown_fragment': ('minecraft:debug_stick', {k: v for k, v in FRAGMENT.items() if k != 'minecraft:custom_data'}, '{yadventures-bosses:{item:"wildfire_crown_fragment"}}'),
}


def item_entry(name, extra=(), **kw):
    base, comps, data = ITEMS[name]
    e = {'type': 'minecraft:item', 'name': base,
         'modifier': [{'type': 'minecraft:set_components', 'components': comps},
                      {'type': 'minecraft:set_custom_data', 'tag': data}, *extra]}
    e.update(kw)
    return e


def count(lo, hi):
    return {'type': 'minecraft:set_count', 'count': {'type': 'minecraft:uniform', 'min': lo, 'max': hi}}


def looting(lo, hi):
    return {'type': 'minecraft:enchanted_count_increase', 'enchantment': 'minecraft:looting',
            'count': {'type': 'minecraft:uniform', 'min': lo, 'max': hi}}


KILLED_BY_PLAYER = {'type': 'minecraft:killed_by_player'}

for name in ITEMS:
    dj('yadventures-bosses', f'loot_table/items/{name}', {'pools': [{'rolls': 1, 'entries': [item_entry(name)]}]})
    fn(f'yadventures-bosses:give/{name}', f'loot give @s loot yadventures-bosses:items/{name}')

# Boss drops are only minor items: the signature items (totems, crown fragments) come from the vaults
dj('yadventures-bosses', 'loot_table/entities/wildfire', {'type': 'minecraft:entity', 'pools': [
    {'rolls': 1, 'entries': [{'type': 'minecraft:item', 'name': 'minecraft:blaze_powder',
                              'modifier': [count(0, 2), looting(0, 1)]}]}],
    'random_sequence': 'yadventures-bosses:entities/wildfire'})
dj('yadventures-bosses', 'loot_table/entities/empty', {'type': 'minecraft:entity', 'pools': []})
dj('minecraft', 'loot_table/entities/illusioner', {'type': 'minecraft:entity', 'pools': [
    {'rolls': 1, 'entries': [{'type': 'minecraft:item', 'name': 'minecraft:emerald',
                              'modifier': [count(0, 1), looting(0, 1)]}], 'condition': KILLED_BY_PLAYER},
    {'rolls': 1, 'entries': [{'type': 'minecraft:item', 'name': 'minecraft:arrow',
                              'modifier': [count(0, 2), looting(0, 1)]}]},
], 'random_sequence': 'minecraft:entities/illusioner'})

dj('yadventures-bosses', 'loot_table/entities/iceologer', {'type': 'minecraft:entity', 'pools': [
    {'rolls': 1, 'entries': [{'type': 'minecraft:item', 'name': 'minecraft:emerald',
                              'modifier': [count(0, 1), looting(0, 1)]}], 'condition': KILLED_BY_PLAYER},
    {'rolls': 1, 'entries': [{'type': 'minecraft:item', 'name': 'minecraft:blue_ice',
                              'modifier': [count(0, 2), looting(0, 1)]}]},
], 'random_sequence': 'yadventures-bosses:entities/iceologer'})

dj('yadventures-bosses', 'loot_table/technical/player_head', {'type': 'minecraft:command', 'pools': [{'rolls': 1, 'entries': [
    {'type': 'minecraft:item', 'name': 'minecraft:player_head',
     'modifier': [{'type': 'minecraft:fill_player_head', 'entity': 'this'}]}]}]})

dj('yadventures-bosses', 'item_modifier/consume', {'type': 'minecraft:set_count', 'count': -1, 'add': True})

TEMPLATE_RESULT = {'id': TEMPLATE_BASE, 'components': {**TEMPLATE, 'minecraft:custom_data': {'yadventures-bosses': {'item': 'wildfire_crown_upgrade_smithing_template'}}}}
dj('yadventures-bosses', 'recipe/wildfire_crown_upgrade_smithing_template', {
    'type': 'minecraft:crafting_shaped', 'category': 'misc',
    'pattern': ['CCC', 'CSC'], 'key': {'C': 'minecraft:debug_stick', 'S': 'minecraft:netherite_scrap'}, 'result': TEMPLATE_RESULT})
# Duplication, like the netherite upgrade (gold ingots instead of diamonds, blaze rod instead of netherrack)
dj('yadventures-bosses', 'recipe/wildfire_crown_upgrade_smithing_template_duplication', {
    'type': 'minecraft:crafting_shaped', 'category': 'misc',
    'pattern': ['GTG', 'GBG', 'GGG'],
    'key': {'G': 'minecraft:gold_ingot', 'T': TEMPLATE_BASE, 'B': 'minecraft:blaze_rod'},
    'result': {**TEMPLATE_RESULT, 'count': 2}})
dj('yadventures-bosses', 'recipe/wildfire_crown', {
    'type': 'minecraft:smithing_transform', 'category': 'equipment',
    'template': TEMPLATE_BASE, 'base': 'minecraft:netherite_helmet', 'addition': 'minecraft:gold_block',
    'result': {'id': 'minecraft:golden_helmet', 'components': {
        'minecraft:equippable': CROWN_EQUIPPABLE,
        **CROWN_STATS,
        'minecraft:item_model': 'yadventures-bosses:wildfire_crown_netherite_helmet',
        'minecraft:item_name': {'translate': 'item.yadventures-bosses.wildfire_crown'},
        'minecraft:custom_data': CROWN_DATA}}})

# ============================================================ predicates / tags
dj('yadventures-bosses', 'predicate/chance/half', {'type': 'minecraft:random_chance', 'chance': 0.5})
dj('yadventures-bosses', 'predicate/chance/third', {'type': 'minecraft:random_chance', 'chance': 0.33})
dj('yadventures-bosses', 'predicate/chance/wildfire_ambient', {'type': 'minecraft:random_chance', 'chance': 0.0125})
dj('yadventures-bosses', 'predicate/is_passenger', {'type': 'minecraft:entity_properties', 'entity': 'this', 'predicate': {'vehicle': {}}})
dj('yadventures-bosses', 'predicate/long_invisibility', {'type': 'minecraft:entity_properties', 'entity': 'this', 'predicate': {
    'effects': {'minecraft:invisibility': {'duration': {'min': 61}}}}})
dj('yadventures-bosses', 'predicate/wearing_wildfire_crown', {'type': 'minecraft:entity_properties', 'entity': 'this', 'predicate': {
    'slots': {'armor.head': {'predicates': {'minecraft:custom_data': '{yadventures-bosses:{crown:1b}}'}}}}})
dj('yadventures-bosses', 'predicate/burning', {'type': 'minecraft:any_of', 'terms': [
    {'type': 'minecraft:entity_properties', 'entity': 'this', 'predicate': {'flags': {'is_on_fire': True}}},
    {'type': 'minecraft:entity_properties', 'entity': 'this', 'predicate': {'location': {'fluid': {'fluids': '#minecraft:lava'}}}},
]})

dj('yadventures-bosses', 'tags/block/passable', {'values': [
    '#minecraft:air', '#minecraft:small_flowers', '#minecraft:saplings', 'minecraft:short_grass', 'minecraft:tall_grass',
    'minecraft:fern', 'minecraft:large_fern', 'minecraft:dead_bush', 'minecraft:bush', 'minecraft:short_dry_grass',
    'minecraft:tall_dry_grass', 'minecraft:snow', 'minecraft:vine', 'minecraft:glow_lichen', 'minecraft:light',
    'minecraft:leaf_litter', 'minecraft:warped_roots', 'minecraft:crimson_roots', 'minecraft:nether_sprouts',
    'minecraft:sweet_berry_bush', 'minecraft:firefly_bush']})
dj('yadventures-bosses', 'tags/block/citadel_pillar_replaceable', {'values': [
    'minecraft:air', 'minecraft:cave_air', 'minecraft:water', 'minecraft:lava', 'minecraft:bubble_column',
    'minecraft:fire', 'minecraft:soul_fire']})
dj('yadventures-bosses', 'tags/entity_type/wildfire_allies', {'values': ['minecraft:blaze', 'minecraft:wither_skeleton']})
dj('yadventures-bosses', 'predicate/chance/iceologer_ambient', {'type': 'minecraft:random_chance', 'chance': 0.17})
# The Iceologer model's legs animate while it walks (and isn't riding anything)
dj('yadventures-bosses', 'predicate/moving', {'type': 'minecraft:all_of', 'terms': [
    {'type': 'minecraft:entity_properties', 'entity': 'this', 'predicate': {'movement': {'horizontal_speed': {'min': 0.00001}}}},
    {'type': 'minecraft:inverted', 'term': {'type': 'minecraft:entity_properties', 'entity': 'this', 'predicate': {'vehicle': {}}}}]})
# Mobs on the yadventures-bosses.illagers team don't attack the (wandering trader based) Iceologer
dj('yadventures-bosses', 'tags/entity_type/prevent_aggression', {'values': [
    'minecraft:zombie', 'minecraft:husk', 'minecraft:drowned', 'minecraft:zombie_villager', '#minecraft:illager',
    'minecraft:vex', 'minecraft:ravager', 'minecraft:zombified_piglin']})
dj('yadventures-bosses', 'tags/entity_type/iceologer_targets', {'values': [
    'minecraft:player', 'minecraft:iron_golem', 'minecraft:villager', 'minecraft:wandering_trader', 'minecraft:glow_squid']})
dj('yadventures-bosses', 'tags/entity_type/villagers', {'values': ['minecraft:villager', 'minecraft:wandering_trader']})
dj('yadventures-bosses', 'tags/block/ice_chunk_passable', {'values': [
    '#minecraft:replaceable', '#minecraft:small_flowers', '#minecraft:saplings', 'minecraft:light']})
# Blocks the Iceologer can see through when looking for a target
dj('yadventures-bosses', 'tags/block/see_through', {'values': [
    '#minecraft:air', '#minecraft:banners', '#minecraft:beds', '#minecraft:buttons', '#minecraft:wool_carpets',
    '#minecraft:corals', '#minecraft:wall_corals', '#minecraft:crops', '#minecraft:fences', '#minecraft:fence_gates',
    '#minecraft:fire', '#minecraft:flower_pots', '#minecraft:leaves', '#minecraft:pressure_plates', '#minecraft:rails',
    '#minecraft:saplings', '#minecraft:all_signs', '#minecraft:flowers', '#minecraft:candles', '#minecraft:cave_vines',
    '#minecraft:candle_cakes', '#minecraft:lightning_rods', '#minecraft:lanterns', '#minecraft:bars', '#minecraft:chains',
    *[f'minecraft:{b}' for b in (
        'small_amethyst_bud medium_amethyst_bud large_amethyst_bud amethyst_cluster big_dripleaf big_dripleaf_stem '
        'small_dripleaf spore_blossom glow_lichen hanging_roots moss_carpet pointed_dripstone sulfur_spike water '
        'dead_tube_coral_fan dead_brain_coral_fan dead_bubble_coral_fan dead_fire_coral_fan dead_horn_coral_fan '
        'dead_tube_coral_wall_fan dead_brain_coral_wall_fan dead_bubble_coral_wall_fan dead_fire_coral_wall_fan '
        'dead_horn_coral_wall_fan cocoa comparator dead_bush fern short_grass large_fern lever attached_melon_stem '
        'melon_stem attached_pumpkin_stem pumpkin_stem redstone_torch redstone_wire repeater snow tall_grass '
        'tall_seagrass torch tripwire tripwire_hook wall_torch ladder turtle_egg conduit bubble_column nether_portal '
        'sea_pickle nether_wart red_mushroom brown_mushroom vine seagrass kelp kelp_plant sugar_cane lily_pad end_rod '
        'cobweb structure_void end_portal barrier crimson_fungus warped_fungus crimson_roots warped_roots '
        'nether_sprouts weeping_vines weeping_vines_plant twisting_vines twisting_vines_plant bamboo bamboo_sapling '
        'soul_torch copper_torch soul_wall_torch redstone_wall_torch copper_wall_torch scaffolding sweet_berry_bush '
        'sculk_vein mangrove_roots frogspawn pink_petals copper_grate waxed_copper_grate exposed_copper_grate '
        'waxed_exposed_copper_grate weathered_copper_grate waxed_weathered_copper_grate oxidized_copper_grate '
        'waxed_oxidized_copper_grate heavy_core trial_spawner vault pale_moss_carpet pale_hanging_moss resin_clump '
        'leaf_litter wildflowers bush firefly_bush cactus_flower short_dry_grass tall_dry_grass red_shrub '
        'shelf_mushroom').split()]]})

# ============================================================ advancement (totems)
TOTEM_DATA = '{yadventures-bosses:{kind:"totem"}}'
dj('yadventures-bosses', 'advancement/technical/totem_hurt', {
    'criteria': {'hurt': {'trigger': 'minecraft:entity_hurt_player', 'conditions': {
        'player': {'type': 'minecraft:any_of', 'terms': [
            {'type': 'minecraft:entity_properties', 'entity': 'this', 'predicate': {
                'slots': {s: {'predicates': {'minecraft:custom_data': TOTEM_DATA}}}}}
            for s in ('weapon.mainhand', 'weapon.offhand')]},
        'damage': {'source_entity': {}}}}},
    'rewards': {'function': 'yadventures-bosses:totem/hurt'}})

# ============================================================ load / tick
shield_rot = [[0.0, round(-math.sin(math.radians(k * 22.5)), 6), 0.0, round(math.cos(math.radians(k * 22.5)), 6)] for k in range(8)]
fn('yadventures-bosses:load', f'''
# yAdventures bosses: Iceologer, Illusioner, Wildfire
scoreboard objectives add yadventures-bosses.dummy dummy
scoreboard objectives add yadventures-bosses.id dummy
scoreboard objectives add yadventures-bosses.timer dummy
scoreboard objectives add yadventures-bosses.cooldown dummy
scoreboard objectives add yadventures-bosses.health dummy
scoreboard objectives add yadventures-bosses.shields dummy
scoreboard objectives add yadventures-bosses.absorbed dummy
scoreboard objectives add yadventures-bosses.regen dummy
scoreboard objectives add yadventures-bosses.state dummy
scoreboard objectives add yadventures-bosses.attack_cd dummy
scoreboard objectives add yadventures-bosses.charge_x dummy
scoreboard objectives add yadventures-bosses.charge_y dummy
scoreboard objectives add yadventures-bosses.charge_z dummy
scoreboard objectives add yadventures-bosses.fired dummy
scoreboard objectives add yadventures-bosses.decoy dummy
scoreboard objectives add yadventures-bosses.uid dummy
scoreboard objectives add yadventures-bosses.target dummy
scoreboard objectives add yadventures-bosses.hurt dummy
scoreboard objectives add yadventures-bosses.cast dummy
scoreboard objectives add yadventures-bosses.chunk_cd dummy
scoreboard objectives add yadventures-bosses.slow_cd dummy
scoreboard objectives add yadventures-bosses.stray_cd dummy
scoreboard objectives add yadventures-bosses.frozen dummy
scoreboard objectives add yadventures-bosses.age dummy
scoreboard objectives add yadventures-bosses.offset dummy
scoreboard objectives add yadventures-bosses.velocity dummy
scoreboard objectives add yadventures-bosses.shield_hp dummy
scoreboard objectives add yadventures-bosses.home_x dummy
scoreboard objectives add yadventures-bosses.home_y dummy
scoreboard objectives add yadventures-bosses.home_z dummy

scoreboard players set #2 yadventures-bosses.dummy 2
scoreboard players set #8 yadventures-bosses.dummy 8
scoreboard players set #20 yadventures-bosses.dummy 20
scoreboard players set #40 yadventures-bosses.dummy 40
scoreboard players set #180 yadventures-bosses.dummy 180

team add yadventures-bosses.illagers
team modify yadventures-bosses.illagers friendlyFire false

data modify storage yadventures-bosses:data shield_rotation set value {'[' + ','.join('[' + ','.join(f'{x}f' for x in q) + ']' for q in shield_rot) + ']'}

schedule function yadventures-bosses:second 1s replace
''')

fn('yadventures-bosses:tick', '''
# Illagers and zombies join the Iceologer's team (every tick: a new mob targets it within its first second)
team join yadventures-bosses.illagers @e[type=#yadventures-bosses:prevent_aggression,team=]

# Bosses spawned by trial spawners (or summon commands) become the real thing
execute as @e[tag=yadventures-bosses.convert] at @s run function yadventures-bosses:convert/run

# Trial spawners: once per player per difficulty
execute as @e[type=minecraft:marker,tag=yadventures-bosses.spawner] at @s run function yadventures-bosses:spawner/tick
# Trial spawners and vaults are slow to mine
function yadventures-bosses:mining/tick

# Structure setup markers and cabin armor stands
execute as @e[type=minecraft:marker,tag=yadventures-bosses.setup] at @s run function yadventures-bosses:setup/run
execute as @e[type=minecraft:armor_stand,tag=yadventures-bosses.cabin_armor_stand] run function yadventures-bosses:setup/armor_stand

# Iceologers, ice chunks and frozen players
# Dying entities can't be selected with @e, so each boss is ticked through a passenger (it still sees the dying vehicle)
execute as @e[type=minecraft:marker,tag=yadventures-bosses.iceologer_link] run function yadventures-bosses:iceologer/link
execute as @e[type=minecraft:item_display,tag=yadventures-bosses.ice_chunk] at @s run function yadventures-bosses:ice_chunk/tick
execute as @a[scores={yadventures-bosses.frozen=1..}] at @s run function yadventures-bosses:iceologer/frozen_player

# Illusioners and player illusions
execute as @e[type=minecraft:illusioner] at @s run function yadventures-bosses:illusioner/tick
execute as @e[type=minecraft:mannequin,tag=yadventures-bosses.player_illusion] at @s run function yadventures-bosses:totem/illusion_tick

# Wildfires
execute store result score #gametime yadventures-bosses.dummy run time query gametime
scoreboard players operation #spin yadventures-bosses.dummy = #gametime yadventures-bosses.dummy
scoreboard players operation #spin yadventures-bosses.dummy %= #20 yadventures-bosses.dummy
execute if score #spin yadventures-bosses.dummy matches 0 run function yadventures-bosses:wildfire/spin
execute as @e[type=minecraft:item_display,tag=yadventures-bosses.wildfire_body] on vehicle at @s run function yadventures-bosses:wildfire/tick
kill @e[type=minecraft:item_display,tag=yadventures-bosses.wildfire_part,predicate=!yadventures-bosses:is_passenger]
# The vanilla blaze attack still runs: remove its fireballs so only the Wildfire's own volleys remain
execute as @e[type=minecraft:small_fireball,tag=!yadventures-bosses.debris] if function yadventures-bosses:wildfire/owns_fireball run kill @s
''')

fn('yadventures-bosses:second', '''
execute store result score #difficulty yadventures-bosses.dummy run difficulty

execute as @e[type=minecraft:wandering_trader,tag=yadventures-bosses.iceologer] at @s run function yadventures-bosses:iceologer/second
execute as @a[predicate=yadventures-bosses:wearing_wildfire_crown] run function yadventures-bosses:crown/wearer
execute as @e[tag=yadventures-bosses.leashed] run function yadventures-bosses:spawner/leash

schedule function yadventures-bosses:second 1s replace
''')
fn('yadventures-bosses:crown/wearer', '''
# Fire resistance while not burning
effect give @s[predicate=!yadventures-bosses:burning] minecraft:fire_resistance 8 0 true
''')

for tag in ('load', 'tick'):
    wjson(f'{DP}/minecraft/tags/function/{tag}.json', {'values': [f'yadventures-bosses:{tag}']})

# ============================================================ structure setup
fn('yadventures-bosses:setup/run', '''
execute if entity @s[tag=yadventures-bosses.spawn_wildfire] run function yadventures-bosses:spawner/setup/wildfire
execute if entity @s[tag=yadventures-bosses.spawn_iceologer] run function yadventures-bosses:spawner/setup/iceologer
execute if entity @s[tag=yadventures-bosses.spawn_illusioner] run function yadventures-bosses:spawner/setup/illusioner
execute if entity @s[tag=yadventures-bosses.setup_brewing_stand] run function yadventures-bosses:setup/brewing_stand
execute if entity @s[tag=yadventures-bosses.citadel_pillar] positioned ~ ~-1 ~ run function yadventures-bosses:setup/pillar
kill @s
''')

fn('yadventures-bosses:setup/pillar', '''
# Extends the citadel foundations down to the ground
execute unless block ~ ~ ~ #yadventures-bosses:citadel_pillar_replaceable run return 0
setblock ~ ~ ~ minecraft:nether_bricks
execute positioned ~ ~-1 ~ run function yadventures-bosses:setup/pillar
''')

fn('yadventures-bosses:setup/brewing_stand', '''
# Random potions for the illusioner shack brewing stands
execute if predicate yadventures-bosses:chance/half run data modify storage yadventures-bosses:data brew set value {Items:[{Slot:3b,id:"minecraft:golden_carrot",count:2}],potion:"minecraft:night_vision"}
execute unless data storage yadventures-bosses:data brew.Items run data modify storage yadventures-bosses:data brew set value {Items:[{Slot:3b,id:"minecraft:fermented_spider_eye",count:1}],potion:"minecraft:invisibility"}
function yadventures-bosses:setup/brewing_stand_potion {slot:1}
execute if predicate yadventures-bosses:chance/half run function yadventures-bosses:setup/brewing_stand_potion {slot:0}
execute if predicate yadventures-bosses:chance/half run function yadventures-bosses:setup/brewing_stand_potion {slot:2}
data modify block ~ ~ ~ Items set from storage yadventures-bosses:data brew.Items
data remove storage yadventures-bosses:data brew
''')
fn('yadventures-bosses:setup/brewing_stand_potion', '''
$data modify storage yadventures-bosses:data brew.Items append value {Slot:$(slot)b,id:"minecraft:potion",count:1}
data modify storage yadventures-bosses:data brew.Items[-1].components."minecraft:potion_contents".potion set from storage yadventures-bosses:data brew.potion
''')

fn('yadventures-bosses:setup/armor_stand', '''
tag @s remove yadventures-bosses.cabin_armor_stand
item replace entity @s armor.head with minecraft:leather_helmet
execute if predicate yadventures-bosses:chance/third run item replace entity @s armor.chest with minecraft:leather_chestplate
execute if predicate yadventures-bosses:chance/third run item replace entity @s armor.legs with minecraft:leather_leggings
execute if predicate yadventures-bosses:chance/third run item replace entity @s armor.feet with minecraft:leather_boots
''')

# ============================================================ ring of illusions (shared by illusioner + totem)
# #mode: 0 = illusioner, 1 = player. #tp = index of the point the caster teleports to.
fn('yadventures-bosses:util/ring', '''
$execute rotated $(yaw) 0 run function yadventures-bosses:util/ring_points
''')
fn('yadventures-bosses:util/ring_points', '\n'.join(
    ['scoreboard players set #i yadventures-bosses.dummy 0'] +
    [f'execute rotated ~{k * 40} 0 positioned ^ ^ ^9 run function yadventures-bosses:util/ring_point' for k in range(9)]))
fn('yadventures-bosses:util/ring_point', '''
scoreboard players add #i yadventures-bosses.dummy 1
scoreboard players set #found yadventures-bosses.dummy 0
scoreboard players set #depth yadventures-bosses.dummy 0
function yadventures-bosses:util/ground_down
scoreboard players set #depth yadventures-bosses.dummy 0
execute if score #found yadventures-bosses.dummy matches 0 positioned ~ ~1 ~ run function yadventures-bosses:util/ground_up
''')
GROUND = 'if block ~ ~ ~ #yadventures-bosses:passable if block ~ ~1 ~ #yadventures-bosses:passable unless block ~ ~-1 ~ #yadventures-bosses:passable unless block ~ ~-1 ~ minecraft:lava unless block ~ ~-1 ~ minecraft:water'
fn('yadventures-bosses:util/ground_down', f'''
execute {GROUND} align y run return run function yadventures-bosses:util/ring_action
scoreboard players add #depth yadventures-bosses.dummy 1
execute if score #depth yadventures-bosses.dummy matches ..16 positioned ~ ~-1 ~ run function yadventures-bosses:util/ground_down
''')
fn('yadventures-bosses:util/ground_up', f'''
execute {GROUND} align y run return run function yadventures-bosses:util/ring_action
scoreboard players add #depth yadventures-bosses.dummy 1
execute if score #depth yadventures-bosses.dummy matches ..16 positioned ~ ~1 ~ run function yadventures-bosses:util/ground_up
''')
fn('yadventures-bosses:util/ring_action', '''
scoreboard players set #found yadventures-bosses.dummy 1
execute if score #i yadventures-bosses.dummy = #tp yadventures-bosses.dummy run return run function yadventures-bosses:util/ring_teleport
execute if score #mode yadventures-bosses.dummy matches 0 run return run function yadventures-bosses:illusioner/summon_illusion
function yadventures-bosses:totem/summon_illusion
''')
fn('yadventures-bosses:util/ring_teleport', '''
tp @s ~ ~ ~
particle minecraft:cloud ~ ~1 ~ 0.3 0.6 0.3 0.05 16
''')
fn('yadventures-bosses:util/start_ring', '''
# Shared setup: new illusion id, random teleport point and ring rotation
scoreboard players add #next yadventures-bosses.id 1
scoreboard players operation @s yadventures-bosses.id = #next yadventures-bosses.id
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
execute store result score #tp yadventures-bosses.dummy run random value 1..9
execute store result storage yadventures-bosses:data ring.yaw int 1 run random value 0..359
function yadventures-bosses:util/ring with storage yadventures-bosses:data ring
''')
fn('yadventures-bosses:util/vanish', '''
particle minecraft:poof ~ ~1 ~ 0.3 0.6 0.3 0.02 15
tp @s ~ -1000 ~
kill @s
''')

# ============================================================ illusioner
fn('yadventures-bosses:illusioner/tick', '''
# Replace the vanilla mirror spell with real illusions
execute if predicate yadventures-bosses:long_invisibility run effect clear @s minecraft:invisibility
execute if entity @s[tag=yadventures-bosses.illusion] run return run function yadventures-bosses:illusioner/illusion_tick

execute if score @s yadventures-bosses.cooldown matches 1.. run return run scoreboard players remove @s yadventures-bosses.cooldown 1
execute if entity @s[nbt={HurtTime:10s}] run return run function yadventures-bosses:illusioner/hurt
# Also splits as soon as it locks onto a survival player, so the fight opens with illusions
scoreboard players set #ok yadventures-bosses.dummy 0
execute on target if entity @s[type=minecraft:player,gamemode=!creative,gamemode=!spectator,distance=..24] run scoreboard players set #ok yadventures-bosses.dummy 1
execute if score #ok yadventures-bosses.dummy matches 1 run function yadventures-bosses:illusioner/create_illusions
''')
fn('yadventures-bosses:illusioner/hurt', '''
scoreboard players set #ok yadventures-bosses.dummy 0
execute on attacker unless entity @s[type=#minecraft:illager] unless entity @s[type=minecraft:player,gamemode=creative] run scoreboard players set #ok yadventures-bosses.dummy 1
execute if score #ok yadventures-bosses.dummy matches 1 run function yadventures-bosses:illusioner/create_illusions
''')
fn('yadventures-bosses:illusioner/create_illusions', '''
scoreboard players set @s yadventures-bosses.cooldown 600
scoreboard players set @s[tag=yadventures-bosses.ominous] yadventures-bosses.cooldown 300
playsound minecraft:entity.illusioner.mirror_move hostile @a ~ ~ ~ 1 1
particle minecraft:cloud ~ ~1 ~ 0.5 1 0.5 0.05 30
effect give @s minecraft:invisibility 3 0 true
scoreboard players set #mode yadventures-bosses.dummy 0
tag @s add yadventures-bosses.this
function yadventures-bosses:util/start_ring
tag @s remove yadventures-bosses.this
''')
fn('yadventures-bosses:illusioner/summon_illusion', '''
summon minecraft:illusioner ~ ~ ~ {Tags:["yadventures-bosses.illusion","yadventures.boss.illusion","yadventures-bosses.new"],DeathLootTable:"yadventures-bosses:entities/empty",equipment:{mainhand:{id:"minecraft:bow",count:1}},drop_chances:{mainhand:0f,offhand:0f,head:0f,chest:0f,legs:0f,feet:0f}}
execute as @e[type=minecraft:illusioner,tag=yadventures-bosses.new,distance=..2] run function yadventures-bosses:illusioner/init_illusion
particle minecraft:cloud ~ ~1 ~ 0.3 0.6 0.3 0.05 16
''')
fn('yadventures-bosses:illusioner/init_illusion', '''
tag @s remove yadventures-bosses.new
data modify entity @s Health set from entity @n[type=minecraft:illusioner,tag=yadventures-bosses.this] Health
data modify entity @s Rotation set from entity @n[type=minecraft:illusioner,tag=yadventures-bosses.this] Rotation
scoreboard players operation @s yadventures-bosses.id = #id yadventures-bosses.dummy
scoreboard players set @s yadventures-bosses.timer 600
''')
fn('yadventures-bosses:illusioner/illusion_tick', '''
scoreboard players remove @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches ..0 run return run function yadventures-bosses:util/vanish
execute if entity @s[nbt={HurtTime:10s}] run return run function yadventures-bosses:util/vanish
# Disappear with the real illusioner
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
scoreboard players set #ok yadventures-bosses.dummy 0
execute as @e[type=minecraft:illusioner,tag=!yadventures-bosses.illusion,distance=..64] if score @s yadventures-bosses.id = #id yadventures-bosses.dummy run scoreboard players set #ok yadventures-bosses.dummy 1
execute if score #ok yadventures-bosses.dummy matches 0 run function yadventures-bosses:util/vanish
''')

# ============================================================ iceologer
# An invisible wandering trader wearing the model: the head item renders on its head and the mainhand
# item (refreshed from armor.chest every tick) renders in the crossed-arms layer.
# custom_model_data flags: head [hurt], body [hurt, moving, spellcasting]
# yadventures-bosses.state: spell being cast (1 = ice chunk, 2 = slowness, 3 = summon strays). Targets are remembered by their yadventures-bosses.uid.
def flags(values, offset=0):
    return json.dumps({'type': 'minecraft:set_custom_model_data', 'flags': {
        'mode': 'replace_section', 'offset': offset, 'size': len(values), 'values': values}}, separators=(',', ':'))


HURT_ON, HURT_OFF = flags([True]), flags([False])
ICE_HEAD = '{id:"minecraft:stone",count:1,components:{"minecraft:item_model":"yadventures-bosses:iceologer/head","minecraft:custom_model_data":{flags:[0b]}}}'
ICE_BODY = '{id:"minecraft:stone",count:1,components:{"minecraft:item_model":"yadventures-bosses:iceologer/body","minecraft:custom_model_data":{flags:[0b,0b,0b]}}}'
NO_DROPS = 'drop_chances:{mainhand:0f,offhand:0f,head:0f,chest:0f,legs:0f,feet:0f}'
INVISIBLE = 'active_effects:[{id:"minecraft:invisibility",duration:-1,amplifier:0b,show_particles:0b}]'
fn('yadventures-bosses:convert/iceologer', f'''
# An invisible wandering trader wearing item models
data merge entity @s {{CustomName:{{"translate":"entity.yadventures-bosses.iceologer"}},Silent:1b,PersistenceRequired:1b,DespawnDelay:0,DeathLootTable:"yadventures-bosses:entities/iceologer",Offers:{{Recipes:[]}},{INVISIBLE},{NO_DROPS},equipment:{{head:{ICE_HEAD},mainhand:{ICE_BODY},chest:{ICE_BODY}}}}}
tag @s add yadventures-bosses.iceologer
tag @s add yadventures.boss.iceologer
team join yadventures-bosses.illagers @s
attribute @s minecraft:follow_range base set 18
attribute @s minecraft:max_health base set 36
summon minecraft:marker ~ ~ ~ {{Tags:["yadventures-bosses.iceologer_link","yadventures-bosses.new"]}}
ride @n[type=minecraft:marker,tag=yadventures-bosses.new,distance=..1] mount @s
tag @e[type=minecraft:marker,tag=yadventures-bosses.new,distance=..1] remove yadventures-bosses.new
function yadventures-bosses:iceologer/init
''')
fn('yadventures-bosses:iceologer/init', '''
scoreboard players add #next yadventures-bosses.id 1
scoreboard players operation @s yadventures-bosses.id = #next yadventures-bosses.id
scoreboard players set @s yadventures-bosses.hurt 0
scoreboard players set @s yadventures-bosses.cast 0
scoreboard players set @s yadventures-bosses.chunk_cd 0
scoreboard players set @s yadventures-bosses.slow_cd 0
scoreboard players set @s yadventures-bosses.stray_cd 10
''')
fn('yadventures-bosses:iceologer/link', '''
execute unless predicate yadventures-bosses:is_passenger run return run kill @s
execute on vehicle at @s run function yadventures-bosses:iceologer/tick
''')
fn('yadventures-bosses:util/uid', '''
# Gives @s a permanent target id and puts it in #uid
execute unless score @s yadventures-bosses.uid matches 1.. run scoreboard players add #next yadventures-bosses.uid 1
execute unless score @s yadventures-bosses.uid matches 1.. run scoreboard players operation @s yadventures-bosses.uid = #next yadventures-bosses.uid
scoreboard players operation #uid yadventures-bosses.dummy = @s yadventures-bosses.uid
''')
fn('yadventures-bosses:util/tag_target', '''
# Tags the entity whose yadventures-bosses.uid is @s's yadventures-bosses.target with yadventures-bosses.target
execute unless score @s yadventures-bosses.target matches 1.. run return fail
scoreboard players operation #t yadventures-bosses.dummy = @s yadventures-bosses.target
execute as @e[scores={yadventures-bosses.uid=1..},distance=..64] if score @s yadventures-bosses.uid = #t yadventures-bosses.dummy run tag @s add yadventures-bosses.target
''')

# The wandering trader's "drink milk while invisible in daylight" goal can't be removed: it puts a milk bucket
# in the mainhand and drinks it, then restarts. Replacing that milk with the body item would make it stop and
# restart every other tick (flickering milk), so the milk is modified in place instead: it looks like the body
# and has no consumable component, so drinking it does nothing and leaves it in the hand.
MILK_DISGUISE = '{type:"minecraft:set_components",components:{"minecraft:item_model":"yadventures-bosses:iceologer/body","minecraft:custom_model_data":{flags:[0b,0b,0b]},"!minecraft:consumable":{}}}'
fn('yadventures-bosses:iceologer/tick', f'''
execute if entity @s[tag=yadventures-bosses.dead] if items entity @s weapon.mainhand minecraft:milk_bucket[minecraft:consumable] run item modify entity @s weapon.mainhand [{MILK_DISGUISE},{flags([True, False, False])}]
execute if entity @s[tag=yadventures-bosses.dead] run return fail
execute unless items entity @s weapon.mainhand minecraft:milk_bucket run item replace entity @s weapon.mainhand from entity @s armor.chest
execute if items entity @s weapon.mainhand minecraft:milk_bucket run item modify entity @s weapon.mainhand {MILK_DISGUISE}
execute if score @s yadventures-bosses.cast matches 1.. if items entity @s weapon.mainhand minecraft:milk_bucket run item modify entity @s weapon.mainhand {flags([True], 2)}
item modify entity @s[predicate=yadventures-bosses:moving] weapon.mainhand {flags([True], 1)}
execute store result score #hp yadventures-bosses.dummy run data get entity @s Health 100
execute if score #hp yadventures-bosses.dummy matches ..0 run return run function yadventures-bosses:iceologer/death

# Hurt: red tint while HurtTime > 0
execute store result score #hurt yadventures-bosses.dummy run data get entity @s HurtTime
execute if score #hurt yadventures-bosses.dummy > @s yadventures-bosses.hurt run function yadventures-bosses:iceologer/hurt
scoreboard players operation @s yadventures-bosses.hurt = #hurt yadventures-bosses.dummy
execute if score #hurt yadventures-bosses.dummy matches 1.. run item modify entity @s weapon.mainhand {HURT_ON}
execute if score #hurt yadventures-bosses.dummy matches 1.. run item modify entity @s armor.head {HURT_ON}
execute if score #hurt yadventures-bosses.dummy matches 0 run item modify entity @s armor.head {HURT_OFF}

execute if score @s yadventures-bosses.cast matches 1.. run function yadventures-bosses:iceologer/cast/tick
''')
fn('yadventures-bosses:iceologer/hurt', '''
playsound yadventures-bosses:entity.iceologer.hurt hostile @a ~ ~ ~ 1 1
# Retaliate against whoever hurt it (except illagers and creative players)
scoreboard players set #uid yadventures-bosses.dummy 0
execute on attacker unless entity @s[type=#minecraft:illager] unless entity @s[tag=yadventures-bosses.iceologer] unless entity @s[type=minecraft:player,gamemode=creative] run function yadventures-bosses:util/uid
execute if score #uid yadventures-bosses.dummy matches 1.. run scoreboard players operation @s yadventures-bosses.target = #uid yadventures-bosses.dummy
''')
fn('yadventures-bosses:iceologer/death', f'''
tag @s add yadventures-bosses.dead
playsound yadventures-bosses:entity.iceologer.death hostile @a ~ ~ ~ 1 1
item modify entity @s armor.head {HURT_ON}
item modify entity @s weapon.mainhand {flags([True, False, False])}
execute on attacker if entity @s[type=minecraft:player] run summon minecraft:experience_orb ~ ~ ~ {{Value:10s}}
''')

fn('yadventures-bosses:iceologer/second', '''
execute if entity @s[tag=yadventures-bosses.dead] run return fail
execute if score #difficulty yadventures-bosses.dummy matches 0 run return run function yadventures-bosses:util/vanish
# Just in case something clears it (the milk it drinks in daylight is made harmless in iceologer/tick)
effect give @s minecraft:invisibility infinite 0 true
execute if predicate yadventures-bosses:chance/iceologer_ambient run playsound yadventures-bosses:entity.iceologer.ambient hostile @a ~ ~ ~ 1 1
execute if score @s yadventures-bosses.chunk_cd matches 1.. run scoreboard players remove @s yadventures-bosses.chunk_cd 1
execute if score @s yadventures-bosses.slow_cd matches 1.. run scoreboard players remove @s yadventures-bosses.slow_cd 1
execute if score @s yadventures-bosses.stray_cd matches 1.. run scoreboard players remove @s yadventures-bosses.stray_cd 1

# Keep away from players
execute if entity @a[gamemode=!creative,gamemode=!spectator,distance=..8] run function yadventures-bosses:iceologer/flee
execute unless entity @a[gamemode=!creative,gamemode=!spectator,distance=..8] run function yadventures-bosses:iceologer/stop_fleeing

# Forget targets that are gone, out of follow range or in creative/spectator, then look for a new one
function yadventures-bosses:util/tag_target
execute unless entity @e[tag=yadventures-bosses.target,distance=..18] run scoreboard players reset @s yadventures-bosses.target
execute if entity @e[type=minecraft:player,tag=yadventures-bosses.target,gamemode=!survival,gamemode=!adventure] run scoreboard players reset @s yadventures-bosses.target
tag @e[tag=yadventures-bosses.target] remove yadventures-bosses.target
execute unless score @s yadventures-bosses.target matches 1.. run function yadventures-bosses:iceologer/find_target
execute if score @s yadventures-bosses.cast matches 0 if score @s yadventures-bosses.target matches 1.. run function yadventures-bosses:iceologer/cast/start
''')
fn('yadventures-bosses:iceologer/flee', '''
attribute @s minecraft:movement_speed modifier remove yadventures-bosses:flee
attribute @s minecraft:movement_speed modifier add yadventures-bosses:flee 1 add_multiplied_base
execute facing entity @p[gamemode=!creative,gamemode=!spectator,distance=..8] feet rotated ~180 0 positioned ^ ^ ^10 run function yadventures-bosses:iceologer/set_wander_target
''')
fn('yadventures-bosses:iceologer/set_wander_target', '''
# The wandering trader walks to its wander_target
summon minecraft:marker ~ ~ ~ {Tags:["yadventures-bosses.aim"]}
data modify entity @s wander_target set value [I;0,0,0]
execute store result entity @s wander_target[0] int 1 run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[0]
execute store result entity @s wander_target[1] int 1 run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[1]
execute store result entity @s wander_target[2] int 1 run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[2]
kill @e[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..1]
''')
fn('yadventures-bosses:iceologer/stop_fleeing', '''
attribute @s minecraft:movement_speed modifier remove yadventures-bosses:flee
execute if data entity @s wander_target run data remove entity @s wander_target
''')

# ---- targeting: nearest player in sight within 16 blocks, else nearest golem / villager / glow squid
fn('yadventures-bosses:iceologer/find_target', '''
tag @e[type=minecraft:player,gamemode=!creative,gamemode=!spectator,distance=..16] add yadventures-bosses.candidate
function yadventures-bosses:iceologer/find_target_loop
execute if score @s yadventures-bosses.target matches 1.. run return 1
tag @e[type=#yadventures-bosses:iceologer_targets,type=!minecraft:player,tag=!yadventures-bosses.iceologer,distance=..16] add yadventures-bosses.candidate
function yadventures-bosses:iceologer/find_target_loop
''')
fn('yadventures-bosses:iceologer/find_target_loop', '''
execute unless entity @e[tag=yadventures-bosses.candidate,distance=..16] run return fail
tag @n[tag=yadventures-bosses.candidate,distance=..16] add yadventures-bosses.ray_target
scoreboard players set #los yadventures-bosses.dummy 0
scoreboard players set #steps yadventures-bosses.dummy 0
execute anchored eyes positioned ^ ^ ^ facing entity @n[tag=yadventures-bosses.ray_target] eyes run function yadventures-bosses:util/raycast
execute if score #los yadventures-bosses.dummy matches 1 as @n[tag=yadventures-bosses.ray_target] run function yadventures-bosses:util/uid
execute if score #los yadventures-bosses.dummy matches 1 run scoreboard players operation @s yadventures-bosses.target = #uid yadventures-bosses.dummy
execute if score #los yadventures-bosses.dummy matches 1 run tag @e[tag=yadventures-bosses.candidate] remove yadventures-bosses.candidate
tag @e[tag=yadventures-bosses.ray_target] remove yadventures-bosses.candidate
tag @e[tag=yadventures-bosses.ray_target] remove yadventures-bosses.ray_target
execute if score #los yadventures-bosses.dummy matches 0 run function yadventures-bosses:iceologer/find_target_loop
''')
fn('yadventures-bosses:util/raycast', '''
# Line of sight to yadventures-bosses.ray_target through #yadventures-bosses:see_through blocks (#los = 1 if it's visible)
execute positioned ~-0.5 ~-0.5 ~-0.5 if entity @e[tag=yadventures-bosses.ray_target,dx=0,dy=0,dz=0] run return run scoreboard players set #los yadventures-bosses.dummy 1
execute unless block ~ ~ ~ #yadventures-bosses:see_through run return fail
scoreboard players add #steps yadventures-bosses.dummy 1
execute if score #steps yadventures-bosses.dummy matches ..40 positioned ^ ^ ^0.5 run function yadventures-bosses:util/raycast
''')

# ---- spells: 20-tick warmup, then the spell; arms stay raised for the casting time
fn('yadventures-bosses:iceologer/cast/start', f'''
scoreboard players set #spell yadventures-bosses.dummy 0
execute if score @s yadventures-bosses.slow_cd matches ..0 run scoreboard players set #spell yadventures-bosses.dummy 2
execute if score @s yadventures-bosses.chunk_cd matches ..0 run scoreboard players set #spell yadventures-bosses.dummy 1
execute if score @s yadventures-bosses.stray_cd matches ..0 run function yadventures-bosses:iceologer/count_strays
execute if score @s yadventures-bosses.stray_cd matches ..0 if score #count yadventures-bosses.dummy matches ..1 run scoreboard players set #spell yadventures-bosses.dummy 3
execute if score #spell yadventures-bosses.dummy matches 0 run return fail
scoreboard players operation @s yadventures-bosses.state = #spell yadventures-bosses.dummy
scoreboard players set @s yadventures-bosses.cast 1
execute if score #spell yadventures-bosses.dummy matches 1 run scoreboard players set @s yadventures-bosses.chunk_cd 8
execute if score #spell yadventures-bosses.dummy matches 1 if entity @s[tag=yadventures-bosses.ominous] run scoreboard players set @s yadventures-bosses.chunk_cd 5
execute if score #spell yadventures-bosses.dummy matches 1 run playsound yadventures-bosses:entity.iceologer.prepare_summon hostile @a ~ ~ ~ 1 1
execute if score #spell yadventures-bosses.dummy matches 2 run scoreboard players set @s yadventures-bosses.slow_cd 11
execute if score #spell yadventures-bosses.dummy matches 2 if entity @s[tag=yadventures-bosses.ominous] run scoreboard players set @s yadventures-bosses.slow_cd 7
execute if score #spell yadventures-bosses.dummy matches 2 run playsound yadventures-bosses:entity.iceologer.prepare_slowness hostile @a ~ ~ ~ 1 1
execute if score #spell yadventures-bosses.dummy matches 3 run scoreboard players set @s yadventures-bosses.stray_cd 24
execute if score #spell yadventures-bosses.dummy matches 3 if entity @s[tag=yadventures-bosses.ominous] run scoreboard players set @s yadventures-bosses.stray_cd 16
execute if score #spell yadventures-bosses.dummy matches 3 run playsound yadventures-bosses:entity.iceologer.prepare_summon hostile @a ~ ~ ~ 1 1
item modify entity @s armor.chest {flags([True], 2)}
attribute @s minecraft:movement_speed modifier add yadventures-bosses:casting -1 add_multiplied_total
''')
fn('yadventures-bosses:iceologer/cast/tick', '''
scoreboard players add @s yadventures-bosses.cast 1
function yadventures-bosses:util/tag_target
execute if entity @e[tag=yadventures-bosses.target,distance=..48] run rotate @s facing entity @n[tag=yadventures-bosses.target] eyes
execute if score @s yadventures-bosses.state matches 1 rotated as @s rotated ~ 0 run particle minecraft:entity_effect{color:[0.4,0.3,0.35,1.0]} ^0.6 ^1.8 ^ 0 0 0 1 0
execute if score @s yadventures-bosses.state matches 1 rotated as @s rotated ~ 0 run particle minecraft:entity_effect{color:[0.4,0.3,0.35,1.0]} ^-0.6 ^1.8 ^ 0 0 0 1 0
execute if score @s yadventures-bosses.state matches 2 rotated as @s rotated ~ 0 run particle minecraft:entity_effect{color:[0.1,0.1,0.2,1.0]} ^0.6 ^1.8 ^ 0 0 0 1 0
execute if score @s yadventures-bosses.state matches 2 rotated as @s rotated ~ 0 run particle minecraft:entity_effect{color:[0.1,0.1,0.2,1.0]} ^-0.6 ^1.8 ^ 0 0 0 1 0
execute if score @s yadventures-bosses.state matches 3 rotated as @s rotated ~ 0 run particle minecraft:entity_effect{color:[0.7,0.85,0.95,1.0]} ^0.6 ^1.8 ^ 0 0 0 1 0
execute if score @s yadventures-bosses.state matches 3 rotated as @s rotated ~ 0 run particle minecraft:entity_effect{color:[0.7,0.85,0.95,1.0]} ^-0.6 ^1.8 ^ 0 0 0 1 0
execute if score @s yadventures-bosses.cast matches 20 if entity @e[tag=yadventures-bosses.target,distance=..48] run function yadventures-bosses:iceologer/cast/perform
tag @e[tag=yadventures-bosses.target] remove yadventures-bosses.target
execute if score @s yadventures-bosses.state matches 1 if score @s yadventures-bosses.cast matches 30.. run function yadventures-bosses:iceologer/cast/end
execute if score @s yadventures-bosses.state matches 2..3 if score @s yadventures-bosses.cast matches 20.. run function yadventures-bosses:iceologer/cast/end
''')
fn('yadventures-bosses:iceologer/cast/perform', '''
playsound yadventures-bosses:entity.iceologer.cast_spell hostile @a ~ ~ ~ 1 1
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
execute if score @s yadventures-bosses.state matches 1 as @n[tag=yadventures-bosses.target] at @s run function yadventures-bosses:ice_chunk/summon
execute if score @s yadventures-bosses.state matches 2 as @n[tag=yadventures-bosses.target] at @s run function yadventures-bosses:iceologer/freeze
execute if score @s yadventures-bosses.state matches 3 run function yadventures-bosses:iceologer/strays/summon
''')

# ---- summon strays: 3-4 (ominous 4) at random spots within 10 blocks, only while at most 1 of its own is alive.
# They wear a helmet so they don't burn in daylight, and join its team so their arrows don't hit it.
fn('yadventures-bosses:iceologer/count_strays', '''
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
scoreboard players set #count yadventures-bosses.dummy 0
execute as @e[type=minecraft:stray,tag=yadventures-bosses.iceologer_stray,distance=..64] if score @s yadventures-bosses.id = #id yadventures-bosses.dummy run scoreboard players add #count yadventures-bosses.dummy 1
''')
fn('yadventures-bosses:iceologer/strays/summon', '''
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
execute store result score #n yadventures-bosses.dummy run random value 3..4
execute if entity @s[tag=yadventures-bosses.ominous] run scoreboard players set #n yadventures-bosses.dummy 4
function yadventures-bosses:iceologer/strays/summon_loop
# spreadplayers looks for ground below its "under" height: allow a few blocks above the Iceologer
execute store result score #y yadventures-bosses.dummy run data get entity @s Pos[1]
execute store result storage yadventures-bosses:data stray.y int 1 run scoreboard players add #y yadventures-bosses.dummy 3
function yadventures-bosses:iceologer/strays/spread with storage yadventures-bosses:data stray
execute as @e[type=minecraft:stray,tag=yadventures-bosses.new] at @s run function yadventures-bosses:iceologer/strays/init
''')
fn('yadventures-bosses:iceologer/strays/summon_loop', '''
summon minecraft:stray ~ ~ ~ {Tags:["yadventures-bosses.iceologer_stray","yadventures-bosses.new"],equipment:{head:{id:"minecraft:leather_helmet",count:1,components:{"minecraft:dyed_color":10539248}}},drop_chances:{head:0f}}
scoreboard players remove #n yadventures-bosses.dummy 1
execute if score #n yadventures-bosses.dummy matches 1.. run function yadventures-bosses:iceologer/strays/summon_loop
''')
fn('yadventures-bosses:iceologer/strays/spread', '''
$spreadplayers ~ ~ 1 10 under $(y) false @e[type=minecraft:stray,tag=yadventures-bosses.new,distance=..1]
''')
fn('yadventures-bosses:iceologer/strays/init', '''
tag @s remove yadventures-bosses.new
scoreboard players operation @s yadventures-bosses.id = #id yadventures-bosses.dummy
team join yadventures-bosses.illagers @s
particle minecraft:snowflake ~ ~1 ~ 0.3 0.6 0.3 0.05 20
particle minecraft:poof ~ ~1 ~ 0.3 0.5 0.3 0.02 8
''')
fn('yadventures-bosses:iceologer/cast/end', f'''
scoreboard players set @s yadventures-bosses.cast 0
item modify entity @s armor.chest {flags([False], 2)}
attribute @s minecraft:movement_speed modifier remove yadventures-bosses:casting
''')

# ---- freezing: mobs get powder snow freezing (TicksFrozen), players (not data-modifiable) an imitation
fn('yadventures-bosses:iceologer/freeze', '''
particle minecraft:snowflake ~ ~1 ~ 0.4 0.8 0.4 0.02 20
execute if entity @s[type=minecraft:player] run return run function yadventures-bosses:iceologer/freeze_player
data modify entity @s TicksFrozen set value 400
''')
fn('yadventures-bosses:iceologer/freeze_player', '''
execute if items entity @s armor.* #minecraft:freeze_immune_wearables run return fail
# Like TicksFrozen 400 thawing out: fully frozen for 130 ticks, 1 freeze damage every 40 ticks
scoreboard players set @s yadventures-bosses.frozen 130
effect give @s minecraft:slowness 7 2
''')
fn('yadventures-bosses:iceologer/frozen_player', '''
scoreboard players remove @s yadventures-bosses.frozen 1
particle minecraft:snowflake ~ ~1 ~ 0.3 0.6 0.3 0 1
scoreboard players operation #m yadventures-bosses.dummy = @s yadventures-bosses.frozen
scoreboard players operation #m yadventures-bosses.dummy %= #40 yadventures-bosses.dummy
execute if score #m yadventures-bosses.dummy matches 0 if score @s yadventures-bosses.frozen matches 1.. run damage @s 1 minecraft:freeze
''')

# ---- ice chunk: appears above the target, follows it for 3-5 s, then falls
fn('yadventures-bosses:ice_chunk/summon', '''
# Height above the target: its height squared, at most 6 blocks (in hundredths)
scoreboard players set #off yadventures-bosses.dummy 324
execute if entity @s[type=#yadventures-bosses:villagers] run scoreboard players set #off yadventures-bosses.dummy 380
execute if entity @s[type=minecraft:iron_golem] run scoreboard players set #off yadventures-bosses.dummy 600
execute if entity @s[type=minecraft:glow_squid] run scoreboard players set #off yadventures-bosses.dummy 64
scoreboard players operation #t yadventures-bosses.dummy = @s yadventures-bosses.uid
summon minecraft:item_display ~ ~ ~ {Tags:["yadventures-bosses.ice_chunk","yadventures-bosses.new"],teleport_duration:1,item:{id:"minecraft:stone",count:1,components:{"minecraft:item_model":"yadventures-bosses:ice_chunk"}},transformation:{translation:[0f,0.5f,0f],left_rotation:[0f,0f,0f,1f],scale:[0f,0f,0f],right_rotation:[0f,0f,0f,1f]}}
execute as @e[type=minecraft:item_display,tag=yadventures-bosses.new,distance=..1] run function yadventures-bosses:ice_chunk/init
''')
fn('yadventures-bosses:ice_chunk/init', '''
tag @s remove yadventures-bosses.new
scoreboard players operation @s yadventures-bosses.offset = #off yadventures-bosses.dummy
scoreboard players operation @s yadventures-bosses.target = #t yadventures-bosses.dummy
scoreboard players operation @s yadventures-bosses.id = #id yadventures-bosses.dummy
scoreboard players set @s yadventures-bosses.age 0
scoreboard players set @s yadventures-bosses.velocity 0
execute store result score @s yadventures-bosses.timer run random value 60..100
execute store result entity @s Rotation[0] float 1 run random value 0..359
execute store result score #y yadventures-bosses.dummy run data get entity @s Pos[1] 100
scoreboard players operation #y yadventures-bosses.dummy += #off yadventures-bosses.dummy
execute store result entity @s Pos[1] double 0.01 run scoreboard players get #y yadventures-bosses.dummy
''')
fn('yadventures-bosses:ice_chunk/tick', '''
scoreboard players add @s yadventures-bosses.age 1
execute if score @s yadventures-bosses.age matches 400.. run return run kill @s
# Grows over 30 ticks
execute if score @s yadventures-bosses.age matches 1 run data merge entity @s {start_interpolation:0,interpolation_duration:30,transformation:{scale:[1f,1f,1f]}}
execute if score @s yadventures-bosses.age matches 10 run playsound yadventures-bosses:entity.ice_chunk.summon hostile @a ~ ~ ~ 1 1
execute if score @s yadventures-bosses.age matches 40 run playsound yadventures-bosses:entity.ice_chunk.ambient hostile @a ~ ~ ~ 1 1
execute if score @s yadventures-bosses.age <= @s yadventures-bosses.timer run return run function yadventures-bosses:ice_chunk/follow
function yadventures-bosses:ice_chunk/fall
''')
fn('yadventures-bosses:ice_chunk/follow', '''
function yadventures-bosses:util/tag_target
execute unless entity @e[tag=yadventures-bosses.target,distance=..64] run return run scoreboard players operation @s yadventures-bosses.timer = @s yadventures-bosses.age
execute if entity @e[type=minecraft:player,tag=yadventures-bosses.target,gamemode=!survival,gamemode=!adventure] run return run function yadventures-bosses:ice_chunk/discard
execute at @n[tag=yadventures-bosses.target] run summon minecraft:marker ~ ~ ~ {Tags:["yadventures-bosses.aim"]}
tag @e[tag=yadventures-bosses.target] remove yadventures-bosses.target
execute store result score #y yadventures-bosses.dummy run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[1] 100
scoreboard players operation #y yadventures-bosses.dummy += @s yadventures-bosses.offset
execute store result entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[1] double 0.01 run scoreboard players get #y yadventures-bosses.dummy
# 0.2 blocks per tick
execute if entity @n[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..0.2] positioned as @n[type=minecraft:marker,tag=yadventures-bosses.aim] run tp @s ~ ~ ~
execute unless entity @n[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..0.2] facing entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] feet run tp @s ^ ^ ^0.2
kill @e[type=minecraft:marker,tag=yadventures-bosses.aim]
''')
fn('yadventures-bosses:ice_chunk/discard', '''
tag @e[tag=yadventures-bosses.target] remove yadventures-bosses.target
kill @s
''')
fn('yadventures-bosses:ice_chunk/fall', '''
# Accelerates by 0.05 blocks/tick every tick (#steps steps of 0.05), up to 2 blocks/tick
execute if score @s yadventures-bosses.velocity matches ..39 run scoreboard players add @s yadventures-bosses.velocity 1
scoreboard players operation #steps yadventures-bosses.dummy = @s yadventures-bosses.velocity
function yadventures-bosses:ice_chunk/fall_step
''')
fn('yadventures-bosses:ice_chunk/fall_step', '''
execute unless block ~ ~-0.05 ~ #yadventures-bosses:ice_chunk_passable run return run function yadventures-bosses:ice_chunk/land
scoreboard players remove #steps yadventures-bosses.dummy 1
execute if score #steps yadventures-bosses.dummy matches ..0 positioned ~ ~-0.05 ~ run return run tp @s ~ ~ ~
execute positioned ~ ~-0.05 ~ run function yadventures-bosses:ice_chunk/fall_step
''')
fn('yadventures-bosses:ice_chunk/land', '''
tp @s ~ ~ ~
playsound yadventures-bosses:entity.ice_chunk.hit hostile @a ~ ~ ~ 1 1
particle minecraft:block{block_state:"minecraft:blue_ice"} ~ ~0.5 ~ 1 0.3 1 0 32
tag @s add yadventures-bosses.this
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
execute as @e[type=minecraft:wandering_trader,tag=yadventures-bosses.iceologer,tag=!yadventures-bosses.dead] if score @s yadventures-bosses.id = #id yadventures-bosses.dummy run tag @s add yadventures-bosses.owner
# 12 damage in its 2.5x1x2.5 box (+0.2 around), except to illagers
execute positioned ~-1.45 ~ ~-1.45 as @e[dx=1.9,dy=0,dz=1.9,type=!#minecraft:illager,type=!minecraft:armor_stand,tag=!yadventures-bosses.iceologer] if data entity @s Health run function yadventures-bosses:ice_chunk/hit
tag @e[tag=yadventures-bosses.owner] remove yadventures-bosses.owner
kill @s
''')
fn('yadventures-bosses:ice_chunk/hit', '''
execute if entity @e[tag=yadventures-bosses.owner] run damage @s 12 minecraft:indirect_magic by @n[type=minecraft:item_display,tag=yadventures-bosses.this] from @n[tag=yadventures-bosses.owner]
execute unless entity @e[tag=yadventures-bosses.owner] run damage @s 12 minecraft:magic
execute if entity @s[type=minecraft:player] run return run function yadventures-bosses:iceologer/freeze_player
data modify entity @s TicksFrozen set value 400
''')

# ============================================================ totems
fn('yadventures-bosses:totem/hurt', '''
# Totems of Freezing / Illusion trigger when hurt by an entity at or below half health
advancement revoke @s only yadventures-bosses:technical/totem_hurt
execute store result score #hp yadventures-bosses.dummy run data get entity @s Health 100
execute store result score #max yadventures-bosses.dummy run attribute @s minecraft:max_health get 50
execute unless score #hp yadventures-bosses.dummy matches 1.. run return fail
execute if score #hp yadventures-bosses.dummy > #max yadventures-bosses.dummy run return fail
execute if items entity @s weapon.mainhand *[minecraft:custom_data~{yadventures-bosses:{totem:"freezing"}}] run return run function yadventures-bosses:totem/use {slot:"weapon.mainhand",kind:"freezing"}
execute if items entity @s weapon.mainhand *[minecraft:custom_data~{yadventures-bosses:{totem:"illusion"}}] run return run function yadventures-bosses:totem/use {slot:"weapon.mainhand",kind:"illusion"}
execute if items entity @s weapon.offhand *[minecraft:custom_data~{yadventures-bosses:{totem:"freezing"}}] run return run function yadventures-bosses:totem/use {slot:"weapon.offhand",kind:"freezing"}
execute if items entity @s weapon.offhand *[minecraft:custom_data~{yadventures-bosses:{totem:"illusion"}}] run return run function yadventures-bosses:totem/use {slot:"weapon.offhand",kind:"illusion"}
''')
fn('yadventures-bosses:totem/use', '''
$item modify entity @s $(slot) yadventures-bosses:consume
playsound minecraft:item.totem.use player @a ~ ~ ~ 1 1
particle minecraft:totem_of_undying ~ ~1 ~ 0.4 0.8 0.4 0.5 60
$function yadventures-bosses:totem/$(kind)
''')
fn('yadventures-bosses:totem/freezing', '''
particle minecraft:snowflake ~ ~1 ~ 3 1 3 0.05 200
execute as @e[type=!minecraft:player,distance=..9] if data entity @s Health run function yadventures-bosses:totem/freeze_mob
effect give @a[distance=0.01..9,gamemode=!creative,gamemode=!spectator] minecraft:slowness 20 1
effect give @s minecraft:speed 10 1
''')
fn('yadventures-bosses:totem/freeze_mob', '''
data modify entity @s TicksFrozen set value 400
effect give @s minecraft:slowness 20 1
''')
fn('yadventures-bosses:totem/illusion', '''
playsound yadventures-bosses:entity.player.mirror_move player @a ~ ~ ~ 1 1
tag @s add yadventures-bosses.this
execute as @e[type=!minecraft:player,distance=..18] run function yadventures-bosses:totem/distract_if_targeting
scoreboard players set #mode yadventures-bosses.dummy 1
function yadventures-bosses:util/start_ring
# Mobs ignore very small repeated damage while hurt-invulnerable, so the decoys "hit" them a bit later
schedule function yadventures-bosses:totem/distract_all 11t replace
tag @s remove yadventures-bosses.this
effect give @s minecraft:invisibility 10 0
''')
fn('yadventures-bosses:totem/distract_if_targeting', '''
scoreboard players set #ok yadventures-bosses.dummy 0
execute on target if entity @s[tag=yadventures-bosses.this] run scoreboard players set #ok yadventures-bosses.dummy 1
execute if score #ok yadventures-bosses.dummy matches 0 run return fail
tag @s add yadventures-bosses.distract
scoreboard players operation @s yadventures-bosses.decoy = #id yadventures-bosses.dummy
''')
fn('yadventures-bosses:totem/distract_all', '''
execute as @e[tag=yadventures-bosses.distract] at @s run function yadventures-bosses:totem/distract
''')
fn('yadventures-bosses:totem/distract', '''
# Blindness does nothing to mobs: make them retaliate against one of the player's illusions instead
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.decoy
execute as @e[type=minecraft:mannequin,tag=yadventures-bosses.player_illusion,distance=..32] if score @s yadventures-bosses.id = #id yadventures-bosses.dummy run tag @s add yadventures-bosses.decoy
damage @s 0.01 minecraft:generic by @e[type=minecraft:mannequin,tag=yadventures-bosses.decoy,sort=random,limit=1]
tag @e[type=minecraft:mannequin,tag=yadventures-bosses.decoy] remove yadventures-bosses.decoy
tag @s remove yadventures-bosses.distract
''')
fn('yadventures-bosses:totem/summon_illusion', '''
summon minecraft:mannequin ~ ~ ~ {Tags:["yadventures-bosses.player_illusion","yadventures-bosses.new"],hide_description:1b}
execute as @n[type=minecraft:mannequin,tag=yadventures-bosses.new,distance=..2] run function yadventures-bosses:totem/init_illusion
particle minecraft:cloud ~ ~1 ~ 0.3 0.6 0.3 0.05 16
''')
fn('yadventures-bosses:totem/init_illusion', '''
execute as @p[tag=yadventures-bosses.this] run loot replace entity @n[type=minecraft:mannequin,tag=yadventures-bosses.new] armor.head loot yadventures-bosses:technical/player_head
data modify entity @s profile set from entity @s equipment.head.components."minecraft:profile"
tag @s remove yadventures-bosses.new
item replace entity @s armor.head from entity @p[tag=yadventures-bosses.this] armor.head
item replace entity @s armor.chest from entity @p[tag=yadventures-bosses.this] armor.chest
item replace entity @s armor.legs from entity @p[tag=yadventures-bosses.this] armor.legs
item replace entity @s armor.feet from entity @p[tag=yadventures-bosses.this] armor.feet
item replace entity @s weapon.mainhand from entity @p[tag=yadventures-bosses.this] weapon.mainhand
item replace entity @s weapon.offhand from entity @p[tag=yadventures-bosses.this] weapon.offhand
execute store result storage yadventures-bosses:data ring.yaw int 1 run random value 0..359
function yadventures-bosses:totem/rotate with storage yadventures-bosses:data ring
scoreboard players operation @s yadventures-bosses.id = #id yadventures-bosses.dummy
scoreboard players set @s yadventures-bosses.timer 600
''')
fn('yadventures-bosses:totem/rotate', '$rotate @s $(yaw) 0')
fn('yadventures-bosses:totem/illusion_tick', '''
scoreboard players remove @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches ..0 run return run function yadventures-bosses:util/vanish
execute if entity @s[nbt={HurtTime:10s}] run function yadventures-bosses:util/vanish
''')

# ============================================================ wildfire
WILDFIRE_PART = 'brightness:{sky:15,block:15},item:{id:"minecraft:stone",count:1,components:{"minecraft:item_model":"yadventures-bosses:wildfire/%s"}},transformation:{translation:[0f,-2.0625f,0f],left_rotation:[0f,0f,0f,1f],scale:[1.5f,1.5f,1.5f],right_rotation:[0f,0f,0f,1f]}'
fn('yadventures-bosses:convert/wildfire', f'''
# A scaled, invisible blaze carrying item display models
data merge entity @s {{CustomName:{{"translate":"entity.yadventures-bosses.wildfire"}},Silent:1b,PersistenceRequired:1b,DeathLootTable:"yadventures-bosses:entities/wildfire",{INVISIBLE}}}
tag @s add yadventures-bosses.wildfire
tag @s add yadventures.boss.wildfire
attribute @s minecraft:scale base set 1.5625
attribute @s minecraft:follow_range base set 32
attribute @s minecraft:movement_speed base set 0.23
attribute @s minecraft:knockback_resistance base set 1
attribute @s minecraft:max_health base set 180
attribute @s minecraft:attack_damage base set 8
attribute @s[tag=yadventures-bosses.ominous] minecraft:attack_damage base set 10
summon minecraft:item_display ~ ~ ~ {{Tags:["yadventures-bosses.wildfire_part","yadventures-bosses.wildfire_body","yadventures-bosses.new"],teleport_duration:1,{WILDFIRE_PART % 'body'}}}
summon minecraft:item_display ~ ~ ~ {{Tags:["yadventures-bosses.wildfire_part","yadventures-bosses.wildfire_shields","yadventures-bosses.new"],interpolation_duration:20,{WILDFIRE_PART % 'shields_4'}}}
execute as @e[type=minecraft:item_display,tag=yadventures-bosses.new,distance=..1] run ride @s mount @n[type=minecraft:blaze,tag=yadventures-bosses.converting]
tag @e[type=minecraft:item_display,tag=yadventures-bosses.new,distance=..1] remove yadventures-bosses.new
function yadventures-bosses:wildfire/init
''')
fn('yadventures-bosses:wildfire/init', '''
scoreboard players add #next yadventures-bosses.id 1
scoreboard players operation @s yadventures-bosses.id = #next yadventures-bosses.id
execute store result score @s yadventures-bosses.health run data get entity @s Health 100
scoreboard players set @s yadventures-bosses.shields 4
scoreboard players set @s yadventures-bosses.absorbed 0
scoreboard players set @s yadventures-bosses.regen 0
scoreboard players set @s yadventures-bosses.state 0
scoreboard players set @s yadventures-bosses.attack_cd 20
''')
fn('yadventures-bosses:wildfire/spin', '''
# Shields turn 45 degrees every second, interpolated over 20 ticks
scoreboard players operation #step yadventures-bosses.dummy = #gametime yadventures-bosses.dummy
scoreboard players operation #step yadventures-bosses.dummy /= #20 yadventures-bosses.dummy
scoreboard players operation #step yadventures-bosses.dummy %= #8 yadventures-bosses.dummy
execute store result storage yadventures-bosses:data spin.step int 1 run scoreboard players get #step yadventures-bosses.dummy
function yadventures-bosses:wildfire/spin_apply with storage yadventures-bosses:data spin
''')
fn('yadventures-bosses:wildfire/spin_apply', '''
$data modify storage yadventures-bosses:data spin.rotation set from storage yadventures-bosses:data shield_rotation[$(step)]
execute as @e[type=minecraft:item_display,tag=yadventures-bosses.wildfire_shields] run data modify entity @s transformation.left_rotation set from storage yadventures-bosses:data spin.rotation
''')
fn('yadventures-bosses:wildfire/tick', '''
execute if entity @s[tag=yadventures-bosses.dead] run return fail
execute store result score #hp yadventures-bosses.dummy run data get entity @s Health 100
execute if score #hp yadventures-bosses.dummy matches ..0 run return run function yadventures-bosses:wildfire/death

function yadventures-bosses:wildfire/shields
execute if predicate yadventures-bosses:chance/wildfire_ambient run playsound yadventures-bosses:entity.wildfire.ambient hostile @a ~ ~ ~ 1 1

# Attacks
tag @s add yadventures-bosses.this
execute on target run tag @s add yadventures-bosses.target
# The model faces the target (a hovering blaze never turns its own body), else the blaze's heading
execute unless entity @e[tag=yadventures-bosses.target,distance=..64] rotated as @s on passengers if entity @s[tag=yadventures-bosses.wildfire_body] run rotate @s ~ 0
execute facing entity @n[tag=yadventures-bosses.target,distance=..64] feet on passengers if entity @s[tag=yadventures-bosses.wildfire_body] run rotate @s ~ 0
function yadventures-bosses:wildfire/ai
tag @e[tag=yadventures-bosses.target,distance=..64] remove yadventures-bosses.target
tag @s remove yadventures-bosses.this
''')
fn('yadventures-bosses:wildfire/ai', '''
execute if score @s yadventures-bosses.state matches 2 run return run function yadventures-bosses:wildfire/shockwave/tick
execute if score @s yadventures-bosses.state matches 3 run return run function yadventures-bosses:wildfire/charge/tick
execute unless entity @e[tag=yadventures-bosses.target,distance=..64] if score @s yadventures-bosses.state matches 1 run return run function yadventures-bosses:wildfire/barrage/stop
execute unless entity @e[tag=yadventures-bosses.target,distance=..64] run return fail
execute if score @s yadventures-bosses.state matches 1 run return run function yadventures-bosses:wildfire/barrage/tick
# One attack at a time: attack ends -> cooldown -> next attack
execute if score @s yadventures-bosses.attack_cd matches 1.. run return run scoreboard players remove @s yadventures-bosses.attack_cd 1
function yadventures-bosses:wildfire/next_attack
''')
fn('yadventures-bosses:wildfire/next_attack', '''
# 1-2 barrage, 3-4 shockwave (target within 6) or charge (within 20, else barrage),
# 5 summon (none of its blazes alive, else as 3-4)
execute store result score #r yadventures-bosses.dummy run random value 1..5
function yadventures-bosses:wildfire/count_blazes
execute if score #r yadventures-bosses.dummy matches 5 if score #count yadventures-bosses.dummy matches 0 run return run function yadventures-bosses:wildfire/summon_blazes
execute if score #r yadventures-bosses.dummy matches 3.. if entity @e[tag=yadventures-bosses.target,distance=..6] run return run function yadventures-bosses:wildfire/shockwave/start
execute if score #r yadventures-bosses.dummy matches 3.. if entity @e[tag=yadventures-bosses.target,distance=..20] run return run function yadventures-bosses:wildfire/charge/start
function yadventures-bosses:wildfire/barrage/start
''')
fn('yadventures-bosses:wildfire/attack_end', '''
scoreboard players set @s yadventures-bosses.state 0
execute store result score @s yadventures-bosses.attack_cd run random value 60..100
execute if entity @s[tag=yadventures-bosses.ominous] store result score @s yadventures-bosses.attack_cd run random value 40..70
''')

# ---- shields
fn('yadventures-bosses:wildfire/shields', '''
# While shields are up, damage is absorbed by them instead of health
execute if score @s yadventures-bosses.shields matches 1.. if score #hp yadventures-bosses.dummy < @s yadventures-bosses.health run function yadventures-bosses:wildfire/absorb
execute if entity @s[nbt={HurtTime:10s}] run function yadventures-bosses:wildfire/hurt
execute if score @s yadventures-bosses.regen matches 1.. run scoreboard players remove @s yadventures-bosses.regen 1
execute if score @s yadventures-bosses.regen matches 0 if score @s yadventures-bosses.shields matches ..3 run function yadventures-bosses:wildfire/regen_shield
execute store result score @s yadventures-bosses.health run data get entity @s Health 100
''')
fn('yadventures-bosses:wildfire/absorb', '''
scoreboard players operation #diff yadventures-bosses.dummy = @s yadventures-bosses.health
scoreboard players operation #diff yadventures-bosses.dummy -= #hp yadventures-bosses.dummy
scoreboard players operation @s yadventures-bosses.absorbed += #diff yadventures-bosses.dummy
execute store result entity @s Health float 0.01 run scoreboard players get @s yadventures-bosses.health
execute if score @s yadventures-bosses.absorbed >= @s yadventures-bosses.shield_hp run function yadventures-bosses:wildfire/break_shield
''')
fn('yadventures-bosses:wildfire/hurt', '''
scoreboard players set @s yadventures-bosses.regen 300
playsound yadventures-bosses:entity.wildfire.hurt hostile @a ~ ~ ~ 1 1
''')
fn('yadventures-bosses:wildfire/break_shield', '''
scoreboard players remove @s yadventures-bosses.shields 1
scoreboard players set @s yadventures-bosses.absorbed 0
playsound yadventures-bosses:entity.wildfire.shield_break hostile @a ~ ~ ~ 1 1
particle minecraft:flame ~ ~1.5 ~ 0.6 0.8 0.6 0.05 40
tag @s add yadventures-bosses.this
execute on attacker run damage @s 8 minecraft:mob_attack by @n[type=minecraft:blaze,tag=yadventures-bosses.this]
tag @s remove yadventures-bosses.this
function yadventures-bosses:wildfire/update_shields
''')
fn('yadventures-bosses:wildfire/regen_shield', '''
scoreboard players add @s yadventures-bosses.shields 1
scoreboard players set @s yadventures-bosses.regen 300
function yadventures-bosses:wildfire/update_shields
''')
fn('yadventures-bosses:wildfire/update_shields', '''
execute store result storage yadventures-bosses:data shields.count int 1 run scoreboard players get @s yadventures-bosses.shields
execute on passengers if entity @s[tag=yadventures-bosses.wildfire_shields] run function yadventures-bosses:wildfire/set_shield_model with storage yadventures-bosses:data shields
''')
fn('yadventures-bosses:wildfire/set_shield_model', '''
$data modify entity @s item.components."minecraft:item_model" set value "yadventures-bosses:wildfire/shields_$(count)"
''')
fn('yadventures-bosses:wildfire/owns_fireball', '''
execute on origin if entity @s[type=minecraft:blaze,tag=yadventures-bosses.wildfire] run return 1
return fail
''')
fn('yadventures-bosses:wildfire/death', '''
tag @s add yadventures-bosses.dead
playsound yadventures-bosses:entity.wildfire.death hostile @a ~ ~ ~ 2 1
particle minecraft:flame ~ ~1.5 ~ 0.7 1 0.7 0.1 80
particle minecraft:large_smoke ~ ~1.5 ~ 0.7 1 0.7 0.05 30
execute on passengers run kill @s
''')

# ---- fireball barrage
fn('yadventures-bosses:wildfire/barrage/start', '''
scoreboard players set @s yadventures-bosses.state 1
scoreboard players set @s yadventures-bosses.fired 0
scoreboard players set @s yadventures-bosses.timer 10
''')
fn('yadventures-bosses:wildfire/barrage/stop', '''
function yadventures-bosses:wildfire/attack_end
''')
fn('yadventures-bosses:wildfire/barrage/tick', '''
execute if score @s yadventures-bosses.fired matches 31.. run return run function yadventures-bosses:wildfire/barrage/stop
scoreboard players add @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches 11.. run function yadventures-bosses:wildfire/barrage/volley
''')
fn('yadventures-bosses:wildfire/barrage/volley', '\n'.join([
    'scoreboard players set @s yadventures-bosses.timer 0',
    'scoreboard players add @s yadventures-bosses.fired 8',
    'playsound yadventures-bosses:entity.wildfire.shoot hostile @a ~ ~ ~ 1 1',
    'playsound minecraft:entity.blaze.shoot hostile @a ~ ~ ~ 1 1',
    *['execute positioned ~ ~1.9 ~ facing entity @e[tag=yadventures-bosses.target,distance=..64,limit=1] eyes run function yadventures-bosses:wildfire/barrage/fireball'] * 8,
    '# Melee hit on every other volley when close',
    'scoreboard players operation #v yadventures-bosses.dummy = @s yadventures-bosses.fired',
    'scoreboard players operation #v yadventures-bosses.dummy /= #8 yadventures-bosses.dummy',
    'scoreboard players operation #v yadventures-bosses.dummy %= #2 yadventures-bosses.dummy',
    'execute if score #v yadventures-bosses.dummy matches 0 as @e[tag=yadventures-bosses.target,distance=..3,limit=1] run damage @s 8 minecraft:mob_attack by @n[type=minecraft:blaze,tag=yadventures-bosses.this]',
]))
fn('yadventures-bosses:wildfire/barrage/fireball', '''
# Random spread (triangular distribution)
execute store result score #a yadventures-bosses.dummy run random value -8..8
execute store result score #b yadventures-bosses.dummy run random value -8..8
execute store result storage yadventures-bosses:data aim.yaw int 1 run scoreboard players operation #a yadventures-bosses.dummy += #b yadventures-bosses.dummy
execute store result score #a yadventures-bosses.dummy run random value -4..4
execute store result score #b yadventures-bosses.dummy run random value -4..4
execute store result storage yadventures-bosses:data aim.pitch int 1 run scoreboard players operation #a yadventures-bosses.dummy += #b yadventures-bosses.dummy
function yadventures-bosses:wildfire/barrage/fireball_aimed with storage yadventures-bosses:data aim
''')
fn('yadventures-bosses:wildfire/barrage/fireball_aimed', '''
$execute rotated ~$(yaw) ~$(pitch) run summon minecraft:marker ^ ^ ^1 {Tags:["yadventures-bosses.aim"]}
summon minecraft:small_fireball ~ ~ ~ {Tags:["yadventures-bosses.new","yadventures-bosses.debris"]}
execute as @e[type=minecraft:small_fireball,tag=yadventures-bosses.new,distance=..0.1] run function yadventures-bosses:wildfire/barrage/fireball_init
kill @e[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..2]
''')
fn('yadventures-bosses:wildfire/barrage/fireball_init', '''
tag @s remove yadventures-bosses.new
execute store result score #x yadventures-bosses.dummy run data get entity @s Pos[0] 1000
execute store result score #y yadventures-bosses.dummy run data get entity @s Pos[1] 1000
execute store result score #z yadventures-bosses.dummy run data get entity @s Pos[2] 1000
execute store result score #dx yadventures-bosses.dummy run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[0] 1000
execute store result score #dy yadventures-bosses.dummy run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[1] 1000
execute store result score #dz yadventures-bosses.dummy run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim] Pos[2] 1000
scoreboard players operation #dx yadventures-bosses.dummy -= #x yadventures-bosses.dummy
scoreboard players operation #dy yadventures-bosses.dummy -= #y yadventures-bosses.dummy
scoreboard players operation #dz yadventures-bosses.dummy -= #z yadventures-bosses.dummy
execute store result entity @s Motion[0] double 0.0001 run scoreboard players get #dx yadventures-bosses.dummy
execute store result entity @s Motion[1] double 0.0001 run scoreboard players get #dy yadventures-bosses.dummy
execute store result entity @s Motion[2] double 0.0001 run scoreboard players get #dz yadventures-bosses.dummy
data modify entity @s Owner set from entity @n[type=minecraft:blaze,tag=yadventures-bosses.this] UUID
''')

# ---- shockwave
BODY = 'on passengers if entity @s[tag=yadventures-bosses.wildfire_body] run data merge entity @s'
fn('yadventures-bosses:wildfire/shockwave/start', f'''
scoreboard players set @s yadventures-bosses.state 2
scoreboard players set @s yadventures-bosses.timer 0
playsound yadventures-bosses:entity.wildfire.shockwave hostile @a ~ ~ ~ 2 1
execute {BODY} {{interpolation_duration:18,transformation:{{translation:[0f,-1.125f,0f]}}}}
''')
fn('yadventures-bosses:wildfire/shockwave/tick', f'''
scoreboard players add @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches 18 {BODY} {{interpolation_duration:2,transformation:{{translation:[0f,-2.25f,0f]}}}}
execute if score @s yadventures-bosses.timer matches 20 run function yadventures-bosses:wildfire/shockwave/blast
execute if score @s yadventures-bosses.timer matches 20 {BODY} {{interpolation_duration:4,transformation:{{translation:[0f,-2.0625f,0f]}}}}
execute if score @s yadventures-bosses.timer matches 24.. run function yadventures-bosses:wildfire/shockwave/end
''')
fn('yadventures-bosses:wildfire/shockwave/blast', '''
execute as @e[distance=..7,type=!#yadventures-bosses:wildfire_allies,tag=!yadventures-bosses.wildfire_part] if data entity @s Health run damage @s 8 minecraft:mob_attack by @n[type=minecraft:blaze,tag=yadventures-bosses.this]
function yadventures-bosses:wildfire/shockwave/particles
playsound minecraft:entity.generic.explode hostile @a ~ ~ ~ 0.6 1.4
''')
lines = []
for i in range(48):
    a = 2 * math.pi * i / 48
    c, s = math.cos(a), math.sin(a)
    for speed in (0.25, 0.4):
        lines.append(f'particle minecraft:flame ~{c * 0.5:.3f} ~0.2 ~{s * 0.5:.3f} {c:.3f} 0 {s:.3f} {speed} 0 force')
fn('yadventures-bosses:wildfire/shockwave/particles', '\n'.join(lines))
fn('yadventures-bosses:wildfire/shockwave/end', '''
function yadventures-bosses:wildfire/attack_end
''')

# ---- charge: 15-tick windup, then a straight dash (1.2 blocks/tick, up to 15 ticks) at where the target was,
# hitting everything it touches once and stopping there
fn('yadventures-bosses:wildfire/charge/start', '''
scoreboard players set @s yadventures-bosses.state 3
scoreboard players set @s yadventures-bosses.timer 0
playsound minecraft:entity.blaze.ambient hostile @a ~ ~ ~ 2 0.5
''')
fn('yadventures-bosses:wildfire/charge/tick', '''
scoreboard players add @s yadventures-bosses.timer 1
execute if score @s yadventures-bosses.timer matches ..15 run particle minecraft:flame ~ ~0.3 ~ 0.5 0.2 0.5 0.02 6
execute if score @s yadventures-bosses.timer matches 16 run function yadventures-bosses:wildfire/charge/aim
execute if score @s yadventures-bosses.timer matches 16.. run function yadventures-bosses:wildfire/charge/dash
execute if score @s yadventures-bosses.timer matches 31.. run function yadventures-bosses:wildfire/charge/end
''')
fn('yadventures-bosses:wildfire/charge/aim', '''
playsound minecraft:item.firecharge.use hostile @a ~ ~ ~ 2 0.6
scoreboard players set @s yadventures-bosses.charge_x 0
scoreboard players set @s yadventures-bosses.charge_y 0
scoreboard players set @s yadventures-bosses.charge_z 0
execute positioned ~ ~1.4 ~ facing entity @n[tag=yadventures-bosses.target,distance=..64] eyes run summon minecraft:marker ^ ^ ^1 {Tags:["yadventures-bosses.aim"]}
execute unless entity @n[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..3] run return fail
execute store result score @s yadventures-bosses.charge_x run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..3] Pos[0] 1000
execute store result score @s yadventures-bosses.charge_y run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..3] Pos[1] 1000
execute store result score @s yadventures-bosses.charge_z run data get entity @n[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..3] Pos[2] 1000
kill @e[type=minecraft:marker,tag=yadventures-bosses.aim,distance=..3]
execute store result score #x yadventures-bosses.dummy run data get entity @s Pos[0] 1000
execute store result score #y yadventures-bosses.dummy run data get entity @s Pos[1] 1000
execute store result score #z yadventures-bosses.dummy run data get entity @s Pos[2] 1000
scoreboard players add #y yadventures-bosses.dummy 1400
scoreboard players operation @s yadventures-bosses.charge_x -= #x yadventures-bosses.dummy
scoreboard players operation @s yadventures-bosses.charge_y -= #y yadventures-bosses.dummy
scoreboard players operation @s yadventures-bosses.charge_z -= #z yadventures-bosses.dummy
''')
fn('yadventures-bosses:wildfire/charge/dash', '''
execute store result entity @s Motion[0] double 0.0012 run scoreboard players get @s yadventures-bosses.charge_x
execute store result entity @s Motion[1] double 0.0012 run scoreboard players get @s yadventures-bosses.charge_y
execute store result entity @s Motion[2] double 0.0012 run scoreboard players get @s yadventures-bosses.charge_z
particle minecraft:flame ~ ~1.4 ~ 0.4 0.6 0.4 0.02 10
scoreboard players set #hit yadventures-bosses.dummy 0
execute positioned ~ ~1.4 ~ as @e[distance=..2.2,type=!#yadventures-bosses:wildfire_allies,tag=!yadventures-bosses.wildfire_part] if data entity @s Health run function yadventures-bosses:wildfire/charge/hit
execute if score #hit yadventures-bosses.dummy matches 1 run function yadventures-bosses:wildfire/charge/end
''')
fn('yadventures-bosses:wildfire/charge/hit', '''
damage @s 10 minecraft:mob_attack by @n[type=minecraft:blaze,tag=yadventures-bosses.this]
scoreboard players set #hit yadventures-bosses.dummy 1
''')
fn('yadventures-bosses:wildfire/charge/end', '''
data modify entity @s Motion set value [0d,0d,0d]
execute if score #hit yadventures-bosses.dummy matches 1 run playsound minecraft:entity.generic.explode hostile @a ~ ~ ~ 0.6 1.6
function yadventures-bosses:wildfire/attack_end
''')

# ---- summon blazes
fn('yadventures-bosses:wildfire/count_blazes', '''
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
scoreboard players set #count yadventures-bosses.dummy 0
execute as @e[type=minecraft:blaze,tag=yadventures-bosses.wildfire_blaze,distance=..64] if score @s yadventures-bosses.id = #id yadventures-bosses.dummy run scoreboard players add #count yadventures-bosses.dummy 1
''')
fn('yadventures-bosses:wildfire/summon_blazes', '''
# Only called while none of its blazes are alive: 1-2 new ones
playsound yadventures-bosses:entity.wildfire.summon_blaze hostile @a ~ ~ ~ 1 1
function yadventures-bosses:wildfire/summon_blaze
execute if predicate yadventures-bosses:chance/half run function yadventures-bosses:wildfire/summon_blaze
function yadventures-bosses:wildfire/attack_end
''')
fn('yadventures-bosses:wildfire/summon_blaze', '''
execute store result storage yadventures-bosses:data blaze.x int 1 run random value -2..2
execute store result storage yadventures-bosses:data blaze.z int 1 run random value -2..2
function yadventures-bosses:wildfire/summon_blaze_at with storage yadventures-bosses:data blaze
''')
fn('yadventures-bosses:wildfire/summon_blaze_at', '''
$summon minecraft:blaze ~$(x) ~1 ~$(z) {Tags:["yadventures-bosses.wildfire_blaze","yadventures-bosses.new"]}
$particle minecraft:flame ~$(x) ~1.5 ~$(z) 0.3 0.6 0.3 0.05 20
execute as @e[type=minecraft:blaze,tag=yadventures-bosses.new,distance=..6] run function yadventures-bosses:wildfire/init_blaze
''')
fn('yadventures-bosses:wildfire/init_blaze', '''
tag @s remove yadventures-bosses.new
scoreboard players operation @s yadventures-bosses.id = #id yadventures-bosses.dummy
''')

# ============================================================ trial spawners, keys and vaults
# Each boss structure gets a trial spawner (normal + ominous config) and a normal + ominous vault.
# The spawner spawns a bare mob tagged yadventures-bosses.convert, which the tick turns into the boss in
# place (the spawner tracks it by UUID). Beating it ejects a boss key per player, which opens the vault.
BOSS_ENTITY = {'iceologer': 'minecraft:wandering_trader', 'illusioner': 'minecraft:illusioner', 'wildfire': 'minecraft:blaze'}
BOSS_NAME = {'iceologer': 'Iceologer', 'illusioner': 'Illusioner', 'wildfire': 'Wildfire'}
SPAWN_RANGE = {'iceologer': 2, 'illusioner': 3, 'wildfire': 4}


def boss_nbt(boss, ominous, spawner):
    nbt = {'id': BOSS_ENTITY[boss], 'Tags': ['yadventures-bosses.convert', f'yadventures-bosses.convert.{boss}']
           + (['yadventures-bosses.ominous'] if ominous else []) + (['yadventures-bosses.from_spawner'] if spawner else [])}
    if boss != 'illusioner':  # hide the wandering trader / blaze until it's converted
        nbt['Silent'] = True
        nbt['active_effects'] = [{'id': 'minecraft:invisibility', 'duration': -1, 'show_particles': False}]
    return nbt


def snbt(obj):
    # JSON is valid SNBT here (quoted keys, true/false are bytes)
    return json.dumps(obj, separators=(',', ':'))


def key_components(boss, ominous):
    prefix = 'ominous_' if ominous else ''
    return {
        'minecraft:item_name': {'translate': f'item.yadventures-bosses.{prefix}{boss}_key'},
        'minecraft:lore': [{'translate': f'item.yadventures-bosses.{boss}_key.tooltip', **GRAY}],
        'minecraft:custom_data': {'yadventures-bosses': {'key': boss, 'ominous': ominous}},
    }


fn('yadventures-bosses:convert/run', '''
tag @s remove yadventures-bosses.convert
tag @s add yadventures-bosses.converting
execute if entity @s[tag=yadventures-bosses.convert.iceologer] run function yadventures-bosses:convert/iceologer
execute if entity @s[tag=yadventures-bosses.convert.illusioner] run function yadventures-bosses:convert/illusioner
execute if entity @s[tag=yadventures-bosses.convert.wildfire] run function yadventures-bosses:convert/wildfire
# Health: x1.5 when ominous, then x0.5 on easy and x1.5 on hard
execute store result score #difficulty yadventures-bosses.dummy run difficulty
attribute @s[tag=yadventures-bosses.ominous] minecraft:max_health modifier add yadventures-bosses:ominous 0.5 add_multiplied_total
execute if score #difficulty yadventures-bosses.dummy matches 1 run attribute @s minecraft:max_health modifier add yadventures-bosses:difficulty -0.5 add_multiplied_total
execute if score #difficulty yadventures-bosses.dummy matches 3 run attribute @s minecraft:max_health modifier add yadventures-bosses:difficulty 0.5 add_multiplied_total
execute store result entity @s Health float 1 run attribute @s minecraft:max_health get
# A Wildfire shield breaks after absorbing a quarter of the max health
execute if entity @s[tag=yadventures-bosses.wildfire] store result score @s yadventures-bosses.shield_hp run attribute @s minecraft:max_health get 25
execute if entity @s[tag=yadventures-bosses.from_spawner] run function yadventures-bosses:spawner/set_home
execute if entity @s[tag=yadventures-bosses.from_spawner] align xyz positioned ~0.5 ~0.5 ~0.5 run function yadventures-bosses:spawner/find
tag @s remove yadventures-bosses.converting
''')
fn('yadventures-bosses:convert/illusioner', f'''
data merge entity @s {{PersistenceRequired:1b,{NO_DROPS}}}
item replace entity @s weapon.mainhand with minecraft:bow
attribute @s minecraft:max_health base set 48
''')
for boss in BOSS_ENTITY:
    for ominous in (False, True):
        nbt = boss_nbt(boss, ominous, False)
        entity = nbt.pop('id')
        fn(f'yadventures-bosses:commands/summon/{"ominous_" if ominous else ""}{boss}', f'''
# Summons {"an ominous" if ominous else "a"} {BOSS_NAME[boss]} (not bound to a trial spawner)
summon {entity} ~ ~ ~ {snbt(nbt)}
execute as @e[type={entity},tag=yadventures-bosses.convert,distance=..1] at @s run function yadventures-bosses:convert/run
''')

# ---- leash: bosses that wander 47+ blocks from their spawner count as defeated, so they're brought back
fn('yadventures-bosses:spawner/set_home', '''
tag @s add yadventures-bosses.leashed
execute store result score @s yadventures-bosses.home_x run data get entity @s Pos[0]
execute store result score @s yadventures-bosses.home_y run data get entity @s Pos[1]
execute store result score @s yadventures-bosses.home_z run data get entity @s Pos[2]
''')
fn('yadventures-bosses:spawner/leash', '''
execute store result storage yadventures-bosses:data home.x int 1 run scoreboard players get @s yadventures-bosses.home_x
execute store result storage yadventures-bosses:data home.y int 1 run scoreboard players get @s yadventures-bosses.home_y
execute store result storage yadventures-bosses:data home.z int 1 run scoreboard players get @s yadventures-bosses.home_z
function yadventures-bosses:spawner/leash_check with storage yadventures-bosses:data home
''')
fn('yadventures-bosses:spawner/leash_check', '''
$execute if entity @s[x=$(x),y=$(y),z=$(z),distance=..32] run return fail
execute at @s run particle minecraft:poof ~ ~1 ~ 0.3 0.6 0.3 0.02 15
$tp @s $(x) $(y) $(z)
execute at @s run particle minecraft:poof ~ ~1 ~ 0.3 0.6 0.3 0.02 15
''')

# ---- once per player per difficulty. Each spawner gets a marker (with a yadventures-bosses.id) when it
# first spawns its boss. Players near it when it's beaten get yadventures-bosses.beat.<id>.<normal|ominous>.
# While only players who already beat the difficulty they'd start (ominous with Bad/Trial Omen) are around,
# the spawner is locked: an ominous spawner in cooldown doesn't look for players at all, so the lock is
# the cooldown + ominous block state with a cooldown that never ends. Unlocking ends the cooldown, which
# resets the spawner (not ominous, waiting for players). The vanilla cooldown is only 1 minute.
SPAWNER_COOLDOWN = 1200
dj('yadventures-bosses', 'predicate/has_omen', {'type': 'minecraft:any_of', 'terms': [
    {'type': 'minecraft:entity_properties', 'entity': 'this', 'predicate': {'effects': {e: {}}}}
    for e in ('minecraft:bad_omen', 'minecraft:trial_omen')]})
# The boss spawned within SPAWN_RANGE blocks of its spawner horizontally, and -1..1 vertically
offsets = sorted(((x, y, z) for x in range(-4, 5) for y in (-1, 0, 1) for z in range(-4, 5)),
                 key=lambda o: o[0] ** 2 + o[1] ** 2 + o[2] ** 2)
fn('yadventures-bosses:spawner/find', '# Registers the trial spawner that spawned @s\n' + '\n'.join(
    f'execute positioned {" ".join("~" + (str(v) if v else "") for v in (x, y, z))} if block ~ ~ ~ minecraft:trial_spawner run return run function yadventures-bosses:spawner/register'
    for x, y, z in offsets))
fn('yadventures-bosses:spawner/register', f'''
execute if entity @e[type=minecraft:marker,tag=yadventures-bosses.spawner,distance=..0.1] run return 1
summon minecraft:marker ~ ~ ~ {{Tags:["yadventures-bosses.spawner"]}}
scoreboard players add #next yadventures-bosses.id 1
scoreboard players operation @n[type=minecraft:marker,tag=yadventures-bosses.spawner,distance=..0.1] yadventures-bosses.id = #next yadventures-bosses.id
data modify block ~ ~ ~ target_cooldown_length set value {SPAWNER_COOLDOWN}
''')
fn('yadventures-bosses:spawner/tick', '''
execute unless block ~ ~ ~ minecraft:trial_spawner run return run kill @s
execute store result storage yadventures-bosses:data spawner.id int 1 run scoreboard players get @s yadventures-bosses.id
execute if block ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=waiting_for_reward_ejection] run function yadventures-bosses:spawner/beaten with storage yadventures-bosses:data spawner
function yadventures-bosses:spawner/tag_eligible with storage yadventures-bosses:data spawner
execute if entity @s[tag=yadventures-bosses.locked] if entity @a[tag=yadventures-bosses.eligible] run function yadventures-bosses:spawner/unlock
execute if entity @s[tag=yadventures-bosses.locked] unless entity @a[gamemode=!creative,gamemode=!spectator,distance=..32] run function yadventures-bosses:spawner/unlock
execute if entity @s[tag=!yadventures-bosses.locked] unless entity @a[tag=yadventures-bosses.eligible] if entity @a[gamemode=!creative,gamemode=!spectator,distance=..20] run function yadventures-bosses:spawner/try_lock
tag @a[tag=yadventures-bosses.eligible] remove yadventures-bosses.eligible
''')
fn('yadventures-bosses:spawner/beaten', '''
$execute if block ~ ~ ~ minecraft:trial_spawner[ominous=false] run tag @a[gamemode=!creative,gamemode=!spectator,distance=..48] add yadventures-bosses.beat.$(id).normal
$execute if block ~ ~ ~ minecraft:trial_spawner[ominous=true] run tag @a[gamemode=!creative,gamemode=!spectator,distance=..48] add yadventures-bosses.beat.$(id).ominous
''')
fn('yadventures-bosses:spawner/tag_eligible', '''
# Players close enough to be detected soon, who haven't beaten the difficulty they'd start
$tag @a[gamemode=!creative,gamemode=!spectator,distance=..20,tag=!yadventures-bosses.beat.$(id).normal,predicate=!yadventures-bosses:has_omen] add yadventures-bosses.eligible
$tag @a[gamemode=!creative,gamemode=!spectator,distance=..20,tag=!yadventures-bosses.beat.$(id).ominous,predicate=yadventures-bosses:has_omen] add yadventures-bosses.eligible
''')
fn('yadventures-bosses:spawner/try_lock', '''
# Never during a fight or its reward
execute unless block ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=inactive] unless block ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=waiting_for_players] unless block ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=cooldown] run return fail
tag @s add yadventures-bosses.locked
setblock ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=cooldown,ominous=true]
data modify block ~ ~ ~ cooldown_ends_at set value 9000000000000000000L
''')
fn('yadventures-bosses:spawner/unlock', '''
tag @s remove yadventures-bosses.locked
setblock ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=cooldown,ominous=false]
data modify block ~ ~ ~ cooldown_ends_at set value 0L
''')

dj('yadventures-bosses', 'loot_table/spawner/nothing', {'pools': []})
dj('yadventures-bosses', 'tags/block/vault_replaceable', {'values': [
    '#yadventures-bosses:passable', '#minecraft:wool_carpets', 'minecraft:moss_carpet', 'minecraft:pale_moss_carpet']})

for boss in BOSS_ENTITY:
    for ominous in (False, True):
        kind = 'ominous' if ominous else 'normal'
        prefix = 'ominous_' if ominous else ''
        dj('yadventures-bosses', f'trial_spawner/{boss}/{kind}', {
            'spawn_range': SPAWN_RANGE[boss], 'total_mobs': 1, 'simultaneous_mobs': 1,
            'total_mobs_added_per_player': 0, 'simultaneous_mobs_added_per_player': 0, 'ticks_between_spawn': 20,
            'spawn_potentials': [{'weight': 1, 'data': {'entity': boss_nbt(boss, ominous, True)}}],
            'loot_tables_to_eject': [{'weight': 1, 'data': f'yadventures-bosses:spawner/{boss}/{prefix}key'}],
            'items_to_drop_when_ominous': 'yadventures-bosses:spawner/nothing'})
        dj('yadventures-bosses', f'loot_table/spawner/{boss}/{prefix}key', {'pools': [{'rolls': 1, 'entries': [
            {'type': 'minecraft:item', 'name': f'minecraft:{prefix}trial_key',
             'modifier': [{'type': 'minecraft:set_components', 'components': key_components(boss, ominous)}]}]}]})


# ---- vault loot (each player can open each vault once)
def it(name, lo=1, hi=1, w=1, mods=()):
    e = {'type': 'minecraft:item', 'name': f'minecraft:{name}', 'weight': w}
    m = ([count(lo, hi)] if (lo, hi) != (1, 1) else []) + list(mods)
    if m:
        e['modifier'] = m
    return e


def book(*enchantments, w=1):
    return it('book', w=w, mods=[{'type': 'minecraft:enchant_randomly', 'options': [f'minecraft:{e}' for e in enchantments]}])


def enchanted(name, w=1):
    return it(name, w=w, mods=[{'type': 'minecraft:enchant_with_levels', 'levels': {'type': 'minecraft:uniform', 'min': 20, 'max': 30}}])


def potion(name, p, lo=1, hi=1, w=1):
    return it(name, lo, hi, w, [{'type': 'minecraft:set_potion', 'id': f'minecraft:{p}'}])


def custom(name, lo=1, hi=1, w=1):
    return {**item_entry(name, [count(lo, hi)] if (lo, hi) != (1, 1) else []), 'weight': w}


def pool(rolls, entries):
    return {'rolls': rolls if isinstance(rolls, int) else {'type': 'minecraft:uniform', 'min': rolls[0], 'max': rolls[1]}, 'entries': entries}


VAULT_LOOT = {  # signature: guaranteed in both vaults
    'iceologer': {
        'signature': [custom('totem_of_freezing')],
        'rare': [book('frost_walker', w=2), it('diamond', 1, 2, 3), enchanted('diamond_boots')],
        'common': [it('emerald', 2, 5, 3), it('blue_ice', 2, 4, 2), it('packed_ice', 4, 8, 2), it('snowball', 8, 16, 2),
                   it('powder_snow_bucket'), it('golden_carrot', 2, 4, 2), it('golden_apple')],
        'ominous': [book('frost_walker', w=2), it('diamond', 2, 4, 3), enchanted('diamond_boots', 2),
                    it('enchanted_golden_apple')],
    },
    'illusioner': {
        'signature': [custom('totem_of_illusion')],
        'rare': [enchanted('bow', 2), book('power', 'infinity', 'punch', 'flame', w=2), it('diamond', 1, 2, 3)],
        'common': [it('emerald', 2, 5, 3), it('arrow', 8, 16, 2), it('spectral_arrow', 4, 8, 2), potion('tipped_arrow', 'slowness', 4, 8),
                   potion('potion', 'long_invisibility'), potion('potion', 'long_night_vision'), it('golden_carrot', 2, 4, 2), it('golden_apple')],
        'ominous': [enchanted('bow', 3), enchanted('crossbow'), it('diamond', 2, 4, 3),
                    it('enchanted_golden_apple')],
    },
    'wildfire': {
        'signature': [custom('wildfire_crown_fragment', 3, 5)],
        'rare': [custom('wildfire_crown_upgrade_smithing_template'), it('netherite_scrap', w=2),
                 book('fire_protection', 'fire_aspect', 'flame', w=2), it('diamond', 1, 3, 3)],
        'common': [it('blaze_rod', 2, 4, 3), it('fire_charge', 3, 6, 2), it('magma_cream', 2, 4, 2), it('gold_ingot', 3, 6, 2),
                   it('emerald', 2, 5, 2), it('golden_apple')],
        'ominous': [custom('wildfire_crown_upgrade_smithing_template', w=2), it('netherite_scrap', 1, 2, 2), it('ancient_debris', w=2),
                    it('diamond', 2, 4, 2), it('enchanted_golden_apple')],
    },
}
for boss, loot in VAULT_LOOT.items():
    dj('yadventures-bosses', f'loot_table/spawner/{boss}/vault', {'pools': [
        pool(1, loot['signature']), pool(1, loot['rare']), pool((2, 4), loot['common'])]})
    dj('yadventures-bosses', f'loot_table/spawner/{boss}/ominous_vault', {'pools': [
        pool(1, loot['signature']), pool(1, loot['ominous']), pool(1, loot['rare']), pool((3, 5), loot['common'])]})

# Trial spawners and vaults (hardness 50, no drops) can be removed with a pickaxe (vanilla ones too). A player
# aiming at one with a pickaxe gets block_break_speed x0.147: ~15 s with a diamond Efficiency V pickaxe
# (instead of 2.2 s), ~64 s with a plain diamond one
TRIAL_BREAK_SPEED = -0.853
dj('minecraft', 'tags/block/mineable/pickaxe', {'values': ['minecraft:trial_spawner', 'minecraft:vault']})
dj('yadventures-bosses', 'tags/block/trial_blocks', {'values': ['minecraft:trial_spawner', 'minecraft:vault']})
# Blocks the mining ray goes through (the game's block outline raycast ignores fluids)
dj('yadventures-bosses', 'tags/block/ray_through', {'values': [
    '#minecraft:air', 'minecraft:water', 'minecraft:lava', 'minecraft:bubble_column']})
fn('yadventures-bosses:mining/tick', f'''
execute as @a[gamemode=survival] if items entity @s weapon.mainhand #minecraft:pickaxes at @s anchored eyes positioned ^ ^ ^ if function yadventures-bosses:mining/aim run tag @s add yadventures-bosses.aiming_trial_block
execute as @a[tag=yadventures-bosses.aiming_trial_block,tag=!yadventures-bosses.slow_mining] run attribute @s minecraft:block_break_speed modifier add yadventures-bosses:trial_block {TRIAL_BREAK_SPEED} add_multiplied_total
tag @a[tag=yadventures-bosses.aiming_trial_block] add yadventures-bosses.slow_mining
execute as @a[tag=!yadventures-bosses.aiming_trial_block,tag=yadventures-bosses.slow_mining] run attribute @s minecraft:block_break_speed modifier remove yadventures-bosses:trial_block
tag @a[tag=!yadventures-bosses.aiming_trial_block] remove yadventures-bosses.slow_mining
tag @a remove yadventures-bosses.aiming_trial_block
''')
fn('yadventures-bosses:mining/aim', '''
# Steps of 0.1 block, up to the player's block interaction range
execute store result score #steps yadventures-bosses.dummy run attribute @s minecraft:block_interaction_range get 10
return run function yadventures-bosses:mining/ray
''')
fn('yadventures-bosses:mining/ray', '''
execute if block ~ ~ ~ #yadventures-bosses:trial_blocks run return 1
execute unless block ~ ~ ~ #yadventures-bosses:ray_through run return 0
scoreboard players remove #steps yadventures-bosses.dummy 1
execute if score #steps yadventures-bosses.dummy matches ..0 run return 0
execute positioned ^ ^ ^0.1 run return run function yadventures-bosses:mining/ray
''')

# ---- structure setup: the spawner stands on the floor at the marker, with a vault on each side of it
# (lined up with the structure, via the marker yaw, when both spots are free), all facing open space
def free(x, z):
    return (f'if block ~{x} ~ ~{z} #yadventures-bosses:vault_replaceable if block ~{x} ~1 ~{z} #yadventures-bosses:passable '
            f'unless block ~{x} ~-1 ~{z} #yadventures-bosses:passable').replace('~0', '~')


def rel(x, z):
    return f'~{x or ""} ~ ~{z or ""}'


def vault_config(boss, ominous):
    prefix = 'ominous_' if ominous else ''
    return {'loot_table': f'yadventures-bosses:spawner/{boss}/{prefix}vault',
            'key_item': {'id': f'minecraft:{prefix}trial_key', 'count': 1, 'components': key_components(boss, ominous)}}


def vault_block(boss, ominous, facing):
    return f'minecraft:vault[facing={facing},ominous={str(ominous).lower()}]{snbt({"config": vault_config(boss, ominous)})}'


# axis: vault offsets (a = normal, b = ominous) and the two directions they can face
VAULT_ROWS = {'z': ((0, -1), (0, 1), (('west', -1, 0), ('east', 1, 0))),
              'x': ((-1, 0), (1, 0), (('north', 0, -1), ('south', 0, 1)))}
for boss in BOSS_ENTITY:
    d = f'yadventures-bosses:spawner/setup/{boss}'
    fn(d, f'''
execute positioned ~ ~-1 ~ run setblock ~ ~ ~ minecraft:trial_spawner{{normal_config:"yadventures-bosses:{boss}/normal",ominous_config:"yadventures-bosses:{boss}/ominous",target_cooldown_length:{SPAWNER_COOLDOWN}}}
execute store result score #yaw yadventures-bosses.dummy run data get entity @s Rotation[0]
scoreboard players operation #yaw yadventures-bosses.dummy %= #180 yadventures-bosses.dummy
scoreboard players set #placed yadventures-bosses.dummy 0
execute if score #yaw yadventures-bosses.dummy matches 45..134 positioned ~ ~-1 ~ run function {d}/vaults_x
execute if score #placed yadventures-bosses.dummy matches 0 positioned ~ ~-1 ~ run function {d}/vaults_z
execute if score #placed yadventures-bosses.dummy matches 0 positioned ~ ~-1 ~ run function {d}/vaults_x
execute if score #placed yadventures-bosses.dummy matches 0 positioned ~ ~-1 ~ run function {d}/place_z
''')
    for axis, ((ax, az), (bx, bz), faces) in VAULT_ROWS.items():
        fn(f'{d}/vaults_{axis}', f'''
execute {free(ax, az)} {free(bx, bz)} run return run function {d}/place_{axis}
''')
        (f1, dx1, dz1), (f2, _, _) = faces
        fn(f'{d}/place_{axis}', f'''
scoreboard players set #placed yadventures-bosses.dummy 1
execute if block {rel(ax + dx1, az + dz1)} #yadventures-bosses:passable if block {rel(bx + dx1, bz + dz1)} #yadventures-bosses:passable run return run function {d}/place_{axis}_{f1}
function {d}/place_{axis}_{f2}
''')
        for f, _, _ in faces:
            fn(f'{d}/place_{axis}_{f}', f'''
setblock {rel(ax, az)} {vault_block(boss, False, f)}
setblock {rel(bx, bz)} {vault_block(boss, True, f)}
''')

def item_components(components):
    return '[' + ','.join(f'{k}={snbt(v)}' for k, v in components.items()) + ']'


# ---- give: a configured spawner and vaults, to place by hand (e.g. when editing a structure; a boss spawner
# without a setup marker registers itself when it first spawns its boss). Needs creative + operator.
for boss in BOSS_ENTITY:
    spawner = {'minecraft:block_entity_data': {'id': 'minecraft:trial_spawner',
               'normal_config': f'yadventures-bosses:{boss}/normal', 'ominous_config': f'yadventures-bosses:{boss}/ominous',
               'target_cooldown_length': SPAWNER_COOLDOWN},
               'minecraft:item_name': f'{BOSS_NAME[boss]} Trial Spawner'}
    lines = [f'give @s minecraft:trial_spawner{item_components(spawner)}']
    for ominous in (False, True):
        vault = {'minecraft:block_entity_data': {'id': 'minecraft:vault', 'config': vault_config(boss, ominous)},
                 'minecraft:block_state': {'ominous': str(ominous).lower()},
                 'minecraft:item_name': f'{BOSS_NAME[boss]} {"Ominous " if ominous else ""}Vault'}
        lines.append(f'give @s minecraft:vault{item_components(vault)}')
    fn(f'yadventures-bosses:commands/give/{boss}_trial_blocks', '\n'.join(lines))

KEY_LANG = {}
for boss, name in BOSS_NAME.items():
    KEY_LANG[f'item.yadventures-bosses.{boss}_key'] = f'{name} Key'
    KEY_LANG[f'item.yadventures-bosses.ominous_{boss}_key'] = f'Ominous {name} Key'
    KEY_LANG[f'item.yadventures-bosses.{boss}_key.tooltip'] = f'Opens a vault at the {name}\'s lair'

# ============================================================ explorer maps
# Vanilla map decorations are a fixed registry: the maps use the unused marker types, retextured in the
# resource pack (target_x, target_point, blue_marker)
MAPS = {  # name: (structures, decoration, item name)
    'citadel': (['yadventures-bosses:citadel'], 'minecraft:target_x', 'Citadel Explorer Map'),
    'iceologer': (['yadventures-bosses:iceologer_cabin'], 'minecraft:target_point', 'Iceologer Explorer Map'),
    'illusioner': (['yadventures-bosses:illusioner_shack', 'yadventures-bosses:illusioner_training_grounds'],
                   'minecraft:blue_marker', 'Illusioner Explorer Map'),
}
def map_modifiers(m, search_radius=50):
    return [
        {'type': 'minecraft:set_components', 'components': {
            'minecraft:item_name': {'translate': f'item.yadventures-bosses.{m}_map'},
            'minecraft:item_model': f'yadventures-bosses:{m}_map'}},
        {'type': 'minecraft:exploration_map', 'decoration': MAPS[m][1],
         'destination': f'#yadventures-bosses:on_{m}_maps', 'search_radius': search_radius},
        # no structure within range: no map (vanilla does the same)
        {'type': 'minecraft:filtered', 'item_filter': {'predicates': {'minecraft:map_id': {}}},
         'on_fail': {'type': 'minecraft:discard'}}]


for m, (structures, decoration, name) in MAPS.items():
    dj('yadventures-bosses', f'tags/worldgen/structure/on_{m}_maps', {'values': structures})
    dj('yadventures-bosses', f'loot_table/maps/{m}', {'pools': [pool(1, [{
        'type': 'minecraft:item', 'name': 'minecraft:filled_map', 'modifier': map_modifiers(m)}])]})
    fn(f'yadventures-bosses:give/{m}_map', f'loot give @s loot yadventures-bosses:maps/{m}')
    KEY_LANG[f'item.yadventures-bosses.{m}_map'] = name

# Datapacks can't inject into vanilla loot tables: these are the vanilla 26.3 tables plus one pool each
MAP_CHESTS = {  # vanilla table: (map, chance)
    'chests/bastion_treasure': ('citadel', 0.5),
    'chests/bastion_other': ('citadel', 0.1),
    'chests/woodland_mansion': ('illusioner', 0.1),
}
for table, (m, chance) in MAP_CHESTS.items():
    t = json.load(open(f'{VENDOR}/loot_table/{table}.json'))
    t['pools'].append({'rolls': 1, 'condition': {'type': 'minecraft:random_chance', 'chance': chance},
                       'entries': [{'type': 'minecraft:loot_table', 'value': f'yadventures-bosses:maps/{m}'}]})
    dj('minecraft', f'loot_table/{table}', t)

# Snowy cartographers sell the Iceologer map at journeyman level, next to the monument and trial chambers
# maps (vanilla offers 2 of that level's trades)
dj('yadventures-bosses', 'villager_trade/cartographer/emerald_and_compass_iceologer_map', {
    'wants': {'id': 'minecraft:emerald', 'count': 13},
    'additional_wants': {'id': 'minecraft:compass'},
    'gives': {'id': 'minecraft:filled_map'},
    'given_item_modifier': map_modifiers('iceologer', 100),
    'merchant_predicate': {'type': 'minecraft:entity_properties', 'entity': 'this',
                           'predicate': {'minecraft:predicates': {'minecraft:villager/variant': ['minecraft:snow']}}},
    'max_uses': 12, 'reputation_discount': 0.2, 'xp': 10})
dj('minecraft', 'tags/villager_trade/cartographer/level_3', {
    'values': ['yadventures-bosses:cartographer/emerald_and_compass_iceologer_map']})

# ============================================================ resource pack
# Textures and sounds live directly
# in the resource pack; only models, item definitions, equipment and lang are generated here.
for t in ('totem_of_freezing', 'totem_of_illusion', 'wildfire_crown_fragment', 'wildfire_crown_upgrade_smithing_template',
          *(f'{m}_map' for m in MAPS)):
    wjson(f'{RP}/yadventures-bosses/models/item/{t}.json', {'parent': 'minecraft:item/generated', 'textures': {'layer0': f'yadventures-bosses:item/{t}'}})
    wjson(f'{RP}/yadventures-bosses/items/{t}.json', {'model': {'type': 'minecraft:model', 'model': f'yadventures-bosses:item/{t}'}})
# Crowned netherite helmet: the netherite equipment asset plus the crown layer (trims still render on top),
# and the vanilla item model (with its trim variants) plus a crown overlay
eq = json.load(open(f'{VENDOR}/netherite_equipment.json'))
eq['layers']['humanoid'].append({'texture': 'yadventures-bosses:wildfire_crown'})
wjson(f'{RP}/yadventures-bosses/equipment/wildfire_crown_netherite.json', eq)
wjson(f'{RP}/yadventures-bosses/models/item/wildfire_crown_overlay.json', {'parent': 'minecraft:item/generated', 'textures': {'layer0': 'yadventures-bosses:item/wildfire_crown_overlay'}})
wjson(f'{RP}/yadventures-bosses/items/wildfire_crown_netherite_helmet.json', {'model': {'type': 'minecraft:composite', 'models': [
    json.load(open(f'{VENDOR}/netherite_helmet_model.json')),
    {'type': 'minecraft:model', 'model': 'yadventures-bosses:item/wildfire_crown_overlay'}]}})

wjson(f'{RP}/minecraft/atlases/blocks.json', {'sources': [{'type': 'directory', 'source': 'yadventures-bosses_entity', 'prefix': 'entity/'}]})


def cube(frm, to, uv, size, rotation=None):
    u, v = uv
    w, h, dd = size

    def r(u1, v1, u2, v2):
        return [u1 / 4, v1 / 4, u2 / 4, v2 / 4]
    e = {'from': frm, 'to': to, 'faces': {
        'north': {'uv': r(u + dd, v + dd, u + dd + w, v + dd + h), 'texture': '#0'},
        'east': {'uv': r(u, v + dd, u + dd, v + dd + h), 'texture': '#0'},
        'south': {'uv': r(u + 2 * dd + w, v + dd, u + 2 * dd + 2 * w, v + dd + h), 'texture': '#0'},
        'west': {'uv': r(u + dd + w, v + dd, u + 2 * dd + w, v + dd + h), 'texture': '#0'},
        'up': {'uv': r(u + dd, v, u + dd + w, v + dd), 'rotation': 180, 'texture': '#0'},
        'down': {'uv': r(u + dd + w, v, u + dd + 2 * w, v + dd), 'rotation': 180, 'texture': '#0'},
    }}
    if rotation:
        e['rotation'] = rotation
    return e


TEX = {'0': 'yadventures-bosses:entity/wildfire', 'particle': 'yadventures-bosses:entity/wildfire'}
wjson(f'{RP}/yadventures-bosses/models/wildfire/body.json', {'texture_size': [64, 64], 'textures': TEX, 'elements': [
    cube([6, 0, 6], [10, 21, 10], (0, 0), (4, 21, 4)),
    cube([4, 21, 4], [12, 29, 12], (0, 26), (8, 8, 8)),
    cube([3.8, 20.8, 3.8], [12.2, 30.2, 12.2], (0, 43), (8, 9, 8)),
]})
wjson(f'{RP}/yadventures-bosses/items/wildfire/body.json', {'model': {'type': 'minecraft:model', 'model': 'yadventures-bosses:wildfire/body'}})
for n in range(5):
    if n == 0:
        wjson(f'{RP}/yadventures-bosses/items/wildfire/shields_0.json', {'model': {'type': 'minecraft:empty'}})
        continue
    wjson(f'{RP}/yadventures-bosses/models/wildfire/shields_{n}.json', {'texture_size': [64, 64], 'textures': TEX, 'elements': [
        cube([3, 1.5, -1.5], [13, 18.5, 0.5], (17, 0), (10, 17, 2),
             {'origin': [8, 22, 8], 'x': 15, 'y': -k * 90, 'rescale': False})
        for k in range(n)]})
    wjson(f'{RP}/yadventures-bosses/items/wildfire/shields_{n}.json', {'model': {'type': 'minecraft:model', 'model': f'yadventures-bosses:wildfire/shields_{n}'}})

# Iceologer: the model files in models/iceologer are hand-maintained (rig from Myriad, texture from Friends & Foes).
# Item definitions pick the variant from custom_model_data flags: head [hurt], body [hurt, moving, spellcasting]
def ice_model(path):
    return {'type': 'minecraft:model', 'model': f'yadventures-bosses:iceologer/{path}'}


def if_flag(index, on_true, on_false):
    return {'type': 'minecraft:condition', 'property': 'minecraft:custom_model_data', 'index': index,
            'on_true': on_true, 'on_false': on_false}


def hurt_variant(path):
    return if_flag(0, ice_model(f'{path}/hurt'), ice_model(f'{path}/normal'))


def walking_legs(v):
    # every leg rotation layered; their animated textures show one frame at a time
    return {'type': 'minecraft:composite', 'models': [
        ice_model(f'legs/{side}/{n}/{v}') for side in ('left', 'right') for n in range(-4, 5)]}


wjson(f'{RP}/yadventures-bosses/items/iceologer/head.json', {'model': hurt_variant('head')})
wjson(f'{RP}/yadventures-bosses/items/iceologer/body.json', {'model': {'type': 'minecraft:composite', 'models': [
    hurt_variant('body'),
    if_flag(2, hurt_variant('arms/spellcasting'), hurt_variant('arms/crossed')),
    if_flag(1, if_flag(0, walking_legs('hurt'), walking_legs('normal')), hurt_variant('legs/static')),
]}})

# Ice chunk (Friends & Foes model): three ice blocks and two slabs, 2 x 1 x 2.5 blocks
ICE_TEX = {'0': 'yadventures-bosses:entity/ice_chunk', 'particle': 'yadventures-bosses:entity/ice_chunk'}
wjson(f'{RP}/yadventures-bosses/models/ice_chunk.json', {'texture_size': [64, 64], 'textures': ICE_TEX, 'elements': [
    cube([-8, 0, 4], [8, 16, 20], (0, 0), (16, 16, 16)),
    cube([8, 0, 4], [24, 16, 20], (0, 0), (16, 16, 16)),
    cube([-8, 0, -12], [8, 16, 4], (0, 0), (16, 16, 16)),
    cube([-8, 0, 20], [8, 16, 28], (0, 32), (16, 16, 8)),
    cube([4, 0, -8], [20, 16, 0], (0, 32), (16, 16, 8), {'origin': [12, 8, -4], 'y': 90, 'rescale': False}),
]})
wjson(f'{RP}/yadventures-bosses/items/ice_chunk.json', {'model': {'type': 'minecraft:model', 'model': 'yadventures-bosses:ice_chunk'}})

# Sound events (the .ogg files are hand-maintained)
sounds = json.load(open(f'{RP}/yadventures-bosses/sounds.json'))
for event, files in (('entity.iceologer.ambient', ['ambient1', 'ambient2', 'ambient3']),
                     ('entity.iceologer.cast_spell', ['cast_spell1', 'cast_spell2']),
                     ('entity.iceologer.death', ['death1', 'death2', 'death3']),
                     ('entity.iceologer.hurt', ['hurt1', 'hurt2', 'hurt3']),
                     ('entity.iceologer.prepare_slowness', ['prepare_slowness']),
                     ('entity.iceologer.prepare_summon', ['prepare_summon']),
                     ('entity.ice_chunk.ambient', ['ambient']),
                     ('entity.ice_chunk.hit', ['hit']),
                     ('entity.ice_chunk.summon', ['summon'])):
    folder = event.split('.')[1]
    sounds[event] = {'sounds': [f'yadventures-bosses:entity/{folder}/{f}' for f in files], 'subtitle': f'subtitle.{event.replace(".", ".yadventures-bosses.", 1)}'}
wjson(f'{RP}/yadventures-bosses/sounds.json', sounds)

# subtitles for the sounds in yadventures-bosses/sounds.json
SUBS = {
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

lang = {
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
}
lang.update(SUBS)
lang.update(KEY_LANG)
wjson(f'{RP}/yadventures-bosses/lang/en_us.json', lang)

for path, desc in ((f'{Y}/resourcepack/pack.mcmeta', 'yAdventures bosses: Iceologer, Illusioner & Wildfire assets'),
                   (f'{Y}/datapack/pack.mcmeta', 'yAdventures bosses: Iceologer, Illusioner & Wildfire')):
    d = json.load(open(path))
    d['pack']['description'] = desc
    wjson(path, d)
print('ok')
