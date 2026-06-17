import nodemailer from 'nodemailer';
import type { IJob, IUser } from '@/types';

function createTransporter() {
  const isDev = !process.env['SMTP_HOST'];

  if (isDev) {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host: process.env['SMTP_HOST'],
    port: Number(process.env['SMTP_PORT'] ?? 587),
    secure: Number(process.env['SMTP_PORT']) === 465,
    auth: {
      user: process.env['SMTP_USER'],
      pass: process.env['SMTP_PASS'],
    },
  });
}

async function send(options: nodemailer.SendMailOptions): Promise<void> {
  const transporter = createTransporter();
  const isDev = !process.env['SMTP_HOST'];

  try {
    const info = await transporter.sendMail({
      from: process.env['SMTP_FROM'] ?? 'noreply@dispatchiq.com',
      ...options,
    });

    if (isDev) {
      console.log('[Mailer] Email sent (dev mode):');
      console.log('  To:', options.to);
      console.log('  Subject:', options.subject);
      console.log('  Body:', options.text);
    } else {
      console.log('[Mailer] Email sent:', info.messageId);
    }
  } catch (err) {
    console.error('[Mailer] Failed to send email:', err);
  }
}

export async function sendJobAssignedEmail(
  technician: Pick<IUser, 'name' | 'email'>,
  job: Pick<IJob, 'jobNumber' | 'title' | 'customer' | 'scheduledAt' | 'priority' | '_id'>
): Promise<void> {
  await send({
    to: technician.email,
    subject: `New job assigned: ${job.jobNumber} — ${job.title}`,
    text: `
Hi ${technician.name},

A new job has been assigned to you.

Job Number: ${job.jobNumber}
Title: ${job.title}
Priority: ${job.priority.toUpperCase()}
Scheduled: ${new Date(job.scheduledAt).toLocaleString()}

Customer: ${job.customer.name}
Address: ${job.customer.address.street}, ${job.customer.address.city}
Phone: ${job.customer.phone}

View job: ${process.env['NEXT_PUBLIC_APP_URL']}/my-jobs/${job._id}

Best,
DispatchIQ
    `.trim(),
  });
}

export async function sendJobStatusUpdateEmail(
  recipient: Pick<IUser, 'name' | 'email'>,
  job: Pick<IJob, 'jobNumber' | 'title' | 'status' | '_id'>,
  changedBy: Pick<IUser, 'name'>,
  note?: string
): Promise<void> {
  await send({
    to: recipient.email,
    subject: `Job ${job.jobNumber} updated to: ${job.status.replace('_', ' ')}`,
    text: `
Hi ${recipient.name},

Job ${job.jobNumber} has been updated.

Title: ${job.title}
New Status: ${job.status.replace(/_/g, ' ').toUpperCase()}
Updated By: ${changedBy.name}
${note ? `Note: ${note}` : ''}

View job: ${process.env['NEXT_PUBLIC_APP_URL']}/jobs/${job._id}

Best,
DispatchIQ
    `.trim(),
  });
}
