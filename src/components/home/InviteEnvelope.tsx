/* The opened envelope under the invitation: cream paper, side and bottom flaps, the open flap lined in gold foil. */
export default function InviteEnvelope() {
  return (
    <svg className="lx-invite__env-art" viewBox="0 0 160 166">
    <defs>
    <linearGradient id="lx-invite-liner" gradientUnits="userSpaceOnUse" x1="4" y1="20" x2="156" y2="96">
    <stop offset="0" className="lx-invite__st-gold"/>
    <stop offset=".13" className="lx-invite__st-gold-hi"/>
    <stop offset=".27" className="lx-invite__st-gold"/>
    <stop offset=".5" className="lx-invite__st-gold-lo"/>
    <stop offset=".7" className="lx-invite__st-gold"/>
    <stop offset=".79" className="lx-invite__st-gold-hi"/>
    <stop offset=".88" className="lx-invite__st-gold"/>
    <stop offset="1" className="lx-invite__st-gold-lo"/>
    </linearGradient>
    <pattern id="lx-invite-lattice" width="4.4" height="4.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <path className="lx-invite__lattice-lo" d="M0,.2H4.4M.2,0V4.4"/>
    <path className="lx-invite__lattice-hi" d="M0,.48H4.4M.48,0V4.4"/>
    </pattern>
    <linearGradient id="lx-invite-paper" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="160" y2="166">
    <stop offset="0" className="lx-invite__st-paper-hi"/>
    <stop offset=".55" className="lx-invite__st-paper"/>
    <stop offset="1" className="lx-invite__st-paper-lo"/>
    </linearGradient>
    <filter id="lx-invite-flapshadow" x="-10%" y="-10%" width="120%" height="120%">
    <feGaussianBlur in="SourceAlpha" stdDeviation=".7"/>
    <feOffset dx=".45" dy=".7" result="s"/>
    <feFlood className="lx-invite__fx-ao"/>
    <feComposite in2="s" operator="in"/>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    </defs>
    <path className="lx-invite__env-paper" d="M0,60L74,4Q80,-.5 86,4L160,60V166H0Z"/>
    <path fill="url(#lx-invite-liner)" d="M5.7,60L75.3,7.7Q80,4.3 84.7,7.7L154.3,60V122H5.7Z"/>
    <path fill="url(#lx-invite-lattice)" d="M5.7,60L75.3,7.7Q80,4.3 84.7,7.7L154.3,60V122H5.7Z"/>
    <path className="lx-invite__env-fold" d="M5.7,59.9H154.3"/>
    <path className="lx-invite__env-fold-lip" d="M5.7,60.45H154.3"/>
    <g filter="url(#lx-invite-flapshadow)">
    <path className="lx-invite__env-paper" d="M0,61.2L79,107Q80,107.6 79,108.3L0,166Z"/>
    <path className="lx-invite__env-paper" d="M160,61.2L81,107Q80,107.6 81,108.3L160,166Z"/>
    </g>
    <g filter="url(#lx-invite-flapshadow)">
    <path className="lx-invite__env-paper" d="M0,163.5L74.5,99.6Q80,95 85.5,99.6L160,163.5V166H0Z"/>
    </g>
    <path className="lx-invite__env-edge" d="M0,61.2L79,107M160,61.2L81,107M0,163.5L74.5,99.6Q80,95 85.5,99.6L160,163.5"/>
    </svg>
  );
}
