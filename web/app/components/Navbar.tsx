import {
  Avatar,
  Box,
  Card,
  Chip,
  List,
  ListDivider,
  ListItemDecorator,
  listItemDecoratorClasses,
  Option,
  optionClasses,
  Select,
  Stack,
  Typography,
} from '@mui/joy';
import type { Prisma, User } from '@prisma/client';
import type { SerializeFrom } from '@remix-run/node';
import { Link, useLocation, useNavigate, useParams } from '@remix-run/react';
import { Fragment, useCallback } from 'react';

import { Add, Check } from './Icons';

export type NavbarProps = {
  user: Pick<User, 'avatar_url' | 'name'>;
  teams: SerializeFrom<
    Prisma.TeamGetPayload<{
      include: {
        projects: true;
      };
    }>[]
  >;
};

export const Navbar = ({ user, teams }: NavbarProps) => {
  const { teamSlug, projectSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const onSelect = useCallback(
    (_: React.SyntheticEvent | null, value: string | null) => {
      if (value) {
        navigate(`/dashboard/${value}`);
      }
    },
    [navigate],
  );

  return (
    <Card
      sx={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        overflow: 'hidden',
        py: 1,
        px: 2,
        borderBottom: ({ palette }) => `1px solid ${palette.neutral.outlinedBorder}`,
        position: 'sticky',
        top: ({ spacing }) => spacing(1),
        zIndex: 10,
        background: ({ palette }) => palette.background.backdrop,
        backdropFilter: `blur(5px)`,
      }}>
      <Stack alignItems='center' direction='row' sx={{ overflow: 'hidden' }}>
        <Box component={Link} sx={{ height: 34 }} to='/dashboard' unstable_viewTransition>
          <Box alt='' component='img' src='/favicon-192.png' sx={{ height: 34 }} />
        </Box>
        <Select
          onChange={onSelect}
          placeholder='Choose team/project'
          slotProps={{
            listbox: {
              variant: 'outlined',
              component: 'div',
              sx: {
                maxHeight: 240,
                overflow: 'auto',
                '--List-padding': '0px',
                '--ListItem-radius': '0px',
              },
            },
          }}
          value={[teamSlug, projectSlug].filter(Boolean).join('/')}
          variant='plain'>
          {teams.map((team) => (
            <Fragment key={team.id}>
              <List aria-labelledby={`team-${team.slug}`} sx={{ '--ListItemDecorator-size': '28px' }}>
                <Option
                  id={`team-${team.slug}`}
                  label={
                    <Chip color='primary' size='md' sx={{ borderRadius: 'xs', mr: 1 }}>
                      {team.name}
                    </Chip>
                  }
                  sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    textTransform: 'uppercase',
                    fontSize: ({ fontSize }) => fontSize.sm,
                    background: ({ palette }) => palette.background.popup,
                  }}
                  value={`${team.slug}`}>
                  {team.name} ({team.projects.length})
                </Option>
                {team.projects.map((project) => (
                  <Option
                    key={project.id}
                    label={
                      <Typography level='body-md'>
                        <Chip color='primary' component='span' size='sm' sx={{ borderRadius: 'xs', mr: 1 }}>
                          {team.name}
                        </Chip>
                        {project.name}
                      </Typography>
                    }
                    sx={{ [`&.${optionClasses.selected} .${listItemDecoratorClasses.root}`]: { opacity: 1 } }}
                    value={`${team.slug}/${project.slug}`}>
                    <ListItemDecorator sx={{ opacity: 0 }}>
                      <Check />
                    </ListItemDecorator>
                    {project.name}
                  </Option>
                ))}
              </List>
              <ListDivider role='none' />
            </Fragment>
          ))}
          <List aria-labelledby={`new-team`} sx={{ '--ListItemDecorator-size': '28px' }}>
            <Option id={`new-team`} sx={{ fontSize: ({ fontSize }) => fontSize.sm }} value='new-team'>
              <ListItemDecorator>
                <Add />
              </ListItemDecorator>
              Create team
            </Option>
          </List>
        </Select>
      </Stack>
      {location.pathname !== '/profile' && (
        <Link to='/profile' unstable_viewTransition>
          <Avatar
            alt='Link to profile'
            src={user.avatar_url || undefined}
            sx={{ viewTransitionName: 'avatar', ':hover': { scale: '1.1', transition: 'scale 0.1s' } }}>
            {user.name[0]}
          </Avatar>
        </Link>
      )}
    </Card>
  );
};
