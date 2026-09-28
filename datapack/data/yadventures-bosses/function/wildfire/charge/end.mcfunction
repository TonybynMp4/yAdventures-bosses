data modify entity @s Motion set value [0d,0d,0d]
execute if score #hit yadventures-bosses.dummy matches 1 run playsound minecraft:entity.generic.explode hostile @a ~ ~ ~ 0.6 1.6
function yadventures-bosses:wildfire/attack_end
