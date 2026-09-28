playsound yadventures-bosses:entity.iceologer.cast_spell hostile @a ~ ~ ~ 1 1
scoreboard players operation #id yadventures-bosses.dummy = @s yadventures-bosses.id
execute if score @s yadventures-bosses.state matches 1 as @n[tag=yadventures-bosses.target] at @s run function yadventures-bosses:ice_chunk/summon
execute if score @s yadventures-bosses.state matches 2 as @n[tag=yadventures-bosses.target] at @s run function yadventures-bosses:iceologer/freeze
execute if score @s yadventures-bosses.state matches 3 run function yadventures-bosses:iceologer/strays/summon
