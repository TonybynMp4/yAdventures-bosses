execute unless block ~ ~ ~ minecraft:trial_spawner run return run kill @s
execute store result storage yadventures-bosses:data spawner.id int 1 run scoreboard players get @s yadventures-bosses.id
execute if block ~ ~ ~ minecraft:trial_spawner[trial_spawner_state=waiting_for_reward_ejection] run function yadventures-bosses:spawner/beaten with storage yadventures-bosses:data spawner
function yadventures-bosses:spawner/tag_eligible with storage yadventures-bosses:data spawner
execute if entity @s[tag=yadventures-bosses.locked] if entity @a[tag=yadventures-bosses.eligible] run function yadventures-bosses:spawner/unlock
execute if entity @s[tag=yadventures-bosses.locked] unless entity @a[gamemode=!creative,gamemode=!spectator,distance=..32] run function yadventures-bosses:spawner/unlock
execute if entity @s[tag=!yadventures-bosses.locked] unless entity @a[tag=yadventures-bosses.eligible] if entity @a[gamemode=!creative,gamemode=!spectator,distance=..20] run function yadventures-bosses:spawner/try_lock
tag @a[tag=yadventures-bosses.eligible] remove yadventures-bosses.eligible
