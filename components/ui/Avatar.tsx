import Image from 'next/image';
import { cn } from '@/lib/cn';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: { px: 24, cls: 'h-6 w-6 text-[10px]' },
  md: { px: 32, cls: 'h-8 w-8 text-xs' },
  lg: { px: 40, cls: 'h-10 w-10 text-sm' },
  xl: { px: 56, cls: 'h-14 w-14 text-base' },
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const { px, cls } = sizes[size];
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a2235&color=3b82f6&bold=true&size=${px * 2}`;

  return (
    <div className={cn('relative rounded-full overflow-hidden bg-bg-card border border-border-dark flex-shrink-0', cls, className)}>
      <Image
        src={src && src !== '' ? src : fallback}
        alt={name}
        fill
        sizes={`${px}px`}
        className="object-cover"
      />
    </div>
  );
}
