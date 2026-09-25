// Fills {done} and {total} in a copy string. Copy stays plain data so it can cross to a client component.
export function fillCount(template: string, done: number, total: number): string {
  return template.replace("{done}", String(done)).replace("{total}", String(total));
}
