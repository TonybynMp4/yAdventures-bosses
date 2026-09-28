# Summons a Illusioner (not bound to a trial spawner)
summon minecraft:illusioner ~ ~ ~ {"Tags":["yadventures-bosses.convert","yadventures-bosses.convert.illusioner"]}
execute as @e[type=minecraft:illusioner,tag=yadventures-bosses.convert,distance=..1] at @s run function yadventures-bosses:convert/run
