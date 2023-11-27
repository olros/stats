import type { TabsProps } from '@mui/joy';
import { Tab, TabList, Tabs } from '@mui/joy';
import { Link, useLocation } from '@remix-run/react';
import { useState } from 'react';

export type LinkTabsProps = Omit<TabsProps, 'defaultValue'> & {
  tabs: {
    label: string;
    url?: string;
  }[];
  baseLocation: string;
};

export const LinkTabs = ({ tabs, baseLocation, ...props }: LinkTabsProps) => {
  const location = useLocation();
  const [defaultLocation] = useState(location.pathname);
  return (
    <Tabs defaultValue={defaultLocation} {...props}>
      <TabList>
        {tabs.map((tab) => (
          <Tab
            component={Link}
            key={tab.label}
            to={`${baseLocation}${tab.url ? `/${tab.url}` : ''}`}
            unstable_viewTransition
            value={`${baseLocation}${tab.url ? `/${tab.url}` : ''}`}>
            {tab.label}
          </Tab>
        ))}
      </TabList>
    </Tabs>
  );
};
