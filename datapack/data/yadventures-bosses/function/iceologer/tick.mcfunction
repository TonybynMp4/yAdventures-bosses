execute if entity @s[tag=yadventures-bosses.dead] if items entity @s weapon.mainhand minecraft:milk_bucket[minecraft:consumable] run item modify entity @s weapon.mainhand [{type:"minecraft:set_components",components:{"minecraft:item_model":"yadventures-bosses:iceologer/body","minecraft:custom_model_data":{flags:[0b,0b,0b]},"!minecraft:consumable":{}}},{"type":"minecraft:set_custom_model_data","flags":{"mode":"replace_section","offset":0,"size":3,"values":[true,false,false]}}]
execute if entity @s[tag=yadventures-bosses.dead] run return fail
execute unless items entity @s weapon.mainhand minecraft:milk_bucket run item replace entity @s weapon.mainhand from entity @s armor.chest
execute if items entity @s weapon.mainhand minecraft:milk_bucket run item modify entity @s weapon.mainhand {type:"minecraft:set_components",components:{"minecraft:item_model":"yadventures-bosses:iceologer/body","minecraft:custom_model_data":{flags:[0b,0b,0b]},"!minecraft:consumable":{}}}
execute if score @s yadventures-bosses.cast matches 1.. if items entity @s weapon.mainhand minecraft:milk_bucket run item modify entity @s weapon.mainhand {"type":"minecraft:set_custom_model_data","flags":{"mode":"replace_section","offset":2,"size":1,"values":[true]}}
item modify entity @s[predicate=yadventures-bosses:moving] weapon.mainhand {"type":"minecraft:set_custom_model_data","flags":{"mode":"replace_section","offset":1,"size":1,"values":[true]}}
execute store result score #hp yadventures-bosses.dummy run data get entity @s Health 100
execute if score #hp yadventures-bosses.dummy matches ..0 run return run function yadventures-bosses:iceologer/death

# Hurt: red tint while HurtTime > 0
execute store result score #hurt yadventures-bosses.dummy run data get entity @s HurtTime
execute if score #hurt yadventures-bosses.dummy > @s yadventures-bosses.hurt run function yadventures-bosses:iceologer/hurt
scoreboard players operation @s yadventures-bosses.hurt = #hurt yadventures-bosses.dummy
execute if score #hurt yadventures-bosses.dummy matches 1.. run item modify entity @s weapon.mainhand {"type":"minecraft:set_custom_model_data","flags":{"mode":"replace_section","offset":0,"size":1,"values":[true]}}
execute if score #hurt yadventures-bosses.dummy matches 1.. run item modify entity @s armor.head {"type":"minecraft:set_custom_model_data","flags":{"mode":"replace_section","offset":0,"size":1,"values":[true]}}
execute if score #hurt yadventures-bosses.dummy matches 0 run item modify entity @s armor.head {"type":"minecraft:set_custom_model_data","flags":{"mode":"replace_section","offset":0,"size":1,"values":[false]}}

execute if score @s yadventures-bosses.cast matches 1.. run function yadventures-bosses:iceologer/cast/tick
