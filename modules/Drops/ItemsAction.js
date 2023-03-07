import { game } from '../../app.js';
import { Airstrike } from '../Lasers/Friendly/Airstrike.js';
import { BlueLaser } from '../Lasers/Friendly/BlueLaser.js';
import { Dart } from '../Lasers/Friendly/Dart.js';
import { Debris } from '../Lasers/Friendly/Debris.js';
import { Drone } from '../Lasers/Friendly/Drone.js';
import { Rocket } from '../Lasers/Friendly/Rocket.js';
import { Seeker } from '../Lasers/Friendly/Seeker.js';
import { getClosestEnemyTo, randomInRange } from '../Logic/Helpers.js';

export class ItemsActions {
    static addDebris() {
        setInterval(() => {
            if (Debris.count < Debris.maxDebris) {
                game.bluelasers.add(new Debris());
                Debris.count++;
            }
        }, Debris.respawnRate);
    }

    static blowEmp() {
        game.enemies.damageAll(
            randomInRange(2, 6) * game.state.variables.damageMultiplier * game.state.variables.emprate
        );
        game.firelasers.clear();
    }

    static bombAll() {
        game.enemies.damageAll(laser.damage * game.state.variables.bombdamagerate);
    }

    static getGreedMultiplyer() {
        const greedroll = randomInRange(0, 100);
        if (game.state.variables.greed && greedroll < game.state.variables.greedchance) {
            return 2;
        }
        return 1;
    }

    static getWeaponType() {
        const rocketroll = randomInRange(0, 100);
        if (game.state.variables.rocket && rocketroll < game.state.variables.rocketchance) {
            return Rocket;
        } else {
            return BlueLaser;
        }
    }

    static sendAirstrike() {
        const airstrikeroll = randomInRange(0, 100);
        if (
            game.enemies.enemiesOnScreen() &&
            airstrikeroll < game.state.variables.airstrikechance &&
            laser.constructor !== Airstrike &&
            laser.constructor !== Drone
        ) {
            game.enemies.liveEnemies.forEach((enemy, index) => {
                setTimeout(() => {
                    game.bluelasers.add(new Airstrike(enemy));
                }, 100 * index);
            });
        }
    }

    static shootDart() {
        game.bluelasers.add(new Dart());
    }

    static shootDrone() {
        for (let i = 0; i < game.state.variables.dronesnumber; i++) {
            game.bluelasers.add(new Drone());
        }
    }

    static shootSeeker() {
        game.bluelasers.add(new Seeker(getClosestEnemyTo(game.player)));
    }

    static startToxic() {
        game.state.variables.toxic = true;
        setInterval(() => {
            if (game.state.slowmo && game.state.variables.toxic) {
                game.enemies.damageAll(
                    randomInRange(2, 6) * game.state.variables.damageMultiplier * game.state.variables.toxicrate
                );
            }
        }, 500);
    }

    static stunWithDart(enemy) {
        const stunroll = randomInRange(0, 100);
        if (stunroll < game.state.variables.dartsstunchance) {
            enemy.stun();
            enemy.takeDamage(laser.damage * game.state.variables.dartsrate);
        }
    }
}
