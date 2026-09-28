# Accelerates by 0.05 blocks/tick every tick (#steps steps of 0.05), up to 2 blocks/tick
execute if score @s yadventures-bosses.velocity matches ..39 run scoreboard players add @s yadventures-bosses.velocity 1
scoreboard players operation #steps yadventures-bosses.dummy = @s yadventures-bosses.velocity
function yadventures-bosses:ice_chunk/fall_step
