export default function DashboardShellLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[var(--text-muted)]/20 border-t-[var(--accent-jade)]" />
    </div>
  );
}
