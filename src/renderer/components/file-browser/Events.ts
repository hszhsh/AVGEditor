import { Emitter } from "@/utils/event-kit";

let emmiter = new Emitter;
export let ReloadDir = emmiter.createEvent<() => void>();
export let NewDir = emmiter.createEvent<() => void>();