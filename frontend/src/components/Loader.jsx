export default function Loader({ label = "Loading agricultural data..." }) {
  return (
    <div className="loader-wrap">
      <div className="loader-spin" />
      <span>{label}</span>
    </div>
  );
}
