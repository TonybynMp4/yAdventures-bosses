execute if entity @s[tag=yadventures-bosses.spawn_wildfire] run function yadventures-bosses:spawner/setup/wildfire
execute if entity @s[tag=yadventures-bosses.spawn_iceologer] run function yadventures-bosses:spawner/setup/iceologer
execute if entity @s[tag=yadventures-bosses.spawn_illusioner] run function yadventures-bosses:spawner/setup/illusioner
execute if entity @s[tag=yadventures-bosses.setup_brewing_stand] run function yadventures-bosses:setup/brewing_stand
execute if entity @s[tag=yadventures-bosses.citadel_pillar] positioned ~ ~-1 ~ run function yadventures-bosses:setup/pillar
kill @s
