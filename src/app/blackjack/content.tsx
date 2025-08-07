"use client";

import { InfoCard } from "./_components/info-card";
// import { ActivityCard } from "./_components/activity-card";
// import { NotificationCard } from "./_components/notification-card";
import { GameplayCard } from "./_components/gameplay-card";
// import { UpdatesCard } from "./_components/updates-card";
import { ShoeCard } from "./_components/shoe-card";

export const Content = () => {
  return (
    <div className="md:px-4 space-y-6">
      {/* Main Blackjack Game Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Shoe Status Card */}
        <DesktopShoeCard />

        {/* Main Game Table */}
        <GameplayCard />

        <MobileShoeCard />

        {/* Game Statistics */}
        <InfoCard />

        {/* Game Updates/Rules */}
        {/*<UpdatesCard />*/}

        {/* Activity/History */}
        {/*<ActivityCard />*/}

        {/* Notifications */}
        {/*<NotificationCard />*/}
      </div>
    </div>
  );
};

const DesktopShoeCard = () => (
  <div className="lg:col-span-3 hidden lg:flex w-full items-start justify-center">
    <ShoeCard />
  </div>
);
const MobileShoeCard = () => (
  <div className="lg:col-span-3 lg:hidden">
    <ShoeCard />
  </div>
);
