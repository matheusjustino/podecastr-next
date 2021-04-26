import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { usePlayerContext as UsePlayerContext } from '../../contexts/playerContext';

import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [progress, setProgress] = useState(0);

	const {
		episodeList,
		currentEpisodeIndex,
		isPlaying,
		isLooping,
		isShuffling,
		togglePlay,
		toggleLoop,
		toggleShuffle,
		setPlayingState,
		playNext,
		playPrevious,
		hasNext,
		hasPrevious,
		clearPlayerState
	} = UsePlayerContext();

	const currentEpisode = episodeList[currentEpisodeIndex];

	useEffect(() => {
		if (!audioRef.current) {
			return;
		}

		if (isPlaying) {
			audioRef.current.play();
		} else {
			audioRef.current.pause();
		}
	}, [isPlaying]);

	const setupProgressListener = () => {
		audioRef.current.currentTime = 0;

		audioRef.current.addEventListener('timeupdate', () => {
			setProgress(Math.floor(audioRef.current.currentTime));
		});
	}

	const handleSeek = (amount: number) => {
		audioRef.current.currentTime = amount;
		setProgress(amount);
	}

	const handleEpisodeEnded = () => {
		if (hasNext) {
			playNext();
		} else {
			clearPlayerState();
		}
	}

	return (
		<div className={styles.playerContainer}>
			<header>
				<img src="/playing.svg" alt="Tocando agora" />
				<strong>Tocando agora</strong>
			</header>

			{
				currentEpisode ?
				(
					<div className={styles.currentEpisode}>
						<Image
							width={592}
							height={592}
							src={currentEpisode.thumbnail}
							objectFit="cover"
						/>
						<strong>{currentEpisode.title}</strong>
						<span>{currentEpisode.members}</span>
					</div>
				)
				:
				(
					<div className={styles.emptyPlayer}>
						<strong>Selecione um podcast para ouvir</strong>
					</div>
				)
			}

			<footer className={!currentEpisode ? styles.empty : ''}>
				<div className={styles.progress}>
					<span>
						{
							convertDurationToTimeString(progress)
						}
					</span>

					<div className={styles.slider}>
						{
							currentEpisode ?
							(
								<Slider
									max={currentEpisode.duration}
									value={progress}
									onChange={handleSeek}
									trackStyle={{ backgroundColor: '#04d361' }}
									railStyle={{ backgroundColor: '#9f75ff' }}
									handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
								/>
							)
							:
							(
								<div className={styles.emptySlider} />
							)
						}
					</div>

					<span>
						{
							convertDurationToTimeString(currentEpisode?.duration ?? 0)
						}
					</span>
				</div>

				{
					currentEpisode && (
						<audio
							src={currentEpisode.url}
							ref={audioRef}
							loop={isLooping}
							autoPlay
							onEnded={handleEpisodeEnded}
							onLoadedMetadata={setupProgressListener}
							onPlay={() => setPlayingState(true)}
							onPause={() => setPlayingState(false)}
						/>
					)
				}

				<div className={styles.buttons}>
					<button onClick={toggleShuffle} className={isShuffling ? styles.isActive : ''} type="button" disabled={!currentEpisode || episodeList.length === 1}>
						<img src="/shuffle.svg" alt="Embaralhar"/>
					</button>

					<button onClick={playPrevious} type="button" disabled={!currentEpisode || !hasPrevious}>
						<img src="/play-previous.svg" alt="Tocar anterior"/>
					</button>

					<button onClick={togglePlay} className={styles.playButton} type="button" disabled={!currentEpisode}>
						{
							isPlaying ?
							(
								<img src="/pause.svg" alt="Pausar"/>
							)
							:
							(
								<img src="/play.svg" alt="Tocar"/>
							)
						}
					</button>

					<button onClick={playNext} type="button" disabled={!currentEpisode || !hasNext}>
						<img src="/play-next.svg" alt="Tocar próxima"/>
					</button>

					<button onClick={toggleLoop} className={isLooping ? styles.isActive : ''} type="button" disabled={!currentEpisode}>
						<img src="/repeat.svg" alt="Repetir"/>
					</button>
				</div>
			</footer>
		</div>
	);
}
