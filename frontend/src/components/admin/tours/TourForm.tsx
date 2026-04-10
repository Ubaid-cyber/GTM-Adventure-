'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  AlertCircle,
  Clock,
  MapPin,
  Mountain,
  ChevronDown,
  LayoutGrid,
  ListChecks,
  Backpack,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const tourSchema = z.object({
  title: z.string().min(3, 'Tour title must be at least 3 characters'),
  description: z.string().min(20, 'Provide a detailed tour description (20+ chars)'),
  location: z.string().min(3, 'Tour location required'),
  durationDays: z.coerce.number().min(1, 'Tour must last at least 1 day'),
  difficulty: z.string().min(1, 'Tour difficulty required'),
  price: z.coerce.number().min(0, 'Tour price must be zero or more'),
  maxAltitude: z.coerce.number().nullable(),
  bestSeason: z.string().nullable(),
  coverImage: z.string().url('Invalid image URL').or(z.literal('')),
  maxCapacity: z.coerce.number().min(1, 'Minimum 1 spot required'),
  highlights: z.array(z.object({ value: z.string().min(1, 'Highlight required') })).min(1, 'Add at least one tour highlight'),
  inclusions: z.array(z.object({ value: z.string().min(1, 'Item required') })).min(1, 'Add what is included'),
  exclusions: z.array(z.object({ value: z.string().min(1, 'Item required') })).min(1, 'Add what is excluded'),
  gearRequirements: z.array(z.object({ value: z.string() })).default([]),
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string().min(1, 'Day title required'),
    description: z.string().min(1, 'Day description required')
  })).min(1, 'Tour itinerary required'),
  gallery: z.array(z.object({ value: z.string().url('Invalid image URL').or(z.literal('')) })).default([])
});

type TourFormValues = z.infer<typeof tourSchema>;

interface TourFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export default function TourForm({ initialData, onSubmit, loading }: TourFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'itinerary' | 'logistics'>('basic');
  
  // 🔄 Hydrate data from DB (Strings) to UI (Objects)
  const formatInitialData = (data: any) => {
    if (!data) return undefined;
    return {
      ...data,
      highlights: data.highlights?.map((v: string) => ({ value: v })) || [{ value: '' }],
      inclusions: data.inclusions?.map((v: string) => ({ value: v })) || [{ value: '' }],
      exclusions: data.exclusions?.map((v: string) => ({ value: v })) || [{ value: '' }],
      gearRequirements: data.gearRequirements?.map((v: string) => ({ value: v })) || [{ value: '' }],
      itinerary: data.itinerary || [{ day: 1, title: 'Arrival', description: '' }],
      gallery: data.gallery?.map((v: string) => ({ value: v })) || []
    };
  };

  const { register, control, handleSubmit, formState: { errors }, watch } = useForm<TourFormValues>({
    resolver: zodResolver(tourSchema) as any,
    defaultValues: formatInitialData(initialData) || {
      title: '',
      description: '',
      location: '',
      durationDays: 1,
      difficulty: 'Moderate',
      price: 0,
      maxAltitude: 0,
      bestSeason: '',
      coverImage: '',
      maxCapacity: 15,
      highlights: [{ value: '' }],
      inclusions: [{ value: '' }],
      exclusions: [{ value: '' }],
      gearRequirements: [{ value: '' }],
      itinerary: [{ day: 1, title: 'Arrival', description: '' }]
    }
  });

  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control, name: 'highlights'
  });

  const { fields: inclusionFields, append: appendInclusion, remove: removeInclusion } = useFieldArray({
    control, name: 'inclusions'
  });

  const { fields: exclusionFields, append: appendExclusion, remove: removeExclusion } = useFieldArray({
    control, name: 'exclusions'
  });

  const { fields: gearFields, append: appendGear, remove: removeGear } = useFieldArray({
    control, name: 'gearRequirements'
  });

  const { fields: itineraryFields, append: appendDay, remove: removeDay } = useFieldArray({
    control, name: 'itinerary'
  });

  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control, name: 'gallery'
  });

  const onFormSubmit = async (data: TourFormValues) => {
    try {
      const submissionData = {
        ...data,
        highlights: data.highlights.map(h => h.value),
        inclusions: data.inclusions.map(i => i.value),
        exclusions: data.exclusions.map(e => e.value),
        gearRequirements: data.gearRequirements?.map(g => g.value) || [],
        gallery: data.gallery?.map(img => img.value).filter(v => v !== '') || [],
      };
      
      await onSubmit(submissionData);
      toast.success(initialData ? 'Tour updated successfully' : 'Tour created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`
        flex items-center gap-2.5 px-6 py-4 border-b-2 transition-all duration-300
        ${activeTab === id ? 'border-blue-500 bg-blue-500/5 text-white' : 'border-transparent text-white/40 hover:text-white/70'}
      `}
    >
      <Icon className={`w-4 h-4 ${activeTab === id ? 'text-blue-500' : ''}`} />
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
    </button>
  );

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 max-w-5xl mx-auto pb-24">
      {/* 🧭 Header & Action Navigation */}
      <div className="flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl sticky top-24 z-40 shadow-2xl">
        <div className="flex gap-1">
          <TabButton id="basic" label="Tour Info" icon={LayoutGrid} />
          <TabButton id="itinerary" label="Itinerary" icon={CalendarDays} />
          <TabButton id="logistics" label="Details" icon={ListChecks} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {initialData ? 'Update Tour' : 'Create Tour'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'basic' && (
          <motion.div
            key="basic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Tour Title</label>
              <input 
                {...register('title')}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-bold text-lg placeholder:text-white/10"
                placeholder="Ex: Everest Base Camp Trek"
              />
              {errors.title && <p className="text-rose-500 text-[10px] font-bold mt-1 px-1 flex items-center gap-1 uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> {errors.title.message}</p>}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Tour Description</label>
              <textarea 
                {...register('description')}
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm placeholder:text-white/10"
                placeholder="Tell us about this trek..."
              />
              {errors.description && <p className="text-rose-500 text-[10px] font-bold mt-1 px-1 flex items-center gap-1 uppercase tracking-wider"><AlertCircle className="w-3 h-3" /> {errors.description.message}</p>}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input {...register('location')} className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white" placeholder="Region, Country" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1 text-nowrap">Duration (Days)</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input type="number" {...register('durationDays')} className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Max Altitude (Meters)</label>
                  <div className="relative">
                    <Mountain className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input type="number" {...register('maxAltitude')} className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Price (₹)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-blue-500 font-bold">₹</span>
                </div>
                <input 
                  type="number" 
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-8 pr-4 text-sm text-white focus:outline-none focus:border-blue-600/50 transition-all font-bold"
                />
              </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Difficulty</label>
                  <select {...register('difficulty')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500">
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Max Capacity</label>
                  <div className="relative">
                    <Backpack className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input type="number" {...register('maxCapacity')} className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Cover Image URL</label>
              <input {...register('coverImage')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white/60 font-mono" placeholder="Ex: https://example.com/image.jpg" />
              <div className="mt-4 w-full h-48 rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.02] overflow-hidden group">
                {watch('coverImage') ? (
                  <img src={watch('coverImage')} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10 flex-col gap-2">
                    <LayoutGrid className="w-8 h-8" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Image Preview</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'itinerary' && (
          <motion.div
            key="itinerary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold uppercase tracking-[0.2em] text-xs">Tour Itinerary</h3>
              <button 
                type="button" 
                onClick={() => appendDay({ day: itineraryFields.length + 1, title: '', description: '' })}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/10 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Day
              </button>
            </div>

            <div className="space-y-4">
              {itineraryFields.map((field, index) => (
                <div key={field.id} className="relative bg-white/5 border border-white/10 rounded-2xl p-6 group">
                  <div className="absolute -left-3 top-6 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black italic shadow-lg shadow-blue-600/30">
                    D{index + 1}
                  </div>
                  <div className="flex gap-4 mb-4">
                    <input 
                      {...register(`itinerary.${index}.title`)} 
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-blue-500" 
                      placeholder="Daily Objective Title"
                    />
                    <button type="button" onClick={() => removeDay(index)} className="p-2.5 text-white/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea 
                    {...register(`itinerary.${index}.description`)} 
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white/60 outline-none focus:border-blue-500"
                    placeholder="Provide a detailed briefing for this day's operation..."
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'logistics' && (
          <motion.div
            key="logistics"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Highlights List */}
            <div className="space-y-4 p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-blue-400 font-bold uppercase tracking-widest text-[10px]">Tour Highlights</h3>
                <button type="button" onClick={() => appendHighlight({ value: '' })} className="p-1 hover:bg-white/10 rounded transition-colors"><Plus className="w-3.5 h-3.5 text-blue-500" /></button>
              </div>
              <div className="space-y-2">
                {highlightFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input {...register(`highlights.${index}.value`)} className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/80" placeholder="e.g. Helicopter evacuation support included" />
                    <button type="button" onClick={() => removeHighlight(index)} className="p-2 text-white/20 hover:text-rose-500"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions List */}
            <div className="space-y-4 p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-green-400 font-bold uppercase tracking-widest text-[10px]">What's Included</h3>
                <button type="button" onClick={() => appendInclusion({ value: '' })} className="p-1 hover:bg-white/10 rounded transition-colors"><Plus className="w-3.5 h-3.5 text-green-500" /></button>
              </div>
              <div className="space-y-2">
                {inclusionFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input {...register(`inclusions.${index}.value`)} className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/80" placeholder="e.g. Professional Mountain Guide" />
                    <button type="button" onClick={() => removeInclusion(index)} className="p-2 text-white/20 hover:text-rose-500"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusions List */}
            <div className="space-y-4 p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-rose-400 font-bold uppercase tracking-widest text-[10px]">What's Excluded</h3>
                <button type="button" onClick={() => appendExclusion({ value: '' })} className="p-1 hover:bg-white/10 rounded transition-colors"><Plus className="w-3.5 h-3.5 text-rose-500" /></button>
              </div>
              <div className="space-y-2">
                {exclusionFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input {...register(`exclusions.${index}.value`)} className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/80" placeholder="e.g. Personal medical kit" />
                    <button type="button" onClick={() => removeExclusion(index)} className="p-2 text-white/20 hover:text-rose-500"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Gear Requirements List */}
            <div className="space-y-4 p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-amber-400 font-bold uppercase tracking-widest text-[10px]">Gear Requirements</h3>
                <button type="button" onClick={() => appendGear({ value: '' })} className="p-1 hover:bg-white/10 rounded transition-colors"><Plus className="w-3.5 h-3.5 text-amber-500" /></button>
              </div>
              <div className="space-y-2">
                {gearFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input {...register(`gearRequirements.${index}.value`)} className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/80" placeholder="e.g. Crampons (Type C1)" />
                    <button type="button" onClick={() => removeGear(index)} className="p-2 text-white/20 hover:text-rose-500"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Expedition Gallery */}
            <div className="md:col-span-2 space-y-4 p-6 bg-white/[0.02] border border-white/10 rounded-2xl mt-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="space-y-1">
                  <h3 className="text-blue-500 font-black uppercase tracking-[0.2em] text-xs">Expedition Gallery</h3>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Add up to 30 high-definition expedition photos</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => appendGallery({ value: '' })} 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-blue-500/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Image Link
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryFields.map((field, index) => (
                  <div key={field.id} className="space-y-3 group bg-black/20 p-3 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all shadow-xl">
                    <div className="relative group/field">
                      <input 
                        {...register(`gallery.${index}.value`)} 
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-[10px] font-mono text-white/60 focus:border-blue-500 focus:text-white outline-none transition-all placeholder:text-white/10" 
                        placeholder="Paste Image URL (Unsplash, Pinterest, etc.)" 
                      />
                      <button 
                        type="button" 
                        onClick={() => removeGallery(index)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Tiny Preview */}
                    <div className="aspect-video w-full rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden group-hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all">
                      {watch(`gallery.${index}.value`) ? (
                        <img 
                          src={watch(`gallery.${index}.value`)} 
                          alt={`Gallery Preview ${index + 1}`} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                          onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/000000/FFFFFF?text=Invalid+Image+URL')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center flex-col gap-2 opacity-10">
                          <Mountain className="w-8 h-8" />
                          <p className="text-[8px] font-bold uppercase tracking-tighter">Awaiting Signal...</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {galleryFields.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[32px] group hover:border-blue-500/20 transition-all cursor-pointer" onClick={() => appendGallery({ value: '' })}>
                   <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/10 transition-all">
                      <LayoutGrid className="w-8 h-8 text-white/10 group-hover:text-blue-500 transition-colors" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-xs font-black text-white/20 uppercase tracking-[0.2em] group-hover:text-white/40">No Visual Assets Loaded</p>
                      <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest">Click to initialize expedition gallery</p>
                   </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
