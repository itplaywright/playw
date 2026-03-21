"use client"
import { useState, useRef, useEffect } from "react"
import { X, Play, Pause, Volume2, MonitorPlay } from "lucide-react"

export default function PseudoVideoPlayer({ videoUrl, initialCode, title }: { videoUrl: string, initialCode: string, title: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const audioRef = useRef<HTMLAudioElement>(null)

    // Handle time update
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
            if (audioRef.current.duration) {
                setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
            }
        }
    }

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause()
            else audioRef.current.play()
            setIsPlaying(!isPlaying)
        }
    }

    // Auto play when opened
    useEffect(() => {
        if (isOpen && audioRef.current) {
            audioRef.current.playbackRate = 1.25
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(e => {
                    console.log("Autoplay blocked:", e)
                    setIsPlaying(false)
                })
        } else {
            setIsPlaying(false)
            setProgress(0)
            setCurrentTime(0)
        }
    }, [isOpen])

    const formatTime = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds)) return "0:00"
        const m = Math.floor(timeInSeconds / 60)
        const s = Math.floor(timeInSeconds % 60)
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] mb-6"
            >
                <MonitorPlay className="w-5 h-5 fill-current" />
                Дивитись відео-пояснення
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 lg:p-12 animate-in fade-in zoom-in-95 duration-200">
                    <div className="relative w-full max-w-5xl h-full lg:h-[85vh] flex flex-col bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">

                        {/* Hidden Audio Element */}
                        <audio
                            ref={audioRef}
                            src={videoUrl}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                            onEnded={() => setIsPlaying(false)}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />

                        {/* Top Bar */}
                        <div className="absolute top-0 left-0 right-0 p-4 lg:p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    <MonitorPlay className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm lg:text-lg drop-shadow-md">{title}</h3>
                                    <p className="text-blue-300 text-xs font-medium">Ментор (🇺🇦)</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white p-2 border border-white/10 rounded-full hover:bg-white/10 transition-colors bg-black/50 backdrop-blur-sm">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Visuals - Code Editor Style */}
                        <div className="flex-1 p-4 lg:p-12 flex flex-col items-center justify-center relative bg-[#090b10]">
                            <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

                            <div className="w-full max-w-4xl bg-[#1e1e1e] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative z-10 opacity-95">
                                {/* Editor Header */}
                                <div className="h-10 bg-[#2d2d2d] flex items-center px-4 border-b border-slate-700">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                                    </div>
                                    <div className="mx-auto text-xs text-slate-400 font-mono flex items-center gap-2">
                                        <span>playwright.test.ts</span>
                                    </div>
                                </div>
                                <div className="p-6 overflow-y-auto max-h-[50vh] scrollbar-thin scrollbar-thumb-slate-700">
                                    <pre className="font-mono text-sm lg:text-base text-[#9cdcfe] whitespace-pre-wrap leading-relaxed">
                                        <code>{initialCode}</code>
                                    </pre>
                                </div>
                            </div>

                            {/* AI Speaking Indicator */}
                            <div className={`absolute bottom-8 flex items-center gap-3 bg-blue-500/20 border border-blue-500/30 px-5 py-3 rounded-full backdrop-blur-md transition-all duration-500 ${isPlaying ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
                                <div className="flex gap-1 items-center h-4">
                                    <div className="w-1 bg-blue-400 rounded-full animate-pulse" style={{ height: isPlaying ? '100%' : '4px', animationDelay: '0ms' }} />
                                    <div className="w-1 bg-blue-400 rounded-full animate-pulse" style={{ height: isPlaying ? '60%' : '4px', animationDelay: '150ms' }} />
                                    <div className="w-1 bg-blue-400 rounded-full animate-pulse" style={{ height: isPlaying ? '80%' : '4px', animationDelay: '300ms' }} />
                                    <div className="w-1 bg-blue-400 rounded-full animate-pulse" style={{ height: isPlaying ? '40%' : '4px', animationDelay: '450ms' }} />
                                </div>
                                <span className="text-blue-200 text-sm font-semibold tracking-wide">Ментор пояснює код...</span>
                            </div>
                        </div>

                        {/* Bottom Controls */}
                        <div className="h-24 bg-slate-900 border-t border-slate-800 flex items-center px-4 lg:px-8 gap-4 lg:gap-8 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                            <button
                                onClick={togglePlay}
                                className="text-white hover:text-blue-400 transition-colors w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/5 active:scale-90"
                            >
                                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                            </button>

                            {/* Progress bar */}
                            <div className="flex-1 flex items-center gap-3 lg:gap-5">
                                <span className="text-xs text-slate-400 font-mono w-10 text-right">
                                    {formatTime(currentTime)}
                                </span>
                                <div className="flex-1 h-3 bg-slate-800/80 rounded-full overflow-hidden relative group cursor-pointer"
                                    onClick={(e) => {
                                        if (audioRef.current && duration) {
                                            const rect = e.currentTarget.getBoundingClientRect()
                                            const x = e.clientX - rect.left
                                            const percentage = Math.max(0, Math.min(1, x / rect.width))
                                            audioRef.current.currentTime = percentage * duration
                                            setCurrentTime(percentage * duration)
                                            setProgress(percentage * 100)
                                        }
                                    }}
                                >
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        style={{ width: `${progress}%` }}
                                    />
                                    <div
                                        className="absolute top-0 bottom-0 bg-white shadow-md rounded-full w-3 -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ left: `${progress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-400 font-mono w-10">
                                    {formatTime(duration)}
                                </span>
                            </div>

                            <div className="hidden sm:flex items-center gap-3 text-slate-400">
                                <Volume2 className="w-5 h-5" />
                                <div className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs font-bold text-slate-300 shadow-inner">
                                    1.25x
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    )
}
