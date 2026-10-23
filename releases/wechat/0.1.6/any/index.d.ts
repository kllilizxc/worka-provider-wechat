import { type Caller, type Extension, type ProviderInitializer, type ResourceDefinition, type SynchronizerDefinition, type WorkaExtensionHost } from '@realiz3r/worka/host';
import { type Issue, type WeChatConfig, type WeChatSource } from './source.js';
import { WeChatStore } from './state.js';
export type { WeChatConfig } from './source.js';
/** Independently packaged connector. Notes retain presentation and business decisions. */
export declare class WeChatProvider implements Extension {
    private readonly host;
    private readonly source;
    private readonly store;
    private readonly now;
    readonly resources: Record<string, ResourceDefinition<any, any>>;
    readonly initializers: Record<string, ProviderInitializer>;
    readonly initializationMethods: {
        initialize: string;
    };
    readonly synchronizers: Record<string, SynchronizerDefinition>;
    private readonly activity;
    private readonly stopped;
    private readonly reads;
    private prepareTask?;
    private prepareInput?;
    private bootstrapTask?;
    private bootstrapInput?;
    private checkTask?;
    private syncTask?;
    private beginning?;
    private closing?;
    private verified?;
    private lastIssue?;
    private bootstrapProgress?;
    constructor(host: WorkaExtensionHost, source: WeChatSource, store?: WeChatStore, now?: () => number);
    start(): Promise<void>;
    private failed;
    private control;
    private liveRead;
    private consumer;
    private selected;
    private runnable;
    private activeConsumers;
    private activityChanged;
    status(noteId?: string): Promise<{
        ready: boolean;
        initialized: boolean;
        connected: boolean;
        joined: boolean;
        preparing: boolean;
        checking: boolean;
        runtimeInstalled: boolean;
        configFile: string;
        keyConfig: string;
        accountId: string | null;
        selected: number;
        enabled: boolean;
        verifiedAt: number | null;
        lastVerifiedAt: number | null;
        issue: Issue | null;
        bootstrap: {
            operationId: string;
            stage: 'approval_requested' | 'approval_granted' | 'accepted' | 'spawned' | 'exited' | 'cancelled' | 'failed';
            diagnostic?: import("@realiz3r/worka/host").WeChatBootstrapDiagnostic;
            exitCode?: number;
            signal?: string;
        } | null;
    }>;
    private prepare;
    private prepareKeys;
    private verify;
    private check;
    private cached;
    private sessions;
    private readChat;
    private publishPending;
    private tick;
    private initializeConnection;
    invoke(method: string, input: Record<string, unknown>, caller: Caller, signal?: AbortSignal): Promise<unknown>;
    noteContext(note: {
        id: string;
    }): Promise<readonly string[]>;
    pause(_noteId: string): Promise<void>;
    beginClose(): Promise<void>;
    close(): Promise<void>;
}
export declare function registerWeChatProvider(host: WorkaExtensionHost, config?: WeChatConfig): Promise<() => Promise<void>>;
export declare const name = "worka-wechat";
export declare const inject: string[];
/** Ordinary DSH entrypoint, including when installed separately from Worka. */
export declare function apply(ctx: {
    worka: WorkaExtensionHost;
    effect(callback: () => (() => Promise<void>), label?: string): unknown;
}, config?: WeChatConfig): Promise<void>;
