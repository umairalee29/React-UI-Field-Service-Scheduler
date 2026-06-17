import { JobForm } from '@/components/jobs/JobForm';

export const metadata = { title: 'New Job — DispatchIQ' };

export default function NewJobPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-text-primary mb-8 font-heading">Create New Job</h2>
      <JobForm />
    </div>
  );
}
