import { game } from '../../app.js';
import { DamageNumber } from '../Effects/Misc/DamageNumber.js';
import { SceneUtils } from './SceneUtils.js';
import { getGametimeToMMSS } from '../Logic/Helpers.js';
import {
    CANVAS,
    FOG,
    FOGGREEN,
    MENU,
    S0BACK,
    S0FRONT,
    S1BACK,
    S1FRONT,
    S2BACK,
    S2FRONT,
    S3BACK,
    S3FRONT,
    S4BACK,
    S4FRONT,
} from '../Assets/OtherGfx.js';
import { GLASSPAUSESPRITE, GLASSGAMEOVERSPRITE } from '../Assets/Hud.js';
import { WeatherController } from '../Logic/Controllers/WeatherController.js';
import { BLACKSCREENSPRITE, HIEROGLYPHSPRITE, LIGHTBEAMSPRITE } from '../Assets/Effects.js';
import { Vortex } from '../Effects/Weather/Vortex.js';
import { RedPackage } from '../Actors/Packages/RedPackage.js';
import { SceneVariables } from './SceneVariables.js';
import { HudGfx } from './HudGfx.js';
import { PlayerGfx } from './PlayerGfx.js';

// CANVAS
const CANVASWIDTH = 1000;
const RATIO = 16 / 9;

// BACKGROUNDS
const BACKGROUNDS = {
    stage0: { back: S0BACK, front: S0FRONT },
    stage1: { back: S1BACK, front: S1FRONT },
    stage2: { back: S2BACK, front: S2FRONT },
    stage3: { back: S3BACK, front: S3FRONT },
    stage4: { back: S4BACK, front: S4FRONT },
};

export class Scene {
    constructor() {
        // Canvas
        this.canvas = CANVAS;
        this.canvas.width = CANVASWIDTH;
        this.canvas.height = CANVASWIDTH / RATIO;
        this.ctx = this.canvas.getContext('2d');

        // Background offset is used to scroll the background for parallax effect
        this.backgroundScrollOffset = 0;

        // Set by the shakeScreen helper function. Used for screen-shake effect
        this.shake = 0;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        const backgroundback = BACKGROUNDS[`stage${game.state.stage}`].back;
        const backgroundfront = BACKGROUNDS[`stage${game.state.stage}`].front;

        // BACKPART - Parallax Effect
        // Draw stars
        this.ctx.drawImage(backgroundback, this.backgroundScrollOffset + this.shake, this.shake);
        this.ctx.drawImage(backgroundback, this.backgroundScrollOffset + backgroundback.width + this.shake, this.shake);

        // Reset the offset in case the background reaches the end while scrolling
        if (this.backgroundScrollOffset <= -backgroundback.width) {
            this.backgroundScrollOffset = 0;
        }

        // BACKPART - Darkness
        if (WeatherController.darknessActive) {
            this.ctx.drawImage(BLACKSCREENSPRITE, 0, 0);
        }

        // FRONTPART - Draw the front part of the background
        this.ctx.drawImage(backgroundfront, this.shake, this.shake);
        if (WeatherController.weatherActive.constructor === Vortex) {
            this.ctx.drawImage(HIEROGLYPHSPRITE, this.shake, this.shake);
        }

        // LOGIC - Slow the stars & draw the fog during slowmo
        const fogtype = game.state.variables.toxic ? FOGGREEN : FOG;
        if (game.state.slowmo || !game.state.time || game.player.clock.active) {
            this.ctx.drawImage(fogtype, -this.backgroundScrollOffset - backgroundback.width, 0);
            this.ctx.drawImage(fogtype, -this.backgroundScrollOffset, 0);
            this.backgroundScrollOffset -= game.state.variables.slowmorate;
        } else {
            this.backgroundScrollOffset -= 3;
        }
    }

    drawPlayer() {
        PlayerGfx.drawJetFlame();
        PlayerGfx.drawPlayer();
        PlayerGfx.drawShield();
    }

    drawEnemies() {
        game.enemies.liveEnemies.forEach((enemy) => {
            // Setup
            const isBoss = enemy.name;
            const isHit = enemy.hitRatio !== 1;
            const isRedPackage = enemy.constructor === RedPackage;

            // Healthbar - Normal Enemy
            if (isHit && !isBoss) {
                SceneUtils.drawBar(
                    enemy.x - enemy.sprite.width / 2,
                    enemy.y - enemy.sprite.height / 1.25,
                    enemy.sprite.width,
                    1.5,
                    enemy.hitRatio
                );
            }

            // Healthbar - Boss
            if (isBoss) {
                SceneUtils.drawBigBar(690, 10, 296, 11, hitPercentage);
                SceneUtils.drawText(enemy.name, 690, 40, SceneVariables.FONTMEDIUM);
            }

            // Lightbeam - Only if enemy is a RedPackage
            if (isRedPackage) {
                this.ctx.drawImage(LIGHTBEAMSPRITE, enemy.x - LIGHTBEAMSPRITE.width / 2, 0);
            }

            // Enemy Sprite
            this.ctx.drawImage(
                enemy.sprite,
                SceneUtils.offsetCoordinates(enemy).x,
                SceneUtils.offsetCoordinates(enemy).y
            );
        });
    }

    // LASERS AND EFFECTS
    drawEntity(entity) {
        entity.forEach((entity) => {
            if (entity.constructor === DamageNumber) {
                SceneUtils.drawCenteredText(entity.text, entity.x, entity.y, SceneVariables.FONTMEDIUM);
            } else {
                this.ctx.drawImage(
                    entity.sprite,
                    SceneUtils.offsetCoordinates(entity).x,
                    SceneUtils.offsetCoordinates(entity).y
                );
            }
        });
    }

    drawMenu() {
        this.ctx.drawImage(MENU, 0, 0);
    }

    drawGameOver() {
        this.ctx.drawImage(GLASSGAMEOVERSPRITE, 320, 205);
        SceneUtils.setShadow();
        SceneUtils.drawText(`GAMEOVER !`, 370, 245, SceneVariables.FONTXLARGE);
        SceneUtils.drawText(`YOU SURVIVED ${getGametimeToMMSS()} MINUTES`, 330, 270, SceneVariables.FONTMEDIUM);
        SceneUtils.drawText(`YOU DIED AT STAGE ${game.state.stage + 1}`, 380, 290, SceneVariables.FONTMEDIUM);
        SceneUtils.drawText(`EARNED CASH: ${game.cashcontroller.cash}`, 405, 310, SceneVariables.FONTMEDIUM);
        SceneUtils.drawText(`PRESS SPACE TO REPLAY`, 355, 340, SceneVariables.FONTMEDIUM);
        SceneUtils.unsetFilters();
    }

    drawPause() {
        this.ctx.drawImage(GLASSPAUSESPRITE, 360, 125);
        SceneUtils.drawItemsDescriptions();
    }

    drawHud() {
        HudGfx.drawStageTimeCoin();
        HudGfx.drawShipmentProgress();
        HudGfx.drawItemsIcons();
        HudGfx.drawShieldWarning();
        HudGfx.drawBuffs();
    }
}
