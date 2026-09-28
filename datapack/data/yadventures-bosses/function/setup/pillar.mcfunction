# Extends the citadel foundations down to the ground
execute unless block ~ ~ ~ #yadventures-bosses:citadel_pillar_replaceable run return 0
setblock ~ ~ ~ minecraft:nether_bricks
execute positioned ~ ~-1 ~ run function yadventures-bosses:setup/pillar
