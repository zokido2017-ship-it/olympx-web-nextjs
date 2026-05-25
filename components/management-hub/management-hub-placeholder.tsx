type ManagementHubPlaceholderProps = {
  title: string;
};

export function ManagementHubPlaceholder({
  title,
}: ManagementHubPlaceholderProps) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
      <h1 className="text-lg font-bold text-slate-900">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        This section is coming soon.
      </p>
    </div>
  );
}
