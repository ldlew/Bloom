import Svg, { Path, Circle, Ellipse, G, Rect } from 'react-native-svg';

interface PartProps {
    color: string;
    size: number;
}

// Body shapes
export const BodyDefault = ({ color, size }: PartProps) => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
        <Ellipse cx="50" cy="50" rx="45" ry="40" fill={color} />
    </Svg>
);

export const BodyRound = ({ color, size }: PartProps) => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="45" fill={color} />
    </Svg>
);

export const BodySquare = ({ color, size }: PartProps) => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
        <Rect x="10" y="15" width="80" height="70" rx="15" fill={color} />
    </Svg>
);

export const BodyTall = ({ color, size }: PartProps) => (
    <Svg width={size} height={size * 1.2} viewBox="0 0 100 120">
        <Ellipse cx="50" cy="60" rx="40" ry="55" fill={color} />
    </Svg>
);

// Hat/top variations
interface HatProps {
    color: string;
    size: number;
}

export const HatLeaves = ({ color, size }: HatProps) => (
    <Svg width={size * 0.5} height={size * 0.4} viewBox="0 0 50 40">
        <Path 
            d="M25 35 Q15 20 25 5 Q35 20 25 35" 
            fill="#8BC34A" 
        />
        <Path 
            d="M20 30 Q5 20 15 5 Q25 15 20 30" 
            fill="#4CAF50" 
        />
    </Svg>
);

export const HatFlower = ({ color, size }: HatProps) => (
    <Svg width={size * 0.4} height={size * 0.4} viewBox="0 0 40 40">
        <Circle cx="20" cy="10" r="8" fill="#FF9800" />
        <Circle cx="10" cy="18" r="8" fill="#FF9800" />
        <Circle cx="30" cy="18" r="8" fill="#FF9800" />
        <Circle cx="14" cy="28" r="8" fill="#FF9800" />
        <Circle cx="26" cy="28" r="8" fill="#FF9800" />
        <Circle cx="20" cy="20" r="6" fill="#FFC107" />
    </Svg>
);

export const HatBow = ({ color, size }: HatProps) => (
    <Svg width={size * 0.5} height={size * 0.3} viewBox="0 0 50 30">
        <Path 
            d="M25 15 Q10 5 5 15 Q10 25 25 15" 
            fill="#E91E63" 
        />
        <Path 
            d="M25 15 Q40 5 45 15 Q40 25 25 15" 
            fill="#E91E63" 
        />
        <Circle cx="25" cy="15" r="5" fill="#C2185B" />
    </Svg>
);

export const HatNone = ({ color, size }: HatProps) => null;

// Eyes component
interface EyesProps {
    size: number;
}

export const Eyes = ({ size }: EyesProps) => {
    const eyeRadius = size * 0.12;
    const pupilRadius = size * 0.06;
    const spacing = size * 0.15;
    
    return (
        <Svg width={size} height={size * 0.4} viewBox="0 0 100 40">
            <G>
                {/* Left eye */}
                <Circle cx={35} cy={20} r={eyeRadius * 2.5} fill="white" />
                <Circle cx={37} cy={20} r={pupilRadius * 2} fill="#2e2e2e" />
                {/* Right eye */}
                <Circle cx={65} cy={20} r={eyeRadius * 2.5} fill="white" />
                <Circle cx={67} cy={20} r={pupilRadius * 2} fill="#2e2e2e" />
            </G>
        </Svg>
    );
};

// Mouth component
interface MouthProps {
    size: number;
}

export const Mouth = ({ size }: MouthProps) => (
    <Svg width={size * 0.3} height={size * 0.1} viewBox="0 0 30 10">
        <Rect x="5" y="2" width="20" height="6" rx="3" fill="#2e2e2e" />
    </Svg>
);

// Legs component
interface LegsProps {
    color: string;
    size: number;
}

export const Legs = ({ color, size }: LegsProps) => (
    <Svg width={size * 0.6} height={size * 0.5} viewBox="0 0 60 50">
        {/* Left leg */}
        <Path 
            d="M15 0 Q10 25 15 45 Q18 50 15 45" 
            stroke={color} 
            strokeWidth="8" 
            strokeLinecap="round"
            fill="none"
        />
        {/* Right leg */}
        <Path 
            d="M45 0 Q50 25 45 45 Q42 50 45 45" 
            stroke={color} 
            strokeWidth="8" 
            strokeLinecap="round"
            fill="none"
        />
    </Svg>
);