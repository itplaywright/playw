"use client"

import { motion } from "framer-motion"

const skills = [
    "Locators & Selectors",
    "Actions & Assertions",
    "Page Object Model",
    "API Testing",
    "Parallel Execution",
    "Visual Testing",
    "Network Interception",
    "Authentication Flows",
]

export default function Skills() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
                    {skills.map((skill, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="px-8 py-4 rounded-2xl bg-muted/50 border border-border text-foreground font-bold text-lg hover:border-blue-500/50 hover:bg-card transition-all cursor-default shadow-sm hover:shadow-lg hover:-translate-y-1"
                        >
                            {skill}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
