import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type { Prisma, User } from '@prisma/client';
import type { SerializeFrom } from '@remix-run/node';
import { Link, useLocation, useParams } from '@remix-run/react';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export type NavbarProps = {
  user: Pick<User, 'avatar_url' | 'name'>;
  teams: Prisma.TeamGetPayload<{
    include: {
      projects: true;
    };
  }>[];
};

export const Navbar = ({ user, teams }: NavbarProps) => {
  const { teamSlug, projectSlug } = useParams();
  const location = useLocation();

  return (
    <Card className='sticky top-2 z-10 flex justify-between overflow-hidden py-2 px-4 backdrop:blur-sm'>
      <div className='flex items-center gap-2 overflow-hidden'>
        <Link className='h-[34px]' to='/dashboard' unstable_viewTransition>
          <img alt='' src='/favicon-192.png' className='h-[34px]' />
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>{[teamSlug, projectSlug].filter(Boolean).join('/') || 'Choose team/project'}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56'>
            <DropdownMenuLabel>My teams</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {teams.map((team, index) => (
              <DropdownMenuGroup key={team.id}>
                <DropdownMenuItem asChild>
                  <Link to={`/dashboard/${team.slug}`} unstable_viewTransition>
                    {team.name}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Projects</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {team.projects.map((project) => (
                        <DropdownMenuItem key={project.id} asChild>
                          <Link to={`/dashboard/${team.slug}/${project.slug}`} unstable_viewTransition>
                            {project.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                {index !== teams.length - 1 && <DropdownMenuSeparator />}
              </DropdownMenuGroup>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {location.pathname !== '/profile' && (
        <Link to='/profile' unstable_viewTransition>
          <Avatar>
            <AvatarImage
              alt='Link to profile'
              src={user.avatar_url || undefined}
              className='[view-transition-name:avatar] hover:scale-[1.1] hover:transition-[scale_0.1s]'
            />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        </Link>
      )}
    </Card>
  );
};
