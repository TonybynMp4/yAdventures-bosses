scoreboard players set #found yadventures-bosses.dummy 1
execute if score #i yadventures-bosses.dummy = #tp yadventures-bosses.dummy run return run function yadventures-bosses:util/ring_teleport
execute if score #mode yadventures-bosses.dummy matches 0 run return run function yadventures-bosses:illusioner/summon_illusion
function yadventures-bosses:totem/summon_illusion
