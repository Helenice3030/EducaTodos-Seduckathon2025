import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function Spinner({ size = 32, color = 'text-blue-600' }: { size?: number, color?: string }) {
  return (
    <div className="flex justify-center items-center" role="status">
      <AiOutlineLoading3Quarters
        className={`animate-spin ${color}`}
        size={size}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
