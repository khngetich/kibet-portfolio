export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path d="M4 9.5L20 4l-3.6 9.4L28 12l-12.4 7.2L13 28l-2.2-9.4L4 17z" fill="#3FC7A4" />
      <path d="M10.8 18.6L20 4l-3.6 9.4z" fill="#1E8E73" />
    </svg>
  );
}
