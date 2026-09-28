tag @s add yadventures-bosses.dead
playsound yadventures-bosses:entity.iceologer.death hostile @a ~ ~ ~ 1 1
item modify entity @s armor.head {"type":"minecraft:set_custom_model_data","flags":{"mode":"replace_section","offset":0,"size":1,"values":[true]}}
item modify entity @s weapon.mainhand {"type":"minecraft:set_custom_model_data","flags":{"mode":"replace_section","offset":0,"size":3,"values":[true,false,false]}}
execute on attacker if entity @s[type=minecraft:player] run summon minecraft:experience_orb ~ ~ ~ {Value:10s}
