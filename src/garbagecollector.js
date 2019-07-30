module.exports = function () {
    for (name in Memory.creeps) {
        if (name === undefined) {
            continue;
        }
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
};