import { useState, useEffect } from 'react';
import { subscribeToTimer, getTimerState } from './timerStore';

export function useTimer() {
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        const unsub = subscribeToTimer(() => forceUpdate(n => n + 1));
        return () => { unsub(); };
    }, []);

    return getTimerState();
}