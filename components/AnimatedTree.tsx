'use client';

import { useEffect, useState } from 'react';
import styles from './AnimatedTree.module.css';

export default function AnimatedTree() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Триггерим анимацию после монтирования
    const timer = setTimeout(() => setActive(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.treeWrapper} ${active ? styles.active : ''}`}>
      {/* ВЕРХ */}
      <div className={styles.level}>
        <div className={styles.hex}>Lessons</div>
        <div className={styles.hex}>Calendar</div>
        <div className={styles.hex}>Dormitory</div>
      </div>

      {/* ЛИНИИ ВЕРХ ↕ */}
      <div className={styles.lines}>
        <div className={styles.lineVertical}></div>
        <div className={styles.lineVertical}></div>
        <div className={styles.lineVertical}></div>
      </div>

      {/* ЦЕНТР */}
      <div className={styles.level}>
        <div className={styles.hex}>Student clubs</div>
        <div className={styles.hex}>YSJ</div>
        <div className={styles.hex}>HelpDesk</div>
        <div className={styles.hex}>KPI</div>
      </div>

      {/* ЛИНИЯ К ЛОГО */}
      <div className={styles.lineToCenter}></div>

      {/* YU логотип */}
      <div className={styles.centerLogo}>YU</div>

      {/* ЛИНИЯ ВНИЗ */}
      <div className={styles.lineToRoots}></div>

      {/* НИЗ */}
      <div className={styles.level}>
        <div className={styles.hex}>OIS</div>
        <div className={styles.hex}>Bitrix24</div>
        <div className={styles.hex}>Canvas</div>
      </div>
    </div>
  );
}
