import { GALAXY_CONFIG } from "../config/galaxyConfig";

const biasRandom = (power) => Math.pow(Math.random(), power);
const gaussianNoise = (factor) => (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / 3 * factor;

export const createGalaxyStars = () => {
  return Array.from({ length: GALAXY_CONFIG.starCount }).map((_, index) => {
    const depth = biasRandom(2); 
    const radius = biasRandom(1.5); 
    const armOffset = (Math.random() * GALAXY_CONFIG.numArms | 0) * (2 * Math.PI / GALAXY_CONFIG.numArms);
    const baseAngle = Math.random() * 0.2 - 0.1;
    const spiralAngle = baseAngle + armOffset + radius * GALAXY_CONFIG.spiralTwist; 

    return {
      id: index,
      radius,
      baseAngle: spiralAngle, 
      depth,
      size: depth * 2.5 + 0.3, 
      baseOpacity: depth * 0.8 + 0.1,
      color: GALAXY_CONFIG.starColors[Math.floor(Math.random() * GALAXY_CONFIG.starColors.length)],
      twinkleSpeed: Math.random() * 0.003 + 0.001,
      twinklePhase: Math.random() * Math.PI * 2,
      offsetX: gaussianNoise(GALAXY_CONFIG.clumpingFactor),
      offsetY: gaussianNoise(GALAXY_CONFIG.clumpingFactor),
      
      // Stati per le animazioni successive
      activationTime: null, 
      personData: null,     
      isFalling: false,
      isDead: false,
      fallStartTime: 0,
      fallX: 0,
      fallY: 0,
      fallVX: 0,
      fallVY: 0
    };
  });
};