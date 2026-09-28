execute as @a[gamemode=survival] if items entity @s weapon.mainhand #minecraft:pickaxes at @s anchored eyes positioned ^ ^ ^ if function yadventures-bosses:mining/aim run tag @s add yadventures-bosses.aiming_trial_block
execute as @a[tag=yadventures-bosses.aiming_trial_block,tag=!yadventures-bosses.slow_mining] run attribute @s minecraft:block_break_speed modifier add yadventures-bosses:trial_block -0.853 add_multiplied_total
tag @a[tag=yadventures-bosses.aiming_trial_block] add yadventures-bosses.slow_mining
execute as @a[tag=!yadventures-bosses.aiming_trial_block,tag=yadventures-bosses.slow_mining] run attribute @s minecraft:block_break_speed modifier remove yadventures-bosses:trial_block
tag @a[tag=!yadventures-bosses.aiming_trial_block] remove yadventures-bosses.slow_mining
tag @a remove yadventures-bosses.aiming_trial_block
