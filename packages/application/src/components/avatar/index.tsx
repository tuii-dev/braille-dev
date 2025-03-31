import Link from "next/link";

import { UserCircleIcon } from "@heroicons/react/24/solid";

type ProfileLinkAvatarProps = {
  user: { avatar: string | null };
};

export const ProfileLinkAvatar = ({ user }: ProfileLinkAvatarProps) => {
  return (
    <Link
      href="/profile"
      className="h-8 w-8 block flex-shrink-0 rounded-full bg-slate-100 dark:bg-midnight-600 hover:dark:bg-midnight-400 hover:bg-slate-50 border border-slate-300 dark:border-midnight-400 relative overflow-hidden"
    >
      {!!user.avatar ? (
        <img
          className="object-cover w-full h-full absolute"
          src={user.avatar}
          alt=""
        />
      ) : (
        <UserCircleIcon className="absolute m-auto inset-0 w-5 h-5 text-black dark:text-white" />
      )}
    </Link>
  );
};
