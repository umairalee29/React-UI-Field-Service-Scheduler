type ClassValue = string | undefined | null | false | ClassValue[];

export function cn(...classes: ClassValue[]): string {
  return classes
    .flat(Infinity as 20)
    .filter(Boolean)
    .join(' ');
}
