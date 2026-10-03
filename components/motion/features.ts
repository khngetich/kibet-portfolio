// The animation engine, loaded after the page instead of in its first download (see MotionPrefs).
// domMax because the header's active-link pill uses a shared layout animation (layoutId).
import { domMax } from 'motion/react';

export default domMax;
