# yAdventures bosses: Iceologer, Illusioner, Wildfire
scoreboard objectives add yadventures-bosses.dummy dummy
scoreboard objectives add yadventures-bosses.id dummy
scoreboard objectives add yadventures-bosses.timer dummy
scoreboard objectives add yadventures-bosses.cooldown dummy
scoreboard objectives add yadventures-bosses.health dummy
scoreboard objectives add yadventures-bosses.shields dummy
scoreboard objectives add yadventures-bosses.absorbed dummy
scoreboard objectives add yadventures-bosses.regen dummy
scoreboard objectives add yadventures-bosses.state dummy
scoreboard objectives add yadventures-bosses.attack_cd dummy
scoreboard objectives add yadventures-bosses.charge_x dummy
scoreboard objectives add yadventures-bosses.charge_y dummy
scoreboard objectives add yadventures-bosses.charge_z dummy
scoreboard objectives add yadventures-bosses.fired dummy
scoreboard objectives add yadventures-bosses.decoy dummy
scoreboard objectives add yadventures-bosses.uid dummy
scoreboard objectives add yadventures-bosses.target dummy
scoreboard objectives add yadventures-bosses.hurt dummy
scoreboard objectives add yadventures-bosses.cast dummy
scoreboard objectives add yadventures-bosses.chunk_cd dummy
scoreboard objectives add yadventures-bosses.slow_cd dummy
scoreboard objectives add yadventures-bosses.stray_cd dummy
scoreboard objectives add yadventures-bosses.frozen dummy
scoreboard objectives add yadventures-bosses.age dummy
scoreboard objectives add yadventures-bosses.offset dummy
scoreboard objectives add yadventures-bosses.velocity dummy
scoreboard objectives add yadventures-bosses.shield_hp dummy
scoreboard objectives add yadventures-bosses.home_x dummy
scoreboard objectives add yadventures-bosses.home_y dummy
scoreboard objectives add yadventures-bosses.home_z dummy

scoreboard players set #2 yadventures-bosses.dummy 2
scoreboard players set #8 yadventures-bosses.dummy 8
scoreboard players set #20 yadventures-bosses.dummy 20
scoreboard players set #40 yadventures-bosses.dummy 40
scoreboard players set #180 yadventures-bosses.dummy 180

team add yadventures-bosses.illagers
team modify yadventures-bosses.illagers friendlyFire false

data modify storage yadventures-bosses:data shield_rotation set value [[0.0f,-0.0f,0.0f,1.0f],[0.0f,-0.382683f,0.0f,0.92388f],[0.0f,-0.707107f,0.0f,0.707107f],[0.0f,-0.92388f,0.0f,0.382683f],[0.0f,-1.0f,0.0f,0.0f],[0.0f,-0.92388f,0.0f,-0.382683f],[0.0f,-0.707107f,0.0f,-0.707107f],[0.0f,-0.382683f,0.0f,-0.92388f]]

schedule function yadventures-bosses:second 1s replace
