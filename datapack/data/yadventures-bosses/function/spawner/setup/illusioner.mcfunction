execute positioned ~ ~-1 ~ run setblock ~ ~ ~ minecraft:trial_spawner{normal_config:"yadventures-bosses:illusioner/normal",ominous_config:"yadventures-bosses:illusioner/ominous",target_cooldown_length:1200}
execute store result score #yaw yadventures-bosses.dummy run data get entity @s Rotation[0]
scoreboard players operation #yaw yadventures-bosses.dummy %= #180 yadventures-bosses.dummy
scoreboard players set #placed yadventures-bosses.dummy 0
execute if score #yaw yadventures-bosses.dummy matches 45..134 positioned ~ ~-1 ~ run function yadventures-bosses:spawner/setup/illusioner/vaults_x
execute if score #placed yadventures-bosses.dummy matches 0 positioned ~ ~-1 ~ run function yadventures-bosses:spawner/setup/illusioner/vaults_z
execute if score #placed yadventures-bosses.dummy matches 0 positioned ~ ~-1 ~ run function yadventures-bosses:spawner/setup/illusioner/vaults_x
execute if score #placed yadventures-bosses.dummy matches 0 positioned ~ ~-1 ~ run function yadventures-bosses:spawner/setup/illusioner/place_z
