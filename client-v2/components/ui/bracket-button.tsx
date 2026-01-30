"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface BracketButtonProps extends React.ComponentProps<typeof motion.button> {
    children: React.ReactNode;
    variant?: "primary" | "secondary";
}

export default function BracketButton({
    children,
    className,
    variant = "primary",
    ...props
}: BracketButtonProps) {
    return (
        <motion.button
            whileHover="hover"
            initial="initial"
            className={cn(
                "relative group px-6 py-3 font-mono text-sm tracking-widest uppercase transition-all duration-300",
                variant === "primary" ? "text-white" : "text-gray-400 hover:text-white",
                className
            )}
            {...props}
        >
            {/* Left Bracket */}
            <motion.span
                variants={{
                    initial: { x: 0 },
                    hover: { x: 4 }
                }}
                className="absolute left-0 top-0 bottom-0 flex items-center"
            >
                <span className="text-xl font-light opacity-50 text-white select-none">[</span>
            </motion.span>

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>

            {/* Right Bracket */}
            <motion.span
                variants={{
                    initial: { x: 0 },
                    hover: { x: -4 }
                }}
                className="absolute right-0 top-0 bottom-0 flex items-center"
            >
                <span className="text-xl font-light opacity-50 text-white select-none">]</span>
            </motion.span>

            {/* Background Glitch Hover Effect */}
            <motion.div
                variants={{
                    initial: { opacity: 0, scaleX: 0.8 },
                    hover: { opacity: 1, scaleX: 1 }
                }}
                className="absolute inset-0 bg-white/5 skew-x-12 z-0"
            />
        </motion.button>
    );
}
