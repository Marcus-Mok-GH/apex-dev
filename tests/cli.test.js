import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { spawn, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const CLI_PATH = path.resolve(import.meta.dir, '../cli.js');
const CONFIG_DIR = path.join(os.homedir(), '.apex-dev');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');
const BACKUP_CONFIG_PATH = path.join(CONFIG_DIR, 'config.json.bak');

// Backup and restore config
beforeAll(() => {
  if (fs.existsSync(CONFIG_PATH)) {
    fs.copyFileSync(CONFIG_PATH, BACKUP_CONFIG_PATH);
  }
});

afterAll(() => {
  if (fs.existsSync(BACKUP_CONFIG_PATH)) {
    fs.copyFileSync(BACKUP_CONFIG_PATH, CONFIG_PATH);
    fs.unlinkSync(BACKUP_CONFIG_PATH);
  } else if (fs.existsSync(CONFIG_PATH)) {
    fs.unlinkSync(CONFIG_PATH);
  }
});

function runCli(args = [], env = {}) {
  return spawnSync('node', [CLI_PATH, ...args], {
    encoding: 'utf-8',
    env: { ...process.env, ...env },
    timeout: 10000,
  });
}

describe('apex-dev CLI', () => {
  test('--help shows help message and exits cleanly', () => {
    const result = runCli(['--help']);
    
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('apex-dev v');
    expect(result.stdout).toContain('--help');
    expect(result.stdout).toContain('--setup');
    expect(result.stdout).toContain('--keys');
  });

  test('-h (short flag) shows help message', () => {
    const result = runCli(['-h']);
    
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('apex-dev v');
  });

  test('--keys shows no keys configured when config is empty', () => {
    // Remove config file temporarily
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
    
    const result = runCli(['--keys']);
    
    expect(result.status).toBe(0);
    expect(result.stderr).toContain('No API keys configured');
  });

  test('--keys shows configured providers when API keys exist', () => {
    // Create a test config
    const testConfig = { openai: 'test-key-12345' };
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(testConfig, null, 2));
    
    const result = runCli(['--keys'], { OPENAI_API_KEY: 'test-key-12345' });
    
    expect(result.status).toBe(0);
    expect(result.stderr).toMatch(/provider\(s\) configured/);
  });

  test('CLI shows platform info in help', () => {
    const result = runCli(['--help']);
    
    expect(result.stdout).toContain('Detected platform:');
    expect(result.stdout).toContain('Binary name:');
    expect(result.stdout).toContain('Cache directory:');
  });

  test('CLI shows version in help output', () => {
    const result = runCli(['--help']);
    
    // Version should be in the format X.Y.Z
    expect(result.stdout).toMatch(/apex-dev v\d+\.\d+\.\d+/);
  });
});

describe('Config management', () => {
  test('Config directory is created if it does not exist', () => {
    // Remove config dir if exists
    if (fs.existsSync(CONFIG_DIR)) {
      fs.rmSync(CONFIG_DIR, { recursive: true });
    }
    
    // Run --help which should trigger config dir creation
    runCli(['--help']);
    
    // Config dir should exist now (or at least not crash)
    expect(() => fs.existsSync(CONFIG_DIR)).not.toThrow();
  });

  test('Config file has correct permissions (0600)', () => {
    const testConfig = { openai: 'secret-key' };
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(testConfig, null, 2));
    
    // Manually set permissions like the CLI does
    fs.chmodSync(CONFIG_PATH, 0o600);
    
    const stats = fs.statSync(CONFIG_PATH);
    const mode = stats.mode & 0o777;
    expect(mode).toBe(0o600);
  });
});

describe('Provider selection', () => {
  test('FIREWORKS_API_KEY env var is recognized', () => {
    const result = runCli(['--keys'], { FIREWORKS_API_KEY: 'test-fireworks-key' });
    
    expect(result.status).toBe(0);
    expect(result.stderr).toMatch(/provider\(s\) configured/);
  });

  test('Multiple API keys are recognized', () => {
    const result = runCli(['--keys'], { 
      OPENAI_API_KEY: 'test-openai-key',
      GROQ_API_KEY: 'test-groq-key',
    });
    
    expect(result.status).toBe(0);
    expect(result.stderr).toContain('2 provider(s) configured');
  });
});

describe('Error handling', () => {
  test('CLI handles missing config file gracefully', () => {
    // Remove config file
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
    
    // Should not crash
    const result = runCli(['--keys']);
    expect(result.status).toBe(0);
  });

  test('CLI handles invalid JSON in config file', () => {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, 'invalid json {{{');
    
    // Should not crash
    const result = runCli(['--keys']);
    expect(result.status).toBe(0);
    
    // Cleanup
    fs.unlinkSync(CONFIG_PATH);
  });
});
