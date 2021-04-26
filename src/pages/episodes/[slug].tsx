import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { api } from '../../services/api';
import { usePlayerContext } from '../../contexts/playerContext';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from './episode.module.scss';


type Episode = {
	id: string;
	title: string;
	members: string;
	thumbnail: string;
	publishedAt: string;
	description: string;
	durationAsString: string;
	url: string;
	duration: number;
}

type EpisodeProps = {
	episode: Episode
}

export default function Episodes({ episode }: EpisodeProps) {
	const { play } = usePlayerContext();

	return (
		<div className={styles.episode}>
			<Head>
				<title>{episode.title} | Podcastr</title>
			</Head>

			<div className={styles.thumbnailContainer}>
				<Link href="/">
					<button type="button">
						<img src="/arrow-left.svg" alt="Voltar" />
					</button>
				</Link>
				<Image
					width={700}
					height={160}
					src={episode.thumbnail}
					objectFit="cover"
				/>

				<button onClick={() => play(episode)} type="button">
					<img src="/play.svg" alt="Tocar episódio" />
				</button>
			</div>

			<header>
				<h1>{episode.title}</h1>
				<span>{episode.members}</span>
				<span>{episode.publishedAt}</span>
				<span>{episode.durationAsString}</span>
			</header>

			<div
				className={styles.description}
				dangerouslySetInnerHTML={{ __html: episode.description }}
			/>
		</div>
	);
}

export const getStaticPaths: GetStaticPaths = async () => {
	const { data } = await api.get('episodes', {
		params: {
			_limit: 2,
			_sort: 'published_at',
			_order: 'desc'
		}
	});

	const paths = data.map(episode => {
		return {
			params: {
				slug: episode.id
			}
		}
	});

	return {
		paths,
		fallback: 'blocking'
	}
}

export const getStaticProps: GetStaticProps = async (context) => {
	const { slug } = context.params;

	const { data } = await api.get(`/episodes/${slug}`);

	const episode = {
		id: data.id,
		title: data.title,
		members: data.members,
		thumbnail: data.thumbnail,
		publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
		description: data.description,
		durationAsString: convertDurationToTimeString(data.file.duration),
		duration: Number(data.file.duration),
		url: data.file.url
	}

	return {
		props: {
			episode
		},
		revalidate: 60 * 60 * 24 // 24 horas
	}
}
