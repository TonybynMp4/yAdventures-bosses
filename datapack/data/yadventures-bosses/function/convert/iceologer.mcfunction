# An invisible wandering trader wearing item models
data merge entity @s {CustomName:{"translate":"entity.yadventures-bosses.iceologer"},Silent:1b,PersistenceRequired:1b,DespawnDelay:0,DeathLootTable:"yadventures-bosses:entities/iceologer",Offers:{Recipes:[]},active_effects:[{id:"minecraft:invisibility",duration:-1,amplifier:0b,show_particles:0b}],drop_chances:{mainhand:0f,offhand:0f,head:0f,chest:0f,legs:0f,feet:0f},equipment:{head:{id:"minecraft:stone",count:1,components:{"minecraft:item_model":"yadventures-bosses:iceologer/head","minecraft:custom_model_data":{flags:[0b]}}},mainhand:{id:"minecraft:stone",count:1,components:{"minecraft:item_model":"yadventures-bosses:iceologer/body","minecraft:custom_model_data":{flags:[0b,0b,0b]}}},chest:{id:"minecraft:stone",count:1,components:{"minecraft:item_model":"yadventures-bosses:iceologer/body","minecraft:custom_model_data":{flags:[0b,0b,0b]}}}}}
tag @s add yadventures-bosses.iceologer
tag @s add yadventures.boss.iceologer
team join yadventures-bosses.illagers @s
attribute @s minecraft:follow_range base set 18
attribute @s minecraft:max_health base set 36
summon minecraft:marker ~ ~ ~ {Tags:["yadventures-bosses.iceologer_link","yadventures-bosses.new"]}
ride @n[type=minecraft:marker,tag=yadventures-bosses.new,distance=..1] mount @s
tag @e[type=minecraft:marker,tag=yadventures-bosses.new,distance=..1] remove yadventures-bosses.new
function yadventures-bosses:iceologer/init
