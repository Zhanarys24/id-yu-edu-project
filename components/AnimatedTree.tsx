'use client';

import { useEffect, useState } from 'react';
import styles from './AnimatedTree.module.css';

export default function AnimatedTree() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setActive(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.treeWrapper} ${active ? styles.active : ''}`}>
      <div className={styles.topLevel}>
        <div className={styles.hex} data-index="0">
          <div className={styles.icon}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div className={styles.label}>Lessons</div>
        </div>
        <div className={styles.hex} data-index="1">
          <div className={styles.icon}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className={styles.label}>Calendar</div>
        </div>
        <div className={styles.hex} data-index="2">
          <div className={styles.icon}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className={styles.label}>Dormitory</div>
        </div>
        <div className={styles.hex} data-index="3">
          <div className={styles.icon}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className={styles.label}>Student clubs</div>
        </div>
        <div className={styles.hex} data-index="4">
          <div className={styles.icon}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className={styles.label}>YSJ</div>
        </div>
        <div className={styles.hex} data-index="5">
          <div className={styles.icon}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className={styles.label}>HelpDesk</div>
        </div>
        <div className={styles.hex} data-index="6">
          <div className={styles.icon}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className={styles.label}>KPI</div>
        </div>
      </div>

      <div className={styles.connectionLines}>
        {[...Array(7)].map((_, i) => (
          <div key={i} className={styles.connectionLine} data-index={i}></div>
        ))}
      </div>

      <div className={styles.centerLogo}>
        <div className={styles.yuText}>YU</div>
      </div>

      <div className={styles.bottomLines}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={styles.bottomLine} data-index={i}></div>
        ))}
      </div>

      <div className={styles.bottomLevel}>
        <div className={styles.circle} data-index="0">
          <div className={styles.circleText}>OJS</div>
          <div className={styles.circleSubtext}>OPEN JOURNAL SYSTEM</div>
        </div>
        <div className={styles.circle} data-index="1">
          <div className={styles.circleText}>Bitrix 24</div>
        </div>
        <div className={styles.circle} data-index="2">
          <div className={styles.circleIcon}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
