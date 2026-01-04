import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

const SimpleTooltip = ({ text }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative inline-flex items-center ml-2 cursor-help"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onClick={() => setIsVisible(!isVisible)} // Mobile support
        >
            <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />

            {isVisible && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border z-50 animate-in fade-in zoom-in-95 duration-200">
                    {text}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
                </div>
            )}
        </div>
    );
};

export default SimpleTooltip;
