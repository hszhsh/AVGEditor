import * as React from 'react';
import { withDefaultProps } from '../utils';

type propBaseTypes = {
    className: string,
    children: Element | null,
    autoPlay: boolean,
    controls: boolean,
    controlsList: string,
    crossOrigin: string | null,
    id: string,
    listenInterval: number,
    loop: boolean,
    muted: boolean,
    onAbort: (e: Event) => void,
    onCanPlay: (e: Event) => void,
    onCanPlayThrough: (e: Event) => void,
    onEnded: (e: Event) => void,
    onError: (e: Event) => void,
    onListen: (e: number) => void,
    onLoadedMetadata: (e: Event) => void,
    onPause: (e: Event) => void,
    onPlay: (e: Event) => void,
    onSeeked: (e: Event) => void,
    onVolumeChanged: (e: Event) => void,
    preload: '' | 'none' | 'metadata' | 'auto',
    src: string | null, // Not required b/c can use <source>
    style: Object
    title: string,
    volume: number,
};

type propTypes = propBaseTypes & DefaultProps;

type DefaultProps = Readonly<typeof defaultProps>

const defaultProps: propBaseTypes = {
    autoPlay: false,
    children: null,
    className: '',
    controls: false,
    controlsList: '',
    crossOrigin: null,
    id: '',
    listenInterval: 10000,
    loop: false,
    muted: false,
    onAbort: (e: Event) => { },
    onCanPlay: (e: Event) => { },
    onCanPlayThrough: (e: Event) => { },
    onEnded: (e: Event) => { },
    onError: (e: Event) => { },
    onListen: (e: number) => { },
    onPause: (e: Event) => { },
    onPlay: (e: Event) => { },
    onSeeked: (e: Event) => { },
    onVolumeChanged: (e: Event) => { },
    onLoadedMetadata: (e: Event) => { },
    preload: 'metadata',
    src: null,
    style: {},
    title: '',
    volume: 1.0,
}

const ReactAudioPlayer = withDefaultProps(
    defaultProps,
    class extends React.Component<propTypes> {
        private audioEl: HTMLAudioElement;
        private listenTracker: any;

        componentDidMount() {
            const audio = this.audioEl;

            this.updateVolume(this.props.volume);

            audio.addEventListener('error', (e) => {
                this.props.onError(e);
            });

            // When enough of the file has downloaded to start playing
            audio.addEventListener('canplay', (e) => {
                this.props.onCanPlay(e);
            });

            // When enough of the file has downloaded to play the entire file
            audio.addEventListener('canplaythrough', (e) => {
                this.props.onCanPlayThrough(e);
            });

            // When audio play starts
            audio.addEventListener('play', (e) => {
                this.setListenTrack();
                this.props.onPlay(e);
            });

            // When unloading the audio player (switching to another src)
            audio.addEventListener('abort', (e) => {
                this.clearListenTrack();
                this.props.onAbort(e);
            });

            // When the file has finished playing to the end
            audio.addEventListener('ended', (e) => {
                this.clearListenTrack();
                this.props.onEnded(e);
            });

            // When the user pauses playback
            audio.addEventListener('pause', (e) => {
                this.clearListenTrack();
                this.props.onPause(e);
            });

            // When the user drags the time indicator to a new time
            audio.addEventListener('seeked', (e) => {
                this.props.onSeeked(e);
            });

            audio.addEventListener('loadedmetadata', (e) => {
                this.props.onLoadedMetadata(e);
            });

            audio.addEventListener('volumechange', (e) => {
                this.props.onVolumeChanged(e);
            });
        }

        UNSAFE_componentWillReceiveProps(nextProps: propTypes) {
            this.updateVolume(nextProps.volume);
        }

        /**
         * Set an interval to call props.onListen every props.listenInterval time period
         */
        setListenTrack() {
            if (!this.listenTracker) {
                const listenInterval = this.props.listenInterval;
                this.listenTracker = setInterval(() => {
                    this.props.onListen(this.audioEl.currentTime);
                }, listenInterval);
            }
        }

        /**
         * Set the volume on the audio element from props
         * @param {Number} volume
         */
        updateVolume(volume: number) {
            if (typeof volume === 'number' && volume !== this.audioEl.volume) {
                this.audioEl.volume = volume;
            }
        }

        /**
         * Clear the onListen interval
         */
        clearListenTrack() {
            if (this.listenTracker) {
                clearInterval(this.listenTracker);
                this.listenTracker = null;
            }
        }

        render() {
            const incompatibilityMessage = this.props.children || (
                <p>Your browser does not support the <code>audio</code> element.</p>
            );

            // Set controls to be true by default unless explicity stated otherwise
            const controls = !(this.props.controls === false);

            // Set lockscreen / process audio title on devices
            const title = this.props.title ? this.props.title : this.props.src;

            // Some props should only be added if specified
            const conditionalProps: any = {};
            if (this.props.controlsList) {
                conditionalProps.controlsList = this.props.controlsList;
            }

            return (
                <audio
                    autoPlay={this.props.autoPlay}
                    className={`react-audio-player ${this.props.className}`}
                    controls={controls}
                    crossOrigin={this.props.crossOrigin}
                    id={this.props.id}
                    loop={this.props.loop}
                    muted={this.props.muted}
                    onPlay={this.props.onPlay}
                    preload={this.props.preload}
                    ref={(ref) => { this.audioEl = ref!; }}
                    src={this.props.src}
                    style={this.props.style}
                    title={title}
                    {...conditionalProps}
                >
                    {incompatibilityMessage}
                </audio>
            );
        }
    }
);

export default ReactAudioPlayer;