// @flow
import { Component, styled } from '@guardian/dotcom-rendering/packages/guui';

import { formatTime } from './utils';

import ProgressBar from './ProgressBar';
import Time from './Time';

const BUCKET_COUNT = 200;
const TICK = 500;

const AudioGrid = styled('div')({
    display: 'grid',
    gridTemplateColumns: '60px 1fr 1fr',
    gridTemplateRows: '2em 60px',
    gridTemplateAreas: '". currentTime duration" "playBtn visu visu" "playBtn track track"'
});

const TimeSpan = styled('span')(({ area }) => ({
    gridArea: area
}));

const PlayButton = styled('button')({
    gridArea: 'playBtn'
});

const Track = styled('div')({
    gridArea: 'track'
});

const Visualization = styled('canvas')({
    gridArea: 'visu'
});

export default class AudioPlayer extends Component {
    constructor() {
        super();
        this.state = {
            ready: false,
            playing: false,
            currentTime: 0,
            duration: NaN,
            volume: NaN,
            interval: 1,
            buckets: []
        };
    }

    componentDidMount() {
        if (Number.isNaN(this.audio.duration)) {
            this.audio.addEventListener('durationchange', this.ready, { once: true });
        } else {
            this.ready();
        }
        this.audio.addEventListener('volumechange', this.onVolumeChange);
        this.audio.addEventListener('timeupdate', this.onTimeUpdate);
        this.context = new window.AudioContext();
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
        this.source = this.context.createMediaElementSource(this.audio);
        this.source.connect(this.analyser);

        const rect = this.canvas.getBoundingClientRect();
        this.setState({
            canvasH: rect.height,
            canvasW: rect.width
        });
    }

    setCanvas = el => {
        this.canvas = el;
        this.drawing = el.getContext("2d");
    }

    setAudio = el => {
        this.audio = el;
    }

    ready = () => {
        this.setState({
            ready: true,
            duration: this.audio.duration,
            volume: this.audio.volume
        });
    }

    onVolumeChange = () => {
        this.setState({ volume: this.audio.volume });
    }

    onTimeUpdate = () => {
        this.setState({ currentTime: this.audio.currentTime });
    }

    play = () => {
        this.setState({ playing: !this.state.playing }, () => {
            if (this.state.playing) {
                this.audio.play();
                const interval = this.audio.duration / BUCKET_COUNT;
                this.sample();
                this.setState({
                    interval,
                    sampler: window.setInterval(this.sample, interval * 1000)
                });
                window.requestAnimationFrame(this.draw);
            } else {
                this.audio.pause();
                window.clearInterval(this.state.sampler);
                this.setState({ sampler: null });
                window.cancelAnimationFrame(this.draw);
            }
        });
    }

    forward = () => {
        this.audio.currentTime = Math.min(this.state.currentTime + 15, this.state.duration);
    }

    backward = () => {
        this.audio.currentTime = Math.max(this.state.currentTime - 15, 0);
    }

    updateVolume = v => {
        this.audio.volume = v / 100;
    }

    seek = v => {
        this.audio.currentTime = this.audio.duration * v / 100;
    }

    sample = () => {
        this.setState(() => {
            this.analyser.getByteFrequencyData(this.dataArray);
            const factor = Math.max(1, ...this.dataArray);
            const mean = this.dataArray.reduce((res, x) => res + x, 0) / this.dataArray.length;
            const minHeight = this.state.canvasH / 10;
            const barHeight = minHeight + (mean / factor * (this.state.canvasH - minHeight));
            this.state.buckets.push(barHeight);
        });
    }

    draw = () => {
        this.drawing.fillStyle = 'rgb(0, 0, 0)';
        this.drawing.fillRect(0, 0, this.state.canvasW, this.state.canvasH);

        const barWidth = (this.state.canvasW - BUCKET_COUNT + 1) / BUCKET_COUNT;

        this.state.buckets.forEach((barHeight, i) => {
            const barOffset = i * (barWidth + 1);
            const playOffset = this.state.currentTime - this.state.interval * i;
            const intensity = playOffset > this.state.interval
                ? 255
                : Math.max(30, 30 + Math.floor(playOffset * 225 / this.state.interval));
            this.drawing.fillStyle = `rgb(${intensity},0,0)`;
            this.drawing.fillRect(barOffset, this.state.canvasH - barHeight, barWidth, barHeight);
        });

        if (this.state.playing) {
            window.setTimeout(() => window.requestAnimationFrame(this.draw), TICK);
        }
    }

    render({
        sourceUrl,
        mediaId,
        controls,
        css
    }, { ready, playing, currentTime, duration, volume, canvasW, canvasH }) {
        const currentOffset = ready ? currentTime / duration * 100 : 0;

        return (
            <AudioGrid>
                <audio ref={this.setAudio} controls={controls} volume data-media-id={mediaId} preload="metadata">
                    <source src={sourceUrl} type="audio/mpeg" />
                </audio>
                <PlayButton onClick={this.play}>{playing ? "Pause" : "Play"}</PlayButton>
                <button onClick={this.backward} disabled={!playing}>← Backward 15s</button>
                <button onClick={this.forward} disabled={!playing}>Forward 15s →</button>
                <TimeSpan area="currentTime"><Time t={currentTime} /></TimeSpan>
                <TimeSpan area="duration">{ready ? ( <Time t={duration} /> ) : ""}</TimeSpan>
                <Track>
                    <ProgressBar value={currentOffset} formattedValue={formatTime(currentOffset)} trackColour={css.track.trackColour} progressColour={css.track.progressColour} onChange={this.seek} />
                </Track>
                {Number.isNaN(volume) ? "" : (
                    <ProgressBar value={volume * 100} formattedValue={`Volume set to ${volume}`} trackColour={css.volume.trackColour} progressColour={css.volume.progressColour} onChange={this.updateVolume} />
                )}
                <Visualization innerRef={this.setCanvas} width={canvasW} height={canvasH}></Visualization>
            </AudioGrid>
        );
    }
}
