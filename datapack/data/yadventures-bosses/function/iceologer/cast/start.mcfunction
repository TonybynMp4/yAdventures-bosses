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
item modify entity @s armor.chest {"type":"minecraft:set_custom_model_data","flags":{"mode":"replace_section","offset":2,"size":1,"values":[true]}}
attribute @s minecraft:movement_speed modifier add yadventures-bosses:casting -1 add_multiplied_total
