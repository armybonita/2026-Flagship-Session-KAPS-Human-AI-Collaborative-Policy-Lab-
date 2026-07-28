"use client";

import { useMemo, useState } from "react";

type SimulatorInput = {
  age: number;
  monthlyIncome: number;
  contributionYears: number;
  retirementAge: number;
};

type PolicyOption = {
  id: "N-A" | "N-B" | "N-C";
  name: string;
  shortName: string;
  premiumRate: number;
  replacementRate: number;
  pensionAge: number;
  fiscalRate: number;
  color: string;
};

const policyOptions: PolicyOption[] = [
  {
    id: "N-A",
    name: "균형 조정안",
    shortName: "부담·급여 균형",
    premiumRate: 9,
    replacementRate: 40,
    pensionAge: 65,
    fiscalRate: 0.8,
    color: "#246bfd",
  },
  {
    id: "N-B",
    name: "소득보장 강화안",
    shortName: "급여 강화",
    premiumRate: 13,
    replacementRate: 43,
    pensionAge: 65,
    fiscalRate: 1.6,
    color: "#6d5ce8",
  },
  {
    id: "N-C",
    name: "재정안정 강화안",
    shortName: "지속가능성 강화",
    premiumRate: 15,
    replacementRate: 40,
    pensionAge: 68,
    fiscalRate: 0.4,
    color: "#0f9f85",
  },
];

function formatWon(value: number) {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1)}억원`;
  }
  if (value >= 10_000) {
    return `${Math.round(value / 10_000).toLocaleString("ko-KR")}만원`;
  }
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function estimateTaxRate(monthlyIncome: number) {
  if (monthlyIncome < 3_000_000) return 5;
  if (monthlyIncome < 5_000_000) return 8;
  if (monthlyIncome < 8_000_000) return 12;
  return 15;
}

function calculate(input: SimulatorInput, policy: PolicyOption) {
  const insuredRatio = Math.min(input.contributionYears / 40, 1);
  const monthlyPension =
    input.monthlyIncome * (policy.replacementRate / 100) * insuredRatio;
  const incomeGap = Math.max(policy.pensionAge - input.retirementAge, 0);
  const receivingMonths = Math.max((83.5 - policy.pensionAge) * 12, 0);
  const lifetimeBenefit = monthlyPension * receivingMonths;
  const taxRate = estimateTaxRate(input.monthlyIncome);
  const totalBurdenRate = taxRate + policy.premiumRate + policy.fiscalRate;
  const annualBurden = input.monthlyIncome * 12 * (totalBurdenRate / 100);

  return {
    ...policy,
    monthlyPension,
    incomeGap,
    lifetimeBenefit,
    totalBurdenRate,
    annualBurden,
  };
}

function policyCommentary(policy: PolicyOption, input: SimulatorInput) {
  if (policy.id === "N-A") {
    return {
      benefit: `${input.contributionYears}년 가입을 반영한 균형형 결과입니다. 현재 부담을 상대적으로 낮게 유지하지만 월연금 증가 폭도 제한적입니다.`,
      fairness: "현세대의 보험료 충격은 작지만, 재정 보강 속도가 완만해 미래세대 부담이 남을 수 있습니다.",
      stability: "급여와 부담의 급격한 변화가 없어 실행 가능성은 높지만 장기 재정 개선 효과는 중간 수준입니다.",
      caution: "은퇴 후 수급 개시 전 소득공백을 개인저축·퇴직연금으로 별도 준비해야 합니다.",
    };
  }
  if (policy.id === "N-B") {
    return {
      benefit: "세 대안 가운데 예상 월연금과 생애 총수급액이 가장 큽니다. 노후소득 보장을 우선하는 선택입니다.",
      fairness: "현재 가입자의 보험료와 국고 부담이 함께 증가하지만, 은퇴세대의 빈곤 위험을 낮추는 효과가 큽니다.",
      stability: "보험료 인상만큼 급여도 높아져 기금 안정 효과가 제한될 수 있어 추가 재원 논의가 필요합니다.",
      caution: "현재 가처분소득 감소가 가장 클 수 있으므로 소득수준별 부담 완화 장치를 함께 검토해야 합니다.",
    };
  }
  return {
    benefit: "월연금은 균형안과 비슷하지만 수급 개시가 늦어 생애 총수급액은 낮아질 수 있습니다.",
    fairness: "현재세대의 보험료 부담을 높이고 수급 시점을 늦춰 미래세대에 이전되는 재정 부담을 줄이는 방향입니다.",
    stability: "높은 보험료율과 늦은 수급 개시로 세 대안 중 장기 재정 안정성이 가장 강한 구조입니다.",
    caution: "은퇴연령이 빠른 사람에게 소득공백이 길어질 수 있어 고령자 고용·브리지 연금이 함께 필요합니다.",
  };
}

export default function Home() {
  const [input, setInput] = useState<SimulatorInput>({
    age: 42,
    monthlyIncome: 4_500_000,
    contributionYears: 35,
    retirementAge: 62,
  });
  const [analyzed, setAnalyzed] = useState(false);

  const results = useMemo(
    () => policyOptions.map((policy) => calculate(input, policy)),
    [input],
  );

  const representative = results[0];
  const highestPension = results.reduce((best, result) =>
    result.monthlyPension > best.monthlyPension ? result : best,
  );
  const lowestBurden = results.reduce((best, result) =>
    result.totalBurdenRate < best.totalBurdenRate ? result : best,
  );
  const shortestGap = results.reduce((best, result) =>
    result.incomeGap < best.incomeGap ? result : best,
  );

  const update = (key: keyof SimulatorInput, value: number) => {
    setInput((current) => ({ ...current, [key]: value }));
    setAnalyzed(false);
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="개인 국민연금 시뮬레이터 홈">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>개인 국민연금 시뮬레이터</span>
        </a>
        <div className="privacy-badge">
          <span className="shield" aria-hidden="true">✓</span>
          입력정보는 저장되지 않습니다
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">MY PENSION IMPACT</p>
          <h1>
            나의 연금,
            <br />
            숫자로 미리 봅니다
          </h1>
          <p className="hero-description">
            현재의 선택이 은퇴 이후의 삶에 어떤 차이를 만드는지
            개인 맞춤형으로 확인해 보세요.
          </p>

          <div className="trust-points" aria-label="서비스 특징">
            <div>
              <span className="trust-icon">✓</span>
              <p><strong>개인 맞춤 분석</strong><small>나에게 맞는 결과 제공</small></p>
            </div>
            <div>
              <span className="trust-icon chart-icon">▥</span>
              <p><strong>대안별 비교</strong><small>선택에 따른 변화 확인</small></p>
            </div>
            <div>
              <span className="trust-icon lock-icon">●</span>
              <p><strong>안심하고 이용</strong><small>입력정보 비저장</small></p>
            </div>
          </div>
        </div>

        <div className="input-card" aria-labelledby="input-title">
          <div className="card-heading">
            <div>
              <p className="section-kicker">STEP 1</p>
              <h2 id="input-title">나의 예상 조건 입력</h2>
            </div>
            <span>모든 값은 가상 입력입니다</span>
          </div>

          <div className="control-row">
            <span className="control-icon" aria-hidden="true">사람</span>
            <label htmlFor="age">현재 나이</label>
            <input
              id="age"
              type="range"
              min="18"
              max="69"
              value={input.age}
              onChange={(event) => update("age", Number(event.target.value))}
            />
            <output htmlFor="age"><strong>{input.age}</strong>세</output>
          </div>

          <div className="control-row income-row">
            <span className="control-icon" aria-hidden="true">₩</span>
            <label htmlFor="income">월소득</label>
            <div className="stepper">
              <button
                type="button"
                aria-label="월소득 10만원 줄이기"
                onClick={() =>
                  update("monthlyIncome", Math.max(1_000_000, input.monthlyIncome - 100_000))
                }
              >
                −
              </button>
              <input
                id="income"
                inputMode="numeric"
                aria-label="월소득 만원 단위"
                value={Math.round(input.monthlyIncome / 10_000)}
                onChange={(event) =>
                  update(
                    "monthlyIncome",
                    Math.min(20_000_000, Math.max(1_000_000, Number(event.target.value || 0) * 10_000)),
                  )
                }
              />
              <button
                type="button"
                aria-label="월소득 10만원 늘리기"
                onClick={() =>
                  update("monthlyIncome", Math.min(20_000_000, input.monthlyIncome + 100_000))
                }
              >
                +
              </button>
            </div>
            <output htmlFor="income">
              <strong>{Math.round(input.monthlyIncome / 10_000).toLocaleString("ko-KR")}</strong>만원
            </output>
          </div>

          <div className="control-row">
            <span className="control-icon" aria-hidden="true">기간</span>
            <label htmlFor="years">예상 가입기간</label>
            <input
              id="years"
              type="range"
              min="10"
              max="40"
              value={input.contributionYears}
              onChange={(event) => update("contributionYears", Number(event.target.value))}
            />
            <output htmlFor="years"><strong>{input.contributionYears}</strong>년</output>
          </div>

          <div className="control-row">
            <span className="control-icon" aria-hidden="true">은퇴</span>
            <label htmlFor="retirement">최종 은퇴연령</label>
            <select
              id="retirement"
              value={input.retirementAge}
              onChange={(event) => update("retirementAge", Number(event.target.value))}
            >
              {Array.from({ length: 16 }, (_, index) => 55 + index).map((age) => (
                <option key={age} value={age}>{age}세</option>
              ))}
            </select>
            <output htmlFor="retirement"><strong>{input.retirementAge}</strong>세</output>
          </div>

          <button
            className="analyze-button"
            type="button"
            onClick={() => {
              setAnalyzed(true);
              window.setTimeout(
                () => document.getElementById("summary")?.scrollIntoView({ behavior: "smooth" }),
                80,
              );
            }}
          >
            내 연금 영향 분석하기
            <span aria-hidden="true">→</span>
          </button>
          <p className="privacy-note">
            <span aria-hidden="true">✓</span>
            계산은 이 브라우저에서만 이루어지며 중앙 서버에 저장되지 않습니다.
          </p>
        </div>
      </section>

      <section className={`summary ${analyzed ? "is-analyzed" : ""}`} id="summary">
        <article>
          <span className="summary-icon">₩</span>
          <div><p>예상 월연금</p><strong>{analyzed ? formatWon(representative.monthlyPension) : "—"}</strong><small>{analyzed ? "N-A 기준" : "계산 전"}</small></div>
        </article>
        <article>
          <span className="summary-icon">↘</span>
          <div><p>은퇴 후 소득공백</p><strong>{analyzed ? `${representative.incomeGap}년` : "—"}</strong><small>{analyzed ? `${representative.pensionAge}세 수급 개시` : "계산 전"}</small></div>
        </article>
        <article>
          <span className="summary-icon">●</span>
          <div><p>생애 총수급액</p><strong>{analyzed ? formatWon(representative.lifetimeBenefit) : "—"}</strong><small>{analyzed ? "기대수명 83.5세 기준" : "계산 전"}</small></div>
        </article>
        <article>
          <span className="summary-icon">%</span>
          <div><p>연 조세·보험료 부담</p><strong>{analyzed ? `${representative.totalBurdenRate.toFixed(1)}%` : "—"}</strong><small>{analyzed ? formatWon(representative.annualBurden) : "계산 전"}</small></div>
        </article>
      </section>

      <section className={`results-panel ${analyzed ? "show" : ""}`} aria-live="polite">
        {!analyzed ? (
          <div className="results-gate">
            <span>STEP 2</span>
            <h2>네 가지 조건을 입력하고 분석을 시작해 주세요</h2>
            <p>개인 조건에 따른 세 가지 정책대안의 차이를 같은 기준으로 비교해 드립니다.</p>
          </div>
        ) : (
          <>
            <div className="results-heading">
              <div>
                <p className="section-kicker">STEP 2 · PERSONAL IMPACT</p>
                <h2>정책대안별 나의 연금 영향</h2>
                <p>
                  월소득 {formatWon(input.monthlyIncome)} · 가입 {input.contributionYears}년 ·
                  {" "}{input.retirementAge}세 은퇴를 가정한 결과입니다.
                </p>
              </div>
              <div className="result-highlights">
                <span>월연금 우위 <strong>{highestPension.id}</strong></span>
                <span>부담 최소 <strong>{lowestBurden.id}</strong></span>
                <span>공백 최소 <strong>{shortestGap.id}</strong></span>
              </div>
            </div>

            <div className="comparison-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">정책대안</th>
                    <th scope="col">예상 월연금</th>
                    <th scope="col">수급 개시</th>
                    <th scope="col">소득공백</th>
                    <th scope="col">생애 총수급액</th>
                    <th scope="col">연 조세·보험료</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id}>
                      <th scope="row">
                        <span className="policy-dot" style={{ background: result.color }} />
                        <span><strong>{result.id}</strong>{result.name}<small>{result.shortName}</small></span>
                      </th>
                      <td><strong>{formatWon(result.monthlyPension)}</strong><small>월 기준</small></td>
                      <td><strong>{result.pensionAge}세</strong><small>예상 개시</small></td>
                      <td className={result.incomeGap >= 5 ? "warning-cell" : ""}>
                        <strong>{result.incomeGap}년</strong><small>{input.retirementAge}세 은퇴 기준</small>
                      </td>
                      <td><strong>{formatWon(result.lifetimeBenefit)}</strong><small>83.5세까지</small></td>
                      <td><strong>{result.totalBurdenRate.toFixed(1)}%</strong><small>{formatWon(result.annualBurden)}/년</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="timeline-card">
              <div className="timeline-title">
                <div>
                  <p className="section-kicker">RETIREMENT GAP</p>
                  <h3>은퇴 이후 소득공백 타임라인</h3>
                </div>
                <p>은퇴 시점과 연금 수급 시점 사이를 별도 소득원으로 연결해야 합니다.</p>
              </div>
              <div className="timeline">
                <div className="timeline-line" />
                <div className="timeline-point retirement-point" style={{ left: "8%" }}>
                  <span>{input.retirementAge}세</span><small>은퇴</small>
                </div>
                {results.map((result, index) => {
                  const left = 8 + ((result.pensionAge - input.retirementAge) / 10) * 82;
                  return (
                    <div
                      className="timeline-point policy-point"
                      key={result.id}
                      style={{ left: `${Math.min(92, Math.max(16, left))}%`, top: `${58 + index * 34}px` }}
                    >
                      <i style={{ background: result.color }} />
                      <span>{result.pensionAge}세</span>
                      <small>{result.id} 수급</small>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="commentary-heading">
              <p className="section-kicker">STEP 3 · AI POLICY EXPLAINER</p>
              <h2>개인 상황을 고려한 정책 해설</h2>
              <p>특정 대안을 권고하지 않고 혜택과 부담, 형평성과 지속가능성을 함께 보여드립니다.</p>
            </div>

            <div className="policy-cards">
              {results.map((result) => {
                const commentary = policyCommentary(result, input);
                return (
                  <article key={result.id} style={{ "--policy-color": result.color } as React.CSSProperties}>
                    <header>
                      <span>{result.id}</span>
                      <div><h3>{result.name}</h3><p>{result.shortName}</p></div>
                    </header>
                    <dl>
                      <div><dt>개인혜택</dt><dd>{commentary.benefit}</dd></div>
                      <div><dt>세대 간 형평성</dt><dd>{commentary.fairness}</dd></div>
                      <div><dt>재정 안정성</dt><dd>{commentary.stability}</dd></div>
                      <div><dt>장점과 유의점</dt><dd>{commentary.caution}</dd></div>
                    </dl>
                  </article>
                );
              })}
            </div>

            <details className="assumptions">
              <summary>계산모형과 변수 가정 보기</summary>
              <div className="assumption-grid">
                <div>
                  <h3>예상 월연금</h3>
                  <code>월소득 × 소득대체율 × min(가입기간 ÷ 40년, 1)</code>
                  <p>실제 연금액의 A값·B값, 재평가율, 크레딧과 상·하한은 반영하지 않은 비교용 단순화 모형입니다.</p>
                </div>
                <div>
                  <h3>생애 총수급액</h3>
                  <code>예상 월연금 × (83.5세 - 수급개시연령) × 12개월</code>
                  <p>평균 기대수명 83.5세를 공통 기준으로 적용하며 물가상승·할인율·유족연금은 제외합니다.</p>
                </div>
                <div>
                  <h3>연 조세·보험료 부담</h3>
                  <code>추정 기존 조세율 + 보험료율 + 국고부담 환산율</code>
                  <p>초과세수 100조원은 조세부담액에서 제외합니다. 국고부담은 연구용 1인당 환산율입니다.</p>
                </div>
                <div>
                  <h3>정책실험 대안값</h3>
                  <ul>
                    {policyOptions.map((policy) => (
                      <li key={policy.id}>
                        <strong>{policy.id}</strong> 보험료 {policy.premiumRate}% ·
                        소득대체 {policy.replacementRate}% · 수급 {policy.pensionAge}세
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          </>
        )}
      </section>

      <section className="method-note">
        <strong>연구용 시뮬레이션 안내</strong>
        <p>
          결과는 정책대안 비교를 위한 단순화 추정치이며 실제 국민연금공단의
          연금액 산정 결과가 아닙니다. 상세 산식과 가정은 분석 결과에서 투명하게 제공합니다.
        </p>
      </section>
    </main>
  );
}
