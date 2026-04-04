import React from 'react';
import { useSearch } from '../../context/SearchContext';
import styles from './Header.module.css';

interface HeaderProps {
  ref?: React.RefObject<HTMLTextAreaElement | null>;
}

export function Header({ ref }: HeaderProps) {
  const { optimisticString, undo, clear } = useSearch();

  return (
    <header className={styles.header}>
      <textarea
        ref={ref}
        readOnly
        value={optimisticString}
        className={styles.display}
        placeholder="Build your Pokémon GO search string..."
      />
      <div className={styles.actions}>
        <button className={`${styles.actionBtn} ${styles.undo}`} onClick={undo}>
          Undo
        </button>
        <button className={`${styles.actionBtn} ${styles.clear}`} onClick={clear}>
          Clear
        </button>
      </div>
    </header>
  );
}
