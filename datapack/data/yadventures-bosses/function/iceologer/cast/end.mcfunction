scoreboard players set @s yadventures-bosses.cast 0
item modify entity @s armor.chest {"type":"minecraft:set_custom_model_data","flags":{"mode":"replace_section","offset":2,"size":1,"values":[false]}}
attribute @s minecraft:movement_speed modifier remove yadventures-bosses:casting
