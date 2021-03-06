var roleBuilder = require('role/builder');
var roleUpgrader = require('role/upgrader');
var roleTransporter = require('role/transporter');

var harvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        const source = creep.room.find(FIND_SOURCES)[0];
        let containers = creep.room.find(FIND_STRUCTURES, {
            filter: (i) => {
                return (i.structureType === STRUCTURE_CONTAINER)
            }
        });
        if (creep.memory.harvesting && creep.carry.energy === 0) {
            creep.memory.harvesting = false;
            creep.memory.upgrading = false;
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.harvesting && creep.carry.energy === creep.carryCapacity) {
            creep.memory.harvesting = true;
            creep.memory.upgrading = true;
            creep.memory.building = true;
            creep.say('🚧 Storing');
        }
        if (!creep.memory.harvesting) {
            const energy = creep.pos.findInRange(
              FIND_DROPPED_RESOURCES,
              6
            );
            if (energy.length) {

                if (creep.pickup(energy[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(energy[0], {visualizePathStyle: {stroke: '#ff671a'}});
                }
            } else if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            const extension = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_EXTENSION) &&
                      structure.energy < structure.energyCapacity;
                }
            });

            const spawn = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_SPAWN) &&
                      structure.energy < structure.energyCapacity;
                }
            });
            if (extension.length > 0) {
                if (creep.transfer(extension[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(extension[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if (spawn.length > 0) {
                if (creep.transfer(spawn[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }

            } else {
                const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
                const repairObjects = getRepairObjects(creep);
                const towers = creep.room.find(
                  FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                if (repairObjects.length > 0) {
                    if(creep.repair(repairObjects[0]) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(repairObjects[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        creep.say('repair');
                    }
                } else if (containers.length > 0 && towers.length > 0 && towers[0].energy < 700) {
                    roleTransporter.run(creep);
                } else if (constructionSites.length) {
                    roleBuilder.run(creep, source);
                } else {
                    roleUpgrader.run(creep, source);
                }
            }
        }
    }
};

function getRepairObjects(creep) {
    return creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType === STRUCTURE_ROAD && structure.hits < structure.hitsMax * 0.75) ||
              (structure.structureType === STRUCTURE_CONTAINER && structure.hits < structure.hitsMax);
        }
    });

}

module.exports = harvester;
