import React, { useEffect, useState, useRef } from 'react';
import { Text, TextStyle } from 'react-native';

interface CountUpTextProps {
  value: number;
  className?: string;
  style?: TextStyle;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export default function CountUpText({ 
  value, 
  className, 
  style, 
  duration = 1000,
  prefix = '',
  suffix = ''
}: CountUpTextProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    if (value === previousValue.current) return;
    
    const startTime = Date.now();
    const startValue = previousValue.current;
    const endValue = value;
    const change = endValue - startValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(Math.floor(startValue + change * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <Text className={className} style={style}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </Text>
  );
}
