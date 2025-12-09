import { FC } from 'react';
import { SvgProps } from 'react-native-svg';

// Bodies
import BodyRounded from '../../assets/sprites/bodies/rounded.svg';
import BodySquare from '../../assets/sprites/bodies/square.svg';
import BodyPill from '../../assets/sprites/bodies/pill.svg';

// Eyes
import EyesDefault from '../../assets/sprites/eyes/default.svg';

// Mouth
import MouthDefault from '../../assets/sprites/mouths/default.svg';

// Legs
import LegsDefault from '../../assets/sprites/legs/default.svg';

// Hats
import HatTallLeaves from '../../assets/sprites/hats/tall-leaves.svg';
import HatSprout from '../../assets/sprites/hats/sprout.svg';
import HatVine from '../../assets/sprites/hats/vine.svg';
import HatBush from '../../assets/sprites/hats/bush.svg';
import HatBranch from '../../assets/sprites/hats/branch.svg';
import HatLeaves from '../../assets/sprites/hats/leaves.svg';

export interface SpriteOption {
    id: string;
    label: string;
    component: FC<SvgProps>;
}

export const BODY_OPTIONS: SpriteOption[] = [
    { id: 'rounded', label: 'Rounded', component: BodyRounded },
    { id: 'square', label: 'Square', component: BodySquare },
    { id: 'pill', label: 'Pill', component: BodyPill },
];

export const HAT_OPTIONS: SpriteOption[] = [
    { id: 'leaves', label: 'Leaves', component: HatLeaves },
    { id: 'tall-leaves', label: 'Tall', component: HatTallLeaves },
    { id: 'sprout', label: 'Sprout', component: HatSprout },
    { id: 'vine', label: 'Vine', component: HatVine },
    { id: 'bush', label: 'Bush', component: HatBush },
    { id: 'branch', label: 'Branch', component: HatBranch },
];

export const EYES_COMPONENT = EyesDefault;
export const MOUTH_COMPONENT = MouthDefault;
export const LEGS_COMPONENT = LegsDefault;

export const COLOR_OPTIONS = [
    '#F5A0C7', '#D4A5A5', '#F5C5A0', '#CEEA99', '#5BBFBA',
    '#A0C4E8', '#C5B8E8', '#9B8DC7', '#7477A0', '#5A5A5A',
];

export const getBodyComponent = (shapeId: string) => 
    BODY_OPTIONS.find(b => b.id === shapeId)?.component ?? BodyRounded;

export const getHatComponent = (hatId: string) => 
    HAT_OPTIONS.find(h => h.id === hatId)?.component ?? HatLeaves;