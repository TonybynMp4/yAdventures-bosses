# Steps of 0.1 block, up to the player's block interaction range
execute store result score #steps yadventures-bosses.dummy run attribute @s minecraft:block_interaction_range get 10
return run function yadventures-bosses:mining/ray
