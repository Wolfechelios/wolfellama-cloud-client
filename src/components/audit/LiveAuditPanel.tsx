import { useMemo, useState } from 'react';
import { createLiveAuditChecks } from '../../audit/liveAuditChecks';
import type { AuditRunItem, AuditRunReport, AuditStatus } from '../../audit/auditTypes';

function statusLabel(status: AuditStatus) {
  return status.toUpperCase();
}

function emptyReport(items: AuditRunItem[]): AuditRunReport {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    startedAt: now,
    status: 'pending',
    passCount: 0,
    warnCount: 0,
    failCount: 0,
    items,
    debugLog: ['Audit ready. Press Run Full Audit.'],
  };
}

export function LiveAuditPanel() {
  const checks = useMemo(() => createLiveAuditChecks(), []);
  const initialItems = useMemo<AuditRunItem[]>(
    () => checks.map(({ run: _run, ...check }) => ({ ...check, status: 'pending', details: [] })),
    [checks],
  );
  const [report, setReport] = useState<AuditRunReport>(() => emptyReport(initialItems));
  const [isRunning, setIsRunning] = useState(false);

  function appendLog(line: string) {
    setReport((current) => ({ ...current, debugLog: [...current.debugLog, `${new Date().toLocaleTimeString()} ${line}`] }));
  }

  async function runAudit() {
    if (isRunning) return;

    setIsRunning(true);
    const startedAt = new Date().toISOString();
    setReport({
      id: crypto.randomUUID(),
      startedAt,
      status: 'running',
      passCount: 0,
      warnCount: 0,
      failCount: 0,
      items: initialItems,
      debugLog: [`${new Date().toLocaleTimeString()} Audit started.`],
    });

    let passCount = 0;
    let warnCount = 0;
    let failCount = 0;

    for (const check of checks) {
      appendLog(`RUN ${check.area} / ${check.label}`);
      setReport((current) => ({
        ...current,
        items: current.items.map((item) => item.id === check.id ? { ...item, status: 'running', startedAt: new Date().toISOString() } : item),
      }));

      await new Promise((resolve) => window.setTimeout(resolve, 220));

      try {
        const result = await check.run();
        if (result.status === 'pass') passCount += 1;
        if (result.status === 'warn') warnCount += 1;
        if (result.status === 'fail') failCount += 1;

        appendLog(`${statusLabel(result.status)} ${check.label}: ${result.summary}`);
        setReport((current) => ({
          ...current,
          passCount,
          warnCount,
          failCount,
          items: current.items.map((item) => item.id === check.id ? {
            ...item,
            status: result.status,
            summary: result.summary,
            details: result.details,
            recommendation: result.recommendation,
            completedAt: new Date().toISOString(),
          } : item),
        }));
      } catch (error) {
        failCount += 1;
        const message = error instanceof Error ? error.message : 'Unknown audit error';
        appendLog(`FAIL ${check.label}: ${message}`);
        setReport((current) => ({
          ...current,
          passCount,
          warnCount,
          failCount,
          items: current.items.map((item) => item.id === check.id ? {
            ...item,
            status: 'fail',
            summary: message,
            details: ['The check threw an exception while running.'],
            completedAt: new Date().toISOString(),
          } : item),
        }));
      }
    }

    setReport((current) => ({
      ...current,
      status: failCount > 0 ? 'fail' : warnCount > 0 ? 'warn' : 'pass',
      completedAt: new Date().toISOString(),
      passCount,
      warnCount,
      failCount,
      debugLog: [...current.debugLog, `${new Date().toLocaleTimeString()} Audit completed.`],
    }));
    setIsRunning(false);
  }

  function copyReport() {
    const text = JSON.stringify(report, null, 2);
    void navigator.clipboard?.writeText(text);
    appendLog('Copied audit report JSON to clipboard.');
  }

  return (
    <section className="audit-panel">
      <div className="agent-hero">
        <div>
          <p className="eyebrow">live debug coverage</p>
          <h3>No Man Left Behind Audit</h3>
          <p>Runs every major surface and shows what is passing, warning, or failing in real time.</p>
        </div>
        <div className={`audit-badge ${report.status}`}>{statusLabel(report.status)}</div>
      </div>

      <div className="audit-summary-grid">
        <span>Pass: {report.passCount}</span>
        <span>Warn: {report.warnCount}</span>
        <span>Fail: {report.failCount}</span>
        <span>Total: {report.items.length}</span>
      </div>

      <div className="hardware-actions">
        <button type="button" className="connect-button" onClick={runAudit} disabled={isRunning}>{isRunning ? 'Running...' : 'Run Full Audit'}</button>
        <button type="button" className="ghost-button" onClick={copyReport}>Copy Report JSON</button>
      </div>

      <div className="audit-layout">
        <div className="audit-check-list">
          {report.items.map((item) => (
            <article key={item.id} className={`audit-check ${item.status}`}>
              <div className="repo-project-header">
                <div>
                  <h4>{item.label}</h4>
                  <p>{item.area} • {item.description}</p>
                </div>
                <strong>{statusLabel(item.status)}</strong>
              </div>
              {item.summary && <p>{item.summary}</p>}
              {item.details.length > 0 && (
                <ul>
                  {item.details.map((detail) => <li key={detail}>{detail}</li>)}
                </ul>
              )}
              {item.recommendation && <p>Fix: {item.recommendation}</p>}
            </article>
          ))}
        </div>

        <div className="audit-debug-card">
          <h4>Live Debug</h4>
          <pre>{report.debugLog.join('\n')}</pre>
        </div>
      </div>
    </section>
  );
}
