scoreboard players set @s yadventures-bosses.state 0
execute store result score @s yadventures-bosses.attack_cd run random value 60..100
execute if entity @s[tag=yadventures-bosses.ominous] store result score @s yadventures-bosses.attack_cd run random value 40..70
