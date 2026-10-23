export interface WeChatRuntimeRelease {
  version: string;
  platform: 'darwin';
  arch: 'arm64';
  archive: 'wechat-runtime-darwin-arm64.tar.gz';
  sha256: string;
  size?: number;
  url?: string;
}

export function bundledRuntimeArchivePath(runtimeDirectory: string, release: { archive: string }): string;
export function verifyBundledRuntime(runtimeDirectory: string): Promise<{ archive: string; release: WeChatRuntimeRelease }>;
export function readRuntimeArchive(options: {
  runtimeDirectory: string;
  release?: WeChatRuntimeRelease;
  archive?: string;
  url?: string;
  fetchImpl?: typeof fetch;
  env?: Record<string, string | undefined>;
}): Promise<Buffer>;
export function ensureBundledRuntimeArchive(
  runtimeDirectory: string,
  options: { cacheDirectory: string; fetchImpl?: typeof fetch },
): Promise<{ archive: string; release: WeChatRuntimeRelease }>;
