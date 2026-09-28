# Height above the target: its height squared, at most 6 blocks (in hundredths)
scoreboard players set #off yadventures-bosses.dummy 324
execute if entity @s[type=#yadventures-bosses:villagers] run scoreboard players set #off yadventures-bosses.dummy 380
execute if entity @s[type=minecraft:iron_golem] run scoreboard players set #off yadventures-bosses.dummy 600
execute if entity @s[type=minecraft:glow_squid] run scoreboard players set #off yadventures-bosses.dummy 64
scoreboard players operation #t yadventures-bosses.dummy = @s yadventures-bosses.uid
summon minecraft:item_display ~ ~ ~ {Tags:["yadventures-bosses.ice_chunk","yadventures-bosses.new"],teleport_duration:1,item:{id:"minecraft:stone",count:1,components:{"minecraft:item_model":"yadventures-bosses:ice_chunk"}},transformation:{translation:[0f,0.5f,0f],left_rotation:[0f,0f,0f,1f],scale:[0f,0f,0f],right_rotation:[0f,0f,0f,1f]}}
execute as @e[type=minecraft:item_display,tag=yadventures-bosses.new,distance=..1] run function yadventures-bosses:ice_chunk/init
