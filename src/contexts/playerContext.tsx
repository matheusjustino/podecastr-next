import { createContext, useContext, useState, ReactNode } from 'react';

type Episode = {
	title: string;
	members: string
	thumbnail: string;
	duration: number;
	url: string;
};

type PlayerContextData = {
	episodeList: Episode[];
	currentEpisodeIndex: number;
	isPlaying: boolean;
	isLooping: boolean;
	isShuffling: boolean;
	play: (episode: Episode) => void;
	playNext: () => void;
	playPrevious: () => void;
	playList: (episodeList: Episode[], index: number) => void;
	togglePlay: () => void;
	toggleLoop: () => void;
	toggleShuffle: () => void;
	setPlayingState: (state: boolean) => void;
	hasNext: boolean;
	hasPrevious: boolean;
	clearPlayerState: () => void;
};

type PlayerContextProviderProps = {
	children: ReactNode
}

export const PlayerContext = createContext({} as PlayerContextData);

export function PlayerContextProvider({ children }: PlayerContextProviderProps) {
	const [episodeList, setEpisodeList] = useState([]);
	const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLooping, setIsLooping] = useState(false);
	const [isShuffling, setIsShuffling] = useState(false);

	const hasPrevious = currentEpisodeIndex > 0;
	const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodeList.length;

	const play = (episode: Episode) => {
		setEpisodeList([episode]);
		setCurrentEpisodeIndex(0);
		setIsPlaying(true);
	}

	const playList = (episodeList: Episode[], index: number) => {
		setEpisodeList(episodeList);
		setCurrentEpisodeIndex(index);
		setIsPlaying(true);
	}

	const playNext = () => {
		if (isShuffling) {
			const nextRandomEpisodeIndex = Math.floor((Math.random() * episodeList.length));
			setCurrentEpisodeIndex(nextRandomEpisodeIndex);
		} else if (hasNext) {
			setCurrentEpisodeIndex(currentEpisodeIndex + 1);
		}
	}

	const playPrevious = () => {
		if (hasPrevious) {
			setCurrentEpisodeIndex(currentEpisodeIndex - 1);
		}
	}

	const togglePlay = () => {
		setIsPlaying(!isPlaying);
	}

	const toggleLoop = () => {
		setIsLooping(!isLooping)
	}

	const toggleShuffle = () => {
		setIsShuffling(!isShuffling);
	}

	const setPlayingState = (state: boolean) => {
		setIsPlaying(state);
	}

	const clearPlayerState = () => {
		setEpisodeList([]);
		setCurrentEpisodeIndex(0);
	}

	const playerContextProvider: PlayerContextData = {
		episodeList,
		currentEpisodeIndex,
		isPlaying,
		isLooping,
		isShuffling,
		play,
		playNext,
		playPrevious,
		playList,
		togglePlay,
		toggleLoop,
		toggleShuffle,
		setPlayingState,
		hasNext,
		hasPrevious,
		clearPlayerState
	};

	return (
		<PlayerContext.Provider value={playerContextProvider}>
			{children}
		</PlayerContext.Provider>
	);
}

export function usePlayerContext() {
	const usePlayerContext = useContext(PlayerContext);
	return usePlayerContext;
}
