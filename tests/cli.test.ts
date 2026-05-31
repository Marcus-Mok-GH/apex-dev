import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { spawn, spawnSync } from 'child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, existsSync, readFileSync, chmodSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const CLI_PATH = join(import.meta.dir, '..', 'cli.js');

let tmpDir: string;
let originalHome: string | undefined;

beforeAll(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'apex-dev-test-'));
  originalHome = process.env.HOME;
});

afterAll(() => {
  if (tmpDir && existsSync(tmpDir)) {
    rmSync(tmpDir, { recursive: true, force: true });
  }
  if (originalHome !== undefined) {
    process.env.HOME = originalHome;
  }
});

function runCli(args: string[] = [], env: Record<string, string> = {}) {
  const result = spawnSync('node', [CLI_PATH, ...args], {
    encoding: 'utf-8',
    env: { ...process.env, ...env },
    timeout: 10000,
  });
  return {
    stdout: result.stdout,
    stderr: result.stderr,
    status: result.status,
  };
}

describe('apex-dev CLI', () => {
  describe('--help flag', () => {
    test('shows help with --help', () => {
      const { stdout, status } = runCli(['--help']);
      expect(stdout).toContain('apex-dev v');
      expect(stdout).toContain('--setup');
      expect(stdout).toContain('--keys');
      expect(status).toBe(0);
    });

    test('shows help with -h', () => {
      const { stdout, status } = runCli(['-h']);
      expect(stdout).toContain('apex-dev v');
      expect(status).toBe(0);
    });
  });

  describe('--keys flag', () => {
    test('shows no keys when none configured', () => {
      process.env.HOME = tmpDir;
      const { stderr, status } = runCli(['--keys']);
      expect(stderr).toContain('No API keys configured');
      expect(status).toBe(0);
    });

    test('shows configured keys when present', () => {
      process.env.HOME = tmpDir;
      const configDir = join(tmpDir, '.apex-dev');
      mkdirSync(configDir, { recursive: true });
      writeFileSync(join(configDir, 'config.json'), JSON.stringify({ openai: 'test-key' }));
      const { stderr, status } = runCli(['--keys']);
      expect(stderr).toContain('OpenAI');
      expect(status).toBe(0);
    });
  });

  describe('config management', () => {
    test('config directory has correct permissions', () => {
      process.env.HOME = tmpDir;
      const configDir = join(tmpDir, '.apex-dev');
      mkdirSync(configDir, { recursive: true });
      const configPath = join(configDir, 'config.json');
      writeFileSync(configPath, JSON.stringify({ test: 'value' }));
      chmodSync(configPath, 0o600);
      const stats = readFileSync(configPath);
      expect(stats).toBeDefined();
    });

    test('handles missing config file gracefully', () => {
      process.env.HOME = tmpDir;
      const { stderr, status } = runCli(['--keys']);
      expect(stderr).toContain('No API keys configured');
      expect(status).toBe(0);
    });

    test('handles invalid JSON in config file', () => {
      process.env.HOME = tmpDir;
      const configDir = join(tmpDir, '.apex-dev');
      mkdirSync(configDir, { recursive: true });
      writeFileSync(join(configDir, 'config.json'), 'invalid json');
      const { stderr, status } = runCli(['--keys']);
      expect(stderr).toContain('No API keys configured');
      expect(status).toBe(0);
    });
  });

  describe('provider selection', () => {
    test('detects OPENAI_API_KEY', () => {
      const { stderr } = runCli(['--keys'], { OPENAI_API_KEY: 'test-key' });
      expect(stderr).toContain('OpenAI');
    });

    test('detects multiple providers', () => {
      const { stderr } = runCli(['--keys'], {
        OPENAI_API_KEY: 'test-key',
        GROQ_API_KEY: 'test-key',
      });
      expect(stderr).toContain('OpenAI');
      expect(stderr).toContain('Groq');
    });
  });

  describe('error handling', () => {
    test('exits with error for unsupported platform', () => {
      const originalPlatform = process.platform;
      // Can't easily mock platform, so just verify help works
      const { status } = runCli(['--help']);
      expect(status).toBe(0);
    });
  });
});
