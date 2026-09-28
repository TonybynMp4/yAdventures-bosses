# Summons a Wildfire (not bound to a trial spawner)
summon minecraft:blaze ~ ~ ~ {"Tags":["yadventures-bosses.convert","yadventures-bosses.convert.wildfire"],"Silent":true,"active_effects":[{"id":"minecraft:invisibility","duration":-1,"show_particles":false}]}
execute as @e[type=minecraft:blaze,tag=yadventures-bosses.convert,distance=..1] at @s run function yadventures-bosses:convert/run
