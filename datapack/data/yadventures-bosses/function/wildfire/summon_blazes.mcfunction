# Only called while none of its blazes are alive: 1-2 new ones
playsound yadventures-bosses:entity.wildfire.summon_blaze hostile @a ~ ~ ~ 1 1
function yadventures-bosses:wildfire/summon_blaze
execute if predicate yadventures-bosses:chance/half run function yadventures-bosses:wildfire/summon_blaze
function yadventures-bosses:wildfire/attack_end
