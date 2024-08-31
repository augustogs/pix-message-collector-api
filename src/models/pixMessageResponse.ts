import { PixMessage } from "./pixMessage";

export interface PixMessageResponse {
    nextInteractionId: string;
    newMessages: PixMessage[];
}