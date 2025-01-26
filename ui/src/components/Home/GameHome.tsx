'use client';
import React, { useState } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCartShopping,
  faGamepad,
  faListCheck,
  faRankingStar,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import useUrlValidation from 'kan/hooks/useUrlValidation';
import { useGetUserInfo } from 'kan/hooks/useGetUserInfo';
import { IFishItem, ITelegramUserInfo } from 'kan/types';
import GameTab from '../GameTab/GameTab';
import ProfileTab from '../ProfileTab/ProfileTab';
import LeaderboardTab from '../LeaderboardTab/LeaderboardTab';
import { useRouter, useSearchParams } from 'next/navigation';
import QuestTab from '../QuestTab/QuestTab';
import ShopTab from '../ShopTab/ShopTab';
import GameProgressBar from '../GameProgressBar';
import { habitatData } from '../Swipers/habitatData';
import { Tooltip } from '../Tooltip';

interface Props {
  telegramUser: ITelegramUserInfo;
}

function GameHome({ telegramUser }: Props) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const router = useRouter();
  const { data: userInfo, isSuccess } = useGetUserInfo(telegramUser);
  const { validateUrl } = useUrlValidation();
  const [isOpenGreetingDialog, setIsOpenGreetingDialog] = useState(true);
  const [isPlayingGame, setIsPlayingGame] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(Number(currentTab) ?? 0);
  const [showProgress, setShowProgress] = useState(true);
  const [currentHabitat, setCurrentHabitat] = useState<
    IFishItem['habitat'] | null
  >(
    typeof window !== 'undefined'
      ? ((localStorage.getItem('habitat') ?? '') as IFishItem['habitat'])
      : null,
  );

  const foundHabitat = habitatData.find((h) => h.type === currentHabitat);

  // Function to handle tab class styling
  const getTabClasses = (selected: boolean) =>
    `${
      selected
        ? 'text-ocean-flashturq text-base focus:outline-none'
        : 'text-white hover:bg-ocean-flashturq/80 text-sm focus:outline-none'
    }`;

  const onRenderTabs = () => {
    const tabList = [
      {
        name: 'Game',
        icon: <FontAwesomeIcon icon={faGamepad} />,
      },
      {
        name: 'Quest',
        icon: <FontAwesomeIcon icon={faListCheck} />,
      },
      {
        name: 'Shop',
        icon: <FontAwesomeIcon icon={faCartShopping} />,
      },
      {
        name: 'Rank',
        icon: <FontAwesomeIcon icon={faRankingStar} />,
      },
      {
        name: 'Profile',
        icon: <FontAwesomeIcon icon={faUser} />,
      },
    ];

    return tabList.map((tab) => (
      <Tooltip key={tab.name} text={tab.name}>
        <Tab
          className={({ selected }) =>
            `${getTabClasses(selected)} ${
              isPlayingGame ? 'hidden' : 'flex'
            } aspect-square w-14 flex-col items-center justify-center gap-1 rounded-full bg-ocean-darkblue/40 shadow-inner shadow-ocean-white backdrop-blur-lg hover:bg-ocean-darkblue`
          }
        >
          {tab.icon}
        </Tab>
      </Tooltip>
    ));
  };

  const handleCreateUser = () => {
    setIsOpenGreetingDialog(false);
  };

  const imageUrl =
    userInfo?.photo_url && validateUrl(userInfo?.photo_url)
      ? userInfo?.photo_url
      : '/diver/diver-avt.png'; // Default image if the URL is invalid

  // Hide progress bar when complete
  const handleComplete = () => {
    setTimeout(() => setShowProgress(false), 1800);
  };

  if (showProgress) {
    return (
      <GameProgressBar isComplete={isSuccess} onComplete={handleComplete} />
    );
  }

  if (!userInfo) {
    return <></>;
  }

  return (
    <div className="relative flex h-[100dvh] flex-col items-center justify-center bg-cover p-4">
      <dialog
        open={isOpenGreetingDialog}
        className="z-30 mx-auto h-[100dvh] w-[90vw] bg-transparent md:w-fit"
      >
        <div className="z-50 flex h-full animate-shake items-center justify-center">
          <div className="flex w-4/5 flex-col items-center gap-3 rounded-xl bg-blue-600 px-3 py-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <Image
                className="h-[20vh] w-auto bg-firefly-radial"
                src={`/diver/diver-greeting.png`}
                alt="diver"
                width={20000}
                height={20000}
              />
              <h2 className="text-lg font-semibold">
                {userInfo.isNewUser
                  ? `Welcome Back, ${
                      userInfo.first_name ?? userInfo.username ?? 'you'
                    }!`
                  : `Welcome ${
                      userInfo.first_name ?? userInfo.username ?? 'you'
                    } to the fantastic Journey!`}
              </h2>
            </div>
            <form method="dialog">
              <button
                className="rounded-lg bg-emerald-500 px-3 py-1"
                onClick={handleCreateUser}
              >
                OK
              </button>
            </form>
          </div>
        </div>
      </dialog>
      <TabGroup
        selectedIndex={selectedIndex}
        onChange={(index) => {
          setSelectedIndex(index);
          router.push(`?tab=${index}`);
        }}
      >
        <TabPanels className="absolute inset-0 h-full w-full flex-1">
          <TabPanel
            className={`${foundHabitat?.gameBgClass ?? 'bg-ocean'} relative flex h-full flex-col items-center justify-center bg-cover bg-center`}
          >
            <GameTab
              setIsPlayingGame={setIsPlayingGame}
              isPlayingGame={isPlayingGame}
              setSelectedIndex={setSelectedIndex}
              userInfo={userInfo}
              imageUrl={imageUrl}
              setCurrentHabitat={setCurrentHabitat}
              currentHabitat={currentHabitat}
            />
          </TabPanel>

          <TabPanel className="flex h-full items-center justify-center">
            <QuestTab />
          </TabPanel>

          <TabPanel className="flex h-full items-center justify-center">
            <ShopTab userInfo={userInfo} />
          </TabPanel>

          <TabPanel className="h-full bg-ocean-primary-medium text-white">
            <LeaderboardTab userInfo={userInfo} />
          </TabPanel>

          <TabPanel className="h-full bg-ocean-primary-medium text-white">
            <ProfileTab userInfo={userInfo} />
          </TabPanel>
        </TabPanels>

        {/* Tabs List at the bottom */}
        <TabList className="fixed inset-y-0 left-4 z-20 my-auto flex h-fit w-fit flex-col gap-3 shadow-lg">
          {onRenderTabs()}
        </TabList>
      </TabGroup>
    </div>
  );
}

export default GameHome;
