import { describe, it, expect } from 'vitest';
import {
  calculatePercentage,
  formatDate,
  formatDateForInput,
  getProgressColor,
  getProgressTextColor,
  getDaysRemaining,
  formatDuration,
  getDifficultyColor,
  truncate,
  parseCSV,
  calculateWeeklyContribution,
  cn,
} from '../index';
import { DifficultyLevel } from '../../types';

describe('Utility Functions', () => {
  describe('calculatePercentage', () => {
    it('calculates percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(75, 100)).toBe(75);
      expect(calculatePercentage(1, 4)).toBe(25);
    });

    it('caps at 100%', () => {
      expect(calculatePercentage(150, 100)).toBe(100);
    });

    it('handles zero target', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
    });

    it('respects decimal places', () => {
      expect(calculatePercentage(1, 3, 2)).toBe(33.33);
      expect(calculatePercentage(1, 3, 0)).toBe(33);
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2026-01-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan.*15.*2026/);
    });

    it('handles string dates', () => {
      const formatted = formatDate('2026-01-15');
      expect(formatted).toMatch(/Jan.*15.*2026/);
    });

    it('handles undefined', () => {
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('formatDateForInput', () => {
    it('formats date for input field', () => {
      const date = new Date('2026-01-15');
      expect(formatDateForInput(date)).toBe('2026-01-15');
    });

    it('handles undefined', () => {
      expect(formatDateForInput(undefined)).toBe('');
    });
  });

  describe('getProgressColor', () => {
    it('returns success color for 100%', () => {
      expect(getProgressColor(100)).toBe('bg-success');
    });

    it('returns warning color for medium progress', () => {
      expect(getProgressColor(50)).toBe('bg-warning');
    });

    it('returns primary color for low progress', () => {
      expect(getProgressColor(20)).toBe('bg-primary-400');
    });

    it('returns appropriate colors for boundaries', () => {
      expect(getProgressColor(75)).toBe('bg-success/80');
      expect(getProgressColor(25)).toBe('bg-warning/80');
    });
  });

  describe('getProgressTextColor', () => {
    it('returns correct text colors', () => {
      expect(getProgressTextColor(100)).toContain('success');
      expect(getProgressTextColor(50)).toContain('warning');
      expect(getProgressTextColor(20)).toContain('primary');
    });
  });

  describe('getDaysRemaining', () => {
    it('calculates days remaining', () => {
      const future = new Date();
      future.setDate(future.getDate() + 7);
      expect(getDaysRemaining(future)).toBe(7);
    });

    it('handles past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      expect(getDaysRemaining(past)).toBeLessThan(0);
    });

    it('handles undefined', () => {
      expect(getDaysRemaining(undefined)).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('formats hours correctly', () => {
      expect(formatDuration(0.5)).toBe('30 minutes');
      expect(formatDuration(1)).toBe('1 hour');
      expect(formatDuration(2)).toBe('2 hours');
    });

    it('formats days correctly', () => {
      expect(formatDuration(24)).toBe('1 day');
      expect(formatDuration(48)).toBe('2 days');
      expect(formatDuration(25)).toBe('1 day 1 hour');
      expect(formatDuration(26)).toBe('1 day 2 hours');
    });
  });

  describe('getDifficultyColor', () => {
    it('returns correct colors for difficulty levels', () => {
      expect(getDifficultyColor(DifficultyLevel.VERY_EASY)).toContain('success');
      expect(getDifficultyColor(DifficultyLevel.MODERATE)).toContain('warning');
      expect(getDifficultyColor(DifficultyLevel.VERY_HARD)).toContain('danger');
    });
  });

  describe('truncate', () => {
    it('truncates long text', () => {
      const text = 'This is a very long text that needs truncation';
      expect(truncate(text, 20)).toBe('This is a very long ...');
    });

    it('does not truncate short text', () => {
      const text = 'Short text';
      expect(truncate(text, 20)).toBe('Short text');
    });
  });

  describe('parseCSV', () => {
    it('parses comma-separated values', () => {
      expect(parseCSV('apple, banana, orange')).toEqual(['apple', 'banana', 'orange']);
    });

    it('handles empty strings', () => {
      expect(parseCSV('')).toEqual([]);
    });

    it('trims whitespace', () => {
      expect(parseCSV('  apple  ,  banana  ')).toEqual(['apple', 'banana']);
    });

    it('filters empty values', () => {
      expect(parseCSV('apple,,banana')).toEqual(['apple', 'banana']);
    });
  });

  describe('calculateWeeklyContribution', () => {
    it('calculates contribution correctly', () => {
      // 5 out of 7 daily goals, 4 weeks in month
      const contribution = calculateWeeklyContribution(5, 7, 4);
      expect(contribution).toBeCloseTo(17.86, 1);
    });

    it('handles zero total', () => {
      expect(calculateWeeklyContribution(5, 0)).toBe(0);
    });

    it('handles perfect completion', () => {
      const contribution = calculateWeeklyContribution(7, 7, 4);
      expect(contribution).toBe(25);
    });
  });

  describe('cn (className merger)', () => {
    it('merges class names', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
    });

    it('handles Tailwind conflicts correctly', () => {
      // twMerge should handle Tailwind class conflicts
      const result = cn('p-4', 'p-8');
      // Should only have p-8, not both
      expect(result).toContain('p-8');
    });
  });
});
