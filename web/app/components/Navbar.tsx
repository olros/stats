import {
  Avatar,
  Box,
  Button,
  List,
  ListDivider,
  ListItem,
  ListItemDecorator,
  Menu,
  MenuItem,
  menuItemClasses,
  Sheet,
  Stack,
  Typography,
  typographyClasses,
} from '@mui/joy';
import type { Project, Team, User } from '@prisma/client';
import { Link, useParams } from '@remix-run/react';
import { useState } from 'react';

import { Add, Check, UnfoldMore } from './Icons';

const Separator = () => (
  <Box
    component='svg'
    fill='none'
    shapeRendering='geometricPrecision'
    stroke='currentColor'
    strokeLinecap='round'
    strokeLinejoin='round'
    strokeWidth='1'
    sx={{ color: (theme) => theme.palette.text.secondary, height: 32, width: 32, opacity: 0.6 }}
    viewBox='0 0 24 24'>
    <path d='M 10 6 L 14 12 L 10 18' />
  </Box>
);

export type NavbarProps = {
  user: Pick<User, 'avatar_url' | 'name'>;
  teams: Team[];
  project?: Project;
};

export const Navbar = ({ user, teams, project }: NavbarProps) => {
  const { teamSlug } = useParams();

  const selectedTeam = teams.find((team) => team.slug === teamSlug);
  const [teamSelectorAnchorEl, setTeamSelectorAnchorEl] = useState<HTMLAnchorElement | null>(null);
  const teamSelectorOpen = Boolean(teamSelectorAnchorEl);

  const closeTeamSelector = () => setTeamSelectorAnchorEl(null);

  return (
    <Sheet
      component='ol'
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        overflow: 'hidden',
        listStyleType: 'none',
        m: 0,
        py: 1,
        px: 2,
        borderBottom: ({ palette }) => `1px solid ${palette.neutral.outlinedBorder}`,
      }}>
      <Stack alignItems='center' direction='row' sx={{ overflow: 'hidden' }}>
        <Box component={Link} sx={{ height: 44 }} to={selectedTeam ? `/dashboard/${selectedTeam.slug}` : '/dashboard'}>
          <Box alt='' component='img' src='/favicon-192.png' sx={{ height: 44 }} />
        </Box>
        <Separator />
        <Button
          aria-controls={teamSelectorOpen ? 'select-team-menu' : undefined}
          aria-expanded={teamSelectorOpen ? 'true' : undefined}
          aria-haspopup='true'
          color='neutral'
          endDecorator={<UnfoldMore />}
          id='select-team'
          onClick={(event) => setTeamSelectorAnchorEl(event.currentTarget)}
          variant='plain'>
          {selectedTeam ? selectedTeam.name : 'Choose team'}
        </Button>
        <Menu
          anchorEl={teamSelectorAnchorEl}
          aria-labelledby='select-team-button'
          id='select-team'
          onClose={closeTeamSelector}
          open={teamSelectorOpen}
          sx={(theme) => ({
            width: 288,
            '--List-padding': 'var(--List-divider-gap)',
            '--List-item-minHeight': '32px',
            [`& .${menuItemClasses.root}`]: {
              transition: 'none',
              '&:hover': {
                ...theme.variants.solid.primary,
                [`& .${typographyClasses.root}`]: {
                  color: 'inherit',
                },
              },
            },
          })}>
          <ListItem nested>
            <List>
              {teams.map((team) => (
                <MenuItem
                  component={Link}
                  key={team.slug}
                  onClick={closeTeamSelector}
                  selected={selectedTeam?.slug === team.slug}
                  to={`/dashboard/${team.slug}`}>
                  <ListItemDecorator>{selectedTeam?.slug === team.slug && <Check />}</ListItemDecorator>
                  {team.name}
                </MenuItem>
              ))}
              {!teams.length && (
                <Typography level='body-md' sx={{ px: 2, py: 1 }}>
                  You're not member of any teams
                </Typography>
              )}
            </List>
          </ListItem>
          <ListDivider />
          <ListItem nested>
            <List>
              <MenuItem component={Link} onClick={closeTeamSelector} to='/dashboard/new-team'>
                <ListItemDecorator>
                  <Add />
                </ListItemDecorator>
                Create team
              </MenuItem>
            </List>
          </ListItem>
        </Menu>
        {project && (
          <>
            <Separator />
            <Typography component={Link} sx={{ textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} to='.'>
              {project.name}
            </Typography>
          </>
        )}
      </Stack>
      <Link to='/profile'>
        <Avatar alt='Link to profile' src={user.avatar_url || undefined} sx={{ ':hover': { scale: '1.1', transition: 'scale 0.1s' } }}>
          {user.name[0]}
        </Avatar>
      </Link>
    </Sheet>
  );
};
