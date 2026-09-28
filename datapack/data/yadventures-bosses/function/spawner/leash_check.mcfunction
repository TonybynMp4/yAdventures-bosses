$execute if entity @s[x=$(x),y=$(y),z=$(z),distance=..32] run return fail
execute at @s run particle minecraft:poof ~ ~1 ~ 0.3 0.6 0.3 0.02 15
$tp @s $(x) $(y) $(z)
execute at @s run particle minecraft:poof ~ ~1 ~ 0.3 0.6 0.3 0.02 15
