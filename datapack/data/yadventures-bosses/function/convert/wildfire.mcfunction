# A scaled, invisible blaze carrying item display models
data merge entity @s {CustomName:{"translate":"entity.yadventures-bosses.wildfire"},Silent:1b,PersistenceRequired:1b,DeathLootTable:"yadventures-bosses:entities/wildfire",active_effects:[{id:"minecraft:invisibility",duration:-1,amplifier:0b,show_particles:0b}]}
tag @s add yadventures-bosses.wildfire
tag @s add yadventures.boss.wildfire
attribute @s minecraft:scale base set 1.5625
attribute @s minecraft:follow_range base set 32
attribute @s minecraft:movement_speed base set 0.23
attribute @s minecraft:knockback_resistance base set 1
attribute @s minecraft:max_health base set 180
attribute @s minecraft:attack_damage base set 8
attribute @s[tag=yadventures-bosses.ominous] minecraft:attack_damage base set 10
summon minecraft:item_display ~ ~ ~ {Tags:["yadventures-bosses.wildfire_part","yadventures-bosses.wildfire_body","yadventures-bosses.new"],teleport_duration:1,brightness:{sky:15,block:15},item:{id:"minecraft:stone",count:1,components:{"minecraft:item_model":"yadventures-bosses:wildfire/body"}},transformation:{translation:[0f,-2.0625f,0f],left_rotation:[0f,0f,0f,1f],scale:[1.5f,1.5f,1.5f],right_rotation:[0f,0f,0f,1f]}}
summon minecraft:item_display ~ ~ ~ {Tags:["yadventures-bosses.wildfire_part","yadventures-bosses.wildfire_shields","yadventures-bosses.new"],interpolation_duration:20,brightness:{sky:15,block:15},item:{id:"minecraft:stone",count:1,components:{"minecraft:item_model":"yadventures-bosses:wildfire/shields_4"}},transformation:{translation:[0f,-2.0625f,0f],left_rotation:[0f,0f,0f,1f],scale:[1.5f,1.5f,1.5f],right_rotation:[0f,0f,0f,1f]}}
execute as @e[type=minecraft:item_display,tag=yadventures-bosses.new,distance=..1] run ride @s mount @n[type=minecraft:blaze,tag=yadventures-bosses.converting]
tag @e[type=minecraft:item_display,tag=yadventures-bosses.new,distance=..1] remove yadventures-bosses.new
function yadventures-bosses:wildfire/init
