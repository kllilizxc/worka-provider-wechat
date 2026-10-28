"""Private stdio bridge for the pinned local reader; never launches key preparation."""
import asyncio
import hashlib
import json
import os
import re
import sys
from pathlib import Path

TOOLS = frozenset({'status', 'sessions', 'timeline', 'read_events'})


def emit(value):
    print(json.dumps(value, ensure_ascii=False, separators=(',', ':')), flush=True)


def identifier(value, fallback):
    return value if isinstance(value, str) and re.fullmatch(r'[\w.:-]{1,100}', value) else fallback


def failure(error, phase):
    # Keep the real exception class/errno and failing operation. Exception text
    # from upstream may contain message bodies or key bytes and is not a log API.
    return {'ok': False, 'phase': phase, 'code': type(error).__name__,
            'cause': str(error.errno) if isinstance(error, OSError) and error.errno is not None else type(error).__name__}


def payload(result):
    if isinstance(result.structuredContent, dict):
        return result.structuredContent
    for block in result.content:
        if block.type == 'text':
            try:
                value = json.loads(block.text)
                if isinstance(value, dict):
                    return value
            except ValueError:
                pass
    return {'ok': False, 'error': {'code': 'invalid_result'}}


def identity(config):
    account = json.loads(Path(config['key_config']).read_text())
    return hashlib.sha256(json.dumps([account['wxid'], account['db_root']]).encode()).hexdigest()


def read_scope(tool, args, data):
    if tool != 'read_events' or args.get('talker') or args.get('chat'):
        return data
    return {'cursor': data.get('cursor'), 'query': data.get('query'),
            'events': [{'session': {'username': event.get('session', {}).get('username')}}
                       for event in data.get('events', [])]}


async def main():
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client

    config = json.loads(Path(sys.argv[1]).read_text())
    env = os.environ.copy()
    env.update({
        'WECHAT_MCP_CLI_PATH': config['cli'], 'WECHAT_MCP_WCDB_LIB': config['wcdb'],
        'WECHAT_CLI_CONFIG': config['key_config'], 'WECHAT_CLI_STATE_DIR': config['metadata_state'],
        'WECHAT_CLI_STRICT_READ_ONLY': '1', 'WXKEY_NO_ELEVATE': '1',
        'PYTHONDONTWRITEBYTECODE': '1', 'PYTHONPATH': str(Path(config['project']) / 'src'),
    })
    for flag in ['MEDIA', 'DERIVED_WRITES', 'OCR', 'FILE_TEXT', 'VOICE', 'NETWORK']:
        env['WECHAT_MCP_ENABLE_' + flag] = '0'
    params = StdioServerParameters(command=config['python'], args=['-B', '-m', 'wechat_cli_mcp.server'],
                                   cwd=config['project'], env=env)
    with open(os.devnull, 'w') as errlog:
        async with stdio_client(params, errlog=errlog) as (reader, writer):
            async with ClientSession(reader, writer) as session:
                await asyncio.wait_for(session.initialize(), 30)
                emit({'ready': True})
                while True:
                    line = await asyncio.to_thread(sys.stdin.readline, 1024 * 1024)
                    if not line:
                        return
                    request = json.loads(line)
                    rid, tool, args = request['id'], request.get('tool'), request.get('input', {})
                    if tool not in TOOLS:
                        emit({'id': rid, 'ok': False, 'phase': 'admission', 'code': 'tool_not_allowed'})
                        continue
                    try:
                        account = identity(config)
                        result = payload(await asyncio.wait_for(session.call_tool(tool, args), 30))
                        if identity(config) != account:
                            emit({'id': rid, 'ok': False, 'phase': tool, 'code': 'account_changed'})
                        elif result.get('ok') is True:
                            emit({'id': rid, 'ok': True, 'identity': account,
                                  'data': read_scope(tool, args, result.get('data', {}))})
                        else:
                            error = result.get('error') or {}
                            code = identifier(error.get('code') if isinstance(error, dict) else None, 'upstream_read_failed')
                            emit({'id': rid, 'ok': False, 'phase': tool, 'code': code})
                    except Exception as error:
                        emit({'id': rid, **failure(error, tool)})


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except BaseException as error:
        emit({'startup': True, **failure(error, 'startup')})
        raise SystemExit(1)
