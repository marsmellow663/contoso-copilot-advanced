import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ageOn, annualAccrual, contributionSplit, pensionableSalary, projectPension } from '../src/domain/pension.ts';

test('pensionable salary subtracts the franchise', () => {
  assert.equal(pensionableSalary(52_000, 1), 34_455);
});

test('pensionable salary applies the part-time factor', () => {
  assert.equal(pensionableSalary(46_000, 0.6), 17_073);
});

test('pensionable salary is capped at the salary cap', () => {
  assert.equal(pensionableSalary(150_000, 1), 120_255);
});

test('pensionable salary is never negative (salary below franchise)', () => {
  assert.equal(pensionableSalary(16_000, 0.9), 0);
});

test('pensionable salary rejects invalid part-time factors', () => {
  assert.throws(() => pensionableSalary(40_000, 0), RangeError);
  assert.throws(() => pensionableSalary(40_000, 1.2), RangeError);
});

test('annual accrual is 1.75% of pensionable salary', () => {
  assert.equal(annualAccrual(34_455), 602.96);
});

test('contribution split is 60% employer / 40% employee', () => {
  assert.deepEqual(contributionSplit(10_000), { total: 2_700, employer: 1_620, employee: 1_080 });
});

test('age is calculated in whole years', () => {
  assert.equal(ageOn('1972-04-15', '2026-11-18'), 54);
  assert.equal(ageOn('1979-12-20', '2026-11-18'), 46);
});

test('projection at the standard retirement age adds future accrual', () => {
  const result = projectPension({
    birthDate: '1972-04-15', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 5_000, asOf: '2026-11-18',
  });
  assert.equal(result.yearsToRetirement, 13);
  assert.equal(result.futureAccrual, 7_838.48);
  assert.equal(result.projectedAnnualPension, 12_838.48);
  assert.equal(result.unreducedAnnualPension, 12_838.48);
  assert.equal(result.earlyRetirementReduction, 0);
  assert.equal(result.retirementDate, '2040-04-15');
});

test('R5 reduces the total pension at 63 and stops accrual at that age', () => {
  const result = projectPension({
    birthDate: '1966-06-30', fullTimeSalary: 98_000, partTimeFactor: 0.8, accruedToDate: 10_423.7,
    asOf: '2026-11-18', retirementAge: 63,
  });
  assert.equal(result.retirementDate, '2029-06-30');
  assert.equal(result.yearsToRetirement, 2);
  assert.equal(result.futureAccrual, 2_252.74);
  assert.equal(result.earlyRetirementReduction, 0.325);
  assert.equal(result.unreducedAnnualPension, 12_676.44);
  assert.equal(result.projectedAnnualPension, 8_556.6);
});

test('R5 counts completed accrual years around the retirement birthday', () => {
  const input = {
    birthDate: '1966-06-30', fullTimeSalary: 98_000, partTimeFactor: 0.8, accruedToDate: 10_423.7,
    retirementAge: 63,
  };
  const beforeBirthday = projectPension({ ...input, asOf: '2026-06-29' });
  const afterBirthday = projectPension({ ...input, asOf: '2026-07-01' });

  assert.equal(beforeBirthday.yearsToRetirement, 3);
  assert.equal(afterBirthday.yearsToRetirement, 2);
  assert.equal(afterBirthday.futureAccrual, 2_252.74);
});

test('R5 accepts retirement at the current age of 60 with no future accrual', () => {
  const result = projectPension({
    birthDate: '1966-06-30', fullTimeSalary: 98_000, partTimeFactor: 0.8, accruedToDate: 10_000,
    asOf: '2026-11-18', retirementAge: 60,
  });
  assert.equal(result.yearsToRetirement, 0);
  assert.equal(result.futureAccrual, 0);
  assert.equal(result.earlyRetirementReduction, 0.52);
  assert.equal(result.unreducedAnnualPension, 10_000);
  assert.equal(result.projectedAnnualPension, 4_800);
});

test('R5 limits growing-salary accrual to the selected retirement age', () => {
  const result = projectPension({
    birthDate: '1965-11-18', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 5_000,
    asOf: '2026-11-18', retirementAge: 63, salaryGrowthRate: 0.1,
  });
  assert.equal(result.yearsToRetirement, 2);
  assert.equal(result.futureAccrual, 1_296.92);
  assert.equal(result.unreducedAnnualPension, 6_296.92);
  assert.equal(result.projectedAnnualPension, 4_250.42);
});

test('R5 rejects ages outside 60-68, non-integers and ages below the current age', () => {
  const input = {
    birthDate: '1959-11-05', fullTimeSalary: 52_000, partTimeFactor: 1, accruedToDate: 0, asOf: '2026-11-18',
  };
  for (const retirementAge of [59, 69, 66, 63.5, NaN, Infinity]) {
    assert.throws(() => projectPension({ ...input, retirementAge }), RangeError, `age ${retirementAge}`);
  }
});
