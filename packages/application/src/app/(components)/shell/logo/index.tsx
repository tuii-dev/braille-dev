import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <svg
        className={cn("h-auto w-full")}
        width="41"
        height="34"
        viewBox="0 0 41 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M26.8115 10H29.863C30.6869 10 31.3614 10.6745 31.3614 11.4984V17.3381C31.3614 18.162 30.6869 18.8365 29.863 18.8365H22.3164V14.4951C22.3164 12.022 24.3384 10 26.8115 10Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.5339 13.1712L22.3155 18.5686V20.7474C22.3155 24.0829 20.2639 25.6064 17.708 24.2219L12.5354 21.4174C11.6834 20.9559 11 19.6439 11 18.5316V14.3308C11 13.2185 11.6878 12.7052 12.5354 13.1726L12.5339 13.1712Z"
            fill="currentColor"
          />
        </g>
      </svg>
    </div>
  );
};
