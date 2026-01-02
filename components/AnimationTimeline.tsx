import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Clock, Plus, Trash2, 
  ChevronDown, Settings2, Download, Video, Share2, 
  Maximize2, GripVertical, Box, Type, Layers
} from 'lucide-react';
import { LogoLayer, LayerAnimation, AnimationKeyframe, AnimationTrack, EasingType } from '../types';

interface AnimationTimelineProps {
  layers: LogoLayer[];
  animations: LayerAnimation[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onTogglePlay: () => void;
  onDurationChange: (duration: number) => void;
  onAddKeyframe: (layerId: string, property: string, time: number, value: number) => void;
  onRemoveKeyframe: (layerId: string, property: string, keyframeId: string) => void;
  onExportVideo: () => void;
}

const AnimationTimeline: React.FC<AnimationTimelineProps> = ({
  layers,
  animations,
  currentTime,
  duration,
  isPlaying,
  onTimeChange,
  onTogglePlay,
  onDurationChange,
  onAddKeyframe,
  onRemoveKeyframe,
  onExportVideo
}) => {
  const [expandedLayerId, setExpandedLayerId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = (x / rect.width) * duration;
    onTimeChange(Math.max(0, Math.min(duration, newTime)));
  };

  const getTrackForLayer = (layerId: string) => animations.find(a => a.layerId === layerId);

  return (
    <div className="h-80 bg-[#161618] border-t border-white/5 flex flex-col animate-in slide-in-from-bottom-24 duration-500 overflow-hidden">
      {/* Timeline Controls */}
      <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-black/20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <button className="p-2 text-gray-500 hover:text-white transition-colors" onClick={() => onTimeChange(0)}><SkipBack size={14}/></button>
            <button 
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-all active:scale-95"
              onClick={onTogglePlay}
            >
              {isPlaying ? <Pause size={14}/> : <Play size={14} className="ml-0.5"/>}
            </button>
            <button className="p-2 text-gray-500 hover:text-white transition-colors" onClick={() => onTimeChange(duration)}><SkipForward size={14}/></button>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center space-x-3 text-[10px] font-mono">
            <span className="text-blue-400 font-bold">{currentTime.toFixed(2)}s</span>
            <span className="text-gray-600">/</span>
            <input 
              type="number" 
              value={duration} 
              onChange={(e) => onDurationChange(parseFloat(e.target.value))}
              className="bg-transparent text-gray-400 outline-none w-10 text-center hover:text-white transition-colors"
            />
            <span className="text-gray-600">s</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">
            <Settings2 size={12}/>
            <span>Presets</span>
          </button>
          <button 
            onClick={onExportVideo}
            className="flex items-center space-x-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all active:scale-95"
          >
            <Video size={12}/>
            <span>Export MP4</span>
          </button>
        </div>
      </div>

      {/* Tracks & Keyframes Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Layer List Column */}
        <div className="w-64 border-r border-white/5 bg-black/10 overflow-y-auto scrollbar-hide">
          {layers.map(l => (
            <div key={l.id} className="flex flex-col border-b border-white/5">
              <button 
                onClick={() => setExpandedLayerId(expandedLayerId === l.id ? null : l.id)}
                className={`flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left ${expandedLayerId === l.id ? 'bg-white/5' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded bg-black/40 border border-white/10 flex items-center justify-center text-gray-500">
                    {l.type === 'icon' ? <Box size={12}/> : <Type size={12}/>}
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 capitalize">{l.type}</span>
                </div>
                <ChevronDown size={12} className={`text-gray-600 transition-transform ${expandedLayerId === l.id ? 'rotate-180' : ''}`} />
              </button>
              
              {expandedLayerId === l.id && (
                <div className="bg-black/40 border-t border-white/5 py-1">
                  {['scale', 'rotation', 'opacity'].map(prop => (
                    <div key={prop} className="px-10 py-1.5 flex items-center justify-between group">
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{prop}</span>
                      <button 
                        onClick={() => onAddKeyframe(l.id, prop, currentTime, (l as any)[prop])}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-blue-400 transition-all"
                      >
                        <Plus size={10}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Timeline Grid Column */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {/* Time Marker Bar */}
          <div 
            ref={timelineRef}
            className="h-8 bg-black/40 border-b border-white/5 cursor-crosshair relative"
            onClick={handleTimelineClick}
          >
            {/* Grid Lines */}
            {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute top-0 bottom-0 border-l border-white/5 flex flex-col items-start px-1"
                style={{ left: `${(i / duration) * 100}%` }}
              >
                <span className="text-[8px] font-mono text-gray-700 mt-1">{i}s</span>
              </div>
            ))}
            
            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-px bg-blue-500 z-50 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#161618] shadow-lg" />
            </div>
          </div>

          {/* Keyframe Tracks Container */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {layers.map(l => (
              <div key={l.id} className="flex flex-col border-b border-white/5">
                <div className="h-[44px] relative bg-transparent">
                  {/* Visual summary of keyframes for closed layer */}
                  {expandedLayerId !== l.id && getTrackForLayer(l.id)?.tracks.map(track => 
                    track.keyframes.map(kf => (
                      <div 
                        key={kf.id}
                        className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-700 rounded-sm rotate-45"
                        style={{ left: `${(kf.time / duration) * 100}%` }}
                      />
                    ))
                  )}
                </div>

                {expandedLayerId === l.id && (
                  <div className="bg-black/20">
                    {['scale', 'rotation', 'opacity'].map(prop => (
                      <div key={prop} className="h-6 relative border-t border-white/5 first:border-t-0">
                         {getTrackForLayer(l.id)?.tracks.find(t => t.property === prop)?.keyframes.map(kf => (
                           <div 
                             key={kf.id}
                             onContextMenu={(e) => { e.preventDefault(); onRemoveKeyframe(l.id, prop, kf.id); }}
                             className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 cursor-pointer transition-all border border-black shadow-lg ${Math.abs(currentTime - kf.time) < 0.05 ? 'bg-blue-400 scale-125' : 'bg-gray-500 hover:bg-gray-300'}`}
                             style={{ left: `${(kf.time / duration) * 100}%` }}
                             title={`Time: ${kf.time.toFixed(2)}s, Value: ${kf.value}`}
                           />
                         ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationTimeline;
