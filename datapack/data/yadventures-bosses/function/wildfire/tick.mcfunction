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
