import { OperationRejectedError, type RuntimeHost, type WeChatProcessRecord } from '@realiz3r/worka/host';
import type { WeChatBootstrapDiagnostic, WeChatBootstrapProgress, WeChatBootstrapReasonCode, WeChatBootstrapSpawner } from '@realiz3r/worka/host';
export type BootstrapFailureStage = WeChatBootstrapDiagnostic['stage'];
export type BootstrapFailureType = 'permission_denied' | 'not_found' | 'timeout' | 'cancelled' | 'host_rejected' | 'approval_unavailable' | 'approval_declined' | 'approval_timeout' | 'approval_failed' | 'caller_not_authorized' | 'nonzero_exit' | 'signal_exit' | 'config_missing' | 'config_invalid' | 'preflight_failed' | 'bootstrap_failed' | 'unknown';
export type BootstrapSystemCode = 'EACCES' | 'EPERM' | 'ENOENT' | 'ETIMEDOUT';
export type BootstrapSignal = 'SIGABRT' | 'SIGALRM' | 'SIGBUS' | 'SIGFPE' | 'SIGHUP' | 'SIGILL' | 'SIGINT' | 'SIGKILL' | 'SIGPIPE' | 'SIGQUIT' | 'SIGSEGV' | 'SIGTERM' | 'SIGTRAP' | 'SIGUSR1' | 'SIGUSR2';
/** Safe, allow-listed process facts only; never contains command, env, paths, or tool output. */
export type BootstrapDiagnostic = WeChatBootstrapDiagnostic;
export type Issue = {
    code: string;
    message: string;
    phase: string;
    diagnostic?: BootstrapDiagnostic;
};
export declare class WeChatError extends OperationRejectedError {
    readonly wechatCode: string;
    readonly phase: string;
    readonly diagnostic?: BootstrapDiagnostic | undefined;
    constructor(wechatCode: string, message: string, phase: string, diagnostic?: BootstrapDiagnostic | undefined);
}
export declare function issue(error: unknown): Issue;
export type RuntimeConfig = {
    python: string;
    project: string;
    cli: string;
    wcdb: string;
    metadata_state: string;
    key_config: string;
};
export type Inspection = {
    configFile: string;
    runtimeInstalled: boolean;
    keyConfig: string;
    fingerprint?: string;
    bootstrapVerificationPending?: boolean;
    issue?: Issue;
};
export type ReadResult = {
    identity: string;
    data: Record<string, unknown>;
};
export type ReadTool = 'status' | 'sessions' | 'timeline' | 'read_events';
export type WxkeyBootstrapInvocation = {
    command: string;
    args: string[];
    keyConfig: string;
    env: Record<string, string>;
};
export type WxkeyBootstrapExecutor = (invocation: WxkeyBootstrapInvocation, signal: AbortSignal) => Promise<void>;
export type BootstrapProcess = {
    pid: number;
    uid: number;
    realUid: number;
    startTime: string;
    executable: string;
};
export type BootstrapSafety = {
    home: string;
    uid: number;
    listProcesses(signal: AbortSignal): Promise<BootstrapProcess[]>;
    openOriginal(signal: AbortSignal): Promise<void>;
};
export type KeyBootstrapReadiness = {
    available: true;
    version: string;
    confirmation: string;
} | {
    available: false;
    issue: Issue;
};
export type WeChatRuntimeInstaller = (input: {
    runtimeDirectory: string;
    keyConfig: string;
    archive?: string;
    url?: string;
    signal: AbortSignal;
}) => Promise<void>;
export type WeChatProcessInspector = (signal: AbortSignal) => Promise<WeChatProcessRecord[]>;
export type BootstrapRequest = {
    operationId?: string;
    signal?: AbortSignal;
    onProgress?: (progress: WeChatBootstrapProgress) => void;
};
/** Fixed wxkey v1.4.8 CLI and environment, verified against the pinned source and runtime receipt. */
export declare function wxkeyBootstrapInvocation(command: string, keyConfig: string): WxkeyBootstrapInvocation;
export interface WeChatSource {
    inspect(): Promise<Inspection>;
    prepare(input?: {
        keyConfig?: string;
    }, signal?: AbortSignal): Promise<Inspection>;
    keyBootstrapReadiness(): KeyBootstrapReadiness;
    bootstrapKeys(request?: BootstrapRequest): Promise<void>;
    completeBootstrapVerification(verified: boolean): Promise<string | undefined>;
    call(tool: ReadTool, input: Record<string, unknown>, signal?: AbortSignal): Promise<ReadResult>;
    close(): Promise<void>;
}
export interface WeChatConfig {
    /** Distribution assets stay with this independent provider package. */
    assetsRoot?: string;
    runtimeConfig?: string;
    keyConfig?: string;
    /** Deployment-owned artifact location; private repository URLs never ship in source. */
    runtimeUrl?: string;
    /** Existing archive, checked against the release's fixed SHA-256 before use. */
    runtimeArchive?: string;
}
/** Reads only the explicitly addressed file; no discovery, preparation or credential writes. */
export declare function readKeyConfiguration(keyConfig: string): Promise<string>;
/** Sanitize failures at an initialize boundary without replacing a more specific runner diagnostic. */
export declare function bootstrapBoundaryFailure(error: unknown, stage: BootstrapFailureStage, operationId?: string, reasonCode?: WeChatBootstrapReasonCode): WeChatError;
export declare class LocalWeChatSource implements WeChatSource {
    private readonly runtime;
    private readonly dataRoot;
    private readonly config;
    private readonly environment;
    private readonly wxkeyBootstrapExecutor?;
    private readonly runtimeInstaller?;
    private readonly hostBootstrapHome?;
    private readonly hostBootstrap?;
    private readonly requireHostBootstrap;
    private readonly assetsRoot;
    private readonly profileConfig;
    private readonly stop;
    private child?;
    private starting?;
    private readonly starts;
    private closing?;
    private readonly preparations;
    private readonly bootstraps;
    private readonly bootstrapSafety;
    private pendingBootstrapConfig?;
    private finishingBootstrap?;
    private readonly retirements;
    private readonly retired;
    private readerGeneration;
    private activeFingerprint?;
    private nextId;
    private buffer;
    private readonly listeners;
    private pending;
    private ready?;
    constructor(runtime: RuntimeHost, dataRoot: string, config?: WeChatConfig, environment?: {
        platform: NodeJS.Platform;
        arch: string;
    }, wxkeyBootstrapExecutor?: WxkeyBootstrapExecutor | undefined, bootstrapSafety?: BootstrapSafety, runtimeInstaller?: WeChatRuntimeInstaller | undefined, processInspector?: WeChatProcessInspector, hostBootstrapHome?: string | undefined, hostBootstrap?: WeChatBootstrapSpawner | undefined, requireHostBootstrap?: boolean);
    private configPath;
    private readConfiguration;
    private bootstrapMarker;
    private hasPendingBootstrap;
    private markBootstrapPending;
    private clearBootstrapPending;
    inspect(): Promise<Inspection>;
    keyBootstrapReadiness(): KeyBootstrapReadiness;
    bootstrapKeys(request?: BootstrapRequest): Promise<void>;
    private runBootstrapKeys;
    completeBootstrapVerification(verified: boolean): Promise<string | undefined>;
    prepare(input?: {
        keyConfig?: string;
    }, signal?: AbortSignal): Promise<Inspection>;
    private prepareRuntime;
    private fail;
    private retireProcess;
    private retireChild;
    private start;
    call(tool: ReadTool, input: Record<string, unknown>, signal?: AbortSignal): Promise<ReadResult>;
    close(): Promise<void>;
}
