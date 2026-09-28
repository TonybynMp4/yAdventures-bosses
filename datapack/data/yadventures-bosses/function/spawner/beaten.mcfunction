$execute if block ~ ~ ~ minecraft:trial_spawner[ominous=false] run tag @a[gamemode=!creative,gamemode=!spectator,distance=..48] add yadventures-bosses.beat.$(id).normal
$execute if block ~ ~ ~ minecraft:trial_spawner[ominous=true] run tag @a[gamemode=!creative,gamemode=!spectator,distance=..48] add yadventures-bosses.beat.$(id).ominous
