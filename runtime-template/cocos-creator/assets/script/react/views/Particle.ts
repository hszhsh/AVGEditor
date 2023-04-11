import View from "./View";

export default interface Particle extends View, ParticleProps {
    isStopped(): boolean;
    stop(): void;
}