import { IFishItem, ITelegramUserInfo, Rewards } from 'kan/types';
import Image from 'next/image';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import SpeciesBackground from '../SpeciesBackground';
import BubblesBackground from '../BubbleBackground';
import BackgroundAudio from '../BackgroundAudio';
import { GiFishingNet } from 'react-icons/gi';
import { usePutUpdateUser } from 'kan/hooks/usePutUpdateUser';
import GameMatches from './GameMatches';
import RenderModel from '../RenderModel';
import { Model } from '../ProfileTab/Model';

interface Props {
  isPlayingGame: boolean;
  userInfo: ITelegramUserInfo;
  setIsPlayingGame: Dispatch<SetStateAction<boolean>>;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  imageUrl: string;
  setCurrentHabitat: Dispatch<SetStateAction<IFishItem['habitat'] | null>>;
  currentHabitat: IFishItem['habitat'] | null;
}

interface Box {
  id: number; // Unique identifier for each box
  reward: Rewards;
}

function GameTab({
  isPlayingGame,
  userInfo,
  setIsPlayingGame,
  setSelectedIndex,
  imageUrl,
  setCurrentHabitat,
  currentHabitat,
}: Props) {
  const { mutate: putUpdateUserMutate } = usePutUpdateUser();
  const [currentTurns, setCurrentTurns] = useState<number>(userInfo.turns);
  const [userCoins, setUserCoins] = useState(userInfo.resources.coins);
  const [userFish, setUserFish] = useState(userInfo.resources.fish);
  const [userShells, setUserShells] = useState(userInfo.resources.shells);
  const [isOpenTurnEmpty, setIsOpenTurnEmpty] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState(20);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isOpenGameMatches, setIsOpenGameMatches] = useState(false);

  const showBox = (reward: Rewards) => {
    const newBox = { id: Date.now(), reward: reward }; // Use timestamp as a unique ID
    setBoxes((prevBoxes) => [...prevBoxes, newBox]);
  };

  const handleAnimationEnd = (id: number) => {
    setBoxes((prevBoxes) => prevBoxes.filter((box) => box.id !== id));
  };

  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Move the box upwards
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVisible && position > 2) {
      interval = setInterval(() => {
        setPosition((prevPosition) => prevPosition - 5); // Move 5% up every interval
      }, 200); // Adjust speed as needed
    } else if (position <= 2) {
      // Stop the box when it reaches the top
      setIsVisible(false);
      setPosition(20); // Reset position for future
    }
    return () => clearInterval(interval);
  }, [isVisible, position]);

  const handleTabClick = (reward: Rewards) => {
    if (currentTurns > 0) {
      setCurrentTurns(currentTurns - 1);
      setUserCoins(userCoins + reward.coins);
      setUserShells(userShells + reward.shells);
      setUserFish(userFish + reward.fish);

      showBox(reward);

      if (reward && currentTurns > 0) {
        const resources: Rewards = {
          fish: userInfo.resources.fish + reward.fish,
          shells: userInfo.resources.shells + reward.shells,
          coins: userInfo.resources.coins + reward.coins,
        };

        putUpdateUserMutate({
          userId: String(userInfo.id),
          user: { resources, turns: currentTurns - 1 },
        });
      }
    }
  };

  const onRenderUserRewards = () => {
    const rewardList = [
      {
        name: 'Coin',
        value: userCoins,
      },
      {
        name: 'Fish',
        value: userFish,
      },
      {
        name: 'Shell',
        value: userShells,
      },
    ];
    return rewardList.map((r) => {
      return (
        <div
          key={r.name}
          className="flex items-center justify-between gap-2 text-sm"
        >
          <Image
            src={`/resources/${r.name.toLowerCase()}.png`}
            alt={r.name}
            className="h-6 w-auto rounded-lg"
            width={20000}
            height={20000}
          />
          <p className="font-semibold text-ocean-yellow">{r.value}</p>
        </div>
      );
    });
  };

  const onRenderBoxReward = (reward: Rewards) => {
    return Object.entries(reward).map(([key, value]) => {
      const imagePath = `${key === 'coins' ? 'coin' : key === 'shells' ? 'shell' : 'fish'}.png`;
      return value !== 0 ? (
        <div className="flex gap-3">
          <p className="glow-effect-reward text-xl font-black">
            {value} <span className="capitalize">{key}</span>
          </p>
          <Image
            className="h-5 w-auto bg-firefly-radial"
            src={`/resources/${imagePath}`}
            alt="diver"
            width={20000}
            height={20000}
          />
        </div>
      ) : (
        <></>
      );
    });
  };

  const handleCloseGameMatches = (habitatType: IFishItem['habitat'] | null) => {
    setIsOpenGameMatches(false);
    setCurrentHabitat(habitatType);
  };

  return (
    <>
      <dialog
        open={isOpenTurnEmpty}
        className="z-50 mx-auto h-[100dvh] w-[90vw] bg-transparent md:w-fit"
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
                Out of turn, please comeback tomorrow!
              </h2>
            </div>
            <form method="dialog">
              <button
                className="rounded-lg bg-emerald-500 px-3 py-1"
                onClick={() => setIsOpenTurnEmpty(false)}
              >
                OK
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {isOpenGameMatches ? (
        <GameMatches
          handleCloseGameMatches={handleCloseGameMatches}
          currentHabitat={currentHabitat}
        />
      ) : (
        <>
          {isPlayingGame ? (
            <>
              <div className="flex h-[100dvh] flex-col items-center justify-center pb-10 text-center">
                {/* <Image
                  className="mt-20 h-[30vh] w-auto animate-pulse"
                  src={'/diver/diver-default.png'}
                  alt="diver"
                  width={20000}
                  height={20000}
                /> */}
                <div className="flex items-center justify-between pt-32">
                  <div className="z-10 mx-auto flex h-[14.5rem] w-[8rem]">
                    <RenderModel className="">
                      <Model />
                    </RenderModel>
                  </div>
                </div>
              </div>
              <div className="absolute inset-x-3 top-5">
                <div className="flex w-full items-start justify-between gap-3">
                  <div className="flex flex-col gap-2 rounded-xl border border-white/20 bg-ocean-turquoise/20 p-1 px-2 text-white backdrop-blur-sm hover:opacity-80">
                    <div className="flex items-center justify-center gap-1 text-3xl text-white">
                      <GiFishingNet
                        className="inset-0 animate-wrap-net font-thin"
                        size={30}
                      />
                      <p className="font-bold text-ocean-flashturq">
                        {currentTurns}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {onRenderUserRewards()}
                    </div>
                  </div>
                  <div className="z-30 flex flex-col justify-end gap-2">
                    <Image
                      className="h-10 w-auto"
                      src={'/control/control-5.png'}
                      alt="diver"
                      width={20000}
                      height={20000}
                      onClick={() => setIsPlayingGame(false)}
                    />
                    <Image
                      className="h-10 w-auto"
                      src={`/control/control-${isPlayingMusic ? '11' : '12'}.png`}
                      alt="diver"
                      width={20000}
                      height={20000}
                      onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                    />
                  </div>
                </div>
              </div>

              <SpeciesBackground
                handleTabClick={handleTabClick}
                userInfo={userInfo}
                currentTurns={currentTurns}
                setIsOpenTurnEmpty={setIsOpenTurnEmpty}
                currentHabitat={currentHabitat}
              />
            </>
          ) : (
            <div className="z-20">
              <div className="flex flex-col items-center justify-start">
                <div onClick={() => setIsPlayingGame(!isPlayingGame)}>
                  <Image
                    className="h-20 w-auto animate-shake-infinite"
                    src={'/control/control-2.png'}
                    alt="play button"
                    width={20000}
                    height={20000}
                  />
                </div>
              </div>
              <div className="absolute inset-x-3 top-5 z-20 flex items-start justify-between">
                <div
                  className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-ocean-turquoise/50 p-1 px-2 text-white backdrop-blur-sm hover:opacity-80"
                  onClick={() => setSelectedIndex(4)}
                >
                  <Image
                    className="h-10 w-auto animate-shake rounded-full"
                    src={imageUrl}
                    alt="diver"
                    width={20000}
                    height={20000}
                  />
                  <p className="pr-2">
                    Hi, {userInfo.first_name ?? userInfo.username ?? 'Hunter'}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-start gap-2">
                  <Image
                    className="h-10 w-auto"
                    src={`/control/control-${isPlayingMusic ? '11' : '12'}.png`}
                    alt="diver"
                    width={20000}
                    height={20000}
                    onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                  />
                  <Image
                    className="h-10 w-auto"
                    src={`/control/control-8.png`}
                    alt="diver"
                    width={20000}
                    height={20000}
                    onClick={() => setIsOpenGameMatches(true)}
                  />
                </div>
              </div>
            </div>
          )}
          {boxes.map((box) => (
            <div
              key={box.id}
              onAnimationEnd={() => handleAnimationEnd(box.id)}
              className="fixed z-50 flex w-fit animate-moveUp items-center justify-center gap-2 text-ocean-blue transition-transform"
              style={{
                top: `${position}%`, // Dynamic position for vertical movement
              }}
            >
              <div className="flex flex-col gap-3">
                {onRenderBoxReward(box.reward)}
              </div>
            </div>
          ))}
          <BubblesBackground />
          <BackgroundAudio
            isPlayingGame={isPlayingGame}
            isPlayingMusic={isPlayingMusic}
          />
        </>
      )}
    </>
  );
}

export default GameTab;
