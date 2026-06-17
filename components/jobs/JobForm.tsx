'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import type { TechnicianWithMeta } from '@/types';

const MapPreview = dynamic(() => import('./MapPreview'), { ssr: false });

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  type: z.enum(['installation', 'maintenance', 'repair', 'inspection', 'emergency']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  scheduledAt: z.string().min(1),
  estimatedDuration: z.coerce.number().int().min(15).max(480),
  customerName: z.string().min(2),
  customerPhone: z.string().min(7),
  customerEmail: z.string().email(),
  street: z.string().min(3),
  city: z.string().min(2),
  postCode: z.string().min(3),
  country: z.string().min(2).default('Norway'),
  longitude: z.coerce.number().default(10.7522),
  latitude: z.coerce.number().default(59.9139),
  technicianId: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const JOB_TYPES = [
  { value: 'installation', label: 'Installation', icon: '🔧' },
  { value: 'maintenance', label: 'Maintenance', icon: '🛠️' },
  { value: 'repair', label: 'Repair', icon: '⚙️' },
  { value: 'inspection', label: 'Inspection', icon: '🔍' },
  { value: 'emergency', label: 'Emergency', icon: '🚨' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#64748b' },
  { value: 'medium', label: 'Medium', color: '#3b82f6' },
  { value: 'high', label: 'High', color: '#f59e0b' },
  { value: 'critical', label: 'Critical', color: '#ef4444' },
];

export function JobForm() {
  const [step, setStep] = useState(1);
  const [technicians, setTechnicians] = useState<TechnicianWithMeta[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [mapCoords, setMapCoords] = useState<[number, number]>([10.7522, 59.9139]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      country: 'Norway',
      longitude: 10.7522,
      latitude: 59.9139,
      priority: 'medium',
      type: 'maintenance',
    },
  });

  const selectedType = watch('type');
  const selectedPriority = watch('priority');
  const selectedTech = watch('technicianId');
  const values = watch();

  const goNext = async () => {
    const fields: Record<number, (keyof FormData)[]> = {
      1: ['title', 'description', 'type', 'priority', 'scheduledAt', 'estimatedDuration'],
      2: ['customerName', 'customerPhone', 'customerEmail', 'street', 'city', 'postCode'],
    };
    const valid = await trigger(fields[step]);
    if (valid) {
      if (step === 2) {
        const res = await fetch('/api/technicians');
        const data = await res.json();
        if (data.success) setTechnicians(data.data);
      }
      setStep((s) => s + 1);
    }
  };

  const onAddressBlur = useCallback(async () => {
    const address = `${values.street}, ${values.city}, ${values.postCode}, ${values.country}`;
    if (!values.street || !values.city) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'DispatchIQ/1.0' } });
      const results = await res.json();
      if (results[0]) {
        const lng = parseFloat(results[0].lon);
        const lat = parseFloat(results[0].lat);
        setValue('longitude', lng);
        setValue('latitude', lat);
        setMapCoords([lng, lat]);
      }
    } catch {/* ignore geocoding errors */}
  }, [values.street, values.city, values.postCode, values.country, setValue]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const body = {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        scheduledAt: data.scheduledAt,
        estimatedDuration: data.estimatedDuration,
        customer: {
          name: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail,
          address: { street: data.street, city: data.city, postCode: data.postCode, country: data.country },
        },
        location: { type: 'Point', coordinates: [data.longitude, data.latitude] },
        technicianId: data.technicianId || undefined,
        notes: data.notes ?? '',
      };

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Job created!');
        router.push('/jobs');
      } else {
        toast.error(result.error ?? 'Failed to create job');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${s <= step ? 'bg-accent-blue text-white' : 'bg-bg-card text-text-secondary border border-border-dark'}`}>
              {s}
            </div>
            <div className={`flex-1 h-0.5 ${s < step ? 'bg-accent-blue' : 'bg-border-dark'} ${s === 3 ? 'hidden' : ''}`} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-text-secondary mb-6 -mt-6">
        <span>Job Details</span>
        <span>Customer & Location</span>
        <span>Assignment</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <Input label="Job Title" {...register('title')} error={errors.title?.message} />
            <Textarea label="Description" {...register('description')} error={errors.description?.message} rows={3} />

            <div>
              <p className="text-sm font-medium text-text-secondary mb-2">Job Type</p>
              <div className="grid grid-cols-5 gap-2">
                {JOB_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setValue('type', t.value as FormData['type'])}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-all ${selectedType === t.value ? 'border-accent-blue bg-accent-blue/10 text-accent-blue' : 'border-border-dark text-text-secondary hover:border-accent-blue/50'}`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-text-secondary mb-2">Priority</p>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setValue('priority', p.value as FormData['priority'])}
                    className={`py-2 rounded-lg border text-xs font-medium transition-all ${selectedPriority === p.value ? 'border-current' : 'border-border-dark text-text-secondary'}`}
                    style={selectedPriority === p.value ? { borderColor: p.color, backgroundColor: `${p.color}20`, color: p.color } : {}}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Scheduled At" type="datetime-local" {...register('scheduledAt')} error={errors.scheduledAt?.message} />
              <Input label="Duration (minutes)" type="number" min={15} max={480} {...register('estimatedDuration')} error={errors.estimatedDuration?.message} />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Customer Name" {...register('customerName')} error={errors.customerName?.message} />
              <Input label="Phone" {...register('customerPhone')} error={errors.customerPhone?.message} />
            </div>
            <Input label="Email" type="email" {...register('customerEmail')} error={errors.customerEmail?.message} />
            <Input label="Street Address" {...register('street')} onBlur={onAddressBlur} error={errors.street?.message} />
            <div className="grid grid-cols-3 gap-3">
              <Input label="City" {...register('city')} onBlur={onAddressBlur} error={errors.city?.message} />
              <Input label="Post Code" {...register('postCode')} onBlur={onAddressBlur} error={errors.postCode?.message} />
              <Input label="Country" {...register('country')} error={errors.country?.message} />
            </div>

            <div className="h-48 rounded-xl overflow-hidden border border-border-dark">
              <MapPreview coordinates={mapCoords} />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-text-secondary mb-3">Select Technician (optional)</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <div
                  onClick={() => setValue('technicianId', '')}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${!selectedTech ? 'border-accent-blue bg-accent-blue/10' : 'border-border-dark hover:border-accent-blue/50'}`}
                >
                  <span className="text-text-secondary text-sm italic">Leave unassigned</span>
                </div>
                {technicians.map((tech) => (
                  <div
                    key={tech._id}
                    onClick={() => setValue('technicianId', tech._id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedTech === tech._id ? 'border-accent-blue bg-accent-blue/10' : 'border-border-dark hover:border-accent-blue/50'}`}
                  >
                    <div className="h-8 w-8 rounded-full bg-bg-card border border-border-dark flex items-center justify-center text-xs font-bold text-accent-blue">
                      {tech.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{tech.name}</p>
                      <div className="flex gap-1 flex-wrap">
                        {tech.skills.slice(0, 3).map((s) => (
                          <span key={s} className="text-[10px] px-1.5 bg-bg-card text-text-secondary rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-text-secondary">{tech.activeJobCount} jobs</span>
                    {tech.isAvailable && (
                      <span className="h-2 w-2 bg-accent-emerald rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Textarea label="Internal Notes" {...register('notes')} rows={3} />

            {/* Summary */}
            <div className="bg-bg-card rounded-xl p-4 border border-border-dark space-y-1 text-sm">
              <p className="font-semibold text-text-primary mb-2">Review</p>
              <p className="text-text-secondary"><span className="text-text-primary">Title:</span> {values.title}</p>
              <p className="text-text-secondary"><span className="text-text-primary">Type:</span> {values.type} • <span className="text-text-primary">Priority:</span> {values.priority}</p>
              <p className="text-text-secondary"><span className="text-text-primary">Customer:</span> {values.customerName}</p>
              <p className="text-text-secondary"><span className="text-text-primary">Address:</span> {values.street}, {values.city}</p>
              <p className="text-text-secondary"><span className="text-text-primary">Scheduled:</span> {values.scheduledAt}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" onClick={goNext} className="ml-auto">
              Next
            </Button>
          ) : (
            <Button type="submit" loading={submitting} className="ml-auto">
              Create Job
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
