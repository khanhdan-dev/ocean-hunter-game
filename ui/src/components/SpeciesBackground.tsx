'use client';
import { getRandomFish } from 'kan/hooks/useRandomValue';
import { IFishItem, ITelegramUserInfo, Rewards } from 'kan/types';
import {
  deepOceanFish,
  openOceanFish,
  reefFish,
  shallowReefFish,
} from 'kan/utils/newFishData';
import Image from 'next/image';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GiFishingNet } from 'react-icons/gi';

interface Props {
  handleTabClick: (reward: Rewards) => void;
  userInfo: ITelegramUserInfo;
  currentTurns: number;
  setIsOpenTurnEmpty: Dispatch<SetStateAction<boolean>>;
  currentHabitat: IFishItem['habitat'] | null;
}

type Species = {
  id: number;
  top: string;
  left: string;
  right: string;
  size: string;
  animationDuration: string;
  animationDirection: string;
  species: string; // URL of the species image
  direction: 'left' | 'right'; // Direction of the fish movement
  hp: number;
  requiredAttacks: number;
  reward: Rewards;
  sizeString: 'small' | 'medium' | 'large';
};

const getSize = (size: IFishItem['size']) => {
  switch (size) {
    case 'small':
      return 40;

    case 'medium':
      return 60;

    case 'large':
      return 100;

    default:
      return 40;
  }
};

const createSpecies = (fishData: IFishItem[]): Species => {
  const directions: Array<Species['direction']> = ['left', 'right'];
  const direction = directions[Math.floor(Math.random() * directions.length)];
  const fish = getRandomFish(fishData);

  return {
    id: Math.random(),
    top: `${Math.random() * 100}%`,
    left: direction === 'left' ? '0' : 'unset',
    right: direction === 'right' ? '0' : 'unset',
    size: `${getSize(fish.size)}px`, // Random size between 10px and 30px
    animationDuration: `${Math.random() * (fish.size === 'large' ? 10 : 5) + 8}s`, // Random speed between 5s and 10s
    animationDirection: Math.random() > 0.5 ? 'normal' : 'reverse', // Randomize direction
    species: fish.image, // Use the helper to get a random fish image
    direction,
    hp: fish.hp,
    sizeString: fish.size,
    requiredAttacks: fish.requiredAttacks,
    reward: {
      fish: fish.rewards.fish,
      shells: fish.rewards.shells,
      coins: fish.rewards.coins,
    },
  };
};

const SpeciesBackground = ({
  handleTabClick,
  currentTurns,
  setIsOpenTurnEmpty,
  currentHabitat,
}: Props) => {
  const audioRewardRef = useRef<HTMLAudioElement | null>(null);
  const audioHitRef = useRef<HTMLAudioElement | null>(null);
  const [species, setSpecies] = useState<Species[]>([]);
  const initialCaughtFish = useMemo(
    () => ({
      id: 0,
      isCaught: false,
    }),
    [],
  );
  const [caughtFish, setCaughtFish] = useState(initialCaughtFish);
  const [attackedFishId, setAttackedFishId] = useState<number | null>(null);
  const fishData = useCallback(() => {
    switch (currentHabitat) {
      case 'shallow reef':
        return shallowReefFish;
      case 'reef':
        return reefFish;
      case 'open ocean':
        return openOceanFish;
      case 'deep ocean':
        return deepOceanFish;

      default:
        return shallowReefFish;
    }
  }, [currentHabitat]);

  // Use the useRandomImage hook to generate a random fish image
  useEffect(() => {
    if (caughtFish.isCaught) {
      setTimeout(
        () => {
          setSpecies(species.filter((s) => s.id !== caughtFish.id));
          setCaughtFish(initialCaughtFish);
        },
        currentTurns === 0 ? 0 : 500,
      );
    }
    const addSpeciesPeriodically = () => {
      const currentFishData = fishData();
      const newSpecies = createSpecies(currentFishData); // Pass the number of fish images you have
      setSpecies((currentSpecies) => [
        ...currentSpecies.slice(-10), // Keep the last 14 species
        newSpecies,
      ]);
    };

    if (!caughtFish.isCaught) {
      const interval = setInterval(addSpeciesPeriodically, 1000); // Add species every second
      return () => clearInterval(interval); // Clean up the interval on unmount
    }
  }, [
    caughtFish.isCaught,
    currentTurns,
    caughtFish.id,
    initialCaughtFish,
    species,
    fishData,
  ]);

  const handleCatchFish = (specie: Species) => {
    if (specie.requiredAttacks !== 1) {
      if (audioHitRef.current) {
        audioHitRef.current.currentTime = 0; // Reset to the start
        audioHitRef.current.play();
      }
    }

    // Trigger attack animation
    setAttackedFishId(specie.id);

    // Reset attack animation after a short delay
    setTimeout(() => {
      setAttackedFishId(null);
    }, 500);

    setSpecies((currentSpecies) =>
      currentSpecies.map((s) =>
        s.id === specie.id
          ? {
              ...s,
              requiredAttacks: s.requiredAttacks - 1,
            }
          : s,
      ),
    );

    const updatedFish = species.find((s) => s.id === specie.id);
    if (updatedFish?.requiredAttacks === 1) {
      if (audioRewardRef.current) {
        audioRewardRef.current.currentTime = 0; // Reset to the start
        audioRewardRef.current.play();
      }
      setCaughtFish({
        id: specie.id,
        isCaught: true,
      });
      setTimeout(() => {
        handleTabClick(specie.reward);
      }, 200);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-10 h-full w-full overflow-hidden">
      {/* Reward sound */}
      <audio ref={audioRewardRef} src="/sounds/reward.mp3" preload="auto" />
      {/* hit sound */}
      <audio ref={audioHitRef} src="/sounds/electric.mp3" preload="auto" />
      {species.map((specie) => (
        <button
          disabled={caughtFish.isCaught}
          key={specie.id}
          className="absolute cursor-pointer"
          style={{
            top: specie.top,
            left: specie.left,
            right: !isNaN(Number(specie.right)) ? -specie.right : 'unset',
            animation: `move-${specie.direction}-${specie.sizeString} ${specie.animationDuration} forwards`,
            animationPlayState:
              caughtFish.id === specie.id && caughtFish.isCaught
                ? 'paused'
                : 'running',
          }}
          onClick={() => {
            if (currentTurns === 0) {
              setIsOpenTurnEmpty(true);
            } else {
              handleCatchFish(specie);
            }
          }}
        >
          <div
            className={`relative flex flex-col items-center ${
              attackedFishId === specie.id ? 'animate-attack-effect' : ''
            }`}
          >
            {attackedFishId === specie.id ? (
              <div className="absolute inset-0 z-20 scale-150 bg-[url('/effects/thunder.gif')] bg-cover bg-center"></div>
            ) : (
              <></>
            )}

            <Image
              src={specie.species}
              alt={`Species ${specie.id}`}
              className={`fish ${
                specie.direction === 'left' ? 'scale-x-100' : '-scale-x-100'
              }`}
              width={20000}
              height={20000}
              style={{
                height: specie.size,
                width: 'auto',
              }}
              loading="eager"
            />
            <div
              className={`${specie.hp === specie.requiredAttacks ? 'hidden' : ''} h-2 animate-showHp rounded-full bg-ocean-flashturq bg-opacity-25 bg-firefly-radial brightness-200 backdrop-blur-md`}
              style={{
                width: specie.hp * 10,
              }}
            >
              <div
                className={`h-2 rounded-full bg-ocean-flashred bg-opacity-85 backdrop-blur-md`}
                style={{
                  width: specie.requiredAttacks * 10,
                }}
              ></div>
            </div>
          </div>

          {caughtFish.id === specie.id &&
            currentTurns !== 0 &&
            specie.requiredAttacks === 0 && (
              <GiFishingNet
                className="absolute inset-0 m-auto animate-wrap-net font-thin text-gray-200"
                style={{
                  height: `calc(${specie.size} + 50px)`,
                  width: 'auto', // Set the size dynamically
                }}
              />
            )}
        </button>
      ))}
    </div>
  );
};

export default SpeciesBackground;
