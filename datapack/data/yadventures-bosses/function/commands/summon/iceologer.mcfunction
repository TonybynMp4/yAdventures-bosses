# Summons a Iceologer (not bound to a trial spawner)
summon minecraft:wandering_trader ~ ~ ~ {"Tags":["yadventures-bosses.convert","yadventures-bosses.convert.iceologer"],"Silent":true,"active_effects":[{"id":"minecraft:invisibility","duration":-1,"show_particles":false}]}
execute as @e[type=minecraft:wandering_trader,tag=yadventures-bosses.convert,distance=..1] at @s run function yadventures-bosses:convert/run
