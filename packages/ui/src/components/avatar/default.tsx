import { Avatar, AvatarFallback, AvatarImage } from '@recurse/ui/components/avatar';

export default function AvatarDemo() {
  return (
    <Avatar>
      <AvatarImage src="/media/avatars/14.png" alt="@reui" />
      <AvatarFallback>CH</AvatarFallback>
    </Avatar>
  );
}
