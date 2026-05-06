// ===== UAV Management =====
const uavState = {
    uavs: [], // { id, element, x, y, speedPxPerMs, angle, alive, patternName, patternState, width, height, typeConfig }
    uavIdCounter: 0,
    respawnQueue: [], // { timeToSpawn: number (timestamp) }
    lastTimestamp: 0,
    config: {
        maxActiveUAVs: 1,
        respawnDelayMs: 5000,
        types: [{
            name: "DefaultUAV",
            width: 88,
            height: 45,
            baseSpeedPxPerMs: 0.2, // Adjusted for visibility, e.g., 40px/sec if 1000ms/sec
            cssClass: 'uav',
            clickableChildClass: 'uav-child-button',
            flightPatternName: 'linearAcrossStrict',
        }],
        flightPatterns: {
            linearAcrossStrict: function(uav, deltaTime) {
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                if (!uav.patternState || !uav.patternState.initialized) {
                    uav.x = -(uav.width / 2) - 10;
                    uav.y = viewportHeight * (0.15 + Math.random() * 0.15);
                    uav.angle = 0;

                    uav.patternState = {
                        initialized: true,
                    };
                }

                uav.x += uav.speedPxPerMs * deltaTime;

                if (uav.x - uav.width / 2 > viewportWidth + 10) {
                    uav.alive = false;
                }
                if (uav.y < -uav.height * 2 || uav.y > viewportHeight + uav.height * 2) {
                    uav.alive = false;
                }
            },
            linearAcross: function(uav, deltaTime) {
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                if (!uav.patternState || !uav.patternState.initialized) {
                    const goingRight = Math.random() < 0.5;
                    uav.x = goingRight ? -uav.width : viewportWidth;
                    uav.y = viewportHeight * (0.1 + Math.random() * 0.3);
                    uav.angle = goingRight ? (Math.random() * 20 - 10) : (180 + Math.random() * 20 - 10);

                    uav.patternState = {
                        targetX: goingRight ? viewportWidth + uav.width * 1.5 : -uav.width * 1.5,
                        targetY: uav.y + (Math.random() * 100 - 50),
                        initialized: true,
                        goingRight: goingRight,
                    };
                    const dxInitial = uav.patternState.targetX - uav.x;
                    const dyInitial = uav.patternState.targetY - uav.y;
                    uav.angle = Math.atan2(dyInitial, dxInitial) * 180 / Math.PI;
                }

                const moveX = Math.cos(uav.angle * Math.PI / 180) * uav.speedPxPerMs * deltaTime;
                const moveY = Math.sin(uav.angle * Math.PI / 180) * uav.speedPxPerMs * deltaTime;

                uav.x += moveX;
                uav.y += moveY;

                if ((uav.patternState.goingRight && uav.x > viewportWidth + uav.width * 2) ||
                    (!uav.patternState.goingRight && uav.x < -uav.width * 2) ||
                    uav.y < -uav.height * 2 || uav.y > viewportHeight + uav.height * 2) {
                    uav.alive = false;
                }
            }
        }
    }
};

function createUAVElement(uavData) {
    const uavElement = document.createElement('div');
    uavElement.id = `uav-${uavData.id}`;
    uavElement.className = uavData.typeConfig.cssClass;
    uavElement.style.width = `${uavData.width}px`;
    uavElement.style.height = `${uavData.height}px`;
    uavElement.style.position = 'absolute'
    uavElement.style.opacity = '1';
    uavElement.style.zIndex = '50';

    const clickableArea = document.createElement('div');
    clickableArea.className = uavData.typeConfig.clickableChildClass;
    uavElement.appendChild(clickableArea);

    // MODIFIED: Calls the new dispatcher function
    clickableArea.addEventListener('click', () => {
        initiateIntercept(uavData, uavElement);
    });

    document.body.appendChild(uavElement);
    return uavElement;
}

function spawnNewUAV(typeIndex = 0) {
    if (uavState.uavs.filter(u => u.alive).length >= uavState.config.maxActiveUAVs) {
        return;
    }

    uavState.uavIdCounter++;
    const typeConfig = uavState.config.types[typeIndex];
    if (!typeConfig) {
        console.error(`Invalid UAV typeIndex: ${typeIndex}`);
        return;
    }
    if (!uavState.config.flightPatterns[typeConfig.flightPatternName]) {
        console.error(`Flight pattern "${typeConfig.flightPatternName}" not found for UAV type "${typeConfig.name}"!`);
        return;
    }

    const uavData = {
        id: uavState.uavIdCounter,
        typeConfig: typeConfig,
        width: typeConfig.width,
        height: typeConfig.height,
        x: 0,
        y: 0,
        angle: 0,
        speedPxPerMs: typeConfig.baseSpeedPxPerMs * (0.9 + Math.random() * 0.2),
        alive: true,
        patternName: typeConfig.flightPatternName,
        patternState: {
            initialized: false
        },
    };
    uavData.element = createUAVElement(uavData);

    const patternFn = uavState.config.flightPatterns[uavData.patternName];
    if (patternFn) {
        patternFn(uavData, 0);
    } else {
        console.error(`Pattern function ${uavData.patternName} not found during spawn for UAV ${uavData.id}`);
        if (uavData.element && uavData.element.parentNode) uavData.element.remove();
        return;
    }

    uavData.element.style.left = `${uavData.x - uavData.width / 2}px`;
    uavData.element.style.top = `${uavData.y - uavData.height / 2}px`;
    uavData.element.style.transform = `rotate(${uavData.angle}deg)`;

    uavState.uavs.push(uavData);
}

function updateActiveUAVs(deltaTime) {
    for (let i = uavState.uavs.length - 1; i >= 0; i--) {
        const uav = uavState.uavs[i];
        if (uav.alive) {
            const patternFn = uavState.config.flightPatterns[uav.patternName];
            if (patternFn) {
                patternFn(uav, deltaTime);
            } else {
                console.warn(`No pattern function for ${uav.patternName} on UAV ${uav.id}`);
                uav.alive = false;
            }

            if (uav.element) {
                uav.element.style.left = `${uav.x - uav.width / 2}px`;
                uav.element.style.top = `${uav.y - uav.height / 2}px`;
                uav.element.style.transform = `rotate(${uav.angle}deg)`;
            } else {
                console.warn(`UAV ${uav.id} is alive but has no element.`);
                uav.alive = false;
            }

            if (!uav.alive) {
                handleUAVDestroyedVisuals(uav, false);
            }
        }
    }
}

function processUAVRespawnQueue(currentTime) {
    for (let i = uavState.respawnQueue.length - 1; i >= 0; i--) {
        if (currentTime >= uavState.respawnQueue[i].timeToSpawn) {
            spawnNewUAV();
            uavState.respawnQueue.splice(i, 1);
        }
    }
}

function handleUAVDestroyedVisuals(uav, byMissile = true) {
    if (!uav) {
        console.warn("handleUAVDestroyedVisuals called with null uav");
        return;
    }
    uav.alive = false;

    if (uav.element) {
        uav.element.style.opacity = '0';
        setTimeout(() => {
            if (uav.element && uav.element.parentNode) {
                uav.element.remove();
            }
            uav.element = null;
        }, byMissile ? 200 : 500);
    }

    const liveUAVs = uavState.uavs.filter(u_ => u_.alive && u_.id !== uav.id).length;
    if (liveUAVs < uavState.config.maxActiveUAVs || uavState.config.maxActiveUAVs === 1) {
        const recentQueueThreshold = 1000;
        const isRecentlyQueued = uavState.respawnQueue.some(
            item => (performance.now() - (item.timeToSpawn - uavState.config.respawnDelayMs)) < recentQueueThreshold
        );
        if (!isRecentlyQueued) {
            uavState.respawnQueue.push({
                timeToSpawn: performance.now() + uavState.config.respawnDelayMs
            });
        }
    }

    // Clear target from both systems
    if (f35State.uavElement === uav.element) {
        f35State.uavElement = null;
    }
    if (aaState.targetUAVObject === uav) {
        aaState.targetUAVObject = null;
    }
}

let uavUpdateLoopId = null;

function runUAVSystem(timestamp) {
    if (!uavState.lastTimestamp) {
        uavState.lastTimestamp = timestamp;
        if (uavState.uavs.filter(u => u.alive).length === 0 && uavState.respawnQueue.length === 0) {
            spawnNewUAV();
        }
    }
    const deltaTime = timestamp - uavState.lastTimestamp;
    uavState.lastTimestamp = timestamp;

    if (deltaTime > 0) {
        updateActiveUAVs(deltaTime);
        processUAVRespawnQueue(timestamp);
    } else if (deltaTime < 0) {
        console.warn("UAV System: Negative deltaTime detected!", deltaTime);
    }

    if (uavState.uavs.filter(u => u.alive).length === 0 && uavState.respawnQueue.length === 0) {
        const canForceSpawn = !uavState.forceSpawnCooldown || timestamp > uavState.forceSpawnCooldown;
        if (canForceSpawn) {
            spawnNewUAV();
            uavState.forceSpawnCooldown = timestamp + 2000;
        }
    }
    uavUpdateLoopId = requestAnimationFrame(runUAVSystem);
}

// ===== NEW: INTERCEPT DISPATCHER =====
function initiateIntercept(uavData, uavElement) {
    if (!uavData.alive) return;

    if (f35State.mode !== 'IDLE' || aaState.mode !== 'IDLE') {
        showSystemMessage("ASSET ALREADY ENGAGED. AWAIT CURRENT TARGET DESTRUCTION.", 2500);
        return;
    }

    if (Math.random() < 0.5) {
        showSystemMessage("SCRAMBLING F35...", 1500);
        window.startF35Intercept(uavElement, null);
    } else {
        showSystemMessage("ACTIVATING GROUND-BASED AIR DEFENSE...", 1500);
        window.startAAIntercept(uavData);
    }
}


// ===== F35 INTERCEPTION LOGIC (RESTORED TO ORIGINAL) =====
let f35FlightAnimFrameId = null;
let missileAnimFrameId = null; // Original name
let targetBracketsAnimFrameId = null;
let smokeIntervalId = null; // Original name
let explosionTimeoutId = null; // Original name

const f35State = {
    element: null, x: 0, y: 0, angle: 0, speed: 0, targetSpeed: 0.5, acceleration: 0.003,
    deceleration: 0.005, turnRate: 0.5, mode: 'IDLE', waypoint: { x: 0, y: 0 },
    timeInMode: 0, hasFired: false, uavElement: null, missileElement: null, explosionElement: null,
    clickedButtonElement: null, targetBracketsElement: null, initialUAVAimPos: { x: 0, y: 0 },
    MIN_FIRING_DISTANCE: 300, MANEUVER_ANGLE_THRESHOLD: 20, MANEUVER_SLOWDOWN_FACTOR: 0.6,
    MIN_EFFECTIVE_SPEED: 1.0, spriteMirrorX: false,
    missileFlightState: {
        x: 0, y: 0, velocityX: 0, velocityY: 0, speed: 0, targetSpeed: 0.06, acceleration: 0.02,
        spriteMirrorX: false, currentAngleDeg: 0
    }
};

// ===== NEW: AA SYSTEM LOGIC =====
let aaSystemUpdateId = null;
let aa_missileAnimFrameId = null;
let aa_smokeIntervalId = null;
let aa_explosionTimeoutId = null;

const aaState = {
    mode: 'IDLE', // IDLE, DEPLOYING, TRACKING, FIRING, DISENGAGING
    elements: {
        cnc: null, launcher: null, radar: null, radarLine: null, missile: null, explosion: null
    },
    targetUAVObject: null,
    missilesRemaining: 4,
    timeInMode: 0,
    lastFiredTimestamp: 0,
    missileInFlight: false,
    config: {
        cnc:      { left: '44%', bottom: '5px' },
        launcher: { right: '10%', bottom: '0px' },
        radar:    { left:  '10%', bottom: '-15px' },
        radarLineStartOffset: { x: 50, y: -60 },
        radarLineEndOffset:   { x: 0,  y: 0 },
        launcherMissileSlots: [
            { x: 65, y: 15 }, { x: 80, y: 35 }, { x: 50, y: 40 }, { x: 65, y: 60 }
        ],
        missileInitialAngle: -115,
        ascentStraightenFrames: 0, // Frames to transition from initial angle to straight up (~0.6s)
        ascentBoostFrames: 0,      // Frames to fly straight up after straightening (~0.5s)

        deployDuration: 500,
        trackingDuration: 2000,
        reloadDuration: 1500,
        disengageDuration: 1000,
    },
    missileFlightState: {
        x: 0, y: 0, velocityX: 0, velocityY: 0, currentAngleDeg: 0,
        framesSinceLaunch: 0, homingActive: false
    }
};


function resetGlobalAnimationState() {
    // F35 Reset (Using original variable names)
    if (f35FlightAnimFrameId) cancelAnimationFrame(f35FlightAnimFrameId);
    if (missileAnimFrameId) cancelAnimationFrame(missileAnimFrameId);
    if (targetBracketsAnimFrameId) cancelAnimationFrame(targetBracketsAnimFrameId);
    if (smokeIntervalId) clearInterval(smokeIntervalId);
    if (explosionTimeoutId) clearTimeout(explosionTimeoutId);
    f35FlightAnimFrameId = missileAnimFrameId = targetBracketsAnimFrameId = smokeIntervalId = explosionTimeoutId = null;
    f35State.hasFired = false; f35State.timeInMode = 0; f35State.spriteMirrorX = false;
    if (f35State.missileFlightState) { f35State.missileFlightState.spriteMirrorX = false; }
    
    const f35 = document.querySelector('.f35');
    if (f35) { f35.style.opacity = '0'; f35.classList.remove('animating'); }
    const missile = document.querySelector('.missile');
    if(missile) missile.style.opacity = '0';
    const explosion = document.querySelector('.explosion');
    if(explosion) { explosion.style.opacity = '0'; explosion.style.animation = 'none'; explosion.style.backgroundPositionX = '0px'; explosion.style.backgroundPositionY = '0px';}
    let tb = document.querySelector('.target-brackets');
    if (tb && tb.parentNode) { tb.remove(); }
    f35State.targetBracketsElement = null;
    f35State.mode = 'IDLE';

    // AA System Reset (Using prefixed variable names)
    if (aaSystemUpdateId) cancelAnimationFrame(aaSystemUpdateId);
    if (aa_missileAnimFrameId) cancelAnimationFrame(aa_missileAnimFrameId);
    if (aa_smokeIntervalId) clearInterval(aa_smokeIntervalId);
    if (aa_explosionTimeoutId) clearTimeout(aa_explosionTimeoutId);
    aaSystemUpdateId = aa_missileAnimFrameId = aa_smokeIntervalId = aa_explosionTimeoutId = null;
    if (aaState.elements.radarLine && aaState.elements.radarLine.parentNode) { aaState.elements.radarLine.remove(); aaState.elements.radarLine = null; }
    Object.values(aaState.elements).forEach(el => { if (el) el.style.opacity = '0'; });
    const aa_explosion = document.querySelector('.aa-explosion');
    if (aa_explosion) aa_explosion.style.opacity = '0';
    aaState.mode = 'IDLE';
    aaState.missileInFlight = false;
    
    window.isIntercepting = false;
}

/** Cancels the main F-35 flight animation loop. */
function cancelF35FlightAnimation() {
    if (window.f35FlightAnimFrameId) {
        cancelAnimationFrame(window.f35FlightAnimFrameId);
        window.f35FlightAnimFrameId = null;
    }
}

/** Cancels the missile flight animation and its associated effects (smoke, explosion). */
function cancelF35MissileSequence() {
    if (window.missileAnimFrameId) {
        cancelAnimationFrame(window.missileAnimFrameId);
        window.missileAnimFrameId = null;
    }
    if (window.smokeIntervalId) {
        clearInterval(window.smokeIntervalId);
        window.smokeIntervalId = null;
    }
    if (window.explosionTimeoutId) {
        clearTimeout(window.explosionTimeoutId);
        window.explosionTimeoutId = null;
    }
}

/** Cancels the target brackets animation loop. */
function cancelF35TargetingAnimation() {
    if (window.targetBracketsAnimFrameId) {
        cancelAnimationFrame(window.targetBracketsAnimFrameId);
        window.targetBracketsAnimFrameId = null;
    }
}

// --- F35: Granular State and DOM Reset Functions ---

/** Resets the F-35's internal state object to its default values. */
function resetF35State() {
    f35State.hasFired = false;
    f35State.timeInMode = 0;
    f35State.spriteMirrorX = false;
    f35State.mode = 'IDLE';
    if (f35State.missileFlightState) {
        f35State.missileFlightState.spriteMirrorX = false;
    }
}

/** Hides and resets the visual style of all F-35 related DOM elements. */
function resetF35DOMElements() {
    const f35 = document.querySelector('.f35');
    if (f35) {
        f35.style.opacity = '0';
        f35.classList.remove('animating');
    }
    const missile = document.querySelector('.missile');
    if (missile) {
        missile.style.opacity = '0';
    }
    const explosion = document.querySelector('.explosion');
    if (explosion) {
        explosion.style.opacity = '0';
        explosion.style.animation = 'none';
        explosion.style.backgroundPositionX = '0px';
        explosion.style.backgroundPositionY = '0px';
    }
    const tb = document.querySelector('.target-brackets');
    if (tb) {
        tb.remove(); // Or tb.style.opacity = '0' if you reuse it
    }
    f35State.targetBracketsElement = null;
}


// --- AA System: Granular Cancellation and Reset Functions (Following the same pattern) ---

/** Cancels all Anti-Aircraft system animations and intervals. */
function cancelAASystemAnimations() {
    if (window.aaSystemUpdateId) {
        cancelAnimationFrame(window.aaSystemUpdateId);
        window.aaSystemUpdateId = null;
    }
    if (window.aa_missileAnimFrameId) {
        cancelAnimationFrame(window.aa_missileAnimFrameId);
        window.aa_missileAnimFrameId = null;
    }
    if (window.aa_smokeIntervalId) {
        clearInterval(window.aa_smokeIntervalId);
        window.aa_smokeIntervalId = null;
    }
    if (window.aa_explosionTimeoutId) {
        clearTimeout(window.aa_explosionTimeoutId);
        window.aa_explosionTimeoutId = null;
    }
}

/** Resets the AA system's internal state object. */
function resetAASystemState() {
    aaState.mode = 'IDLE';
    aaState.missileInFlight = false;
}

/** Hides and resets the visual style of all AA system related DOM elements. */
function resetAASystemDOMElements() {
    if (aaState.elements.radarLine && aaState.elements.radarLine.parentNode) {
        aaState.elements.radarLine.remove();
        aaState.elements.radarLine = null;
    }
    Object.values(aaState.elements).forEach(el => {
        if (el) el.style.opacity = '0';
    });
    const aa_explosion = document.querySelector('.aa-explosion');
    if (aa_explosion) {
        aa_explosion.style.opacity = '0';
    }
}


function showSystemMessage(message, duration = 2000) {
    let systemMessagesContainer = document.querySelector('.system-messages');
    if (!systemMessagesContainer) {
        systemMessagesContainer = document.createElement('div');
        systemMessagesContainer.className = 'system-messages';
        document.body.appendChild(systemMessagesContainer);
    }
    const messageElement = document.createElement('div');
    messageElement.className = 'system-message';
    messageElement.textContent = message;
    systemMessagesContainer.appendChild(messageElement);
    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateX(0)';
    }, 10);
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateX(20px)';
        setTimeout(() => { if (messageElement.parentNode) messageElement.remove(); }, 500);
    }, duration);
}

// ===== F35 FLIGHT/INTERCEPT FUNCTIONS (RESTORED & MODIFIED) =====
function updateF35Flight() {
    if (!f35State.element || f35State.mode === 'IDLE') {
        if (f35FlightAnimFrameId) cancelAnimationFrame(f35FlightAnimFrameId);
        f35FlightAnimFrameId = null;
        if (f35State.element && f35State.mode === 'IDLE') f35State.element.style.opacity = '0';
        return;
    }

    f35State.timeInMode++;

    switch (f35State.mode) {
        case 'ENTERING':
            const startX = f35State.x;
            const startY = f35State.y;

            // --- MODIFICATION START ---
            // The destination is now the top-middle of the screen.
            const endX = window.innerWidth / 2 + (Math.random() * 300 - 150); // Center with some variance
            const endY = -200; // Well above the top of the screen

            // The control point is adjusted to create a 1/x-like curve.
            // It will be placed to make the F-35 dip down before climbing sharply.
            const controlX = startX + (endX - startX) * 0.5; // Positioned between start and end X
            const controlY = startY + (150 + Math.random() * 150); // Positioned below the start Y to create the dip
            // --- MODIFICATION END ---
            
            f35State.arcPath = { p0: { x: startX, y: startY }, p1: { x: controlX, y: controlY }, p2: { x: endX, y: endY } };
            f35State.arcProgress = 0;
            f35State.mode = 'FLYING_ARC';
            f35State.timeInMode = 0;
            break;

        case 'FLYING_ARC':
            const FIRING_DELAY_FRAMES = 100;
            if (f35State.timeInMode > FIRING_DELAY_FRAMES && !f35State.hasFired) {
                const targetUAVObject = f35State.uavElement ? uavState.uavs.find(u => u.element === f35State.uavElement) : null;
                if (targetUAVObject && targetUAVObject.alive) {
                    showSystemMessage("FIRING SOLUTION... FOX 3!", 1000);
                    launchMissileFromF35();
                    f35State.hasFired = true;
                }
            }

            // Increase speed slightly for a more dynamic feel
            const arcTraversalSpeed = 0.005; 
            f35State.arcProgress += arcTraversalSpeed;

            if (f35State.arcProgress >= 1) {
                f35State.mode = 'IDLE';
                resetF35State();
                return;
            }

            const t = f35State.arcProgress;
            const p0 = f35State.arcPath.p0, p1 = f35State.arcPath.p1, p2 = f35State.arcPath.p2;
            f35State.x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
            f35State.y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
            const dx_dt = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
            const dy_dt = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
            f35State.angle = Math.atan2(dy_dt, dx_dt) * 180 / Math.PI;

            f35State.element.style.left = `${f35State.x - f35State.element.offsetWidth / 2}px`;
            f35State.element.style.top = `${f35State.y - f35State.element.offsetHeight / 2}px`;
            let scaleX = 1, scaleY = 1;
            if (f35State.spriteMirrorX) { scaleX = 1; scaleY = -1; }
            f35State.element.style.transform = `rotate(${f35State.angle}deg) scaleX(${scaleX}) scaleY(${scaleY})`;
            break;
            
        case 'DISENGAGING':
            if (!f35State.arcPath) { f35State.mode = 'IDLE'; resetF35State(); return; }
            f35State.mode = 'FLYING_ARC';
            break;

        default:
            f35State.mode = 'IDLE';
            resetF35State();
            return;
    }

    if (f35State.mode !== 'IDLE') {
      f35FlightAnimFrameId = requestAnimationFrame(updateF35Flight);
    } else {
      if(f35FlightAnimFrameId) cancelAnimationFrame(f35FlightAnimFrameId);
      f35FlightAnimFrameId = null;
      if (f35State.element) f35State.element.style.opacity = '0';
    }
}

function launchMissileFromF35() { // RESTORED TO ORIGINAL
    const missile = f35State.missileElement;
    if (!missile) { console.error("Missile element not found!"); return; }

    const missileWidth = missile.offsetWidth || 50;
    const missileHeight = missile.offsetHeight || 10;
    const f35AngleRad = f35State.angle * Math.PI / 180;
    const f35CurrentWidth = f35State.element.offsetWidth;
    const noseOffsetFactor = f35CurrentWidth * 0.3;
    
    f35State.missileFlightState.x = f35State.x + (noseOffsetFactor * Math.cos(f35AngleRad)) - missileWidth / 2;
    f35State.missileFlightState.y = f35State.y + (noseOffsetFactor * Math.sin(f35AngleRad)) - missileHeight / 2;

    missile.style.left = `${f35State.missileFlightState.x}px`;
    missile.style.top = `${f35State.missileFlightState.y}px`;
    
    f35State.missileFlightState.currentAngleDeg = f35State.angle;
    f35State.missileFlightState.speed = f35State.speed * 0.8;
    f35State.missileFlightState.velocityX = Math.cos(f35AngleRad) * f35State.missileFlightState.speed;
    f35State.missileFlightState.velocityY = Math.sin(f35AngleRad) * f35State.missileFlightState.speed;
    f35State.missileFlightState.framesSinceLaunch = 0;
    f35State.missileFlightState.homingActive = false;
    
    missile.style.transform = `rotate(${f35State.missileFlightState.currentAngleDeg}deg) ${f35State.missileFlightState.spriteMirrorX ? 'scaleX(-1)' : 'scaleX(1)'}`;
    missile.style.opacity = '1';
    missile.style.backgroundImage = 'url("../../public/assets/images/Missile_ON.png")';
    
    setTimeout(() => {
        if (missile.style.opacity !== '0') {
            missile.style.backgroundImage = 'url("../../public/assets/images/Missile_OFF.png")';
        }
    }, 500);

    let hitOccurred = false;
    const MAX_MISSILE_FLIGHT_FRAMES = 800;
    const DROP_FRAMES = 32, DROP_GRAVITY = 0.15, BOOSTER_ACCELERATION = 0.3;
    const MAX_MISSILE_SPEED = 8.0, HOMING_TURN_RATE = 1.5;

    function animateMissileFlight() {
        if (hitOccurred || !window.isIntercepting) {
            if (missileAnimFrameId) cancelAnimationFrame(missileAnimFrameId); missileAnimFrameId = null;
            if (!hitOccurred && missile) missile.style.opacity = '0';
            if (smokeIntervalId) { clearInterval(smokeIntervalId); smokeIntervalId = null; }
            return;
        }
        
        f35State.missileFlightState.framesSinceLaunch++;
        const frameCount = f35State.missileFlightState.framesSinceLaunch;
        const targetUAVObject = f35State.uavElement ? uavState.uavs.find(u => u.element === f35State.uavElement) : null;
        if (!targetUAVObject || !targetUAVObject.alive) {
            if (hitOccurred) return; hitOccurred = true;
            if (missileAnimFrameId) cancelAnimationFrame(missileAnimFrameId); missileAnimFrameId = null;
            if (missile) missile.style.opacity = '0';
            if (smokeIntervalId) { clearInterval(smokeIntervalId); smokeIntervalId = null; }
            showSystemMessage("UAV LOST MID-FLIGHT (MISSILE)", 2000);
            return;
        }
        
        if (frameCount <= DROP_FRAMES) {
            f35State.missileFlightState.velocityY += DROP_GRAVITY;
        } 
        else {
            if (!f35State.missileFlightState.homingActive) f35State.missileFlightState.homingActive = true;
            
            const targetCenterX = targetUAVObject.x + targetUAVObject.width / 2;
            const targetCenterY = (targetUAVObject.y + targetUAVObject.height / 2) - 70;
            const missileGlobalX = f35State.missileFlightState.x + (missile.offsetWidth||50)/2;
            const missileGlobalY = f35State.missileFlightState.y + (missile.offsetHeight||10)/2;

            const dxToTarget = targetCenterX - missileGlobalX, dyToTarget = targetCenterY - missileGlobalY;
            const angleToTargetDeg = Math.atan2(dyToTarget, dxToTarget) * 180 / Math.PI;
            let angleDiff = angleToTargetDeg - f35State.missileFlightState.currentAngleDeg;
            while (angleDiff > 180) angleDiff -= 360; while (angleDiff < -180) angleDiff += 360;
            
            const turnAmount = Math.max(-HOMING_TURN_RATE, Math.min(HOMING_TURN_RATE, angleDiff));
            f35State.missileFlightState.currentAngleDeg = (f35State.missileFlightState.currentAngleDeg + turnAmount + 360) % 360;

            const thrustAngleRad = f35State.missileFlightState.currentAngleDeg * Math.PI / 180;
            const accelerationX = Math.cos(thrustAngleRad) * BOOSTER_ACCELERATION;
            const accelerationY = Math.sin(thrustAngleRad) * BOOSTER_ACCELERATION;
            f35State.missileFlightState.velocityX += accelerationX;
            f35State.missileFlightState.velocityY += accelerationY;

            const currentSpeed = Math.sqrt(f35State.missileFlightState.velocityX ** 2 + f35State.missileFlightState.velocityY ** 2);
            if (currentSpeed > MAX_MISSILE_SPEED) {
                const speedFactor = MAX_MISSILE_SPEED / currentSpeed;
                f35State.missileFlightState.velocityX *= speedFactor;
                f35State.missileFlightState.velocityY *= speedFactor;
            }
        }

        f35State.missileFlightState.x += f35State.missileFlightState.velocityX;
        f35State.missileFlightState.y += f35State.missileFlightState.velocityY;
        
        missile.style.left = `${f35State.missileFlightState.x}px`;
        missile.style.top = `${f35State.missileFlightState.y}px`;
        missile.style.transform = `rotate(${f35State.missileFlightState.currentAngleDeg}deg) ${f35State.missileFlightState.spriteMirrorX ? 'scaleX(-1)' : 'scaleX(1)'}`;

        const hitboxWidth = 100, hitboxHeight = 100;
        const hitboxLeft = targetUAVObject.x - hitboxWidth / 2, hitboxRight = targetUAVObject.x + hitboxWidth / 2;
        const hitboxTop = targetUAVObject.y - hitboxHeight / 2, hitboxBottom = targetUAVObject.y + hitboxHeight / 2;

        if (missile.style.opacity !== '0' && !hitOccurred) {
            const missileCenterX = f35State.missileFlightState.x + (missile.offsetWidth || 50) / 2;
            const missileCenterY = f35State.missileFlightState.y + (missile.offsetHeight || 10) / 2;

            const isColliding = missileCenterX - 5 > hitboxLeft && missileCenterX + 5 < hitboxRight &&
                                missileCenterY - 5 > hitboxTop && missileCenterY + 5 < hitboxBottom;

            if (isColliding) {
                if (hitOccurred) return; hitOccurred = true;

                missile.style.opacity = '0';
                handleUAVDestroyedVisuals(targetUAVObject, true);

                if (targetBracketsAnimFrameId) cancelAnimationFrame(targetBracketsAnimFrameId);
                targetBracketsAnimFrameId = null;
                if (f35State.targetBracketsElement && f35State.targetBracketsElement.parentNode) {
                    f35State.targetBracketsElement.remove(); f35State.targetBracketsElement = null;
                }

                const explosion = f35State.explosionElement;
                explosion.style.left = `${targetUAVObject.x - explosion.offsetWidth / 2}px`;
                explosion.style.top = `${targetUAVObject.y - explosion.offsetHeight / 2 - 55}px`;
                explosion.style.opacity = '1'; explosion.style.animation = 'none';

                let currentExplosionFrame = 0;
                function animateExplosionStep() {
                    if (currentExplosionFrame >= 48) { if (explosion.parentNode) explosion.style.opacity = '0'; return; }
                    const col = currentExplosionFrame % 8, row = Math.floor(currentExplosionFrame / 8);
                    explosion.style.backgroundPositionX = `-${col * 240}px`; explosion.style.backgroundPositionY = `-${row * 240}px`;
                    currentExplosionFrame++;
                    explosionTimeoutId = setTimeout(animateExplosionStep, 800 / 48);
                }
                animateExplosionStep();
                showSystemMessage("IMPACT CONFIRMED!", 2000);
                return;
            }
        }

        if (frameCount > MAX_MISSILE_FLIGHT_FRAMES && !hitOccurred) {
            if (hitOccurred) return; hitOccurred = true;
            if (missileAnimFrameId) cancelAnimationFrame(missileAnimFrameId); missileAnimFrameId = null;
            if (smokeIntervalId) { clearInterval(smokeIntervalId); smokeIntervalId = null; }
            if (missile.style.opacity !== '0') missile.style.opacity = '0';
            showSystemMessage("TARGET MISSED, RE-ENGAGING", 2000);
            return;
        }

        if (!hitOccurred) {
            missileAnimFrameId = requestAnimationFrame(animateMissileFlight);
        }
    }
    missileAnimFrameId = requestAnimationFrame(animateMissileFlight);
}

function actualF35InterceptLogic(visualUavElement, _clickedButtonElement) {
    if (f35State.mode !== 'IDLE') { showSystemMessage("F35 ALREADY OPERATIONAL", 1500); return; }
    resetGlobalAnimationState();

    f35State.element = document.querySelector('.f35');
    f35State.missileElement = document.querySelector('.missile');
    f35State.explosionElement = document.querySelector('.explosion');
    f35State.uavElement = visualUavElement;

    if (!f35State.uavElement || !f35State.uavElement.parentNode) {
        showSystemMessage("INITIAL TARGET INVALID. F35 STANDING BY.", 2000); f35State.mode = 'IDLE'; return;
    }
    const uavRectInitial = visualUavElement.getBoundingClientRect();
    f35State.initialUAVAimPos.x = uavRectInitial.left + uavRectInitial.width / 2;
    f35State.initialUAVAimPos.y = uavRectInitial.top + uavRectInitial.height / 2;

    if (!f35State.element || !f35State.missileElement || !f35State.explosionElement) {
        console.error("F35 Intercept: Missing critical DOM elements."); window.isIntercepting = false; f35State.mode = 'IDLE'; return;
    }

    window.isIntercepting = true;
    f35State.element.classList.add('animating');
    f35State.element.style.opacity = '1'; f35State.element.style.transition = 'none';

    const f35InitialWidth = f35State.element.offsetWidth || 100;
    const targetIsLeftHalf = f35State.initialUAVAimPos.x < window.innerWidth / 2;
    f35State.x = targetIsLeftHalf ? window.innerWidth + f35InitialWidth : -f35InitialWidth;
    f35State.y = (window.innerHeight * (0.15 + Math.random() * 0.25));
    f35State.angle = targetIsLeftHalf ? (180 + (Math.random() * 20 - 10)) : (Math.random() * 20 - 10);

    f35State.speed = 0; f35State.targetSpeed = 4 + Math.random(); f35State.mode = 'ENTERING';
    f35State.timeInMode = 0; f35State.hasFired = false; f35State.spriteMirrorX = !targetIsLeftHalf;
    if (f35State.missileFlightState) f35State.missileFlightState.spriteMirrorX = false;

    showSystemMessage("F35 ENGAGING. SCANNING AIRSPACE...", 2000);

    if (!f35State.targetBracketsElement || !f35State.targetBracketsElement.parentNode) {
        let tb = document.querySelector('.target-brackets');
        if (!tb) { tb = document.createElement('div'); tb.className = 'target-brackets'; document.body.appendChild(tb); }
        f35State.targetBracketsElement = tb;
    }
    f35State.targetBracketsElement.style.opacity = '0'; f35State.targetBracketsElement.style.animation = 'none';
    void f35State.targetBracketsElement.offsetWidth;
    f35State.targetBracketsElement.style.animation = 'targetLock 0.75s ease-out forwards';
    f35State.targetBracketsElement.style.opacity = '1';

    if (!targetBracketsAnimFrameId) { targetBracketsAnimFrameId = requestAnimationFrame(updateTargetBracketsPosition); }
    if (!f35FlightAnimFrameId) { f35FlightAnimFrameId = requestAnimationFrame(updateF35Flight); }
}
window.startF35Intercept = actualF35InterceptLogic;

function updateTargetBracketsPosition() {
    const currentTargetElement = f35State.uavElement || (aaState.targetUAVObject ? aaState.targetUAVObject.element : null);
    if (!window.isIntercepting || !currentTargetElement || !currentTargetElement.parentNode || currentTargetElement.style.opacity === '0') {
        if (f35State.targetBracketsElement) f35State.targetBracketsElement.style.opacity = '0';
        if (!window.isIntercepting && targetBracketsAnimFrameId) {
            cancelAnimationFrame(targetBracketsAnimFrameId); targetBracketsAnimFrameId = null;
            if (f35State.targetBracketsElement && f35State.targetBracketsElement.parentNode) { f35State.targetBracketsElement.remove(); f35State.targetBracketsElement = null; }
        }
        if (window.isIntercepting) { targetBracketsAnimFrameId = requestAnimationFrame(updateTargetBracketsPosition); }
        return;
    }

    if (!f35State.targetBracketsElement || !f35State.targetBracketsElement.parentNode) {
        let tb = document.querySelector('.target-brackets');
        if (!tb) { tb = document.createElement('div'); tb.className = 'target-brackets'; document.body.appendChild(tb); }
        f35State.targetBracketsElement = tb;
        f35State.targetBracketsElement.style.animation = 'targetLock 0.75s ease-out forwards';
    }

    f35State.targetBracketsElement.style.opacity = '1';
    const uavLiveRect = currentTargetElement.getBoundingClientRect();
    if (uavLiveRect.width === 0) {
        f35State.targetBracketsElement.style.opacity = '0';
        targetBracketsAnimFrameId = requestAnimationFrame(updateTargetBracketsPosition);
        return;
    }
    const scrollX = window.scrollX || window.pageXOffset, scrollY = window.scrollY || window.pageYOffset;
    f35State.targetBracketsElement.style.left = `${uavLiveRect.left + scrollX}px`;
    f35State.targetBracketsElement.style.top = `${uavLiveRect.top + scrollY}px`;
    f35State.targetBracketsElement.style.width = `${uavLiveRect.width}px`;
    f35State.targetBracketsElement.style.height = `${uavLiveRect.height}px`;

    targetBracketsAnimFrameId = requestAnimationFrame(updateTargetBracketsPosition);
}

// ===== NEW AA SYSTEM FUNCTIONS =====
// In your JavaScript file

function createAndPositionAASystemElements() {
    const ids = { cnc: 'aa-cnc', launcher: 'aa-launcher', radar: 'aa-radar', missile: 'aa-missile' };
    const images = { cnc: 'AA_C&C.png', launcher: 'AA_launcher.png', radar: 'AA_radar.png', missile: 'AA_missile.png' };

    for (const [key, id] of Object.entries(ids)) {
        if (!aaState.elements[key]) {
            let el = document.getElementById(id);
            if (!el) { el = document.createElement('div'); el.id = id; el.className = `aa-system-element ${id}`; document.body.appendChild(el); }
            aaState.elements[key] = el;
        }
        const el = aaState.elements[key];
        // The 'position: absolute' is now handled by your CSS file, which is better.
        el.style.zIndex = '40'; 
        el.style.opacity = '0';
        el.style.transition = `opacity ${aaState.config.deployDuration / 2000}s ease-in-out`;
        if (images[key]) { el.style.backgroundImage = `url('./assets/images/${images[key]}')`; }
    }

    // ===== NEW DYNAMIC POSITIONING LOGIC =====

    // Get the current scroll position and viewport height
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;

    // --- Position C&C ---
    const cnc = aaState.elements.cnc;
    cnc.style.left = aaState.config.cnc.right; // CSS handles transform for centering
    cnc.style.transform = 'translateX(-50%)'; // Center it based on the 'right: 50%' value
    cnc.style.left = '50%';
    cnc.style.top = `${scrollY + viewportHeight - 145 - 5}px`; // (scroll + screen height) - element height - bottom offset

    // --- Position Launcher ---
    const launcher = aaState.elements.launcher;
    launcher.style.right = aaState.config.launcher.right;
    launcher.style.top = `${scrollY + viewportHeight - 235 - 10}px`;

    // --- Position Radar ---
    const radar = aaState.elements.radar;
    radar.style.left = aaState.config.radar.left;
    radar.style.transform = 'scaleX(-1)'; // Flip radar horizontally
    radar.style.top = `${scrollY + viewportHeight - 220 - 10}px`;
}

function startAAIntercept(uavData) {
    if (aaState.mode !== 'IDLE') return;
    resetGlobalAnimationState();
    createAndPositionAASystemElements();
    aaState.targetUAVObject = uavData;
    aaState.missilesRemaining = 4;
    aaState.mode = 'DEPLOYING';
    aaState.timeInMode = performance.now();
    window.isIntercepting = true;
    if (!targetBracketsAnimFrameId) { targetBracketsAnimFrameId = requestAnimationFrame(updateTargetBracketsPosition); }

    setTimeout(() => {
        if (aaState.mode !== 'DEPLOYING') return;
        ['cnc', 'launcher', 'radar'].forEach(key => { aaState.elements[key].style.opacity = '1'; });
        showSystemMessage("RADAR LOCK ACQUIRED", 1500);
        const radarLine = document.createElement('div');
        radarLine.className = 'radar-line';
        document.body.appendChild(radarLine);
        aaState.elements.radarLine = radarLine;
    }, 100);

    aaSystemUpdateId = requestAnimationFrame(runAASystem);
}
window.startAAIntercept = startAAIntercept;

function runAASystem(timestamp) {
    const elapsed = timestamp - aaState.timeInMode;
    if (!aaState.targetUAVObject || !aaState.targetUAVObject.alive) {
        if (aaState.mode !== 'DISENGAGING' && aaState.mode !== 'IDLE') {
             showSystemMessage("TARGET LOST. AA STANDING DOWN.", 2000);
             aaState.mode = 'DISENGAGING'; aaState.timeInMode = performance.now();
        }
    }
    
    switch (aaState.mode) {
        case 'DEPLOYING':
            if (elapsed > aaState.config.deployDuration) { aaState.mode = 'TRACKING'; aaState.timeInMode = timestamp; }
            break;
        case 'TRACKING':
            updateRadarLine();
            if (elapsed > aaState.config.trackingDuration) { aaState.mode = 'FIRING'; aaState.timeInMode = timestamp; aaState.lastFiredTimestamp = 0; }
            break;
        case 'FIRING':
            updateRadarLine();
            if (aaState.missilesRemaining > 0 && !aaState.missileInFlight) {
                if (timestamp - aaState.lastFiredTimestamp > aaState.config.reloadDuration) {
                    showSystemMessage(`FIRING MISSILE ${5 - aaState.missilesRemaining}/4...`, 1000);
                    launchAAMissile(); aaState.lastFiredTimestamp = timestamp;
                }
            } else if (aaState.missilesRemaining <= 0 && !aaState.missileInFlight) {
                showSystemMessage("MUNITIONS EXPENDED. DISENGAGING.", 2500);
                aaState.mode = 'DISENGAGING'; aaState.timeInMode = timestamp;
            }
            break;
        case 'DISENGAGING':
            if (elapsed < 50) {
                 ['cnc', 'launcher', 'radar', 'radarLine'].forEach(key => { if (aaState.elements[key]) aaState.elements[key].style.opacity = '0'; });
                if (targetBracketsAnimFrameId) { cancelAnimationFrame(targetBracketsAnimFrameId); targetBracketsAnimFrameId = null; }
                if(f35State.targetBracketsElement) f35State.targetBracketsElement.style.opacity = '0';
            }
            if (elapsed > aaState.config.disengageDuration) { resetGlobalAnimationState(); return; }
            break;
    }
    if (aaState.mode !== 'IDLE') { aaSystemUpdateId = requestAnimationFrame(runAASystem); }
}

function updateRadarLine() {
    const line = aaState.elements.radarLine;
    const radar = aaState.elements.radar;
    const uav = aaState.targetUAVObject;
    if (!line || !radar || !uav || !uav.element) return;
    
    // --- Get current scroll position ---
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    // --- Calculate the radar's position ON THE PAGE ---
    const radarRect = radar.getBoundingClientRect();
    // Start point: center of radar element (relative to screen) + scroll distance + offset
    const startX = radarRect.left + scrollX + (radarRect.width / 2) + aaState.config.radarLineStartOffset.x;
    const startY = radarRect.top + scrollY + (radarRect.height / 2) + aaState.config.radarLineStartOffset.y;

    // --- UAV's position is already relative to the page ---
    const endX = uav.x + aaState.config.radarLineEndOffset.x;
    const endY = uav.y + aaState.config.radarLineEndOffset.y;

    // --- Calculations remain the same ---
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    line.style.left = `${startX}px`;
    line.style.top = `${startY}px`;
    line.style.width = `${distance}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = 'left center';
    line.style.opacity = '1';
}

function launchAAMissile() {
    aaState.missileInFlight = true; aaState.missilesRemaining--;
    const { missile, launcher } = aaState.elements;
    const launcherRect = launcher.getBoundingClientRect();
    const slotIndex = 3 - aaState.missilesRemaining;
    const slot = aaState.config.launcherMissileSlots[slotIndex];
    if (!slot) { aaState.missileInFlight = false; return; }

    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    const state = aaState.missileFlightState;

    state.x = launcherRect.left + scrollX + slot.x;
    state.y = launcherRect.top + scrollY + slot.y;

    state.currentAngleDeg = aaState.config.missileInitialAngle;
    state.framesSinceLaunch = 0; state.homingActive = true;
    
    const initialAngleRad = state.currentAngleDeg * Math.PI / 180, initialSpeed = 2.0;
    state.velocityX = Math.cos(initialAngleRad) * initialSpeed;
    state.velocityY = Math.sin(initialAngleRad) * initialSpeed;

    missile.style.left = `${state.x}px`; missile.style.top = `${state.y}px`;
    missile.style.transform = `rotate(${state.currentAngleDeg}deg)`; missile.style.opacity = '1';

 if (aa_smokeIntervalId) clearInterval(aa_smokeIntervalId);
    aa_smokeIntervalId = setInterval(() => {
        if (missile.style.opacity === '0' || !window.isIntercepting) {
            clearInterval(aa_smokeIntervalId);
            aa_smokeIntervalId = null;
            return;
        }
        
        // 1. Define the dimensions for calculation
        const missileWidth = 76; // From your #aa-missile CSS
        const smokePuffSize = 10; // From your .smoke-trail CSS

        // 2. Calculate the missile's current center point
        const missileCenterX = state.x + missileWidth / 2;
        const missileCenterY = state.y + (10 / 2); // 10 is missile height

        // 3. Convert the missile's angle to radians for trigonometry
        const angleRad = state.currentAngleDeg * Math.PI / 180;

        // 4. Calculate the tail's position by going backwards from the center
        // We use cosine for the x-offset and sine for the y-offset.
        const tailX = missileCenterX - Math.cos(angleRad) * (missileWidth / 2);
        const tailY = missileCenterY - Math.sin(angleRad) * (missileWidth / 2);
        
        // 5. Create the smoke element
        const smokeTrail = document.createElement('div');
        smokeTrail.className = 'smoke-trail';
        
        // 6. Position the smoke, adjusting for its own size to center it on the tail
        smokeTrail.style.left = `${tailX - (smokePuffSize / 2)}px`;
        smokeTrail.style.top = `${tailY - (smokePuffSize / 2)}px`;
        
        document.body.appendChild(smokeTrail);
        smokeTrail.addEventListener('animationend', () => {
            if (smokeTrail.parentNode) smokeTrail.remove();
        });
    }, 50);

    animateAAMissile();
}

function animateAAMissile() {
    const state = aaState.missileFlightState, missile = aaState.elements.missile, target = aaState.targetUAVObject;
    if (!target || !target.alive || state.framesSinceLaunch > 400) {
        missile.style.opacity = '0'; aaState.missileInFlight = false;
        if(state.framesSinceLaunch > 400) showSystemMessage("MISSILE SELF-DESTRUCTED.", 1500);
        if (aa_missileAnimFrameId) cancelAnimationFrame(aa_missileAnimFrameId); aa_missileAnimFrameId = null;
        return;
    }
    state.framesSinceLaunch++;
    const frameCount = state.framesSinceLaunch;

    // --- NEW: Multi-Phase Flight Path Logic ---
    const straightenFrames = aaState.config.ascentStraightenFrames;
    const totalAscentFrames = straightenFrames + aaState.config.ascentBoostFrames;

    // Phase 1: Straightening Ascent (e.g., frames 1-40)
    if (frameCount <= straightenFrames) {
        const progress = frameCount / straightenFrames;
        const startAngle = aaState.config.missileInitialAngle;
        const endAngle = -90; // Straight up
        state.currentAngleDeg = startAngle + (endAngle - startAngle) * progress;
    }
    // Phase 2: Vertical Boost (e.g., frames 41-70)
    else if (frameCount <= totalAscentFrames) {
        state.currentAngleDeg = -90;
    }
    // Phase 3: Homing (This is your original logic, now placed here)
    else {
        // Using your custom values
        const HOMING_TURN_RATE = 1.5; 
        const dxToTarget = target.x - state.x;
        const dyToTarget = target.y - state.y;
        
        const angleToTargetDeg = Math.atan2(dyToTarget, dxToTarget) * 180 / Math.PI;
        let angleDiff = angleToTargetDeg - state.currentAngleDeg;
        while (angleDiff > 180) angleDiff -= 360; while (angleDiff < -180) angleDiff += 360;
        
        const turnAmount = Math.max(-HOMING_TURN_RATE, Math.min(HOMING_TURN_RATE, angleDiff));
        state.currentAngleDeg = (state.currentAngleDeg + turnAmount + 360) % 360;
    }

    // --- Physics Application (Runs for every phase) ---
    // Using your custom values
    const BOOSTER_ACCELERATION = 0.3;
    const MAX_MISSILE_SPEED = 6.0;

    const thrustAngleRad = state.currentAngleDeg * Math.PI / 180;
    state.velocityX += Math.cos(thrustAngleRad) * BOOSTER_ACCELERATION;
    state.velocityY += Math.sin(thrustAngleRad) * BOOSTER_ACCELERATION;
    const currentSpeed = Math.sqrt(state.velocityX ** 2 + state.velocityY ** 2);
    if (currentSpeed > MAX_MISSILE_SPEED) {
        const speedFactor = MAX_MISSILE_SPEED / currentSpeed;
        state.velocityX *= speedFactor; state.velocityY *= speedFactor;
    }
    // Update the missile's position in the state
    state.x += state.velocityX; 
    state.y += state.velocityY;

    // --- MOVED: Collision Check (Now happens AFTER position is updated) ---
    const dxToTarget = target.x - state.x;
    const dyToTarget = target.y - state.y;
    if (Math.sqrt(dxToTarget**2 + dyToTarget**2) < target.width / 2) {
        // This is your full, unchanged explosion and cleanup logic
        const explosion = document.querySelector('.explosion'); 
        if (explosion) {
            explosion.style.left = `${target.x - explosion.offsetWidth / 2}px`;
            explosion.style.top = `${target.y - explosion.offsetHeight / 2 - 55}px`;
            explosion.style.opacity = '1';
            explosion.style.animation = 'none';
            let currentExplosionFrame = 0;
            function animateExplosionStep() {
                if (currentExplosionFrame >= 48) {
                    if (explosion.parentNode) explosion.style.opacity = '0';
                    return;
                }
                const col = currentExplosionFrame % 8;
                const row = Math.floor(currentExplosionFrame / 8);
                explosion.style.backgroundPositionX = `-${col * 240}px`;
                explosion.style.backgroundPositionY = `-${row * 240}px`;
                currentExplosionFrame++;
                aa_explosionTimeoutId = setTimeout(animateExplosionStep, 800 / 48);
            }
            if (aa_explosionTimeoutId) clearTimeout(aa_explosionTimeoutId);
            animateExplosionStep();
        }
        handleUAVDestroyedVisuals(target, true);
        showSystemMessage("TARGET DESTROYED!", 2000);
        missile.style.opacity = '0';
        aaState.missileInFlight = false;
        aaState.mode = 'DISENGAGING';
        aaState.timeInMode = performance.now();
        if (aa_missileAnimFrameId) cancelAnimationFrame(aa_missileAnimFrameId);
        aa_missileAnimFrameId = null;
        return; // End the function here on impact
    }
    
    // --- Render the missile at its new position ---
    missile.style.left = `${state.x}px`; missile.style.top = `${state.y}px`;
    missile.style.transform = `rotate(${state.currentAngleDeg}deg)`;
    aa_missileAnimFrameId = requestAnimationFrame(animateAAMissile);
}

// ===== DUMMY FUNCTIONS & INITIALIZATION =====
function initCustomCursor() { /* Placeholder */ } function initScrollAnimations() { /* Placeholder */ } function initThemeToggle() { /* Placeholder */ } function initMobileMenu() { /* Placeholder */ } function initPortfolioFilter() { /* Placeholder */ } function initPortfolioModal() { /* Placeholder */ } function initTerminalAnimation() { /* Placeholder */ } function initSkillsAnimation() { /* Placeholder */ } function initScrollToTop() { /* Placeholder */ }

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor(); initScrollAnimations(); initThemeToggle(); initMobileMenu(); initPortfolioFilter(); initPortfolioModal(); initTerminalAnimation(); initSkillsAnimation(); initScrollToTop();

  ['.f35', '.missile', '.explosion'].forEach(selector => {
      if (!document.querySelector(selector)) {
          const el = document.createElement('div');
          el.className = selector.substring(1);
          document.body.appendChild(el);
          console.warn(`'${selector}' not found, created a dummy element.`);
      }
  });

  resetGlobalAnimationState();
  
  uavState.lastTimestamp = performance.now();
  runUAVSystem(uavState.lastTimestamp);
});