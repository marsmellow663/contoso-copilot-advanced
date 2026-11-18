import { annualAccrual, dateAtAge, pensionableSalary, projectPension, roundMoney, ageOn } from '../domain/pension.ts';
import { SCHEME_2026 } from '../domain/scheme.ts';
import type { ContributionRepository } from '../repositories/contributionRepository.ts';
import type { Member } from '../repositories/types.ts';

export interface AnnualStatement {
  memberId: string;
  asOf: string;
  age: number;
  yearsOfService: number;
  accruedPension: number;
  currentPensionableSalary: number;
  currentYearAccrual: number;
  projectedPensionAtRetirement: number;
  retirementDate: string;
  scheme: string;
}

/**
 * Builds the yearly pension statement ("annual statement") for a member.
 * Accrued pension comes from the stored contribution history;
 * the current-year figures are calculated from the member's CURRENT salary and part-time factor.
 */
export class StatementService {
  private readonly contributions: ContributionRepository;
  constructor(contributions: ContributionRepository) { this.contributions = contributions; }

  build(member: Member, asOf: string): AnnualStatement {
    const history = this.contributions.listByMember(member.id);
    const accruedPension = roundMoney(this.contributions.totalAccrual(member.id));

    const currentPensionable = pensionableSalary(member.fullTimeSalary, 1);
    const currentYearAccrual = annualAccrual(currentPensionable);

    const age = ageOn(member.birthDate, asOf);
    const retirementDate = dateAtAge(member.birthDate, SCHEME_2026.retirementAge);
    const projectedPensionAtRetirement = age > SCHEME_2026.retirementAge
      ? accruedPension
      : projectPension({
        birthDate: member.birthDate,
        fullTimeSalary: member.fullTimeSalary,
        partTimeFactor: member.partTimeFactor,
        accruedToDate: accruedPension,
        asOf,
      }).projectedAnnualPension;

    return {
      memberId: member.id,
      asOf,
      age,
      yearsOfService: history.length,
      accruedPension,
      currentPensionableSalary: currentPensionable,
      currentYearAccrual,
      projectedPensionAtRetirement,
      retirementDate,
      scheme: SCHEME_2026.id,
    };
  }
}
