export type Chat = {
    id: string;
    name: string;
    type: 'private' | 'group';
};
export type Message = {
    id: string;
    time: number;
    sender: string;
    text: string;
    kind: string;
    fromMe: boolean;
};
export type CachedChat = {
    chat: Chat;
    cursor?: string;
    messages: Message[];
    updatedAt?: number;
};
export type Notice = {
    chatId: string;
    title: string;
    fromMessageId: string | null;
    messageId: string;
    revision: string;
};
export type Consumer = {
    accountId: string;
    enabled: boolean;
    chats: Chat[];
    pending: Record<string, Notice>;
};
export type Account = {
    chats: Record<string, CachedChat>;
    verifiedAt?: number;
    fingerprint?: string;
};
export type State = {
    version: 1;
    accounts: Record<string, Account>;
    consumers: Record<string, Consumer>;
    activeAccount?: string;
};
/** Account data is private to this provider and never stored in a note's state. */
export declare class WeChatStore {
    private readonly directory;
    value: State;
    private queue;
    private listeners;
    constructor(directory: string);
    open(): Promise<void>;
    subscribe(listener: () => void): () => void;
    touch(): void;
    update<T>(change: (state: State) => T): Promise<T>;
    drain(): Promise<void>;
}
export declare function normalize(raw: any): Message;
export declare function mergeMessages(previous: Message[], incoming: Message[]): Message[];
