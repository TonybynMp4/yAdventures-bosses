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
