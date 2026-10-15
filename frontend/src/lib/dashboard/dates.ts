/** Local-date helpers for challenge dots and session labels. */
export function isTodayLocal(dates: string[]): boolean {
  const now = new Date();
  return dates.some((iso) => {
    const d = new Date(iso);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });
}
