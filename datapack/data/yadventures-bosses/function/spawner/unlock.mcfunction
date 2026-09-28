tag @s remove yadventures-bosses.locked
setblock ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=cooldown,ominous=false]
data modify block ~ ~ ~ cooldown_ends_at set value 0L
