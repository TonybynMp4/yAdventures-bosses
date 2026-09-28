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
