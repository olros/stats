import { Link, useLocation } from '@remix-run/react';
import { useState } from 'react';
import { Tabs, TabsList, TabsProps, TabsTrigger } from './ui/tabs';

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
      <TabsList className='grid w-full auto-cols-fr grid-flow-col'>
        {tabs.map((tab) => (
          <TabsTrigger asChild key={tab.label} value={`${baseLocation}${tab.url ? `/${tab.url}` : ''}`}>
            <Link to={`${baseLocation}${tab.url ? `/${tab.url}` : ''}`} unstable_viewTransition>
              {tab.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
