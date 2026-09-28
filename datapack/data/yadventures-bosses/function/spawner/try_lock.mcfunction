# Never during a fight or its reward
execute unless block ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=inactive] unless block ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=waiting_for_players] unless block ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=cooldown] run return fail
tag @s add yadventures-bosses.locked
setblock ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=cooldown,ominous=true]
data modify block ~ ~ ~ cooldown_ends_at set value 9000000000000000000L
